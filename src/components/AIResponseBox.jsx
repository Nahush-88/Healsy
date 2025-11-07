import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Utensils, Moon } from 'lucide-react';
import GradientCard from './GradientCard';

const LoadingSkeleton = () => (
  <GradientCard className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/80 dark:to-slate-900/80">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
      </div>
    </div>
  </GradientCard>
);

export default function AIResponseBox({ response, isLoading, type = 'analysis' }) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!response) {
    return null;
  }

  let content = '';
  if (type === 'insight') {
    content = response.insights || response.summary || '';
  } else {
    content = response.summary || response.insights || '';
  }
  
  if (!content) return null;

  const config = {
    analysis: {
      title: 'AI Analysis Summary',
      Icon: Utensils,
      gradient: 'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
      iconColor: 'text-rose-500',
    },
    insight: {
      title: 'AI Insight',
      Icon: Brain,
      gradient: 'from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30',
      iconColor: 'text-violet-500',
    },
  };
  
  const currentConfig = config[type] || config.analysis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GradientCard className={`p-6 bg-gradient-to-r ${currentConfig.gradient}`} hover={false}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
            <Sparkles className={`w-5 h-5 ${currentConfig.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{currentConfig.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </GradientCard>
    </motion.div>
  );
}