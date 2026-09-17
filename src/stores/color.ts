import { atom } from "nanostores";

export type ColorTheme = "bamboo" | "gold" | "sakura" | "ocean" | "lavender";

export const colorThemeStore = atom<ColorTheme>("bamboo");

export const colorThemes: Record<ColorTheme, { name: string; light: string; dark: string }> = {
  bamboo: { name: "竹青", light: "#7B9E87", dark: "#5A7A63" },
  gold: { name: "金箔", light: "#C4A962", dark: "#D4B972" },
  sakura: { name: "樱粉", light: "#E8A0A0", dark: "#D48A8A" },
  ocean: { name: "碧海", light: "#6B9DAD", dark: "#5A8A9A" },
  lavender: { name: "藤紫", light: "#9B8AA6", dark: "#8A7A96" },
};

export function setColorTheme(theme: ColorTheme) {
  colorThemeStore.set(theme);
  localStorage.setItem("colorTheme", theme);
  applyColorTheme(theme);
}

export function applyColorTheme(theme: ColorTheme) {
  const colors = colorThemes[theme];
  const isDark = document.documentElement.classList.contains("dark");
  const accentColor = isDark ? colors.dark : colors.light;

  const root = document.documentElement;

  // Set zen variables
  root.style.setProperty("--zen-accent", accentColor);
  root.style.setProperty("--zen-bamboo", accentColor);

  // Also set Tailwind color variables directly for immediate effect
  root.style.setProperty("--color-accent", accentColor);
  root.style.setProperty("--color-bamboo", accentColor);

  // Update selection color
  const r = parseInt(accentColor.slice(1, 3), 16);
  const g = parseInt(accentColor.slice(3, 5), 16);
  const b = parseInt(accentColor.slice(5, 7), 16);
  root.style.setProperty("--zen-selection", `rgba(${r}, ${g}, ${b}, 0.3)`);
}

// MutationObserver 只建一次：否则每次 initColorTheme（React 版每次挂载都会调）
// 都新建一个观察者，dark class 一变就重复应用 N 次
let colorObserver: MutationObserver | null = null;

export function initColorTheme() {
  const saved = localStorage.getItem("colorTheme") as ColorTheme | null;
  const theme = saved && saved in colorThemes ? saved : "bamboo";
  colorThemeStore.set(theme);
  applyColorTheme(theme);

  if (!colorObserver) {
    colorObserver = new MutationObserver(() => {
      applyColorTheme(colorThemeStore.get());
    });
    colorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
}
