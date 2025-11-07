
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Flame, CheckCircle, Timer, Target, Award, TrendingUp, Calendar, Sparkles, Sun, Moon, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import GradientCard from '../GradientCard';
import { FacialExerciseLog } from '@/entities/FacialExerciseLog';
import { format } from 'date-fns';

const exercises = [
  {
    id: 'jawline_sculptor',
    name: 'Jawline Sculptor',
    emoji: '💪',
    target: 'Sharpen jawline & reduce double chin',
    duration: 300,
    reps: 15,
    sets: 3,
    color: 'from-blue-500 to-cyan-600',
    steps: [
      'Tilt your head back and look at the ceiling',
      'Push your lower jaw forward',
      'Hold for 10 seconds, feeling the stretch under your chin',
      'Relax and repeat',
      'Do 3 sets of 15 reps'
    ],
    benefits: ['Defines jawline', 'Reduces double chin', 'Tightens neck skin']
  },
  {
    id: 'cheekbone_lifter',
    name: 'Cheekbone Lifter',
    emoji: '😊',
    target: 'Lift cheeks & enhance facial structure',
    duration: 240,
    reps: 20,
    sets: 3,
    color: 'from-pink-500 to-rose-600',
    steps: [
      'Smile as wide as possible',
      'Place fingertips on cheekbones',
      'Lift cheeks up while resisting with fingers',
      'Hold for 5 seconds',
      'Repeat 20 times'
    ],
    benefits: ['Lifts sagging cheeks', 'Enhances cheekbones', 'Reduces nasolabial folds']
  },
  {
    id: 'face_yoga',
    name: 'Full Face Yoga',
    emoji: '🧘',
    target: 'Complete facial workout & glow',
    duration: 600,
    reps: 'Varies',
    sets: 1,
    color: 'from-purple-500 to-indigo-600',
    steps: [
      'Start with face and neck massage (2 min)',
      'Do jaw clenches (1 min)',
      'Cheek lifts (2 min)',
      'Forehead smoothers (1 min)',
      'Eye area exercises (2 min)',
      'Finish with relaxation breathing (2 min)'
    ],
    benefits: ['Complete facial toning', 'Improves circulation', 'Natural face glow', 'Stress relief']
  },
  {
    id: 'chin_tightener',
    name: 'Chin Tightener',
    emoji: '🎯',
    target: 'Eliminate double chin fast',
    duration: 180,
    reps: 10,
    sets: 3,
    color: 'from-emerald-500 to-teal-600',
    steps: [
      'Sit upright with shoulders relaxed',
      'Tilt head back until looking at ceiling',
      'Pucker lips as if kissing the ceiling',
      'Hold for 10 seconds',
      'Repeat 10 times for 3 sets'
    ],
    benefits: ['Targets double chin', 'Tightens neck', 'Quick results']
  },
  {
    id: 'glow_activator',
    name: 'Glow Activator',
    emoji: '✨',
    target: 'Boost circulation & natural glow',
    duration: 300,
    reps: 'Continuous',
    sets: 1,
    color: 'from-amber-500 to-orange-600',
    steps: [
      'Gently tap all over face with fingertips (1 min)',
      'Massage cheeks in circular motions (1 min)',
      'Tap under eyes gently (30 sec)',
      'Massage jawline from chin to ears (1 min)',
      'Finish with gentle face patting (30 sec)'
    ],
    benefits: ['Boosts blood flow', 'Natural glow', 'Reduces puffiness', 'Lymphatic drainage']
  }
];

export default function FacialFitness({ user, onWorkoutComplete }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    streak: 0,
    workoutsThisWeek: 0,
    achievements: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const logs = await FacialExerciseLog.list('-log_date', 50);
      const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
      
      // Calculate streak
      const today = format(new Date(), 'yyyy-MM-dd');
      const dates = [...new Set(logs.map(l => l.log_date))].sort().reverse();
      let streak = 0;
      for (let i = 0; i < dates.length; i++) {
        const daysDiff = Math.floor((new Date(today) - new Date(dates[i])) / (1000 * 60 * 60 * 24));
        if (daysDiff === i) streak++;
        else break;
      }

      const thisWeekLogs = logs.filter(l => {
        const logDate = new Date(l.log_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      });

      setStats({
        totalMinutes,
        streak,
        workoutsThisWeek: thisWeekLogs.length,
        achievements: []
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleExerciseComplete = useCallback(async () => {
    setIsPlaying(false);
    
    try {
      await FacialExerciseLog.create({
        exercise_type: selectedExercise.id,
        duration_minutes: Math.ceil(selectedExercise.duration / 60),
        exercises_completed: [selectedExercise.name],
        log_date: format(new Date(), 'yyyy-MM-dd'),
        user_email: user?.email
      });

      toast.success('🎉 Exercise completed! Great work!', {
        description: `You earned ${Math.ceil(selectedExercise.duration / 60)} minutes of facial fitness`
      });

      loadStats();
      setSelectedExercise(null);
      if (onWorkoutComplete) onWorkoutComplete();
    } catch (error) {
      console.error('Failed to log exercise:', error);
    }
  }, [selectedExercise, user, onWorkoutComplete]);

  useEffect(() => {
    let interval;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleExerciseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, handleExerciseComplete]);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setTimeLeft(exercise.duration);
    setCurrentStep(0);
    setCompletedSets(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setTimeLeft(selectedExercise.duration);
    setCurrentStep(0);
    setCompletedSets(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GradientCard tone="blue">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Training</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMinutes}min</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
          </div>
        </GradientCard>

        <GradientCard tone="amber">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Streak</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak} days</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>
        </GradientCard>

        <GradientCard tone="green">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">This Week</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.workoutsThisWeek} workouts</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Exercise Player */}
      <AnimatePresence>
        {selectedExercise ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GradientCard tone="violet">
              <div className="space-y-6">
                {/* Exercise Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{selectedExercise.emoji}</span>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedExercise.name}
                      </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{selectedExercise.target}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedExercise(null)}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>

                {/* Timer Display */}
                <div className="text-center space-y-4">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - timeLeft / selectedExercise.duration)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-slate-900 dark:text-white">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {Math.round((timeLeft / selectedExercise.duration) * 100)}% remaining
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resetExercise}
                      className="rounded-full w-14 h-14"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="rounded-full w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExerciseComplete}
                      className="rounded-full w-14 h-14"
                    >
                      <CheckCircle className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Exercise Steps */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Exercise Steps
                  </h3>
                  <div className="space-y-2">
                    {selectedExercise.steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                          idx === currentStep
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                            : 'bg-slate-50 dark:bg-slate-800/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          idx === currentStep
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Benefits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.benefits.map((benefit, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </GradientCard>
          </motion.div>
        ) : (
          <>
            {/* Exercise Library */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-blue-600" />
                  Facial Exercise Library
                </h2>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  {exercises.length} Exercises
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((exercise, idx) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <GradientCard tone="blue" className="h-full">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{exercise.emoji}</span>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {exercise.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {exercise.target}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {Math.ceil(exercise.duration / 60)} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {exercise.reps} reps
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {exercise.sets} sets
                          </span>
                        </div>

                        <Button
                          onClick={() => startExercise(exercise)}
                          className={`w-full bg-gradient-to-r ${exercise.color} text-white`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Exercise
                        </Button>
                      </div>
                    </GradientCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pro Tips for Facial Fitness */}
            <GradientCard tone="violet">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Pro Tips for Maximum Results
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Expert advice to enhance your facial fitness journey
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-xl">🎯</span> Best Practices
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-violet-600">1</span>
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white">Consistency is Key</strong>
                          <p className="text-slate-600 dark:text-slate-400">Do exercises daily for 5-10 minutes. Results appear in 2-4 weeks with regular practice.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-violet-600">2</span>
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white">Perfect Your Form</strong>
                          <p className="text-slate-600 dark:text-slate-400">Quality over quantity! Focus on controlled movements and feeling the muscle engagement.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-violet-600">3</span>
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white">Breathe Properly</strong>
                          <p className="text-slate-600 dark:text-slate-400">Never hold your breath. Inhale during relaxation, exhale during exertion.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-violet-600">4</span>
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white">Stay Hydrated</strong>
                          <p className="text-slate-600 dark:text-slate-400">Drink water before and after exercises to keep skin plump and muscles functioning well.</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-xl">⏰</span> Optimal Timing
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4">
                        <h5 className="font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                          <Sun className="w-4 h-4" /> Morning (Best)
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          Exercises boost circulation and reduce morning puffiness. Perfect before your skincare routine!
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                        <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                          <Moon className="w-4 h-4" /> Evening (Good)
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          Relaxing exercises before bed help release facial tension from the day and promote better sleep.
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                        <h5 className="font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                          <Coffee className="w-4 h-4" /> Anytime
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          Short 2-minute breaks during work to refresh and de-stress facial muscles!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-600" />
                    Results Timeline - What to Expect
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200">Week 1-2</Badge>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        Improved facial muscle awareness, reduced tension, better posture
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200">Week 3-4</Badge>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        Subtle definition improvements, less puffiness, enhanced circulation glow
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200">Week 5-8</Badge>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        Visible jawline definition, lifted cheeks, reduced double chin
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-200">Week 8+</Badge>
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                        Maintained results with continuous improvement, sculpted facial structure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GradientCard>
          </>
        )}
      </AnimatePresence>

      {/* Achievements */}
      {stats.totalMinutes > 0 && (
        <GradientCard tone="amber">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Achievements</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.totalMinutes >= 30 && (
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <span className="text-3xl">🏆</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  30 Min Club
                </p>
              </div>
            )}
            {stats.streak >= 7 && (
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <span className="text-3xl">🔥</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  Week Streak
                </p>
              </div>
            )}
            {stats.workoutsThisWeek >= 5 && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-3xl">💪</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  Consistent
                </p>
              </div>
            )}
            {stats.totalMinutes >= 100 && (
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <span className="text-3xl">⭐</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  100 Min Master
                </p>
              </div>
            )}
          </div>
        </GradientCard>
      )}
    </div>
  );
}
