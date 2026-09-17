/**
 * remark 插件：移除正文开头与 frontmatter 重复的标题/简介
 *
 * 页面模板已经渲染了 title 和 description，
 * 正文若以同名 `# 一级标题`（以及紧随其后的同文简介段落）开头，
 * 会在页面上显示两遍——移动端尤其明显（36px 的重复大标题折行占半屏）。
 * 仅在文本与 frontmatter 完全一致（忽略空白与大小写）时移除，不误伤正常内容。
 */

interface MdNode {
  type: string;
  depth?: number;
  value?: string;
  children?: MdNode[];
}

interface VFileLike {
  data?: { astro?: { frontmatter?: Record<string, unknown> } };
}

function textOf(node: MdNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children || []).map(textOf).join("");
}

function normalize(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

export default function remarkStripTitle() {
  return function transformer(tree: MdNode, file: VFileLike) {
    const fm = file?.data?.astro?.frontmatter ?? {};
    const title = normalize(String(fm.title ?? ""));
    const description = normalize(String(fm.description ?? ""));
    const children = tree.children;
    if (!title || !children) return;

    const idx = children.findIndex((n) => n.type !== "yaml" && n.type !== "toml");
    if (idx < 0) return;

    const first = children[idx];
    if (first.type === "heading" && first.depth === 1 && normalize(textOf(first)) === title) {
      children.splice(idx, 1);

      // 标题后紧跟与 description 相同的段落时一并移除
      const next = children[idx];
      if (
        description &&
        next?.type === "paragraph" &&
        normalize(textOf(next)) === description
      ) {
        children.splice(idx, 1);
      }
    }
  };
}
