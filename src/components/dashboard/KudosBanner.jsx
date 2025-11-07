import React from "react";
import { motion } from "framer-motion";
import GradientCard from "../GradientCard";
import { Trophy, Sparkles } from "lucide-react";

export default function KudosBanner({ moodStreak = 0, waterPct = 0 }) {
  const show = moodStreak >= 3 || waterPct >= 100;

  if (!show) return null;

  return (
    <GradientCard className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/60 dark:border-amber-800/60">
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-lg font-bold">You’re on fire!</h3>
          </div>
          <p className="text-sm text-amber-800/80 dark:text-amber-200/90">
            {moodStreak >= 3 ? `Mood streak: ${moodStreak} days` : null}
            {moodStreak >= 3 && waterPct >= 100 ? " • " : ""}
            {waterPct >= 100 ? "Hydration goal met today!" : null}
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="hidden sm:block"
        >
          <div className="relative w-16 h-16">
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute block w-2 h-2 bg-amber-400 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: Math.cos((i / 8) * 2 * Math.PI) * 24,
                  y: Math.sin((i / 8) * 2 * Math.PI) * 24
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                style={{ left: "50%", top: "50%" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </GradientCard>
  );
}