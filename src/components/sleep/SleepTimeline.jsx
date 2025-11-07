import React from "react";
import { Sun, Sunset } from "lucide-react";

function parseToMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function SleepTimeline({ bedTime, wakeTime }) {
  const bed = parseToMinutes(bedTime);
  const wake = parseToMinutes(wakeTime);

  if (bed == null || wake == null) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Set both bedtime and wake time to view your sleep timeline.
      </div>
    );
  }

  let segments = [];
  let totalSleep = 0;

  if (wake <= bed) {
    // Crosses midnight
    segments = [
      { start: bed, end: 1440 },
      { start: 0, end: wake },
    ];
    totalSleep = (1440 - bed) + wake;
  } else {
    segments = [{ start: bed, end: wake }];
    totalSleep = wake - bed;
  }

  const toPct = (min) => `${(min / 1440) * 100}%`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5" /> Bed: {bedTime}</div>
        <div className="font-medium text-slate-700 dark:text-slate-200">Duration: {formatDuration(totalSleep)}</div>
        <div className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Wake: {wakeTime}</div>
      </div>
      <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        {/* Night shading */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-300/50 via-slate-200/30 to-slate-300/50 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 pointer-events-none" />
        {/* Sleep segments */}
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ left: toPct(seg.start), width: `calc(${toPct(seg.end - seg.start)})` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}