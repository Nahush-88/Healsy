import React from "react";
import { motion } from "framer-motion";

const CHAKRAS = [
  { name: "Root", color: "#DC2626", emoji: "🔴" },
  { name: "Sacral", color: "#EA580C", emoji: "🟠" },
  { name: "Solar Plexus", color: "#EAB308", emoji: "🟡" },
  { name: "Heart", color: "#16A34A", emoji: "💚" },
  { name: "Throat", color: "#3B82F6", emoji: "💙" },
  { name: "Third Eye", color: "#7C3AED", emoji: "💜" },
  { name: "Crown", color: "#A855F7", emoji: "👑" },
];

export default function ChakraMeter({ analysis }) {
  const chakraName = analysis?.chakra_connection?.chakra_name || "Solar Plexus Chakra";
  const baseStrength = analysis?.aura_strength || 85;

  return (
    <div className="space-y-4">
      {CHAKRAS.map((chakra, idx) => {
        const isActive = chakraName.toLowerCase().includes(chakra.name.toLowerCase());
        const strength = isActive ? baseStrength : Math.max(50, baseStrength - 15 - idx * 5);

        return (
          <div key={chakra.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>{chakra.emoji}</span>
                <span>{chakra.name}</span>
              </span>
              <span className="text-xs text-slate-500">{strength}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ 
                  duration: 1, 
                  delay: idx * 0.1, 
                  ease: "easeOut" 
                }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${chakra.color}, ${chakra.color}CC)`,
                  boxShadow: isActive ? `0 0 12px ${chakra.color}88` : "none"
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatType: "loop",
                      ease: "easeInOut" 
                    }}
                    style={{ backgroundColor: chakra.color }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        );
      })}
      {analysis?.chakra_connection?.significance && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 italic">
          {analysis.chakra_connection.significance}
        </p>
      )}
    </div>
  );
}