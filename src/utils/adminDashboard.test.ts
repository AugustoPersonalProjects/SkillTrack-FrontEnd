import { describe, expect, it } from "vitest";
import {
  dropLeadingEmptyMonths,
  foldCategories,
  formatMonthLong,
  formatMonthShort,
  formatWeekLong,
  formatWeekShort,
  niceCountTicks,
  percentOf,
} from "./adminDashboard";

describe("formatação dos períodos", () => {
  it("mostra o mês do período, sem voltar para o mês anterior no fuso do Brasil", () => {
    expect(formatMonthShort("2026-05")).toBe("mai");
    expect(formatMonthLong("2026-05")).toBe("maio de 2026");
    expect(formatMonthShort("2026-01")).toBe("jan");
  });

  it("mostra o dia em que a semana começa", () => {
    expect(formatWeekShort("2026-08-10")).toBe("10/08");
    expect(formatWeekLong("2026-08-10")).toBe("Semana de 10/08/2026");
  });
});

describe("niceCountTicks", () => {
  it("usa números redondos que cobrem o maior valor", () => {
    expect(niceCountTicks(36)).toEqual([0, 10, 20, 30, 40]);
    expect(niceCountTicks(12)).toEqual([0, 5, 10, 15]);
    expect(niceCountTicks(5)).toEqual([0, 2, 4, 6]);
    expect(niceCountTicks(4)).toEqual([0, 1, 2, 3, 4]);
    expect(niceCountTicks(1500)).toEqual([0, 500, 1000, 1500]);
  });

  it("só usa números inteiros, mesmo com valores pequenos", () => {
    expect(niceCountTicks(1)).toEqual([0, 1]);
    expect(niceCountTicks(0)).toEqual([0, 1]);
  });
});

describe("percentOf", () => {
  it("arredonda a porcentagem", () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(2, 3)).toBe(67);
  });

  it("retorna zero quando o total é zero", () => {
    expect(percentOf(0, 0)).toBe(0);
  });
});

describe("dropLeadingEmptyMonths", () => {
  const mes = (periodo: string, skills = 0, metas = 0, metasConcluidas = 0) => ({ periodo, skills, metas, metasConcluidas });

  it("começa no primeiro mês com dados e mantém os zeros depois dele", () => {
    const registros = [mes("2026-08"), mes("2026-09", 0, 2), mes("2026-10"), mes("2026-11", 1)];

    expect(dropLeadingEmptyMonths(registros).map((m) => m.periodo)).toEqual(["2026-09", "2026-10", "2026-11"]);
  });

  it("considera também as metas concluídas", () => {
    expect(dropLeadingEmptyMonths([mes("2026-10"), mes("2026-11", 0, 0, 1)])).toHaveLength(1);
  });

  it("retorna vazio quando nenhum mês tem dados", () => {
    expect(dropLeadingEmptyMonths([mes("2026-10"), mes("2026-11")])).toEqual([]);
  });
});

describe("foldCategories", () => {
  const categorias = (quantidade: number) =>
    Array.from({ length: quantidade }, (_, i) => ({ categoria: `Categoria ${i + 1}`, total: quantidade - i }));

  it("mantém as categorias até o limite", () => {
    expect(foldCategories(categorias(8))).toHaveLength(8);
  });

  it("junta as menores em Outras acima do limite", () => {
    const resultado = foldCategories(categorias(10));

    expect(resultado).toHaveLength(8);
    expect(resultado[6]).toEqual({ categoria: "Categoria 7", total: 4 });
    // categorias 8, 9 e 10, com 3, 2 e 1 skills
    expect(resultado[7]).toEqual({ categoria: "Outras (3)", total: 6 });
  });
});
