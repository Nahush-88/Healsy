import React from "react";
import { Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CalorieTarget({ current = 0, target = 2000 }) {
  const pct = Math.min(100, Math.round((current / (target || 1)) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div className="w-full rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Today’s Calories</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {Math.round(current)} / {Math.round(target)} kcal
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400">Remaining</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-300">{Math.round(remaining)} kcal</div>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{pct}% of daily goal</div>
    </div>
  );
}