import api from "../api/api";
import type { Skill, SkillRequest, Category, Goal, GoalRequest, Progress, ProgressRequest } from "../types/skill";

export const skillService = {
  // Skills
  async getSkills(page: number = 0, size: number = 10): Promise<Skill[]> {
    try {
      const response = await api.get(`/api/skills?page=${page}&size=${size}`);
      // Para estrutura HATEOAS do Spring
      if (response.data._embedded?.skillResponseDTOList) {
        return response.data._embedded.skillResponseDTOList;
      }
      return response.data.content || [];
    } catch (error) {
      console.error("Erro ao carregar skills:", error);
      return [];
    }
  },

  async getSkillById(id: number): Promise<Skill | null> {
    try {
      const response = await api.get(`/api/skills/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar skill:", error);
      return null;
    }
  },

  async createSkill(skillData: SkillRequest): Promise<Skill | null> {
    try {
      const response = await api.post("/api/skills", skillData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar skill:", error);
      throw error;
    }
  },

  async updateSkill(id: number, skillData: SkillRequest): Promise<Skill | null> {
    try {
      const response = await api.put(`/api/skills/${id}`, skillData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar skill:", error);
      throw error;
    }
  },

  async deleteSkill(id: number): Promise<boolean> {
    try {
      await api.delete(`/api/skills/${id}`);
      return true;
    } catch (error) {
      console.error("Erro ao deletar skill:", error);
      throw error;
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get("/categories");
      // Para estrutura HATEOAS do Spring
      if (response.data._embedded?.categoryResponseDTOList) {
        return response.data._embedded.categoryResponseDTOList;
      }
      return response.data.content || [];
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      // Fallback para desenvolvimento
      return this.getMockCategories();
    }
  },

  getMockCategories(): Category[] {
    return [
      { id_category: 1, name: "Backend", description: "Tecnologias de servidor" },
      { id_category: 2, name: "Frontend", description: "Tecnologias de interface" },
      { id_category: 3, name: "Database", description: "Bancos de dados" },
      { id_category: 4, name: "DevOps", description: "Infraestrutura e deploy" }
    ];
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    try {
      const response = await api.get("/goals");
      if (response.data._embedded?.goalResponseDTOList) {
        return response.data._embedded.goalResponseDTOList;
      }
      return response.data.content || [];
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      return [];
    }
  },

  async createGoal(goalData: GoalRequest): Promise<Goal | null> {
    try {
      const response = await api.post("/goals", goalData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      throw error;
    }
  },

  async updateGoal(id: number, goalData: GoalRequest): Promise<Goal | null> {
    try {
      const response = await api.put(`/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      throw error;
    }
  },

  async deleteGoal(id: number): Promise<boolean> {
    try {
      await api.delete(`/goals/${id}`);
      return true;
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
      throw error;
    }
  },

  async completeGoal(id: number): Promise<boolean> {
    try {
      await api.post(`/goals/${id}/complete`);
      return true;
    } catch (error) {
      console.error("Erro ao completar meta:", error);
      throw error;
    }
  },

  // Progress
  async getProgress(): Promise<Progress[]> {
    try {
      const response = await api.get("/progress");
      if (response.data._embedded?.progressResponseDTOList) {
        return response.data._embedded.progressResponseDTOList;
      }
      return response.data.content || [];
    } catch (error) {
      console.error("Erro ao carregar progressos:", error);
      return [];
    }
  },

  async createProgress(progressData: ProgressRequest): Promise<Progress | null> {
    try {
      const response = await api.post("/progress", progressData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar progresso:", error);
      throw error;
    }
  }
};