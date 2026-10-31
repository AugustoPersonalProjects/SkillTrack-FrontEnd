import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, niceCountTicks } from "../../../utils/adminDashboard";
import ChartTooltip from "./ChartTooltip";

interface ColumnSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface ColumnChartProps {
  // cada ponto traz o rótulo do eixo, o rótulo do tooltip e os valores das séries
  data: ({ rotulo: string; rotuloCompleto: string } & Record<string, string | number>)[];
  series: ColumnSeries[];
  height?: number;
}

export default function ColumnChart({ data, series, height = 240 }: ColumnChartProps) {
  const ticks = niceCountTicks(Math.max(...data.flatMap((point) => series.map((serie) => Number(point[serie.dataKey])))));

  return (
    <div>
      {/* com uma série só, o título do card já diz o que está no gráfico */}
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          {series.map((serie) => (
            <li key={serie.dataKey} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: serie.color }} />
              {serie.name}
            </li>
          ))}
        </ul>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="rotulo"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            interval="preserveStartEnd"
            minTickGap={8}
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} ticks={ticks} domain={[0, ticks[ticks.length - 1]]} width={48} />
          <Tooltip content={ChartTooltip} cursor={{ fill: "var(--chart-cursor)" }} isAnimationActive={false} />
          {series.map((serie) => (
            <Bar
              key={serie.dataKey}
              dataKey={serie.dataKey}
              name={serie.name}
              fill={serie.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              activeBar={{ fillOpacity: 0.85 }}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
