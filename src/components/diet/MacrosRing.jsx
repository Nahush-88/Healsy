import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  protein: "#3b82f6", // blue
  carbs: "#22c55e",   // green
  fat: "#f59e0b"      // amber
};

function parsePercent(v) {
  if (typeof v === "string" && v.trim().endsWith("%")) return Number(v.replace("%", "").trim());
  if (typeof v === "number") return v;
  return 0;
}

export default function MacrosRing({ distribution = {} }) {
  const protein = parsePercent(distribution.protein);
  const carbs = parsePercent(distribution.carbs);
  const fat = parsePercent(distribution.fat);

  const data = [
    { name: "Protein", value: protein, key: "protein" },
    { name: "Carbs", value: carbs, key: "carbs" },
    { name: "Fat", value: fat, key: "fat" }
  ];

  const total = protein + carbs + fat || 1;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [`${Math.round((val / total) * 100)}%`, name]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}