"use client";
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from "recharts";

type Point = { day: string; equity: number; dailyPnl: number };

export default function EquityCurve({ data }: { data: Point[] }) {
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = payload.dailyPnl >= 0 ? "#10b981" : "#ef4444";
    return <circle cx={cx} cy={cy} r={3} stroke={color} fill="#fff" strokeWidth={2} />;
  };

  return (
    <div className="h-[28rem]">
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
          <Bar dataKey="dailyPnl" name="Daily P&L" isAnimationActive animationDuration={500}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.dailyPnl >= 0 ? "#10b981" : "#ef4444"} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="url(#equityGrad)"
            strokeWidth={3}
            dot={renderDot}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
