import api from "./api";
import type { DashboardData } from "../types/interfaces";

export const dashboardService = {
  // Estatísticas do usuário logado, calculadas pela API
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>("/dashboard");
    return response.data;
  },
};
