import api from "./api";
import {
  Tema,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type Usuario,
} from "../types/interfaces";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { clearSession } from "../utils/session";
import { applyTheme } from "../utils/theme";

const saveUser = ({ id_usuario, nome, email, perfil, data_criacao, bio, cor_avatar, tema }: Usuario): Usuario => {
  const userData: Usuario = { id_usuario, nome, email, perfil, data_criacao, bio, cor_avatar, tema };
  localStorage.setItem("user", JSON.stringify(userData));
  return userData;
};

// Salva o token e carrega os dados do usuário dono dele
const startSession = async (token: string): Promise<Usuario> => {
  localStorage.setItem("token", token);

  const response = await api.get<Usuario>("/usuarios/me");
  const userData = saveUser(response.data);

  // o tema escolhido na conta vale em qualquer dispositivo; em SISTEMA, cada navegador mantém o seu
  if (userData.tema !== Tema.SISTEMA) {
    applyTheme(userData.tema);
  }
  return userData;
};

export const authService = {
  async login(loginData: LoginRequest): Promise<Usuario> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", loginData);

      if (!response.data?.token) {
        throw new Error("Token não retornado pela API");
      }

      return await startSession(response.data.token);
    } catch (error: unknown) {
      this.logout();
      throw new Error(
        getApiErrorMessage(error, "Falha no login. Verifique suas credenciais.")
      );
    }
  },

  /*
  Cadastra um novo usuário e já inicia a sessão
   */
  async register(userData: RegisterRequest): Promise<Usuario> {
    try {
      const response = await api.post<LoginResponse>("/auth/register", userData);
      return await startSession(response.data.token);
    } catch (error: unknown) {
      this.logout();
      throw new Error(getApiErrorMessage(error, "Falha no registro de usuário."));
    }
  },

  logout() {
    clearSession();
  },

  // Recarrega os dados do usuário logado (ex.: perfil alterado por um ADMIN)
  async refreshSession(): Promise<Usuario | null> {
    const token = this.getToken();
    return token ? startSession(token) : null;
  },

  saveUser,

  getCurrentUser(): Usuario | null {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },
};
