import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tema } from "../types/interfaces";
import { applyTheme, getCurrentTheme, getThemePreference, THEME_EVENT } from "./theme";

const simularSistema = (escuro: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: escuro });
};

describe("applyTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    simularSistema(false);
  });

  it("aplica o tema escuro e salva no formato lido pelo index.html", () => {
    applyTheme(Tema.ESCURO);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(getCurrentTheme()).toBe("dark");
  });

  it("aplica o tema claro mesmo com o sistema no escuro", () => {
    simularSistema(true);
    document.documentElement.classList.add("dark");

    applyTheme(Tema.CLARO);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(getCurrentTheme()).toBe("light");
  });

  it("em SISTEMA segue o sistema e apaga a escolha salva", () => {
    localStorage.setItem("theme", "light");
    simularSistema(true);

    applyTheme(Tema.SISTEMA);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("avisa os componentes que acompanham o tema", () => {
    const ouvinte = vi.fn();
    window.addEventListener(THEME_EVENT, ouvinte);

    applyTheme(Tema.ESCURO);

    expect(ouvinte).toHaveBeenCalledOnce();
    window.removeEventListener(THEME_EVENT, ouvinte);
  });
});

describe("getThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lê a preferência salva neste navegador", () => {
    localStorage.setItem("theme", "dark");
    expect(getThemePreference()).toBe(Tema.ESCURO);

    localStorage.setItem("theme", "light");
    expect(getThemePreference()).toBe(Tema.CLARO);
  });

  it("sem preferência salva, segue o sistema", () => {
    expect(getThemePreference()).toBe(Tema.SISTEMA);
  });
});
