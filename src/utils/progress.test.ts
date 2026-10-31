import { describe, expect, it } from "vitest";
import { type Progress, type Skill, SkillLevel } from "../types/interfaces";
import { getLatestPercentage, getLatestProgress } from "./progress";

const registro = (id_progress: number, date: string, percentage: number): Progress => ({
  id_progress,
  date,
  percentage,
  skill_id: 1,
});

const skill = (progress_history?: Progress[]): Skill => ({
  id_skill: 1,
  name: "Java",
  category_id: 1,
  level: SkillLevel.BEGINNER,
  progress_history,
});

// A mesma regra existe em ProgressRepository.findLatestBySkillUserId, na API
describe("progresso atual da skill", () => {
  it("é 0 quando não há registros", () => {
    expect(getLatestPercentage(skill())).toBe(0);
    expect(getLatestPercentage(skill([]))).toBe(0);
  });

  it("é o registro de maior data, em qualquer ordem", () => {
    const historico = [registro(1, "2026-01-02", 40), registro(2, "2026-01-01", 80)];

    expect(getLatestPercentage(skill(historico))).toBe(40);
  });

  it("no empate de data, é o registro de maior id", () => {
    const historico = [registro(3, "2026-01-02", 70), registro(2, "2026-01-02", 40), registro(1, "2026-01-01", 80)];

    expect(getLatestProgress(skill(historico))?.id_progress).toBe(3);
    expect(getLatestPercentage(skill(historico))).toBe(70);
  });

  it("não altera a lista original", () => {
    const historico = [registro(2, "2026-01-02", 40), registro(1, "2026-01-01", 80)];

    getLatestProgress(skill(historico));

    expect(historico.map((r) => r.id_progress)).toEqual([2, 1]);
  });
});
