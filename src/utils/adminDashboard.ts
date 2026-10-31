import type { AdminDashboard } from "../types/interfaces";
import { parseLocalDate } from "./date";

export const AXIS_TICK = { fill: "var(--chart-text)", fontSize: 12 };

const parseMonth = (periodo: string) => parseLocalDate(`${periodo}-01`);

// "2026-05" vira "mai"
export const formatMonthShort = (periodo: string) =>
  parseMonth(periodo).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

// "2026-05" vira "maio de 2026"
export const formatMonthLong = (periodo: string) =>
  parseMonth(periodo).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

// "2026-08-10" vira "10/08"
export const formatWeekShort = (periodo: string) =>
  parseLocalDate(periodo).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

// "2026-08-10" vira "Semana de 10/08/2026"
export const formatWeekLong = (periodo: string) => `Semana de ${parseLocalDate(periodo).toLocaleDateString("pt-BR")}`;

// Marcas redondas para um eixo de contagens: 0, 10, 20, 30, 40 em vez de 0, 9, 18, 27, 36
export function niceCountTicks(max: number, maxIntervals = 4) {
  const upper = Math.max(max, 1);
  for (let scale = 1; ; scale *= 10) {
    for (const multiple of [1, 2, 5]) {
      const step = multiple * scale;
      const intervals = Math.ceil(upper / step);
      if (intervals <= maxIntervals) {
        return Array.from({ length: intervals + 1 }, (_, i) => i * step);
      }
    }
  }
}

export const percentOf = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

// Antes de a data ser registrada, o zero significa "não se sabe", então o gráfico começa no primeiro mês com dados
export function dropLeadingEmptyMonths(registros: AdminDashboard["registrosPorMes"]) {
  const first = registros.findIndex((mes) => mes.skills + mes.metas + mes.metasConcluidas > 0);
  return first === -1 ? [] : registros.slice(first);
}

// A API já envia as categorias em ordem decrescente de skills; acima do limite, as menores viram "Outras"
export function foldCategories(categorias: AdminDashboard["skillsPorCategoria"], limit = 8) {
  if (categorias.length <= limit) return categorias;

  const others = categorias.slice(limit - 1);
  return [
    ...categorias.slice(0, limit - 1),
    { categoria: `Outras (${others.length})`, total: others.reduce((sum, item) => sum + item.total, 0) },
  ];
}
