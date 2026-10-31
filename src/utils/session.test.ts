import { beforeEach, describe, expect, it } from "vitest";
import { clearSession } from "./session";

describe("clearSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("remove o token, o usuário e as notificações", () => {
    localStorage.setItem("token", "abc");
    localStorage.setItem("user", "{}");
    localStorage.setItem("notifications", "[]");

    clearSession();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("notifications")).toBeNull();
  });

  it("mantém o tema, que é uma preferência do navegador", () => {
    localStorage.setItem("theme", "dark");

    clearSession();

    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
