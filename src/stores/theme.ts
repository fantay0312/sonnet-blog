import { atom } from "nanostores";

export type Theme = "light" | "dark" | "system";

export const themeStore = atom<Theme>("system");

export function setTheme(theme: Theme) {
  themeStore.set(theme);
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  document.documentElement.classList.toggle("dark", isDark);
}

// 系统主题监听只注册一次：否则每次 initTheme（React 版组件每次挂载都会调）
// 都叠加一个 matchMedia change 监听器
let systemThemeListenerBound = false;

export function initTheme() {
  const saved = localStorage.getItem("theme") as Theme | null;
  const theme = saved || "system";
  themeStore.set(theme);
  applyTheme(theme);

  if (!systemThemeListenerBound) {
    systemThemeListenerBound = true;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (themeStore.get() === "system") {
        applyTheme("system");
      }
    });
  }
}
