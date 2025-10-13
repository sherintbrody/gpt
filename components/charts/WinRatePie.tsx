"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#10b981", "#f43f5e"]; // green, red

export default function WinRatePie({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            isAnimationActive
            animationDuration={500}
            label={({ value }) => `${Math.round((value / total) * 100)}%`}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
