/**
 * remark 插件：支持 GitHub / Obsidian 风格 Callout
 *
 * > [!TIP] 可选标题
 * > 内容
 *
 * 渲染为 <blockquote class="callout callout-tip"> 并插入标题行
 */
import { visit } from "unist-util-visit";

interface AnyNode {
  type: string;
  value?: string;
  children?: AnyNode[];
  data?: Record<string, unknown>;
}

// 别名 → 五种视觉类型
const TYPE_ALIASES: Record<string, string> = {
  note: "note",
  info: "note",
  abstract: "note",
  summary: "note",
  tldr: "note",
  example: "note",
  quote: "note",
  cite: "note",
  tip: "tip",
  hint: "tip",
  success: "tip",
  check: "tip",
  done: "tip",
  important: "important",
  question: "important",
  help: "important",
  faq: "important",
  todo: "important",
  warning: "warning",
  attention: "warning",
  bug: "warning",
  caution: "caution",
  danger: "caution",
  error: "caution",
  failure: "caution",
  fail: "caution",
  missing: "caution",
};

const DEFAULT_LABELS: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

const MARKER_RE = /^\[!([a-zA-Z]+)\][+-]?[ \t]*([^\n]*)(?:\n)?([\s\S]*)$/;

export default function remarkCallout() {
  return function transformer(tree: AnyNode) {
    visit(tree, "blockquote", (node: AnyNode) => {
      const firstPara = node.children?.[0];
      if (!firstPara || firstPara.type !== "paragraph") return;

      const firstText = firstPara.children?.[0];
      if (!firstText || firstText.type !== "text" || typeof firstText.value !== "string") return;

      const match = firstText.value.match(MARKER_RE);
      if (!match) return;

      const rawType = match[1].toLowerCase();
      const type = TYPE_ALIASES[rawType];
      if (!type) return; // 未知类型保持原样

      const customTitle = (match[2] || "").trim();
      const rest = match[3] || "";

      // 去掉标记行，保留剩余内容
      if (rest) {
        firstText.value = rest;
      } else {
        firstPara.children!.shift();
        if (firstPara.children!.length === 0) {
          node.children!.shift();
        }
      }

      // 插入标题行
      node.children!.unshift({
        type: "paragraph",
        data: {
          hName: "p",
          hProperties: { className: ["callout-title"] },
        },
        children: [{ type: "text", value: customTitle || DEFAULT_LABELS[type] }],
      });

      const data = (node.data ||= {});
      const hProperties = ((data.hProperties as Record<string, unknown>) ||= {});
      hProperties.className = ["callout", `callout-${type}`];
      hProperties["data-callout"] = type;
    });
  };
}
