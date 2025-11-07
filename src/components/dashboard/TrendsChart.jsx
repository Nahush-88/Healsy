import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function TrendsChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 p-4 sm:p-6">
      <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-white">Last 7 Days Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sleepColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="waterColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="label" className="text-slate-500" />
            <YAxis yAxisId="left" orientation="left" className="text-slate-500" />
            <YAxis yAxisId="right" orientation="right" className="text-slate-500" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="sleep" stroke="#6366F1" fillOpacity={1} fill="url(#sleepColor)" name="Sleep (hrs)" />
            <Area yAxisId="right" type="monotone" dataKey="waterLiters" stroke="#06B6D4" fillOpacity={1} fill="url(#waterColor)" name="Water (L)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default React.memo(TrendsChart);