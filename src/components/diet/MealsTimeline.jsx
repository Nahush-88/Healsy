import React from "react";
import { Calendar } from "lucide-react";

export default function MealsTimeline({ plan = [] }) {
  const byDay = plan.reduce((acc, m) => {
    (acc[m.day] = acc[m.day] || []).push(m);
    return acc;
  }, {});
  const dayOrder = Object.keys(byDay);

  const badgeColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("breakfast")) return "bg-amber-100 text-amber-700";
    if (t.includes("lunch")) return "bg-emerald-100 text-emerald-700";
    if (t.includes("snack")) return "bg-sky-100 text-sky-700";
    if (t.includes("dinner")) return "bg-violet-100 text-violet-700";
    return "bg-slate-100 text-slate-700";
    };

  return (
    <div className="space-y-4">
      {dayOrder.map((day) => (
        <div key={day} className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div className="font-semibold text-slate-800 dark:text-slate-100">{day}</div>
          </div>
          <div className="grid gap-2">
            {byDay[day]
              .sort((a, b) => (a.meal_type || "").localeCompare(b.meal_type || ""))
              .map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor(m.meal_type)}`}>
                      {m.meal_type}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{m.name}</span>
                  </div>
                  {m.calories != null && (
                    <span className="text-sm text-slate-500">{m.calories} kcal</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}