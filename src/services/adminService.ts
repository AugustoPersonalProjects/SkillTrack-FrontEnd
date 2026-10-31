import api from "./api";
import type {
  AdminDashboard,
  AdminResumo,
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
} from "../types/interfaces";

// Chamadas usadas pelo painel de administração (perfil ADMIN)
export const adminService = {
  async getResumo(): Promise<AdminResumo> {
    const response = await api.get<AdminResumo>("/admin/resumo");
    return response.data;
  },

  async getDashboard(): Promise<AdminDashboard> {
    const response = await api.get<AdminDashboard>("/admin/dashboard");
    return response.data;
  },

  async getUsuario(id: number): Promise<Usuario> {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async createUsuario(data: UsuarioCreateRequest): Promise<Usuario> {
    const response = await api.post<Usuario>("/usuarios", data);
    return response.data;
  },

  async updateUsuario(id: number, data: UsuarioUpdateRequest): Promise<Usuario> {
    // senha em branco não é enviada, para manter a atual
    const body = { ...data, senha: data.senha?.trim() ? data.senha : undefined };
    const response = await api.put<Usuario>(`/usuarios/${id}`, body);
    return response.data;
  },

  async deleteUsuario(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
