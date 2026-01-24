import { useStore } from "@nanostores/react";
import { useEffect, useState, useCallback } from "react";
import {
  colorThemeStore,
  colorThemes,
  setColorTheme,
  initColorTheme,
  type ColorTheme,
} from "~/stores/color";

export default function ColorSwitch() {
  const currentTheme = useStore(colorThemeStore);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initColorTheme();
    setMounted(true);
  }, []);

  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(colorThemes) as ColorTheme[];
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setColorTheme(themeKeys[nextIndex]);
  }, [currentTheme]);

  if (!mounted) {
    return (
      <button className="p-2 hover:bg-muted rounded-lg">
        <span className="w-5 h-5 rounded-full bg-muted block" />
      </button>
    );
  }

  const currentColor = colorThemes[currentTheme];

  return (
    <button
      onClick={cycleTheme}
      className="p-2 hover:bg-muted rounded-lg transition-colors group"
      aria-label={`当前主题色：${currentColor.name}，点击切换`}
      title={currentColor.name}
    >
      <span
        className="w-5 h-5 rounded-full block shadow-sm group-hover:scale-110 transition-transform"
        style={{
          backgroundColor: currentColor.light,
          boxShadow: `0 0 0 2px var(--zen-background), 0 0 0 3px ${currentColor.light}40`
        }}
      />
    </button>
  );
}
