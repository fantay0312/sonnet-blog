/**
 * remark 插件：支持 ==高亮文本== 语法
 * 将 ==text== 转换为 <mark>text</mark>
 *
 * 支持嵌套语法，如 ==**粗体高亮**== 或 ==*斜体*内容==
 */
import { visit } from "unist-util-visit";

interface AnyNode {
  type: string;
  value?: string;
  children?: AnyNode[];
  data?: Record<string, unknown>;
}

// 处理 children 数组，查找并转换 ==mark== 语法
function processChildren(children: AnyNode[]): AnyNode[] {
  if (!children || !Array.isArray(children)) {
    return children;
  }

  const result: AnyNode[] = [];
  let i = 0;

  while (i < children.length) {
    const child = children[i];

    if (!child) {
      i++;
      continue;
    }

    // 只检查文本节点中的 == 开始标记
    if (child.type === "text" && typeof child.value === "string") {
      const startMatch = child.value.indexOf("==");

      if (startMatch !== -1) {
        // 找到了开始标记，现在寻找结束标记
        const afterStart = child.value.slice(startMatch + 2);
        const endInSameNode = afterStart.indexOf("==");

        if (endInSameNode !== -1) {
          // 开始和结束标记在同一个文本节点中
          const before = child.value.slice(0, startMatch);
          const content = afterStart.slice(0, endInSameNode);
          const after = afterStart.slice(endInSameNode + 2);

          if (before) {
            result.push({ type: "text", value: before });
          }

          result.push({
            type: "mark",
            data: { hName: "mark" },
            children: [{ type: "text", value: content }],
          });

          if (after) {
            // 继续处理剩余文本（可能还有更多高亮）
            const remaining = processChildren([{ type: "text", value: after }]);
            result.push(...remaining);
          }

          i++;
          continue;
        } else {
          // 结束标记在后续节点中，收集中间内容
          const before = child.value.slice(0, startMatch);
          const contentStart = afterStart;

          if (before) {
            result.push({ type: "text", value: before });
          }

          // 收集内容直到找到 ==
          const markContent: AnyNode[] = [];
          if (contentStart) {
            markContent.push({ type: "text", value: contentStart });
          }

          let j = i + 1;
          let found = false;

          while (j < children.length) {
            const nextChild = children[j];

            if (!nextChild) {
              j++;
              continue;
            }

            if (nextChild.type === "text" && typeof nextChild.value === "string") {
              const endMatch = nextChild.value.indexOf("==");

              if (endMatch !== -1) {
                // 找到结束标记
                const contentEnd = nextChild.value.slice(0, endMatch);
                const after = nextChild.value.slice(endMatch + 2);

                if (contentEnd) {
                  markContent.push({ type: "text", value: contentEnd });
                }

                // 递归处理 markContent 中可能存在的嵌套高亮
                const processedContent = processChildren(markContent);

                result.push({
                  type: "mark",
                  data: { hName: "mark" },
                  children: processedContent,
                });

                if (after) {
                  // 继续处理剩余文本和后续节点
                  const remainingNodes = [
                    { type: "text", value: after } as AnyNode,
                    ...children.slice(j + 1)
                  ];
                  const remaining = processChildren(remainingNodes);
                  result.push(...remaining);
                  return result;
                }

                i = j + 1;
                found = true;
                break;
              } else {
                // 整个文本节点都是内容的一部分
                markContent.push(nextChild);
              }
            } else {
              // 非文本节点（如 strong、em）
              markContent.push(nextChild);
            }
            j++;
          }

          if (!found) {
            // 没找到结束标记，保留原始内容
            result.push(child);
          }

          i++;
          continue;
        }
      }
    }

    // 递归处理嵌套节点
    if (child.children && Array.isArray(child.children)) {
      child.children = processChildren(child.children);
    }

    result.push(child);
    i++;
  }

  return result;
}

export default function remarkMark() {
  return function transformer(tree: AnyNode) {
    try {
      visit(tree, (node: AnyNode) => {
        if (
          node.type === "paragraph" ||
          node.type === "heading" ||
          node.type === "tableCell" ||
          node.type === "listItem"
        ) {
          if (node.children && Array.isArray(node.children)) {
            node.children = processChildren(node.children);
          }
          return "skip"; // 字符串形式，更兼容
        }
      });
    } catch (error) {
      console.error("[remark-mark] Error processing markdown:", error);
    }
  };
}
