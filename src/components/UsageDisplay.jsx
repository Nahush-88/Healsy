import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsageTracker } from './UsageTracker';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Clock, Infinity, Crown } from 'lucide-react';

export default function UsageDisplay({ feature, icon: Icon, name }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        setLoading(true);
        const usageData = await UsageTracker.getCurrentUsage(feature);
        setUsage(usageData);
      } catch (error) {
        console.error('Failed to load usage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [feature]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center h-24">
          <AlertCircle className="w-6 h-6 text-slate-400" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">No data</span>
        </div>
      </div>
    );
  }

  const isPremium = usage.remaining === 'unlimited';
  const isLocked = usage.requiresPremium;
  const percentage = isPremium ? 100 : Math.round((usage.used / usage.limit) * 100);
  const isLow = percentage >= 80 && !isPremium;
  const isExhausted = usage.remaining === 0 && !isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all ${
        isLocked
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
          : isPremium
          ? 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800'
          : isExhausted
          ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
          : isLow
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isLocked
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : isPremium
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : isExhausted
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : 'bg-gradient-to-br from-blue-500 to-cyan-600'
            } shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isLocked ? 'Premium Only' : isPremium ? 'Unlimited' : `${usage.limit}/month`}
              </p>
            </div>
          </div>

          {isLocked && (
            <Badge className="bg-amber-500 text-white border-0 px-2 py-1 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
          {isPremium && (
            <Badge className="bg-violet-500 text-white border-0 px-2 py-1 text-xs">
              <Infinity className="w-3 h-3 mr-1" />
              Unlimited
            </Badge>
          )}
          {isExhausted && !isLocked && !isPremium && (
            <Badge className="bg-red-500 text-white border-0 px-2 py-1 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Exhausted
            </Badge>
          )}
          {isLow && !isExhausted && !isPremium && (
            <Badge className="bg-yellow-500 text-white border-0 px-2 py-1 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Low
            </Badge>
          )}
        </div>

        {!isLocked && !isPremium && (
          <>
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {usage.used} / {usage.limit} used
                </span>
                <span className={`font-bold ${
                  isExhausted
                    ? 'text-red-600 dark:text-red-400'
                    : isLow
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {usage.remaining} left
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={`h-2 ${
                  isExhausted
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : isLow
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Resets in {UsageTracker.getTimeUntilReset()}</span>
            </div>
          </>
        )}

        {isPremium && (
          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">No limits • Use freely</span>
          </div>
        )}

        {isLocked && (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Upgrade to unlock</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}