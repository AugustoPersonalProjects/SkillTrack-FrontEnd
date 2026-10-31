import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { profileService } from "./profileService";
import { Tema } from "../types/interfaces";

vi.mock("./api", () => ({ default: { put: vi.fn() } }));

const put = vi.mocked(api.put);

// deixa as promessas pendentes andarem até a próxima chamada à API
const aguardarFila = () => new Promise((resolve) => setTimeout(resolve));

describe("profileService.changeTheme", () => {
  beforeEach(() => {
    put.mockReset();
  });

  it("só envia a próxima troca depois que a anterior termina", async () => {
    let concluirPrimeira = () => {};
    put.mockReturnValueOnce(new Promise((resolve) => (concluirPrimeira = () => resolve({}))));
    put.mockResolvedValueOnce({});

    const primeira = profileService.changeTheme(Tema.ESCURO);
    const segunda = profileService.changeTheme(Tema.CLARO);
    await aguardarFila();

    expect(put).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenLastCalledWith("/usuarios/me/tema", { tema: Tema.ESCURO });

    concluirPrimeira();
    await Promise.all([primeira, segunda]);

    expect(put).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenLastCalledWith("/usuarios/me/tema", { tema: Tema.CLARO });
  });

  it("uma falha na rede não impede as trocas seguintes", async () => {
    put.mockRejectedValueOnce(new Error("sem conexão"));
    put.mockResolvedValueOnce({});

    await expect(profileService.changeTheme(Tema.ESCURO)).rejects.toThrow("sem conexão");
    await expect(profileService.changeTheme(Tema.CLARO)).resolves.toBeUndefined();

    expect(put).toHaveBeenLastCalledWith("/usuarios/me/tema", { tema: Tema.CLARO });
  });
});

describe("profileService.changePassword", () => {
  beforeEach(() => {
    put.mockReset();
    localStorage.clear();
  });

  it("continua a sessão com o novo token devolvido pela API", async () => {
    localStorage.setItem("token", "token-antigo");
    put.mockResolvedValueOnce({ data: { token: "token-novo" } });

    await profileService.changePassword({ senha_atual: "atual", nova_senha: "nova-senha" });

    expect(localStorage.getItem("token")).toBe("token-novo");
  });

  it("mantém o token quando a API recusa a troca", async () => {
    localStorage.setItem("token", "token-antigo");
    put.mockRejectedValueOnce(new Error("senha incorreta"));

    await expect(
      profileService.changePassword({ senha_atual: "errada", nova_senha: "nova-senha" })
    ).rejects.toThrow("senha incorreta");

    expect(localStorage.getItem("token")).toBe("token-antigo");
  });
});
