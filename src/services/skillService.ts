import api from "./api";
import { type Skill, type SkillRequest } from "../types/interfaces";
import { addNotification } from "../utils/notificationHelper";

export const skillService = {
  // Lista todas as skills (com suporte a paginação + HATEOAS)
  async getSkills(): Promise<Skill[]> {
    const response = await api.get("/api/skills");
    const data = response.data;
    if (data._embedded) {
      const embeddedKeys = Object.keys(data._embedded);
      return data._embedded[embeddedKeys[0]] || [];
    }
    return data.content || data;
  },

  // Lista as skills do usuário logado
  async getUserSkills(userId: number): Promise<Skill[]> {
    const response = await api.get(`/api/skills/user/${userId}`);
    return response.data;
  },

  // Busca uma skill específica por ID
  async getSkillById(id: number): Promise<Skill> {
    const response = await api.get(`/api/skills/${id}`);
    return response.data?.content || response.data;
  },

  // Cria uma nova skill
  async createSkill(data: SkillRequest): Promise<Skill> {
    const response = await api.post("/api/skills", data);
    addNotification(`Nova skill criada: ${data.name}`, "skill");
    return response.data;
  },

  // Atualiza uma skill existente
  async updateSkill(id: number, data: Partial<SkillRequest>): Promise<Skill> {
    const response = await api.put(`/api/skills/${id}`, data);
    addNotification(`Skill atualizada: ${data.name || "Habilidade"}`, "skill");
    return response.data;
  },

  // Deleta uma skill
  async deleteSkill(id: number): Promise<void> {
    await api.delete(`/api/skills/${id}`);
    addNotification("Skill removida com sucesso!", "skill");
  },
};
