import React, { useState, useEffect } from 'react';
import { Moon, Star, Sparkles, Loader2, Save, Clock, Sunrise, Brain, Sun, Sunset, Clipboard, Download, TrendingUp, Award, Flame, Target, Zap, Wind, CloudMoon, BedDouble, Coffee, Activity, Calendar, BarChart3, Trophy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SleepLog } from '@/entities/SleepLog';
import { User } from '@/entities/User';
import { useAI } from '../components/useAI';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import GradientCard from '../components/GradientCard';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import LoadingAnalysis from '../components/LoadingAnalysis';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Sleep Cycle Visualization Component
const SleepCycleViz = ({ bedTime, wakeTime, sleepQuality }) => {
  if (!bedTime || !wakeTime) return null;

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const bedMinutes = parseTime(bedTime);
  let wakeMinutes = parseTime(wakeTime);
  if (wakeMinutes <= bedMinutes) wakeMinutes += 1440;
  
  const totalMinutes = wakeMinutes - bedMinutes;
  const totalHours = totalMinutes / 60;

  const cycles = Math.floor(totalHours / 1.5);
  const stages = ['Light', 'Deep', 'REM', 'Light'];
  
  const cycleData = [];
  for (let i = 0; i < cycles; i++) {
    const stage = stages[i % stages.length];
    cycleData.push({
      cycle: `Cycle ${i + 1}`,
      stage: stage,
      quality: stage === 'Deep' ? 90 : stage === 'REM' ? 85 : 70,
      duration: 90
    });
  }

  const stageColors = {
    Light: '#60A5FA',
    Deep: '#8B5CF6',
    REM: '#EC4899'
  };

  return (
    <GradientCard tone="indigo" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Your Sleep Cycles
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {cycles} complete cycles detected (~{(cycles * 1.5).toFixed(1)}h)
            </p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {cycles >= 5 ? 'Excellent' : cycles >= 4 ? 'Good' : 'Needs Improvement'}
          </Badge>
        </div>

        <div className="relative h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
          {cycleData.map((cycle, idx) => (
            <motion.div
              key={idx}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${(cycle.duration / totalMinutes) * 100}%`, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="absolute h-full"
              style={{
                left: `${(idx * 90 / totalMinutes) * 100}%`,
                background: stageColors[cycle.stage],
                opacity: 0.8
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white text-xs font-semibold">
                <span>{cycle.stage}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-slate-700 dark:text-slate-300">Light Sleep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-700 dark:text-slate-300">Deep Sleep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-slate-700 dark:text-slate-300">REM Sleep</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {cycles >= 5 
                ? 'Perfect! You completed 5+ sleep cycles. This is optimal for recovery.'
                : cycles >= 4
                ? 'Good job! Try to aim for 5 complete cycles (7.5 hours) for even better rest.'
                : 'Try to get at least 4-5 complete sleep cycles for optimal recovery. Each cycle is ~90 minutes.'}
            </span>
          </p>
        </div>
      </div>
    </GradientCard>
  );
};

// Sleep Timeline Component
const SleepTimeline = ({ bedTime, wakeTime }) => {
  if (!bedTime || !wakeTime) {
    return <p className="text-slate-500 dark:text-slate-400 text-center py-8">Set bed & wake times to see your sleep timeline</p>;
  }

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const totalMinutesInDay = 24 * 60;
  const bedMinutes = parseTime(bedTime);
  let wakeMinutes = parseTime(wakeTime);

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += totalMinutesInDay;
  }

  const startPercent = (bedMinutes / totalMinutesInDay) * 100;
  const visualWakeMinutes = parseTime(wakeTime);
  const endPercent = (visualWakeMinutes / totalMinutesInDay) * 100;

  let segments = [];
  if (wakeMinutes > totalMinutesInDay) {
    segments.push({
      left: startPercent,
      width: 100 - startPercent,
    });
    segments.push({
      left: 0,
      width: endPercent,
    });
  } else {
    segments.push({
      left: startPercent,
      width: ((wakeMinutes - bedMinutes) / totalMinutesInDay) * 100,
    });
  }

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 === 0 ? 12 : h % 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative h-28 w-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-xl overflow-hidden flex flex-col justify-center border-2 border-slate-200 dark:border-slate-600">
      <div className="absolute w-full h-full flex">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full border-r border-slate-200/30 dark:border-slate-600/30 ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/50' : 'bg-transparent'}`}
          >
            {i % 3 === 0 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">{i}h</span>
            )}
          </div>
        ))}
      </div>

      {segments.map((segment, index) => (
        <motion.div
          key={index}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${segment.width}%`, opacity: 1 }}
          transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
          className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
          style={{ left: `${segment.left}%` }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white z-10 shadow-lg border-2 border-white dark:border-slate-800"
        style={{ left: `calc(${startPercent}% - 12px)` }}
      >
        <Moon size={12} />
      </motion.div>
      <div
        className="absolute text-xs font-semibold text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 shadow-sm whitespace-nowrap"
        style={{ bottom: `calc(50% + 20px)`, left: `${startPercent}%`, transform: `translateX(-50%)` }}
      >
        😴 {formatTime(bedTime)}
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white z-10 shadow-lg border-2 border-white dark:border-slate-800"
        style={{ left: `calc(${endPercent}% - 12px)` }}
      >
        <Sun size={12} />
      </motion.div>
      <div
        className="absolute text-xs font-semibold text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 shadow-sm whitespace-nowrap"
        style={{ top: `calc(50% + 20px)`, left: `${endPercent}%`, transform: `translateX(-50%)` }}
      >
        ☀️ {formatTime(wakeTime)}
      </div>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          <Star
            className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg' : 'text-slate-300 dark:text-slate-600'
            }`}
            onClick={() => setRating(star)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function Sleep() {
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(0);
  const [dreamDescription, setDreamDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { analyzeSleep, isLoading } = useAI();
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [sleepDuration, setSleepDuration] = useState(0);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [stats, setStats] = useState({
    avgSleepHours: 0,
    avgSleepScore: 0,
    streak: 0,
    totalNights: 0
  });

  useEffect(() => {
    loadSleepHistory();
  }, []);

  const loadSleepHistory = async () => {
    try {
      const logs = await SleepLog.list('-log_date', 30);
      setSleepHistory(logs);

      const totalHours = logs.reduce((sum, log) => sum + (log.sleep_duration || 0), 0);
      const totalScore = logs.reduce((sum, log) => sum + (log.sleep_score || 0), 0);
      
      let streak = 0;
      const today = format(new Date(), 'yyyy-MM-dd');
      const dates = logs.map(l => l.log_date).sort().reverse();
      
      for (let i = 0; i < dates.length; i++) {
        const daysDiff = Math.floor((new Date(today) - new Date(dates[i])) / (1000 * 60 * 60 * 24));
        if (daysDiff === i) streak++;
        else break;
      }

      setStats({
        avgSleepHours: logs.length ? (totalHours / logs.length).toFixed(1) : 0,
        avgSleepScore: logs.length ? Math.round(totalScore / logs.length) : 0,
        streak,
        totalNights: logs.length
      });
    } catch (error) {
      console.error('Failed to load sleep history:', error);
    }
  };

  const handleAnalysis = async () => {
    if (!bedTime || !wakeTime || sleepQuality === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('sleep_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    try {
      toast.info('🌙 AI is analyzing your sleep...');
      const result = await analyzeSleep(bedTime, wakeTime, sleepQuality, dreamDescription);
      setAnalysis(result);
      setSleepDuration(result.sleep_duration_hours);
      toast.success('✨ Your personalized insights are ready!');
    } catch (error) {
      toast.error('Sleep analysis failed');
      console.error('Analysis error:', error);
    }
  };

  const handleSaveLog = async () => {
    if (!bedTime || !wakeTime || sleepQuality === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const bedDateTime = new Date(`${today}T${bedTime}`);
      let wakeDateTime = new Date(`${today}T${wakeTime}`);
      
      if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
      }
      
      const calculatedSleepDuration = (wakeDateTime - bedDateTime) / (1000 * 60 * 60);

      await SleepLog.create({
        bed_time: bedTime,
        wake_time: wakeTime,
        sleep_quality: sleepQuality,
        dream_description: dreamDescription || '',
        sleep_duration: analysis?.sleep_duration_hours || calculatedSleepDuration,
        sleep_score: analysis?.sleep_score || null,
        ai_analysis: analysis,
        log_date: today
      });

      toast.success('💾 Sleep log saved successfully!');
      
      setBedTime('');
      setWakeTime('');
      setSleepQuality(0);
      setDreamDescription('');
      setAnalysis(null);
      setSleepDuration(0);
      
      loadSleepHistory();
      
    } catch (error) {
      toast.error('Failed to save sleep log');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyInsights = () => {
    if (!analysis) {
      toast.error('No analysis to copy yet');
      return;
    }

    let text = `🌙 Sleep Analysis\n\n`;
    text += `Sleep Score: ${analysis.sleep_score} / 100\n`;
    text += `Duration: ${analysis.sleep_duration_hours?.toFixed(1)} hours\n\n`;
    text += `Sleep Quality: ${analysis.sleep_quality}\n\n`;

    if (analysis.dream_analysis && dreamDescription) {
      text += `Dream Analysis:\n${analysis.dream_analysis}\n\n`;
    }

    if (analysis.tips && analysis.tips.length > 0) {
      text += `Improvement Tips:\n`;
      analysis.tips.forEach((tip, index) => {
        text += `${index + 1}. ${tip}\n`;
      });
    }

    navigator.clipboard.writeText(text)
      .then(() => toast.success('📋 Sleep insights copied!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const exportPdf = async () => {
    if (!analysis) {
      toast.error('No analysis to export yet');
      return;
    }

    toast.info('📄 Generating PDF...');

    try {
      const { exportSleepReport } = await import('@/functions/exportSleepReport');
      const payload = {
        bed_time: bedTime,
        wake_time: wakeTime,
        sleep_quality: sleepQuality,
        dream_description: dreamDescription,
        analysis
      };
      
      const { data } = await exportSleepReport(payload);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sleep_Analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('✅ PDF generated successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const weekData = sleepHistory.slice(0, 7).reverse().map(log => ({
    date: format(new Date(log.log_date), 'MM/dd'),
    hours: log.sleep_duration || 0,
    score: log.sleep_score || 0,
    quality: log.sleep_quality || 0
  }));

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="sleep_analyses"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} feature="Unlimited Sleep Analysis" />}
      
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30"
                  >
                    <Moon className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      🌙 Sleep Intelligence
                    </h1>
                    <p className="text-lg text-white/90">
                      Advanced sleep tracking & AI-powered insights
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm opacity-90">Avg Sleep</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.avgSleepHours}h</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5" />
                    <span className="text-sm opacity-90">Avg Score</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.avgSleepScore}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5" />
                    <span className="text-sm opacity-90">Streak</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.streak}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Nights</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalNights}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="log" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="log" className="flex items-center gap-2">
              <BedDouble className="w-4 h-4" />
              Log Sleep
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-6">
            {!isLoading && !analysis && (
              <GradientCard tone="violet">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Moon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Log Your Sleep
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Track and analyze your sleep patterns</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sunset className="w-4 h-4 text-indigo-600" />
                        Bed time
                      </Label>
                      <Input 
                        type="time" 
                        value={bedTime} 
                        onChange={e => setBedTime(e.target.value)} 
                        className="dark:bg-slate-700/50 h-12 text-lg" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Sunrise className="w-4 h-4 text-amber-600" />
                        Wake time
                      </Label>
                      <Input 
                        type="time" 
                        value={wakeTime} 
                        onChange={e => setWakeTime(e.target.value)} 
                        className="dark:bg-slate-700/50 h-12 text-lg" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center block">
                      How was your sleep quality?
                    </Label>
                    <StarRating rating={sleepQuality} setRating={setSleepQuality} />
                    {sleepQuality > 0 && (
                      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        {sleepQuality === 5 && '😴 Excellent! Best sleep ever!'}
                        {sleepQuality === 4 && '😊 Very good sleep'}
                        {sleepQuality === 3 && '🙂 Decent sleep'}
                        {sleepQuality === 2 && '😐 Could be better'}
                        {sleepQuality === 1 && '😟 Poor sleep'}
                      </p>
                    )}
                  </div>
                </div>

                {bedTime && wakeTime && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Your Sleep Timeline
                    </h4>
                    <SleepTimeline bedTime={bedTime} wakeTime={wakeTime} />
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CloudMoon className="w-4 h-4 text-purple-600" />
                    Dream Description
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </Label>
                  <Textarea
                    placeholder="Describe any dreams you remember... Our AI will provide fascinating interpretations!"
                    value={dreamDescription}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    rows={4}
                    className="resize-none dark:bg-slate-700/50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleAnalysis}
                    disabled={isLoading || !bedTime || !wakeTime || sleepQuality === 0}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Get AI Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveLog}
                    disabled={isSaving || !bedTime || !wakeTime || sleepQuality === 0}
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Log
                      </>
                    )}
                  </Button>
                </div>
              </GradientCard>
            )}

            <AnimatePresence>
              {isLoading && !analysis && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GradientCard tone="indigo">
                    <LoadingAnalysis 
                      message="AI is analyzing your sleep patterns..."
                      category="sleep"
                      showProgress={true}
                      duration={8000}
                    />
                  </GradientCard>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <GradientCard tone="indigo">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Trophy className="w-6 h-6 text-amber-500" />
                          Your Sleep Analysis
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {format(new Date(), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 text-lg">
                        Score: {analysis.sleep_score}/100
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="relative">
                        <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Sleep Score</p>
                          <motion.p 
                            className="text-6xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            {analysis.sleep_score}
                          </motion.p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">out of 100</p>
                          <Progress value={analysis.sleep_score} className="mt-4 h-3" />
                        </div>
                      </div>

                      <div className="relative">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Duration</p>
                          <motion.p 
                            className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                          >
                            {analysis.sleep_duration_hours?.toFixed(1)}
                          </motion.p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">hours of sleep</p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            {analysis.sleep_duration_hours >= 7 && analysis.sleep_duration_hours <= 9 ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Optimal
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                {analysis.sleep_duration_hours < 7 ? 'Too Short' : 'Too Long'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {bedTime && wakeTime && (
                      <div className="mb-6">
                        <SleepCycleViz bedTime={bedTime} wakeTime={wakeTime} sleepQuality={sleepQuality} />
                      </div>
                    )}

                    <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200">
                          Sleep Quality Assessment
                        </h4>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {analysis.sleep_quality}
                      </p>
                    </div>

                    {analysis.dream_analysis && dreamDescription && (
                      <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <CloudMoon className="w-5 h-5 text-purple-600" />
                          <h4 className="font-bold text-purple-900 dark:text-purple-200">
                            Dream Interpretation
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Your Dream:</p>
                            <p className="text-slate-700 dark:text-slate-300 italic">"{dreamDescription}"</p>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {analysis.dream_analysis}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          Personalized Sleep Tips
                        </h3>
                      </div>
                      
                      {analysis.tips && (
                        <div className="grid gap-3">
                          {analysis.tips.map((tip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shrink-0 shadow-lg">
                                {index + 1}
                              </div>
                              <span className="text-slate-700 dark:text-slate-300 flex-1 pt-1.5">{tip}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-center">
                      <p className="text-lg font-semibold mb-2">
                        💡 Pro Tip
                      </p>
                      <p className="text-white/90">
                        Consistent sleep schedules help regulate your body's internal clock, leading to better sleep quality and easier wake-ups!
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                      <Button variant="outline" onClick={copyInsights} disabled={!analysis}>
                        <Clipboard className="w-4 h-4 mr-2" />
                        Copy Insights
                      </Button>
                      <Button variant="outline" onClick={exportPdf} disabled={!analysis}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                      <SaveToDashboardButton itemData={{
                        title: `Sleep Analysis - ${format(new Date(), 'MMM d, yyyy')}`,
                        content: `Score: ${analysis.sleep_score}, Duration: ${analysis.sleep_duration_hours?.toFixed(1)}h`,
                        details: analysis,
                        source_page: "Sleep",
                        icon: "Moon"
                      }} />
                    </div>
                  </GradientCard>
                </motion.div>
              )}
            </AnimatePresence>

            <GradientCard tone="blue">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                💤 Better Sleep Habits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Keep a regular bedtime, even on weekends</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Limit caffeine after 2 PM</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Avoid screens at least 1 hour before bed</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Keep your room cool, dark, and quiet</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Try a relaxing pre-sleep routine</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                    <span>Exercise regularly, but not before bed</span>
                  </li>
                </ul>
              </div>
            </GradientCard>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <GradientCard tone="blue">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Sleep Analytics
              </h3>

              {sleepHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Moon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No sleep data yet. Start logging your sleep to see analytics!</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Weekly Sleep Duration</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weekData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px'
                          }}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#6366F1" fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Weekly Sleep Score</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="score" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Sleep Quality Profile</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={[
                        { metric: 'Duration', value: (stats.avgSleepHours / 9) * 100 },
                        { metric: 'Consistency', value: (stats.streak / 7) * 100 },
                        { metric: 'Quality', value: (stats.avgSleepScore / 100) * 100 },
                        { metric: 'Regularity', value: 75 },
                        { metric: 'Recovery', value: 80 },
                      ]}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="metric" stroke="#64748B" />
                        <PolarRadiusAxis stroke="#64748B" />
                        <Radar name="Sleep Profile" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </GradientCard>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GradientCard tone="violet">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sleep Performance</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last 7 days average</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Score</span>
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.avgSleepScore}</span>
                    </div>
                    <Progress value={stats.avgSleepScore} className="h-3" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Duration</span>
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.avgSleepHours}h</span>
                    </div>
                    <Progress value={(parseFloat(stats.avgSleepHours) / 9) * 100} className="h-3" />
                  </div>
                </div>
              </GradientCard>

              <GradientCard tone="amber">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Streak</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Keep it going!</p>
                  </div>
                </div>
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-7xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    {stats.streak}
                  </motion.div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 mt-2">
                    {stats.streak === 1 ? 'day' : 'days'} in a row
                  </p>
                  {stats.streak >= 7 && (
                    <Badge className="mt-4 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <Award className="w-4 h-4 mr-1" />
                      Week Warrior!
                    </Badge>
                  )}
                </div>
              </GradientCard>

              <GradientCard tone="green" className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Sleep Insights</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Personalized recommendations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">Optimal Bedtime</h4>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Based on your wake time, try sleeping by 10:30 PM for 7-8 hours of rest.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Environment</h4>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Keep room temperature between 60-67°F (15-19°C) for optimal sleep.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900 dark:text-purple-200">Caffeine Cutoff</h4>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Avoid caffeine after 2 PM. Try herbal tea or warm milk before bed.
                    </p>
                  </div>
                </div>
              </GradientCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}