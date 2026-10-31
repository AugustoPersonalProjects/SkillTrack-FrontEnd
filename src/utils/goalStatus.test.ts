import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Goal } from "../types/interfaces";
import { describeDeadline, getDaysUntil, getGoalStatus } from "./goalStatus";

const meta = (dados: Partial<Goal>): Goal => ({
  id_goal: 1,
  title: "Meta",
  description: "Meta",
  deadline: "2026-10-31",
  completed: false,
  skill_id: 1,
  ...dados,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 31, 22)); // 31/10, às 22h no horário local
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getDaysUntil", () => {
  it("conta os dias entre hoje e o prazo", () => {
    expect(getDaysUntil("2026-10-31")).toBe(0);
    expect(getDaysUntil("2026-11-01")).toBe(1);
    expect(getDaysUntil("2026-10-30")).toBe(-1);
  });
});

describe("getGoalStatus", () => {
  it("considera em andamento a meta que vence hoje", () => {
    expect(getGoalStatus(meta({ deadline: "2026-10-31" }))).toBe("pending");
  });

  it("considera atrasada a meta com prazo passado", () => {
    expect(getGoalStatus(meta({ deadline: "2026-10-30" }))).toBe("overdue");
  });

  it("dá prioridade à conclusão, mesmo com prazo passado", () => {
    expect(getGoalStatus(meta({ deadline: "2026-10-30", completed: true }))).toBe("completed");
  });
});

describe("describeDeadline", () => {
  it.each([
    ["2026-10-31", "Vence hoje"],
    ["2026-11-01", "1 dia restante"],
    ["2026-11-03", "3 dias restantes"],
    ["2026-10-30", "Atrasada há 1 dia"],
    ["2026-10-28", "Atrasada há 3 dias"],
  ])("descreve o prazo %s como %s", (deadline, descricao) => {
    expect(describeDeadline(meta({ deadline }))).toBe(descricao);
  });

  it("mostra a data do prazo em metas concluídas", () => {
    expect(describeDeadline(meta({ deadline: "2026-10-28", completed: true }))).toBe("Prazo 28/10/2026");
  });
});
