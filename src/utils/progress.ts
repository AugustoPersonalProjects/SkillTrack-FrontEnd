import type { Skill, Progress } from "../types/interfaces";

// A API não garante a ordem do histórico: o mais recente é o de maior data (e maior id no empate)
export function getLatestProgress(skill: Skill): Progress | undefined {
  return [...(skill.progress_history ?? [])].sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") || a.id_progress - b.id_progress
  ).at(-1);
}

export function getLatestPercentage(skill: Skill): number {
  return getLatestProgress(skill)?.percentage ?? 0;
}
