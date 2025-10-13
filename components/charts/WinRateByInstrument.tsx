"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const COLORS: Record<string, string> = {
  XAUUSD: "#f59e0b", // amber
  NAS100: "#3b82f6", // blue
  US30: "#8b5cf6"    // violet
};
const DEFAULT = "#94a3b8"; // slate

export default function WinRateByInstrument({ data }: { data: { instrument: string; winRate: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="instrument" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="winRate" isAnimationActive animationDuration={500}>
            {data.map((d, i) => (
              <Cell key={i} fill={COLORS[d.instrument] || DEFAULT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
