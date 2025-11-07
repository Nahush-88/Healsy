import React from "react";
import { Droplet } from "lucide-react";

export default function WaterProgress({ current = 0, target = 2000 }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="rounded-2xl border border-sky-200/60 dark:border-sky-900/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/90 text-white flex items-center justify-center">
          <Droplet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Water Goal</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{current} / {target} ml</p>
        </div>
      </div>
      <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs mt-2 text-slate-500 dark:text-slate-400">{pct}%</p>
    </div>
  );
}