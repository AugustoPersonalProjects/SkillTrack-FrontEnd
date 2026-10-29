import { SkillLevel } from "../types/interfaces";

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  EXPERT: "Especialista",
};

export const SKILL_LEVEL_BADGE: Record<SkillLevel, string> = {
  BEGINNER: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  INTERMEDIATE: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  ADVANCED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  EXPERT: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
};

export const SKILL_LEVELS = Object.values(SkillLevel);
