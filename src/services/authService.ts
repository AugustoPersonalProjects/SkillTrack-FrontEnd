import api from "./api";
import {
  Perfil,
  type LoginRequest,
  type LoginResponse,
  type Usuario,
} from "../types/interfaces";

export const authService = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", loginData);
      const data = response.data;

      if (!data?.token) {
        throw new Error("Token não retornado pela API");
      }

      // Salva o token
      localStorage.setItem("token", data.token);

      // Agora busca o usuário no backend pelo email para preencher os campos corretos
      const userResponse = await api.get(`/usuarios?email=${loginData.email}`);
      const userList = userResponse.data.content || [];
      const usuarioApi = userList.length > 0 ? userList[0] : {};

      const userData: Usuario = {
        id_usuario: usuarioApi.id_usuario ?? 0,
        nome: usuarioApi.nome ?? data.name ?? "",
        email: usuarioApi.email ?? loginData.email,
        perfil:
          usuarioApi.perfil && Object.values(Perfil).includes(usuarioApi.perfil)
            ? usuarioApi.perfil
            : Perfil.USER,
        data_criacao: usuarioApi.data_criacao ?? new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Usuário salvo:", userData);

      return data;
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      throw new Error(
        error.response?.data?.message ||
          "Falha no login. Verifique suas credenciais."
      );
    }
  },

  /*
  Cadastra um novo usuário
   */
  async register(userData: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<Usuario> {
    try {
      const response = await api.post("/usuarios", userData);
      return response.data;
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      throw new Error(
        error.response?.data?.message || "Falha no registro de usuário."
      );
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
