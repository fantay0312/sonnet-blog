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

export function initTheme() {
  const saved = localStorage.getItem("theme") as Theme | null;
  const theme = saved || "system";
  themeStore.set(theme);
  applyTheme(theme);

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themeStore.get() === "system") {
      applyTheme("system");
    }
  });
}
