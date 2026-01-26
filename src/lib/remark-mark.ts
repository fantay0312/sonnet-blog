/**
 * remark 插件：支持 ==高亮文本== 语法
 * 将 ==text== 转换为 <mark>text</mark>
 */
import { visit } from "unist-util-visit";
import type { Root, Text, Parent } from "mdast";

interface MarkNode {
  type: "mark";
  data: {
    hName: string;
  };
  children: Array<{ type: "text"; value: string }>;
}

export default function remarkMark() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      const markRegex = /==([^=]+)==/g;

      if (!markRegex.test(value)) return;

      // 重置 regex
      markRegex.lastIndex = 0;

      const children: Array<Text | MarkNode> = [];
      let lastIndex = 0;
      let match;

      while ((match = markRegex.exec(value)) !== null) {
        // 添加匹配前的文本
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: value.slice(lastIndex, match.index),
          });
        }

        // 添加高亮节点
        children.push({
          type: "mark" as const,
          data: {
            hName: "mark",
          },
          children: [{ type: "text", value: match[1] }],
        } as MarkNode);

        lastIndex = match.index + match[0].length;
      }

      // 添加剩余文本
      if (lastIndex < value.length) {
        children.push({
          type: "text",
          value: value.slice(lastIndex),
        });
      }

      // 替换原节点
      if (children.length > 0) {
        parent.children.splice(index, 1, ...(children as any));
      }
    });
  };
}
