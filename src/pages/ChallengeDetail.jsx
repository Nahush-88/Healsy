import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Challenge } from '@/entities/Challenge';
import { ChallengeProgress } from '@/entities/ChallengeProgress';
import { User } from '@/entities/User';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Trophy, Calendar, Flame, Zap, Star, Award, Sparkles, Crown, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import GradientCard from '../components/GradientCard';
import { createPageUrl } from '@/utils';

// Enhanced confetti with more particles and colors
const ConfettiPiece = ({ x, y, rotate, color, delay = 0 }) => (
  <motion.div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '12px',
      height: '12px',
      backgroundColor: color,
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
    }}
    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
    animate={{
      x: x,
      y: y,
      opacity: 0,
      rotate: rotate,
      scale: [0, 1.5, 0],
    }}
    transition={{ duration: 2.5, delay, ease: 'easeOut' }}
  />
);

const Celebration = () => {
  const colors = ['#FFD700', '#FF4136', '#0074D9', '#2ECC40', '#B10DC9', '#FF851B', '#FF69B4', '#00FFFF'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(200)].map((_, i) => (
        <ConfettiPiece
          key={i}
          x={Math.random() * 800 - 400}
          y={Math.random() * 600 - 300}
          rotate={Math.random() * 720}
          color={colors[i % colors.length]}
          delay={i * 0.01}
        />
      ))}
    </div>
  );
};

// Level up animation
const LevelUpAnimation = ({ xp, badge }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
    exit={{ scale: 0, opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50"
  >
    <motion.div
      animate={{ 
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="mb-6"
    >
      <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-2xl" />
    </motion.div>
    
    <motion.h2
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-5xl font-black text-white mb-4"
    >
      Challenge Complete!
    </motion.h2>
    
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-3 text-2xl text-amber-400 font-bold"
    >
      <Zap className="w-8 h-8" />
      +{xp} XP Earned
    </motion.div>
    
    {badge && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{badge.emoji}</span>
          <div>
            <div className="text-sm opacity-80">Badge Unlocked</div>
            <div className="text-lg font-bold">{badge.name}</div>
          </div>
        </div>
      </motion.div>
    )}
    
    <Celebration />
  </motion.div>
);

export default function ChallengeDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const progressId = searchParams.get('id');

  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!progressId) {
      navigate(createPageUrl('Challenges'));
      return;
    }
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [progressData, userData] = await Promise.all([
          ChallengeProgress.get(progressId),
          User.me().catch(() => null)
        ]);
        
        if (!progressData) throw new Error("Challenge progress not found.");
        
        const challengeData = await Challenge.get(progressData.challenge_id);
        if (!challengeData) throw new Error("Challenge not found.");

        setProgress(progressData);
        setChallenge(challengeData);
        setUser(userData);
      } catch (error) {
        toast.error(error.message || "Failed to load challenge details.");
        navigate(createPageUrl('Challenges'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [progressId, navigate]);

  const handleCompleteDay = async () => {
    if (!progress || !challenge) return;
    setIsCompleting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already completed today
      if (progress.completed_days?.includes(today)) {
        toast.info("You've already completed today!");
        setIsCompleting(false);
        return;
      }

      const newCompletedDays = [...(progress.completed_days || []), today];
      const newCurrentDay = progress.current_day + 1;
      const newStreak = (progress.streak || 0) + 1;
      const isNowCompleted = newCurrentDay > challenge.duration_days;
      
      // Calculate XP earned (progressive rewards for streaks)
      const dailyXP = Math.floor((challenge.xp_reward || 100) / challenge.duration_days);
      const streakBonus = newStreak >= 7 ? dailyXP * 0.5 : 0;
      const totalXP = progress.xp_earned + dailyXP + streakBonus;

      const updatedProgress = {
        ...progress,
        current_day: newCurrentDay,
        completed_days: newCompletedDays,
        streak: newStreak,
        xp_earned: totalXP,
        is_completed: isNowCompleted,
      };

      if (isNowCompleted && challenge.badge_name) {
        updatedProgress.badges_earned = [
          ...(progress.badges_earned || []),
          challenge.badge_name
        ];
      }

      await ChallengeProgress.update(progress.id, updatedProgress);
      setProgress(updatedProgress);

      if (isNowCompleted) {
        setShowCelebration(true);
        toast.success(`🎉 Challenge Completed! You earned ${challenge.xp_reward} XP!`);
        setTimeout(() => {
          setShowCelebration(false);
          navigate(createPageUrl('Challenges'));
        }, 4000);
      } else {
        toast.success(`Day ${progress.current_day} complete! +${dailyXP + streakBonus} XP 🔥`);
        if (newStreak >= 7) {
          toast.success(`🔥 7-Day Streak Bonus! +${streakBonus} XP`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          className="w-20 h-20 border-4 border-violet-200 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!challenge || !progress) {
    return <div className="text-center p-8 text-slate-600 dark:text-slate-400">Challenge data could not be loaded.</div>;
  }
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isDayCompleted = progress.completed_days?.includes(todayStr);
  const progressPercentage = ((progress.current_day - 1) / challenge.duration_days) * 100;

  const getCategoryGradient = () => {
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
    return themes[challenge.category] || 'from-violet-500 to-purple-600';
  };

  return (
    <div className="p-4 md:p-8 relative max-w-6xl mx-auto">
      <AnimatePresence>
        {showCelebration && (
          <LevelUpAnimation 
            xp={challenge.xp_reward}
            badge={challenge.badge_name ? { name: challenge.badge_name, emoji: challenge.badge_emoji } : null}
          />
        )}
      </AnimatePresence>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" onClick={() => navigate(createPageUrl('Challenges'))} className="mb-6 hover:bg-violet-50 dark:hover:bg-violet-900/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>
      </motion.div>

      {/* Challenge header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getCategoryGradient()} flex items-center justify-center text-4xl shadow-2xl`}
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            {challenge.icon}
          </motion.div>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{challenge.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">{challenge.description}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold capitalize">
                {challenge.category}
              </div>
              <div className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-semibold">
                {challenge.difficulty}
              </div>
              {challenge.is_premium && (
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress overview */}
        <GradientCard className="lg:col-span-2 p-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-violet-500" />
            Your Progress
          </h3>
          
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Overall Progress</span>
                <span className="text-2xl font-black text-violet-600 dark:text-violet-400">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getCategoryGradient()} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/50 text-center"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{progress.current_day - 1}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Days Done</div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50 text-center"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="flex items-center justify-center gap-1 text-3xl font-black text-orange-600 dark:text-orange-400">
                  <Flame className="w-7 h-7" />
                  {progress.streak}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Day Streak</div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-800/50 text-center"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="flex items-center justify-center gap-1 text-3xl font-black text-amber-600 dark:text-amber-400">
                  <Zap className="w-7 h-7" />
                  {progress.xp_earned || 0}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">XP Earned</div>
              </motion.div>
            </div>
          </div>
        </GradientCard>

        {/* Rewards card */}
        <GradientCard className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Rewards
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Total XP</span>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                +{challenge.xp_reward || 100}
              </div>
            </div>

            {challenge.badge_name && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{challenge.badge_emoji}</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white">{challenge.badge_name}</span>
                </div>
              </div>
            )}

            {progress.streak >= 7 && (
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold">Streak Bonus!</span>
                </div>
                <div className="text-sm opacity-90">You're on fire! 🔥</div>
              </motion.div>
            )}
          </div>
        </GradientCard>
      </div>

      {/* Calendar grid */}
      <GradientCard className="p-6 mb-8">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-500" />
          Challenge Journey
        </h3>
        
        <div className="grid grid-cols-7 gap-3">
          {[...Array(challenge.duration_days)].map((_, i) => {
            const day = i + 1;
            const isDone = day < progress.current_day;
            const isCurrent = day === progress.current_day;
            const isFuture = day > progress.current_day;

            return (
              <motion.button
                key={day}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                whileHover={!isFuture ? { scale: 1.1, y: -4 } : {}}
                whileTap={!isFuture ? { scale: 0.95 } : {}}
                onClick={() => !isFuture && setSelectedDay(day)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all relative overflow-hidden
                  ${isDone ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white ring-4 ring-violet-300 dark:ring-violet-700 shadow-2xl scale-110' : ''}
                  ${isFuture ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : ''}
                  ${!isFuture ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
                `}
              >
                {isDone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: i * 0.02 + 0.2 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}
                {!isDone && <span>{day}</span>}
                
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {challenge.daily_tasks && challenge.daily_tasks.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200/50 dark:border-violet-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span className="font-bold text-slate-800 dark:text-white">Daily Tasks</span>
            </div>
            <ul className="space-y-2">
              {challenge.daily_tasks.map((task, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span>{task}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </GradientCard>

      {/* Complete today button */}
      {!progress.is_completed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GradientCard className="p-8 text-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 border-2 border-violet-200/50 dark:border-violet-800/50">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                Day {progress.current_day} Goal
              </h3>
            </motion.div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
              Complete today's check-in to continue your streak! 🔥
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className={`w-full max-w-md mx-auto h-14 text-lg font-bold shadow-2xl ${
                  isDayCompleted
                    ? 'bg-green-500 hover:bg-green-600 cursor-default'
                    : 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 premium-shimmer'
                }`}
                onClick={handleCompleteDay}
                disabled={isDayCompleted || isCompleting}
              >
                {isCompleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Saving...
                  </>
                ) : isDayCompleted ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Today Complete!
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Complete Day {progress.current_day}
                  </>
                )}
              </Button>
            </motion.div>

            {isDayCompleted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-green-600 dark:text-green-400 font-bold"
              >
                ✅ Great job! Come back tomorrow to continue!
              </motion.p>
            )}
          </GradientCard>
        </motion.div>
      )}

      {/* Completion message */}
      {progress.is_completed && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <GradientCard className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500/50">
            <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-4" />
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Challenge Complete!</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              You've successfully completed this challenge. Keep up the amazing work!
            </p>
            {challenge.badge_name && (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-xl">
                <span className="text-3xl">{challenge.badge_emoji}</span>
                <span>{challenge.badge_name}</span>
              </div>
            )}
          </GradientCard>
        </motion.div>
      )}
    </div>
  );
}