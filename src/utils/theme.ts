import { Tema } from "../types/interfaces";

export const THEME_EVENT = "theme-changed";

export const getCurrentTheme = (): "light" | "dark" =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// Preferência salva neste navegador, no formato lido pelo script do index.html: sem a chave, segue o sistema
export const getThemePreference = (): Tema => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return Tema.ESCURO;
    if (saved === "light") return Tema.CLARO;
  } catch {
    // sem localStorage o tema vale só para esta visita
  }
  return Tema.SISTEMA;
};

export function applyTheme(tema: Tema) {
  const dark =
    tema === Tema.ESCURO ||
    (tema === Tema.SISTEMA && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);

  try {
    if (tema === Tema.SISTEMA) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", dark ? "dark" : "light");
    }
  } catch {
    // sem localStorage o tema vale só para esta visita
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}
