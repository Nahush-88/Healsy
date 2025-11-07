import React from "react";
import { motion } from "framer-motion";

export default function BreathPacer({ size = 80, color = "#A78BFA", glow = true }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(80% 80% at 50% 50%, ${color}40, ${color}20, transparent)`,
          boxShadow: glow ? `0 0 30px ${color}50` : "none",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      />
      <div className="text-white/90 text-sm leading-tight">
        <div className="font-semibold">Breathe</div>
        <div className="opacity-80">Inhale 4 • Hold 2 • Exhale 6</div>
      </div>
    </div>
  );
}