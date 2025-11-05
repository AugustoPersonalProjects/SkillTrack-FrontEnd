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
      return this.getMockCategories();
    }
  },

  getMockCategories(): Category[] {
    return [
      { id_category: 1, name: "Backend", description: "Tecnologias de servidor" },
      { id_category: 2, name: "Frontend", description: "Tecnologias de interface" },
      { id_category: 3, name: "Database", description: "Bancos de dados" },
      { id_category: 4, name: "DevOps", description: "Infraestrutura e deploy" },
    ];
  },
};
