import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, CheckCircle, X, Timer, Zap, Flame, Trophy, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import GradientCard from '../GradientCard';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function WorkoutSession({ exercise, onComplete, onCancel }) {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(60);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalSets = exercise.sets || 3;
  const restDuration = 60; // 60 seconds rest between sets

  // Workout timer
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  // Rest timer with motivational messages
  useEffect(() => {
    if (isResting && !isPaused && restTimeLeft > 0) {
      const timer = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setCurrentSet(prev => prev + 1);
            toast.success('Rest complete! Ready for next set 💪');
            return restDuration;
          }
          // Motivational messages at certain times
          if (prev === 30) {
            toast.info('Halfway through rest! 🔥');
          }
          if (prev === 10) {
            toast.info('Get ready! 10 seconds... ⚡');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isResting, isPaused, restTimeLeft, restDuration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleSetComplete = () => {
    setCompletedSets([...completedSets, currentSet]);
    
    if (currentSet < totalSets) {
      setIsResting(true);
      setRestTimeLeft(restDuration);
      toast.success(`Set ${currentSet} complete! 🎯`);
    } else {
      // Workout complete - CELEBRATION!
      const totalCalories = Math.round((workoutTime / 60) * exercise.calories_per_minute);
      triggerCelebration();
      toast.success('🎉 WORKOUT COMPLETE! Amazing job!');
      setTimeout(() => {
        onComplete({
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets_completed: totalSets,
          duration_minutes: Math.round(workoutTime / 60),
          calories_burned: totalCalories,
        });
      }, 1500);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setCurrentSet(prev => prev + 1);
    setRestTimeLeft(restDuration);
    toast.info('Moving to next set...');
  };

  const progressPercentage = (currentSet / totalSets) * 100;
  const estimatedCalories = Math.round((workoutTime / 60) * exercise.calories_per_minute);

  // Rest timer circle animation
  const restProgress = ((restDuration - restTimeLeft) / restDuration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xl overflow-y-auto"
    >
      <GradientCard className="w-full max-w-2xl max-h-[95vh] overflow-y-auto relative">
        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-violet-500/90 to-purple-600/90 rounded-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Trophy className="w-24 h-24 text-yellow-300 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-2">COMPLETED!</h2>
                <p className="text-xl text-white/90">You're a beast! 💪🔥</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{exercise.name}</h2>
            <p className="text-slate-600 dark:text-slate-400 capitalize text-sm sm:text-base">{exercise.muscle_group}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="flex-shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Set {currentSet} of {totalSets}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Main Display */}
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8 sm:py-12"
            >
              {/* Circular progress for rest */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-blue-500"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - restProgress / 100)}`
                    }}
                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - restProgress / 100) }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">{restTimeLeft}</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">seconds</div>
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Rest Time</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base">Take a breather and prepare for the next set</p>
              <Button onClick={handleSkipRest} variant="outline" className="gap-2">
                <SkipForward className="w-4 h-4" />
                Skip Rest
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-6 sm:py-8"
            >
              <div className="mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2"
                >
                  {exercise.reps}
                </motion.div>
                <div className="text-base sm:text-lg text-slate-600 dark:text-slate-400">Reps to complete</div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Sets Done</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {completedSets.length}/{totalSets}
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Calories</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {estimatedCalories}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSetComplete}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {currentSet < totalSets ? 'Complete Set' : 'Finish Workout 🎉'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Timer className="w-4 h-4" />
              <span>Total Time: {formatTime(workoutTime)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="gap-2"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>
      </GradientCard>
    </motion.div>
  );
}