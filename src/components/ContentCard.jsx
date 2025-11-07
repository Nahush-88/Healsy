import React from 'react';

export default function ContentCard({ 
  children, 
  className = "",
  hover = true,
  interactive = false,
  ...props 
}) {
  // Check if device supports hover (not touch devices)
  const canHover = typeof window !== "undefined" ? 
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches : 
    true;

  return (
    <div
      className={`
        ${hover && canHover ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]' : ''}
        bg-white/80 dark:bg-slate-800/80 
        backdrop-blur-sm
        rounded-[var(--radius)]
        border border-slate-200/60 dark:border-slate-700/60
        shadow-[var(--shadow-sm)]
        p-4 sm:p-6
        transition-all duration-300 ease-out
        focus-within:ring-2 focus-within:ring-violet-300/60
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}