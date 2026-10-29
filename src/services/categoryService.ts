import api from "./api";
import type { Category, CategoryRequest } from "../types/interfaces";
import { addNotification } from "../utils/notificationHelper";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      // a listagem é paginada; as categorias são poucas, então vêm todas de uma vez
      const response = await api.get("/categories", { params: { size: 200 } });
      const categories: Category[] =
        response.data._embedded?.categoryResponseDTOList ?? response.data.content ?? [];
      return [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      return [];
    }
  },

  // As operações abaixo são restritas ao perfil ADMIN
  async createCategory(data: CategoryRequest): Promise<Category> {
    const response = await api.post("/categories", data);
    addNotification(`Categoria criada: ${data.name}`, "info");
    return response.data;
  },

  async updateCategory(id: number, data: CategoryRequest): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
