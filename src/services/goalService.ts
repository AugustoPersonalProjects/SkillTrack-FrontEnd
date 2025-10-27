import api from "../api/api";
import type { Goal } from "../types/skill";

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const response = await api.get("/goals");
    return response.data;
  },

  async getUserGoals(userId: number): Promise<Goal[]> {
    const response = await api.get(`/goals/user/${userId}`);
    return response.data;
  },

  async createGoal(goalData: any): Promise<Goal> {
    const response = await api.post("/goals", goalData);
    return response.data;
  },

  async updateGoal(id: number, goalData: any): Promise<Goal> {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`/goals/${id}`);
  }
};