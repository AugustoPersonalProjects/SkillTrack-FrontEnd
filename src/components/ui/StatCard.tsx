import type { LucideIcon } from "lucide-react";
import { cardClass } from "./styles";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
    </div>
  );
}
