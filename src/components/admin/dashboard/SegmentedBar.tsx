import type { LucideIcon } from "lucide-react";
import { percentOf } from "../../../utils/adminDashboard";

export interface BarPart {
  label: string;
  value: number;
  color: string;
  // quando a cor indica uma situação (concluída, atrasada), o ícone evita depender só dela
  icon?: LucideIcon;
}

// Divide um total em partes: a barra mostra a proporção e a lista abaixo traz os números
export default function SegmentedBar({ parts }: { parts: BarPart[] }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden="true">
        {parts
          .filter((part) => part.value > 0)
          .map((part) => (
            <div key={part.label} className="min-w-0.5" style={{ flexGrow: part.value, backgroundColor: part.color }} />
          ))}
      </div>

      <ul className="mt-4 space-y-2">
        {parts.map(({ label, value, color, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            {Icon ? (
              <Icon className="h-4 w-4 shrink-0" style={{ color }} />
            ) : (
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
            )}
            <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{label}</span>
            <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{value}</span>
            <span className="w-10 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {percentOf(value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
