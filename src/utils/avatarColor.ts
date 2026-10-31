import { CorAvatar } from "../types/interfaces";

export const AVATAR_COLOR_LABELS: Record<CorAvatar, string> = {
  ESMERALDA: "Esmeralda",
  AZUL: "Azul",
  VIOLETA: "Violeta",
  ROSA: "Rosa",
  AMBAR: "Âmbar",
  GRAFITE: "Grafite",
};

export const AVATAR_COLOR_CLASSES: Record<CorAvatar, string> = {
  ESMERALDA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  AZUL: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  VIOLETA: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
  ROSA: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
  AMBAR: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  GRAFITE: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
};

export const AVATAR_COLORS = Object.values(CorAvatar);
