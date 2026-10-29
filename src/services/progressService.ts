import api from "./api";
import type { Progress, ProgressRequest } from "../types/interfaces";
import { addNotification } from "../utils/notificationHelper";

export const progressService = {
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

  async createProgress(
    progressData: ProgressRequest
  ): Promise<Progress | null> {
    try {
      const response = await api.post("/progress", progressData);
      addNotification(`Progresso registrado: ${progressData.percentage}%`, "skill");
      return response.data;
    } catch (error) {
      console.error("Erro ao criar progresso:", error);
      throw error;
    }
  },
};
