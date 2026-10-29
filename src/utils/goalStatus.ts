import type { Goal } from "../types/interfaces";
import { parseLocalDate, todayLocalISO } from "./date";

export type GoalStatus = "pending" | "overdue" | "completed";

// Dias entre hoje e o prazo (negativo quando o prazo já passou)
export const getDaysUntil = (deadline: string) =>
  Math.round(
    (parseLocalDate(deadline).getTime() - parseLocalDate(todayLocalISO()).getTime()) / (1000 * 60 * 60 * 24)
  );

export const getGoalStatus = (goal: Goal): GoalStatus => {
  if (goal.completed) return "completed";
  if (goal.deadline && getDaysUntil(goal.deadline) < 0) return "overdue";
  return "pending";
};

export const describeDeadline = (goal: Goal) => {
  if (!goal.deadline) return "Sem prazo";
  const days = getDaysUntil(goal.deadline);
  if (goal.completed) return `Prazo ${parseLocalDate(goal.deadline).toLocaleDateString("pt-BR")}`;
  if (days < 0) return `Atrasada há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`;
  if (days === 0) return "Vence hoje";
  return `${days} ${days === 1 ? "dia restante" : "dias restantes"}`;
};

export const GOAL_STATUS_BADGE: Record<GoalStatus, { label: string; className: string }> = {
  pending: { label: "Em andamento", className: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  overdue: { label: "Atrasada", className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
  completed: {
    label: "Concluída",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
};
