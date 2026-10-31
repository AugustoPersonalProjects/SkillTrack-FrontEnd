import { useSyncExternalStore } from "react";
import { getCurrentTheme, getThemePreference, THEME_EVENT } from "../utils/theme";

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};

// O tema inicial é aplicado por um script no index.html; os componentes só acompanham as mudanças
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getCurrentTheme);
  const preference = useSyncExternalStore(subscribe, getThemePreference);

  return { theme, preference };
}
