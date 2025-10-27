import api from "./api";
import type { LoginRequest, LoginResponse, TokenResponse } from "../types/skill";

export const authService = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await api.post("/usuarios", loginData);
    return response.data;
  },

  async loginLegacy(email: string, senha: string): Promise<TokenResponse> {
    const response = await api.post("/auth", { email, senha });
    return response.data;
  },

  async register(userData: any): Promise<LoginResponse> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  }
};