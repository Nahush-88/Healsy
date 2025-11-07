
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Play, CheckCircle, Flame, Zap, Star, Trophy, Award } from 'lucide-react';
import GradientCard from './GradientCard';

export default function ChallengeCard({ challenge, progress, onStart, onContinue, isStarted = false }) {
  // getDifficultyColor function is removed as it's no longer used for the difficulty badge.

  const getCategoryGradient = (category) => {
    const themes = {
      mind: 'from-violet-500 to-purple-600',
      body: 'from-rose-500 to-pink-600',
      nutrition: 'from-green-500 to-emerald-600',
      sleep: 'from-indigo-500 to-blue-600',
      skin: 'from-amber-500 to-orange-600',
      wellness: 'from-cyan-500 to-teal-600',
      fitness: 'from-red-500 to-orange-600',
      hydration: 'from-blue-500 to-cyan-600',
    };
    return challenge.color_theme || themes[category] || 'from-slate-500 to-slate-600';
  };

  const progressPercentage = progress ? ((progress.current_day - 1) / challenge.duration_days) * 100 : 0;
  const isCompleted = progress?.is_completed || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", damping: 20 }}
      className="h-full relative"
    >
      {/* Static glow effect - NO ANIMATION */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-purple-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
      
      <GradientCard className="p-6 h-full flex flex-col relative overflow-hidden group">
        {/* Static background particles - NO ANIMATION */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Header with icon and badges */}
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryGradient(challenge.category)} flex items-center justify-center shadow-xl`}
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl">{challenge.icon || '🎯'}</span>
            </motion.div>
            
            <div className="flex flex-col gap-2">
              {challenge.is_premium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {challenge.difficulty}
              </Badge>
            </div>
          </div>

          {/* Title and description */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {challenge.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
            {challenge.description}
          </p>

          {/* Progress section for started challenges */}
          {isStarted && progress && !isCompleted && (
            <motion.div 
              className="mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {progress.current_day}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Day {progress.current_day} of {challenge.duration_days}
                  </span>
                </div>
                {progress.streak > 0 && (
                  <motion.div 
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-md"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Flame className="w-3 h-3" />
                    {progress.streak}
                  </motion.div>
                )}
              </div>
              <Progress value={progressPercentage} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{Math.round(progressPercentage)}% Complete</span>
                {challenge.xp_reward && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Zap className="w-3 h-3" />
                    +{challenge.xp_reward} XP
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Completion badge - SIMPLIFIED ANIMATION */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500/50 dark:border-green-600/50"
            >
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">Challenge Completed! 🎉</span>
              </div>
            </motion.div>
          )}

          {/* Challenge info */}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{challenge.duration_days} days</span>
            </div>
            <span className="capitalize px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              {challenge.category}
            </span>
            {challenge.xp_reward && !isStarted && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Zap className="w-4 h-4" />
                {challenge.xp_reward} XP
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-auto">
            {isCompleted ? (
              <Button disabled className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default shadow-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed!
              </Button>
            ) : isStarted ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold shadow-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Challenge
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={onStart}
                  className={`w-full text-white font-bold shadow-xl ${
                    challenge.is_premium 
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 premium-shimmer' 
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600'
                  }`}
                >
                  {challenge.is_premium && <Crown className="w-4 h-4 mr-2" />}
                  Start Challenge
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </GradientCard>
    </motion.div>
  );
}
