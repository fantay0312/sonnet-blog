import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date, locale: string = "zh-cn"): string {
  return date.toLocaleDateString(locale === "zh-cn" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * 阅读统计：中文按字、西文按词计，代码块/行内代码/图片/裸链接不计入。
 * 阅读速度按中文 ~350 字/分、英文 ~200 词/分估算。
 */
export function readingStats(markdown: string): { chars: number; minutes: number } {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ");
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const words = (text.match(/[A-Za-z0-9][A-Za-z0-9''-]*/g) || []).length;
  const chars = cjk + words;
  const minutes = Math.max(1, Math.round(cjk / 350 + words / 200));
  return { chars, minutes };
}
