"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

type Point = { day: string; equity: number; dailyPnl: number };

export default function EquityCurve({ data }: { data: Point[] }) {
  const bars = data.map((d) => (d.dailyPnl >= 0 ? "#10b981" : "#ef4444"));

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="dailyPnl" name="Daily P&L">
            {bars.map((fill, i) => (
              <Cell key={i} fill={fill} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="url(#equityGrad)"
            strokeWidth={3}
            dot={{ r: 3, stroke: "#3b82f6", fill: "#fff" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
