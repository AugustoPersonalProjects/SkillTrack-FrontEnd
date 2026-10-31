import api from "./api";
import type {
  AlteracaoEmailRequest,
  AlteracaoSenhaRequest,
  DadosPessoaisRequest,
  Tema,
  TokenResponse,
  Usuario,
} from "../types/interfaces";

let temaEmEnvio: Promise<unknown> = Promise.resolve();

// Alterações feitas pelo próprio usuário logado
export const profileService = {
  async updateProfile(data: DadosPessoaisRequest): Promise<Usuario> {
    const response = await api.put<Usuario>("/usuarios/me", data);
    return response.data;
  },

  // As trocas seguem em fila: com cliques rápidos, a última escolha é sempre a última a chegar à API
  async changeTheme(tema: Tema): Promise<void> {
    temaEmEnvio = temaEmEnvio.catch(() => {}).then(() => api.put("/usuarios/me/tema", { tema }));
    await temaEmEnvio;
  },

  async changeEmail(data: AlteracaoEmailRequest): Promise<Usuario> {
    const response = await api.put<Usuario>("/usuarios/me/email", data);
    return response.data;
  },

  // A troca invalida os tokens antigos: esta sessão continua com o novo token que vem na resposta
  async changePassword(data: AlteracaoSenhaRequest): Promise<void> {
    const response = await api.put<TokenResponse>("/usuarios/me/senha", data);
    localStorage.setItem("token", response.data.token);
  },
};
