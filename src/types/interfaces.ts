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

export const CorAvatar = {
  ESMERALDA: "ESMERALDA",
  AZUL: "AZUL",
  VIOLETA: "VIOLETA",
  ROSA: "ROSA",
  AMBAR: "AMBAR",
  GRAFITE: "GRAFITE",
} as const;

export type CorAvatar = (typeof CorAvatar)[keyof typeof CorAvatar];

export const Tema = {
  CLARO: "CLARO",
  ESCURO: "ESCURO",
  SISTEMA: "SISTEMA",
} as const;

export type Tema = (typeof Tema)[keyof typeof Tema];

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
  skill_id: number;
}

export interface ProgressRequest {
  skill_id: number;
  percentage: number;
  date?: string;
}

// Resposta do GET /dashboard: skillNames e skillProgressValues são alinhadas pelo índice
export interface DashboardData {
  totalSkills: number;
  totalGoals: number;
  averageProgress: number;
  skillNames: string[];
  skillProgressValues: number[];
  goals: Goal[];
  progressList: Progress[];
}

// USUÁRIO / AUTENTICAÇÃO
export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  perfil: Perfil;
  data_criacao: string;
  bio: string | null;
  cor_avatar: CorAvatar;
  tema: Tema;
}

// Dados que o próprio usuário altera sem confirmar a senha
export interface DadosPessoaisRequest {
  nome: string;
  bio: string;
  cor_avatar: CorAvatar;
}

export interface AlteracaoEmailRequest {
  email: string;
  senha_atual: string;
}

export interface AlteracaoSenhaRequest {
  senha_atual: string;
  nova_senha: string;
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

// ADMINISTRAÇÃO

// Criação de usuário pelo ADMIN (o perfil só é respeitado para ADMIN)
export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

// Na atualização a senha é opcional: vazia mantém a atual
export interface UsuarioUpdateRequest {
  nome: string;
  email: string;
  senha?: string;
  perfil?: Perfil;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface AdminUsuarioResumo extends Omit<Usuario, "bio" | "tema"> {
  totalSkills: number;
  totalGoals: number;
  completedGoals: number;
}

// Resposta do GET /admin/resumo
export interface AdminResumo {
  totalUsuarios: number;
  totalAdmins: number;
  totalSkills: number;
  totalGoals: number;
  completedGoals: number;
  totalProgress: number;
  totalCategories: number;
  usuarios: AdminUsuarioResumo[];
}

// Resposta do GET /admin/dashboard. O período é "yyyy-MM" nos meses e a segunda-feira nas semanas
export interface AdminDashboard {
  indicadores: {
    totalUsuarios: number;
    novosUsuarios30Dias: number;
    usuariosAtivos30Dias: number;
    totalSkills: number;
    progressoMedio: number;
    totalGoals: number;
    completedGoals: number;
    overdueGoals: number;
  };
  novosUsuariosPorMes: { periodo: string; total: number }[];
  progressosPorSemana: { periodo: string; total: number }[];
  registrosPorMes: { periodo: string; skills: number; metas: number; metasConcluidas: number }[];
  skillsSemData: number;
  metasSemData: number;
  skillsPorCategoria: { categoria: string; total: number }[];
  skillsPorNivel: { nivel: SkillLevel; total: number }[];
  usuariosMaisAtivos: { id_usuario: number; nome: string; cor_avatar: CorAvatar; registros: number }[];
}
