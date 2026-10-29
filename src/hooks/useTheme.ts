import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "theme-changed";

const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};

// O tema inicial é aplicado por um script no index.html; aqui ele só é alternado e salvo
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);

  const toggleTheme = useCallback(() => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // sem localStorage o tema vale só para esta visita
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, toggleTheme };
}
