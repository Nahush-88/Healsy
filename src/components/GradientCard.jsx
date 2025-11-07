import React from 'react';

const toneClasses = {
  violet: 'bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-violet-950/90 dark:to-purple-950/90 border-violet-200/60 dark:border-violet-800/40',
  blue: 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/90 dark:to-indigo-950/90 border-blue-200/60 dark:border-blue-800/40',
  green: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/90 dark:to-teal-950/90 border-emerald-200/60 dark:border-emerald-800/40',
  amber: 'bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-950/90 dark:to-orange-950/90 border-amber-200/60 dark:border-amber-800/40',
  pink: 'bg-gradient-to-br from-pink-50/90 to-rose-50/90 dark:from-pink-950/90 dark:to-rose-950/90 border-pink-200/60 dark:border-pink-800/40',
  indigo: 'bg-gradient-to-br from-indigo-50/90 to-violet-50/90 dark:from-indigo-950/90 dark:to-violet-950/90 border-indigo-200/60 dark:border-indigo-800/40',
  slate: 'bg-gradient-to-br from-slate-50/90 to-gray-50/90 dark:from-slate-900/90 dark:to-gray-900/90 border-slate-200/60 dark:border-slate-700/40',
};

export default function GradientCard({ 
  children, 
  tone = 'violet', 
  className = '',
  hover = true,
  ...props 
}) {
  const canHover = typeof window !== "undefined" ? 
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches : 
    true;

  return (
    <div
      className={`
        backdrop-blur-sm
        rounded-[var(--radius)]
        border-2
        shadow-[var(--shadow-sm)]
        p-4 sm:p-6
        transition-all duration-300 ease-out
        ${hover && canHover ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]' : ''}
        ${toneClasses[tone] || toneClasses.violet}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}