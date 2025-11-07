
import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const PALETTE = {
  Blue: "#60A5FA",
  Red: "#F87171",
  Green: "#34D399",
  Yellow: "#FBBF24",
  Purple: "#A78BFA",
  Gold: "#FACC15",
};

// Stabilize labels so useMemo doesn't complain about missing dependency
const LABELS = ["Blue", "Red", "Green", "Yellow", "Purple", "Gold"];

export default function AuraColorDonut({ analysis }) {
  const main = analysis?.aura_color || "Gold";

  const data = useMemo(() => {
    // 60% main color, spread the rest equally
    const rest = (100 - 60) / (LABELS.length - 1);
    return LABELS.map((l) => ({
      name: l,
      value: l === main ? 60 : rest,
      color: PALETTE[l],
    }));
  }, [main]); // LABELS is a stable constant, no need to include it here.

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(17,24,39,0.9)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: 12,
              color: "white",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <span className="text-sm text-slate-500">Aura Color Distribution</span>
      </div>
    </div>
  );
}
