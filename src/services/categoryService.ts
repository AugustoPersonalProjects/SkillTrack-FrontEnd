import api from "./api";
import type { Category } from "../types/interfaces";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get("/categories");
      if (response.data._embedded?.categoryResponseDTOList) {
        return response.data._embedded.categoryResponseDTOList;
      }
      return response.data.content || [];
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      return [];
    }
  },
};
