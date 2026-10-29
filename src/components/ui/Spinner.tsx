export default function Spinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 dark:border-zinc-700 dark:border-t-emerald-500" />
      {label}
    </div>
  );
}
