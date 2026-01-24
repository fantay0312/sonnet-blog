import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { themeStore, setTheme, initTheme, type Theme } from "~/stores/theme";

export default function ThemeToggle() {
  const theme = useStore(themeStore);

  useEffect(() => {
    initTheme();
  }, []);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return "icon-[lucide--sun]";
      case "dark":
        return "icon-[lucide--moon]";
      default:
        return "icon-[lucide--monitor]";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      aria-label={`Current theme: ${theme}`}
    >
      <span className={`${getIcon()} w-5 h-5`} />
    </button>
  );
}
