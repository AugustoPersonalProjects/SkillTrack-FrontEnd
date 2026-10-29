// Classes compartilhadas pelos formulários e cartões, para manter o visual consistente

export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 " +
  "focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export const cardClass =
  "rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonPrimary =
  `${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500`;

export const buttonSecondary =
  `${buttonBase} border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 ` +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

export const buttonGhost =
  `${buttonBase} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`;

export const buttonDanger =
  `${buttonBase} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40`;

export const iconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors " +
  "hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
