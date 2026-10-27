import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Usuario,
} from "../types/interfaces";

// Lê o id do usuário gravado no payload do JWT pelo backend (claim "id")
const getUserIdFromToken = (token: string): number => {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json).id;
};

// Salva o token e carrega os dados do usuário dono dele
const startSession = async (token: string): Promise<Usuario> => {
  localStorage.setItem("token", token);

  const response = await api.get<Usuario>(`/usuarios/${getUserIdFromToken(token)}`);
  const { id_usuario, nome, email, perfil, data_criacao } = response.data;
  const userData: Usuario = { id_usuario, nome, email, perfil, data_criacao };

  localStorage.setItem("user", JSON.stringify(userData));
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
    } catch (error: any) {
      this.logout();
      throw new Error(
        error.response?.data?.message ||
          "Falha no login. Verifique suas credenciais."
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
    } catch (error: any) {
      this.logout();
      const data = error.response?.data;
      // erros de validação chegam como lista [{ campo, mensagem }]
      const message = Array.isArray(data) ? data[0]?.mensagem : data?.message;
      throw new Error(message || "Falha no registro de usuário.");
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

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
