interface RankedBarsProps {
  items: { label: string; value: number }[];
}

// Barras na ordem recebida, proporcionais ao maior valor, com o número sempre visível em texto
export default function RankedBars({ items }: RankedBarsProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-4 text-sm">
            <span className="truncate text-zinc-700 dark:text-zinc-300">{item.label}</span>
            <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{item.value}</span>
          </div>
          <div className="h-2">
            {item.value > 0 && (
              <div
                className="h-2 rounded-r"
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: "var(--chart-serie-1)" }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
