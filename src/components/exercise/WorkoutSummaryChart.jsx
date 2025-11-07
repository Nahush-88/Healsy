import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function WorkoutSummaryChart({ workoutPlan = [] }) {
  // Aggregate exercises count per day
  const data = workoutPlan.map(w => ({
    day: w.day || "",
    exercises: Array.isArray(w.exercises) ? w.exercises.length : 0
  }));

  if (!data.length) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        No workout data to display.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
          <XAxis dataKey="day" tick={{ fill: 'var(--tw-prose-body)' }} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--tw-prose-body)' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(val) => [val, "Exercises"]}
          />
          <Bar dataKey="exercises" radius={[6, 6, 0, 0]} fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}