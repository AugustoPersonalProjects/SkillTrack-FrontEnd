// ENUMS
export const SkillLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

export const Perfil = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Perfil = (typeof Perfil)[keyof typeof Perfil];

// INTERFACES DE DOMÍNIO
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

export interface Category {
  id_category: number;
  name: string;
  description?: string;
}

export interface Goal {
  id_goal: number;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  skill_id: number;
  user_id?: number;
}

export interface GoalRequest {
  title: string;
  description?: string;
  deadline: string;
  skill_id: number;
  user_id?: number;
}

export interface Progress {
  id_progress: number;
  percentage: number;
  date: string; 
  notes?: string;
  skill_id: number;
  goal_id?: number;
}

export interface ProgressRequest {
  skill_id: number;
  percentage: number;
  date?: string;
  notes?: string;
}

// USUÁRIO / AUTENTICAÇÃO
export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: Perfil;
  data_criacao: string;
  foto?: string;
}

/**
 DTO de login
 */
export interface LoginRequest {
  email: string;
  senha: string;
}

/**
Resposta de login
 */
export interface LoginResponse {
  token: string;
}

/**
DTO para registro de usuário
 */
export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

/**
Token JWT puro
 */
export interface TokenResponse {
  token: string;
}
