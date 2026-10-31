import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export default function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1 text-zinc-500 dark:text-zinc-400">{payload[0].payload.rotuloCompleto}</p>
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{entry.value}</span>
            <span className="text-zinc-500 dark:text-zinc-400">{entry.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
