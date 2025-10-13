"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export default function WinRateByInstrument({ data }: { data: { instrument: string; winRate: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="instrument" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="winRate" fill="url(#barTeal)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
