export const enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE", 
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

export const enum Perfil {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface Skill {
  id_skill: number;
  name: string;
  description?: string;
  category_id: number;
  level: SkillLevel;
  progress_history?: Progress[];
  goals?: Goal[];
}

export interface SkillRequest {
  name: string;
  description?: string;
  categoryId: number;
  level: SkillLevel;
  userId: number;
}

export interface Progress {
  id_progress: number;
  percentage: number;
  date: string; // LocalDate do Java
  notes?: string;
  skill_id: number;
  goal_id?: number;
}

export interface ProgressRequest {
  skillId: number;
  percentage: number;
  date?: string;
  notes?: string;
}

export interface Goal {
  id_goal: number;
  title: string;
  description: string;
  deadline: string; // LocalDate do Java
  completed: boolean;
  skill_id: number;
  user_id?: number;
}

export interface GoalRequest {
  title: string;
  description: string;
  deadline: string;
  skillId: number;
  userId?: number;
}

export interface Category {
  id_category: number;
  name: string;
  description?: string;
}

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: Perfil;
  data_criacao: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  id: number;
}

export interface TokenResponse {
  token: string;
}