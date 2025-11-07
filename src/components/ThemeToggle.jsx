import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle({ theme, onThemeChange }) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
      className="relative w-20 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 dark:from-indigo-600 dark:to-purple-600 p-1 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Track Background Glow */}
      <div className="absolute inset-0 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
      
      {/* Sliding Toggle Circle */}
      <motion.div
        className="relative z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
        animate={{
          x: isDark ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8
        }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-indigo-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>

      {/* Icon Labels on Track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={`w-4 h-4 transition-opacity duration-300 ${!isDark ? 'opacity-0' : 'opacity-50 text-white'}`} />
        <Moon className={`w-4 h-4 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-50 text-white'}`} />
      </div>
    </motion.button>
  );
}