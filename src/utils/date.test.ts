import { afterEach, describe, expect, it, vi } from "vitest";
import { parseLocalDate, todayLocalISO } from "./date";

describe("parseLocalDate", () => {
  it("mantém o dia informado no fuso do Brasil", () => {
    const data = parseLocalDate("2026-10-31");

    expect([data.getFullYear(), data.getMonth() + 1, data.getDate()]).toEqual([2026, 10, 31]);
  });

  it("evita o dia anterior que new Date causa ao ler a data como UTC", () => {
    expect(new Date("2026-10-31").getDate()).toBe(30);
    expect(parseLocalDate("2026-10-31").getDate()).toBe(31);
  });
});

describe("todayLocalISO", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa o dia local mesmo quando em UTC já é o dia seguinte", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T01:00:00Z")); // 22h de 31/10 em São Paulo

    expect(todayLocalISO()).toBe("2026-10-31");
  });

  it("preenche o mês e o dia com zero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 12));

    expect(todayLocalISO()).toBe("2026-01-05");
  });
});
