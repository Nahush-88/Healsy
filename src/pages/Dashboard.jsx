
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/entities/User';
import { SleepLog } from '@/entities/SleepLog';
import { WaterLog } from '@/entities/WaterLog';
import { MoodLog } from '@/entities/MoodLog';
import { SavedItem } from '@/entities/SavedItem';
import { JournalEntry } from '@/entities/JournalEntry';
import { ExerciseLog } from '@/entities/ExerciseLog';
import { HealthLog } from '@/entities/HealthLog';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { subDays, format as formatDate, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { 
  Heart, Droplet, Moon, Smile, Sparkles, Brain, Dumbbell, Utensils, 
  CheckCircle, Wind, Waves, Zap, Trophy, LayoutDashboard, Download, 
  Clipboard, TrendingUp, Calendar, Award, Target, Flame, Activity,
  Clock, Star, ChevronRight, Plus, Eye, BookOpen, Coffee, Sun
} from 'lucide-react';
import ContentCard from '../components/ContentCard';
import GradientCard from '../components/GradientCard';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../components/providers/TranslationProvider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const TrendsChart = lazy(() => import('../components/dashboard/TrendsChart'));
const PremiumPaywallLazy = lazy(() => import('../components/PremiumPaywall'));

// Animated Background Particles - FIXED
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-violet-400/20 dark:bg-violet-600/20 rounded-full"
        style={{
          left: `${(i * 11) % 100}%`,
          top: `${(i * 17) % 100}%`,
        }}
        animate={{
          x: [0, Math.random() * 100 - 50, 0],
          y: [0, Math.random() * 100 - 50, 0],
        }}
        transition={{
          duration: 20 + (i % 10),
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: i * 0.5
        }}
      />
    ))}
  </div>
);

// Premium Stat Card Component
const PremiumStatCard = ({ icon: Icon, title, value, subtitle, progress, color, trend, onClick }) => {
  const colorMap = {
    violet: 'from-violet-500 to-purple-600',
    blue: 'from-sky-500 to-blue-600',
    green: 'from-emerald-500 to-teal-600',
    pink: 'from-pink-500 to-rose-600',
    amber: 'from-amber-500 to-orange-600',
    indigo: 'from-indigo-500 to-purple-600',
  };

  const bgColor = {
    violet: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
    blue: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
    green: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    pink: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
    amber: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    indigo: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgColor[color]} border-2 border-${color}-200/60 dark:border-${color}-800/40 p-6 cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" 
           style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {trend && (
            <Badge className={`${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Badge>
          )}
        </div>

        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
            {subtitle && <span className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>}
          </div>
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Activity Timeline Item
const ActivityItem = ({ icon: Icon, title, subtitle, time, color, onClick }) => {
  const colorMap = {
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white truncate">{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-slate-500 dark:text-slate-400">{time}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
      </div>
    </motion.div>
  );
};

// Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, link, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link to={link} className="block">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group h-full`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 mt-4 text-sm font-semibold">
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    sleepDuration: 'N/A',
    sleepQuality: 0,
    waterIntake: 0,
    waterTarget: 2000,
    mood: 'N/A',
    moodScore: 0,
    caloriesConsumed: 0,
    caloriesTarget: 2000,
    exerciseMinutes: 0,
    journalEntries: 0
  });
  const [weekData, setWeekData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const today = formatDate(new Date(), 'yyyy-MM-dd');

        // Build last 7 dates
        const dates = Array.from({ length: 7 }).map((_, idx) => {
          const d = subDays(new Date(), 6 - idx);
          return { key: formatDate(d, 'yyyy-MM-dd'), label: formatDate(d, 'EEE') };
        });

        // BATCHED CALLS
        const [sleepLogsAll, waterLogsAll, moodLogsAll, journalEntriesAll, exerciseLogsAll, healthLogsAll] = await Promise.all([
          SleepLog.list('-created_date', 200),
          WaterLog.list('-created_date', 500),
          MoodLog.list('-created_date', 200),
          JournalEntry.list('-created_date', 100),
          ExerciseLog.list('-created_date', 100),
          HealthLog.list('-created_date', 100)
        ]);

        // Compute daily aggregates
        const daily = dates.map((d) => {
          const daySleep = sleepLogsAll
            .filter((l) => l.log_date === d.key)
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          const lastSleep = daySleep[0];

          const dayWater = waterLogsAll.filter((l) => l.log_date === d.key);
          const totalWater = dayWater.reduce((sum, log) => sum + (log.amount_ml || 0), 0);

          const dayMood = moodLogsAll
            .filter((l) => l.log_date === d.key)
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          const lastMood = dayMood[0];

          const dayExercise = exerciseLogsAll.filter((l) => l.log_date === d.key);
          const totalExercise = dayExercise.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

          return {
            dateKey: d.key,
            label: d.label,
            sleep: lastSleep?.sleep_duration ? Number(lastSleep.sleep_duration) : 0,
            sleepQuality: lastSleep?.sleep_quality || 0,
            water: totalWater,
            waterLiters: Math.round((totalWater / 1000) * 100) / 100,
            mood: lastMood?.mood || null,
            moodScore: lastMood?.mood_score || 0,
            exercise: totalExercise
          };
        });

        setWeekData(daily);

        // Today's stats
        const todayStats = daily.find((d) => d.dateKey === today) || {};
        
        // Calories from health logs (meal logs)
        const todayMeals = healthLogsAll.filter(log => 
          log.log_type === 'meal' && 
          formatDate(new Date(log.created_date), 'yyyy-MM-dd') === today
        );
        const totalCalories = todayMeals.reduce((sum, meal) => {
          return sum + (meal.data?.total_calories || 0);
        }, 0);

        setStats({
          sleepDuration: todayStats.sleep ? `${todayStats.sleep.toFixed(1)}h` : 'N/A',
          sleepQuality: todayStats.sleepQuality || 0,
          waterIntake: todayStats.water || 0,
          waterTarget: currentUser?.daily_water_target || 2000,
          mood: todayStats.mood || 'N/A',
          moodScore: todayStats.moodScore || 0,
          caloriesConsumed: Math.round(totalCalories),
          caloriesTarget: currentUser?.daily_calorie_target || 2000,
          exerciseMinutes: todayStats.exercise || 0,
          journalEntries: journalEntriesAll.filter(j => formatDate(new Date(j.created_date), 'yyyy-MM-dd') === today).length
        });

        // Build recent activities timeline
        const activities = [];
        
        // Sleep
        if (sleepLogsAll[0]) {
          activities.push({
            icon: Moon,
            title: 'Sleep logged',
            subtitle: `${sleepLogsAll[0].sleep_duration}h, Quality: ${sleepLogsAll[0].sleep_quality}/5`,
            time: formatDate(new Date(sleepLogsAll[0].created_date), 'h:mm a'),
            color: 'indigo',
            link: createPageUrl('Sleep')
          });
        }

        // Water
        if (waterLogsAll[0]) {
          activities.push({
            icon: Droplet,
            title: 'Water logged',
            subtitle: `${waterLogsAll[0].amount_ml}ml added`,
            time: formatDate(new Date(waterLogsAll[0].created_date), 'h:mm a'),
            color: 'blue',
            link: createPageUrl('Water')
          });
        }

        // Mood
        if (moodLogsAll[0]) {
          activities.push({
            icon: Smile,
            title: 'Mood check-in',
            subtitle: `Feeling ${moodLogsAll[0].mood}`,
            time: formatDate(new Date(moodLogsAll[0].created_date), 'h:mm a'),
            color: 'pink',
            link: createPageUrl('Mood')
          });
        }

        // Journal
        if (journalEntriesAll[0]) {
          activities.push({
            icon: Brain,
            title: 'Journal entry',
            subtitle: journalEntriesAll[0].title || 'New reflection',
            time: formatDate(new Date(journalEntriesAll[0].created_date), 'h:mm a'),
            color: 'violet',
            link: createPageUrl('Mind')
          });
        }

        // Exercise
        if (exerciseLogsAll[0]) {
          activities.push({
            icon: Dumbbell,
            title: 'Workout completed',
            subtitle: `${exerciseLogsAll[0].duration_minutes}min ${exerciseLogsAll[0].body_part}`,
            time: formatDate(new Date(exerciseLogsAll[0].created_date), 'h:mm a'),
            color: 'green',
            link: createPageUrl('Exercise')
          });
        }

        // Meals
        if (todayMeals[0]) {
          activities.push({
            icon: Utensils,
            title: 'Meal logged',
            subtitle: todayMeals[0].title || 'Nutrition tracked',
            time: formatDate(new Date(todayMeals[0].created_date), 'h:mm a'),
            color: 'amber',
            link: createPageUrl('Diet')
          });
        }

        // Sort by time
        activities.sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.time}`);
          const timeB = new Date(`2000-01-01 ${b.time}`);
          return timeB - timeA;
        });

        setRecentActivities(activities.slice(0, 6));

        // Calculate achievements
        const newAchievements = [];
        
        // Sleep streak
        let sleepStreak = 0;
        for (let i = daily.length - 1; i >= 0; i--) {
          if (daily[i].sleep >= 6) sleepStreak++;
          else break;
        }
        if (sleepStreak >= 3) {
          newAchievements.push({
            icon: Moon,
            title: 'Sleep Master',
            description: `${sleepStreak} days of quality sleep`,
            color: 'indigo'
          });
        }

        // Water goal
        const waterGoalDays = daily.filter(d => d.water >= (currentUser?.daily_water_target || 2000)).length;
        if (waterGoalDays >= 5) {
          newAchievements.push({
            icon: Droplet,
            title: 'Hydration Hero',
            description: `${waterGoalDays} days of water goals met`,
            color: 'blue'
          });
        }

        // Journal streak
        if (journalEntriesAll.length >= 7) {
          newAchievements.push({
            icon: Brain,
            title: 'Mindful Writer',
            description: `${journalEntriesAll.length} journal entries`,
            color: 'violet'
          });
        }

        // Exercise consistency
        const exerciseDays = daily.filter(d => d.exercise > 0).length;
        if (exerciseDays >= 4) {
          newAchievements.push({
            icon: Dumbbell,
            title: 'Fitness Champion',
            description: `${exerciseDays} workout days this week`,
            color: 'green'
          });
        }

        setAchievements(newAchievements);

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load some data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyWeeklySummary = async () => {
    const summary = `Healsy AI Weekly Summary

Sleep: ${stats.sleepDuration} (Quality: ${stats.sleepQuality}/5)
Water: ${stats.waterIntake} / ${stats.waterTarget} ml
Mood: ${stats.mood} (Score: ${stats.moodScore}/5)
Calories: ${stats.caloriesConsumed} / ${stats.caloriesTarget} kcal
Exercise: ${stats.exerciseMinutes} minutes
Journal Entries: ${stats.journalEntries}

Weekly Achievements: ${achievements.length} unlocked`;

    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Weekly summary copied to clipboard!');
    } catch (err) {
      toast.error('Could not copy summary');
    }
  };

  const handleExportDashboard = async () => {
    try {
      const { exportDashboardReport } = await import('@/functions/exportDashboardReport');
      const payload = {
        stats,
        weekData,
        achievements,
        recentActivities
      };
      const { data } = await exportDashboardReport(payload);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healsy_dashboard_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Dashboard exported successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Hero skeleton */}
        <div className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const waterPercentage = Math.min(100, Math.round((stats.waterIntake / stats.waterTarget) * 100));
  const caloriesPercentage = Math.min(100, Math.round((stats.caloriesConsumed / stats.caloriesTarget) * 100));

  return (
    <>
      {showPaywall && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-[99]" />}>
          <PremiumPaywallLazy 
            feature="Premium membership with unlimited AI insights"
            onClose={() => setShowPaywall(false)}
          />
        </Suspense>
      )}

      <div className="space-y-8 relative">
        <AnimatedBackground />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full -ml-48 -mb-48 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                >
                  <Sun className="w-5 h-5" />
                  <span className="font-semibold">
                    {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                  </span>
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Friend'}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Here's your wellness journey today
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={handleCopyWeeklySummary}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy Summary
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleExportDashboard}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Today's Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Activities</span>
                </div>
                <p className="text-3xl font-bold">{recentActivities.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Achievements</span>
                </div>
                <p className="text-3xl font-bold">{achievements.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Streak</span>
                </div>
                <p className="text-3xl font-bold">{weekData.filter(d => d.sleep > 0 || d.water > 0).length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Progress</span>
                </div>
                <p className="text-3xl font-bold">85%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumStatCard
            icon={Moon}
            title="Sleep"
            value={stats.sleepDuration}
            subtitle={`Quality: ${stats.sleepQuality}/5`}
            progress={stats.sleepQuality * 20}
            color="indigo"
            trend={5}
            onClick={() => window.location.href = createPageUrl('Sleep')}
          />
          <PremiumStatCard
            icon={Droplet}
            title="Hydration"
            value={`${stats.waterIntake}ml`}
            subtitle={`of ${stats.waterTarget}ml`}
            progress={waterPercentage}
            color="blue"
            trend={12}
            onClick={() => window.location.href = createPageUrl('Water')}
          />
          <PremiumStatCard
            icon={Flame}
            title="Nutrition"
            value={`${stats.caloriesConsumed}`}
            subtitle={`/ ${stats.caloriesTarget} kcal`}
            progress={caloriesPercentage}
            color="amber"
            trend={-3}
            onClick={() => window.location.href = createPageUrl('Diet')}
          />
          <PremiumStatCard
            icon={Dumbbell}
            title="Exercise"
            value={`${stats.exerciseMinutes}min`}
            subtitle="today"
            progress={Math.min(100, (stats.exerciseMinutes / 30) * 100)}
            color="green"
            trend={20}
            onClick={() => window.location.href = createPageUrl('Exercise')}
          />
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trends Chart */}
          <div className="lg:col-span-2">
            <GradientCard tone="violet">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Weekly Trends</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Your 7-day wellness overview</p>
                </div>
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  Last 7 Days
                </Badge>
              </div>
              <Suspense fallback={<div className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />}>
                <div className="h-80">
                  <TrendsChart data={weekData} />
                </div>
              </Suspense>
            </GradientCard>
          </div>

          {/* Recent Activity Timeline */}
          <GradientCard tone="blue">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Recent Activity</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Latest updates</p>
              </div>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2">
              <AnimatePresence>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
                    <ActivityItem 
                      key={idx}
                      {...activity}
                      onClick={() => window.location.href = activity.link}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet today</p>
                    <p className="text-sm">Start logging your wellness journey!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </GradientCard>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <GradientCard tone="amber" className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Achievements Unlocked</h3>
                <p className="text-amber-700 dark:text-amber-300">Keep up the amazing work!</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-800 group hover:scale-105 transition-transform"
                >
                  <div className={`w-10 h-10 rounded-lg bg-${achievement.color}-100 dark:bg-${achievement.color}-900/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <achievement.icon className={`w-5 h-5 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{achievement.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{achievement.description}</p>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </GradientCard>
        )}

        {/* Quick Actions Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Actions</h3>
              <p className="text-slate-600 dark:text-slate-400">Jump into your wellness activities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={Sparkles}
              title="AI Health Coach"
              description="Chat with AI for personalized health guidance"
              link={createPageUrl('AIHealthCoach')}
              gradient="from-violet-500 via-purple-600 to-indigo-600"
              delay={0}
            />
            <QuickActionCard
              icon={Zap}
              title="Aura Scan"
              description="Analyze your energy and get instant insights"
              link={createPageUrl('Aura')}
              gradient="from-amber-500 via-orange-600 to-red-600"
              delay={0.1}
            />
            <QuickActionCard
              icon={Wind}
              title="AI Yoga"
              description="Get personalized yoga flows for any goal"
              link={createPageUrl('Yoga')}
              gradient="from-sky-500 via-blue-600 to-indigo-600"
              delay={0.2}
            />
            <QuickActionCard
              icon={Waves}
              title="Meditation"
              description="Find calm with guided breathing exercises"
              link={createPageUrl('Meditation')}
              gradient="from-purple-500 via-indigo-600 to-violet-600"
              delay={0.3}
            />
            <QuickActionCard
              icon={Brain}
              title="Mind Journal"
              description="Reflect and analyze your thoughts with AI"
              link={createPageUrl('Mind')}
              gradient="from-pink-500 via-rose-600 to-red-600"
              delay={0.4}
            />
            <QuickActionCard
              icon={Utensils}
              title="Smart Diet"
              description="Generate recipes and track nutrition"
              link={createPageUrl('Diet')}
              gradient="from-green-500 via-emerald-600 to-teal-600"
              delay={0.5}
            />
            <QuickActionCard
              icon={Dumbbell}
              title="Exercise Hub"
              description="Access workout library and track progress"
              link={createPageUrl('Exercise')}
              gradient="from-cyan-500 via-sky-600 to-blue-600"
              delay={0.6}
            />
            <QuickActionCard
              icon={Trophy}
              title="Challenges"
              description="Join wellness challenges and earn badges"
              link={createPageUrl('Challenges')}
              gradient="from-orange-500 via-red-600 to-pink-600"
              delay={0.7}
            />
          </div>
        </div>

        {/* Motivational Footer */}
        <GradientCard tone="green" className="text-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4"
          >
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
              "Every small step counts towards your wellness journey" ✨
            </h3>
            <p className="text-emerald-700 dark:text-emerald-300">
              You're doing amazing! Keep tracking, keep growing.
            </p>
          </motion.div>
        </GradientCard>
      </div>
    </>
  );
}
