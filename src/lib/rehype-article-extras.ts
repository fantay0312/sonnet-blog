import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * rehype-article-extras —— 文章渲染收尾处理
 *
 * 1. 表格包进 .table-wrap 横向滚动容器：
 *    替代旧的 table { display: block } 方案，保住表格语义、圆角和阴影，
 *    宽表格在移动端滚动而不是撑破布局。
 * 2. 独立成段的单图升级为 <figure>：
 *    写了 title 的图片（![alt](url "说明")）生成 <figcaption> 图注；
 *    同一段落里的多图（并排截图）保持原样不动。
 */
export default function rehypeArticleExtras() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || typeof index !== "number") return;

      // —— 表格：套滚动容器 ——
      if (node.tagName === "table") {
        const alreadyWrapped =
          parent.type === "element" &&
          parent.tagName === "div" &&
          Array.isArray(parent.properties?.className) &&
          parent.properties.className.includes("table-wrap");
        if (alreadyWrapped) return;

        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        };
        parent.children[index] = wrapper;
        return;
      }

      // —— 单图段落 → figure（多图并排的段落不处理） ——
      if (node.tagName === "p") {
        const meaningful = node.children.filter(
          (c) => !(c.type === "text" && c.value.trim() === "")
        );
        if (meaningful.length !== 1) return;
        const only = meaningful[0];
        if (only.type !== "element" || only.tagName !== "img") return;

        const children: ElementContent[] = [only];
        const title = only.properties?.title;
        if (typeof title === "string" && title.trim()) {
          children.push({
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: title.trim() }],
          });
          // 已转成图注，去掉原生 tooltip 防止信息重复
          delete only.properties.title;
        }

        parent.children[index] = {
          type: "element",
          tagName: "figure",
          properties: {},
          children,
        } satisfies Element;
      }
    });
  };
}
