import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, title, value, color, bgColor, link, index = 0 }) {
  const CardComponent = link ? Link : 'div';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: 0.1 + index * 0.05,
        ease: "easeOut"
      }}
    >
      <CardComponent to={link} className="block p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{title}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white truncate">{value}</p>
          </div>
        </div>
      </CardComponent>
    </motion.div>
  );
}