import { useState, type ReactNode } from "react";
import { ChartColumn, Table2 } from "lucide-react";
import Section from "../../ui/Section";
import { buttonGhost } from "../../ui/styles";

export interface ChartTable {
  headers: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  description: string;
  // a mesma informação do gráfico em forma de texto, para quem não consegue ler o desenho
  table: ChartTable;
  children: ReactNode;
}

export default function ChartCard({ title, description, table, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  const Icon = showTable ? ChartColumn : Table2;

  return (
    <Section
      title={title}
      description={description}
      action={
        <button type="button" onClick={() => setShowTable(!showTable)} className={`${buttonGhost} shrink-0 px-2 py-1 text-xs`}>
          <Icon className="h-3.5 w-3.5" />
          {showTable ? "Ver gráfico" : "Ver tabela"}
        </button>
      }
    >
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {table.headers.map((header, i) => (
                  <th key={header} className={`px-2 py-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-2 py-1.5 ${
                        i > 0 ? "text-right tabular-nums text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </Section>
  );
}
