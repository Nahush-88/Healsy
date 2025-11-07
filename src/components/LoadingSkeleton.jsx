import React from "react";
import { motion } from "framer-motion";

export default function LoadingSkeleton({ className = "" }) {
  return (
    <div className={className}>
      <motion.div 
        className="h-4 bg-slate-200/70 dark:bg-slate-700/60 rounded mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      />
      <motion.div 
        className="h-4 bg-slate-200/70 dark:bg-slate-700/60 rounded mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div 
        className="h-4 bg-slate-200/70 dark:bg-slate-700/60 rounded w-5/6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.4 }}
      />
    </div>
  );
}