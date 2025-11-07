import React from "react";
import { motion } from "framer-motion";

export default function InsightCard({ icon: Icon, title, value, hint, color = "violet" }) {
  const colorMap = {
    violet: "from-violet-500/10 to-purple-500/10",
    blue: "from-sky-500/10 to-blue-500/10",
    green: "from-emerald-500/10 to-teal-500/10",
    pink: "from-pink-500/10 to-rose-500/10",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br ${colorMap[color]} p-4`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-slate-800/70 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
          {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
        </div>
      </div>
    </motion.div>
  );
}