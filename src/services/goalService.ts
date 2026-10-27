import api from "./api";
import { type Goal, type GoalRequest } from "../types/interfaces";
import { addNotification } from "../utils/notificationHelper";

export const goalService = {
  async getAllGoals(): Promise<Goal[]> {
    const response = await api.get("/goals");
    return response.data.content || response.data;
  },

  async getGoalById(id: number): Promise<Goal> {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  async getUserGoals(userId: number): Promise<Goal[]> {
    const response = await api.get(`/goals/user/${userId}`);
    return response.data;
  },

  async createGoal(data: GoalRequest): Promise<Goal> {
    const response = await api.post("/goals", data);
    addNotification("Nova meta criada com sucesso!", "goal");
    return response.data;
  },

  async updateGoal(id: number, data: GoalRequest): Promise<Goal> {
    const response = await api.put(`/goals/${id}`, data);
    addNotification("Meta atualizada!", "goal");
    return response.data;
  },

  async completeGoal(id: number): Promise<boolean> {
    await api.post(`/goals/${id}/complete`);
    addNotification("Meta concluída com sucesso!", "goal");
    return true;
  },

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`/goals/${id}`);
    addNotification("Meta removida com sucesso!", "goal");
  },
};
