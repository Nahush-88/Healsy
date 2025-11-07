import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function WeeklyHydrationChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Not enough data yet. Log water over a few days to see your weekly progress.
      </div>
    );
  }

  // Ensure safe numbers
  const chartData = data.map(d => ({
    date: d.date,
    intake: Number(d.intake || 0),
    target: Number(d.target || 0),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--tw-prose-body)' }} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--tw-prose-body)' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(val, name) => [val + " ml", name]}
          />
          <Legend />
          <Bar dataKey="intake" name="Intake" radius={[6, 6, 0, 0]} fill="#3b82f6" />
          <Bar dataKey="target" name="Target" radius={[6, 6, 0, 0]} fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}