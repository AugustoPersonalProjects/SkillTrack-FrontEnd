import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, niceCountTicks } from "../../../utils/adminDashboard";
import ChartTooltip from "./ChartTooltip";

const COLOR = "var(--chart-serie-1)";

interface TrendChartProps {
  data: { rotulo: string; rotuloCompleto: string; total: number }[];
  name: string;
}

export default function TrendChart({ data, name }: TrendChartProps) {
  const ticks = niceCountTicks(Math.max(...data.map((point) => point.total)));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="rotulo"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} ticks={ticks} domain={[0, ticks[ticks.length - 1]]} width={48} />
        <Tooltip content={ChartTooltip} cursor={{ stroke: "var(--chart-axis)" }} isAnimationActive={false} />
        <Area
          type="linear"
          dataKey="total"
          name={name}
          stroke={COLOR}
          strokeWidth={2}
          fill={COLOR}
          fillOpacity={0.1}
          activeDot={{ r: 5, fill: COLOR, stroke: "var(--chart-surface)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
