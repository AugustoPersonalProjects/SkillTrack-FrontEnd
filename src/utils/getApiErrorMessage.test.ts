import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./getApiErrorMessage";

const erroDaApi = (data: unknown) => ({ isAxiosError: true, response: { data } });

describe("getApiErrorMessage", () => {
  it("lê o campo message das respostas de erro comuns", () => {
    const erro = erroDaApi({ error: "Erro de regra de negócio", message: "E-mail já cadastrado." });

    expect(getApiErrorMessage(erro, "Padrão")).toBe("E-mail já cadastrado.");
  });

  it("lê a primeira mensagem dos erros de validação", () => {
    const erro = erroDaApi([
      { campo: "nome", mensagem: "O nome é obrigatório" },
      { campo: "email", mensagem: "O e-mail é obrigatório" },
    ]);

    expect(getApiErrorMessage(erro, "Padrão")).toBe("O nome é obrigatório");
  });

  it("usa o texto padrão quando a resposta não traz mensagem", () => {
    expect(getApiErrorMessage(erroDaApi({ error: "Parâmetro inválido" }), "Padrão")).toBe("Padrão");
    expect(getApiErrorMessage(erroDaApi([]), "Padrão")).toBe("Padrão");
    expect(getApiErrorMessage(erroDaApi(undefined), "Padrão")).toBe("Padrão");
  });

  it("usa a mensagem de erros que não vêm da API", () => {
    expect(getApiErrorMessage(new Error("Token não retornado"), "Padrão")).toBe("Token não retornado");
    expect(getApiErrorMessage("desconhecido", "Padrão")).toBe("Padrão");
  });
});
