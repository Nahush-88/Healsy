import React from "react";
import { Smile, Flame } from "lucide-react";

const moodEmoji = {
  radiant: "😊",
  good: "🙂",
  okay: "😐",
  sad: "😟",
  stressed: "😩",
};

export default function MoodStreak({ streak = 0, todayMood = null }) {
  return (
    <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/90 text-white flex items-center justify-center">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">Mood Streak</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{streak} day{streak === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Smile className="w-4 h-4" />
          <span>Today</span>
        </div>
        <div className="text-lg">{todayMood ? moodEmoji[todayMood] : "—"}</div>
      </div>
    </div>
  );
}