import React, { useState, useEffect } from 'react';
import { Smile, Loader2, Heart, Brain, Sparkles, TrendingUp, Calendar, Activity, Send, Clipboard } from 'lucide-react';
import { MoodLog } from '@/entities/MoodLog';
import { useAI } from '../components/useAI';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GradientCard from '../components/GradientCard';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SaveToDashboardButton from '../components/SaveToDashboardButton';

const MOOD_CONFIG = {
  radiant: { 
    emoji: '✨', 
    label: 'Radiant', 
    score: 5, 
    color: '#FFD700',
    gradient: 'from-yellow-400 to-orange-400',
    description: 'Absolutely glowing with joy and energy!'
  },
  good: { 
    emoji: '😊', 
    label: 'Good', 
    score: 4, 
    color: '#22C55E',
    gradient: 'from-green-400 to-emerald-400',
    description: 'Feeling positive and content'
  },
  okay: { 
    emoji: '😐', 
    label: 'Okay', 
    score: 3, 
    color: '#3B82F6',
    gradient: 'from-blue-400 to-cyan-400',
    description: 'Balanced and neutral'
  },
  sad: { 
    emoji: '😢', 
    label: 'Sad', 
    score: 2, 
    color: '#F97316',
    gradient: 'from-orange-400 to-amber-400',
    description: 'Feeling down but hopeful'
  },
  stressed: { 
    emoji: '😰', 
    label: 'Stressed', 
    score: 1, 
    color: '#EF4444',
    gradient: 'from-red-400 to-rose-400',
    description: 'Overwhelmed and tense'
  }
};

const InteractiveMoodSelector = ({ selectedMood, onMoodSelect, disabled = false }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
      {Object.entries(MOOD_CONFIG).map(([mood, config]) => {
        const isSelected = selectedMood === mood;
        
        return (
          <motion.button
            key={mood}
            onClick={() => !disabled && onMoodSelect(mood)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`
              relative p-6 rounded-3xl border-3 transition-all duration-300 group overflow-hidden
              ${isSelected 
                ? `bg-gradient-to-br ${config.gradient} border-white shadow-2xl text-white` 
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isSelected && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 blur-xl`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <div className="relative z-10 text-center">
              <motion.div 
                className="text-4xl mb-3"
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {config.emoji}
              </motion.div>
              <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                {config.label}
              </h3>
              <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                {config.description}
              </p>
            </div>
            
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

const MoodInsightsCard = ({ aiSuggestion, selectedMood }) => {
  if (!aiSuggestion) return null;

  const moodConfig = MOOD_CONFIG[selectedMood];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GradientCard className={`bg-gradient-to-br ${moodConfig?.gradient || 'from-violet-50 to-purple-50'} border-2 border-white/50 shadow-xl`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${moodConfig?.gradient || 'from-violet-400 to-purple-500'} flex items-center justify-center shadow-lg`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Emotional Guidance for {moodConfig?.label}
            </h3>
            
            {aiSuggestion.affirmation && (
              <motion.div 
                className="bg-white/20 rounded-2xl p-4 mb-4 backdrop-blur-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Your Personal Affirmation
                </h4>
                <p className="text-white/90 italic text-lg">"{aiSuggestion.affirmation}"</p>
              </motion.div>
            )}

            {aiSuggestion.suggestion && (
              <div className="mb-4">
                <p className="text-white/90 leading-relaxed">{aiSuggestion.suggestion}</p>
              </div>
            )}

            {aiSuggestion.activities?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-3">Recommended Activities:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiSuggestion.activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white/90"
                    >
                      <span className="text-white mr-2">•</span>
                      {activity}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {aiSuggestion.breathing_exercise && (
              <motion.div 
                className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Quick Breathing Exercise
                </h4>
                <p className="text-white/90">{aiSuggestion.breathing_exercise}</p>
              </motion.div>
            )}
          </div>
        </div>
      </GradientCard>
    </motion.div>
  );
};

const MoodTrendsChart = ({ moodHistory }) => {
  if (!moodHistory.length) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const moodName = Object.keys(MOOD_CONFIG).find(key => 
        MOOD_CONFIG[key].score === Math.round(data.avg_score)
      ) || 'okay';
      const config = MOOD_CONFIG[moodName];
      
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <p className="font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.emoji}</span>
            <span className="font-medium" style={{ color: config.color }}>
              {config.label} ({data.avg_score.toFixed(1)}/5)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GradientCard>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-violet-500" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Mood Journey</h3>
        <div className="ml-auto px-3 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full text-sm font-semibold">
          Last 7 Days
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={moodHistory}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[0, 5]} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => {
                const mood = Object.entries(MOOD_CONFIG).find(([_, config]) => config.score === value);
                return mood ? mood[1].emoji : '';
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="avg_score" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fill="url(#moodGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GradientCard>
  );
};

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [context, setContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const { getMoodSuggestion } = useAI();

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const today = new Date();
      const last7Days = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
      const logs = await MoodLog.filter({ log_date: { '$gte': last7Days } }, '-log_date');
      
      const aggregated = logs.reduce((acc, log) => {
        const date = new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { date, score: [], count: 0 };
        }
        acc[date].score.push(log.mood_score);
        acc[date].count++;
        return acc;
      }, {});

      const chartData = Object.values(aggregated).map(d => ({
        date: d.date,
        avg_score: d.score.reduce((a, b) => a + b, 0) / d.count,
      })).reverse();
      
      setMoodHistory(chartData);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const handleMoodSelect = async (mood) => {
    if (isLoading) return;
    
    setSelectedMood(mood);
    setAiSuggestion(null);
    setShowContextInput(true);
    setContext('');

    const moodScore = MOOD_CONFIG[mood].score;
    const today = new Date().toISOString().split('T')[0];

    try {
      await MoodLog.create({
        mood,
        mood_score: moodScore,
        log_date: today,
        notes: 'Daily mood check-in'
      });
      
      toast.success(`🎉 Mood logged as: ${MOOD_CONFIG[mood].label}!`);
      fetchMoodHistory();
    } catch (error) {
      toast.error('Failed to log mood.');
      console.error('Mood logging error:', error);
    }
  };

  const handleGetInsights = async () => {
    setIsLoading(true);
    setShowContextInput(false);

    try {
      const usage = await UsageTracker.checkAndUpdateUsage('mood_logs');
      if (!usage.allowed) {
        setUsageInfo(usage);
        setShowUsagePopup(true);
        setIsLoading(false);
        return;
      }

      const suggestion = await getMoodSuggestion(selectedMood, context);
      setAiSuggestion(suggestion);

    } catch (error) {
      toast.error('Failed to get AI suggestion.');
      console.error('AI suggestion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copySuggestion = async () => {
    if (!aiSuggestion || !selectedMood) return;
    const text = `Mood Guidance - ${MOOD_CONFIG[selectedMood]?.label || selectedMood}:
Affirmation: ${aiSuggestion.affirmation || 'N/A'}
Suggestion: ${aiSuggestion.suggestion || 'N/A'}
Activities: ${(aiSuggestion.activities || []).map((a, i) => `${i + 1}. ${a}`).join('\n') || 'N/A'}
Breathing Exercise: ${aiSuggestion.breathing_exercise || 'N/A'}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Guidance copied to clipboard!');
    } catch {
      toast.error('Could not copy guidance to clipboard.');
    }
  };

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="mood_logs"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}
      
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent mb-4">
            Mood Sanctuary ✨
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Check in with your emotions and receive personalized insights to nurture your emotional well-being
          </p>
        </motion.div>

        <GradientCard className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              How are you feeling right now?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Take a moment to connect with your emotions
            </p>
          </div>
          
          <InteractiveMoodSelector 
            selectedMood={selectedMood} 
            onMoodSelect={handleMoodSelect}
            disabled={isLoading || showContextInput}
          />
        </GradientCard>

        <AnimatePresence>
          {showContextInput && selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <GradientCard className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  What's on your mind? <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </h3>
                <Textarea
                  placeholder={`Tell me more about why you're feeling ${MOOD_CONFIG[selectedMood]?.label.toLowerCase()}...`}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50 mb-4 min-h-[100px]"
                />
                <Button onClick={handleGetInsights} className="w-full h-12" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Get Personalized Guidance
                </Button>
              </GradientCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading && (
          <GradientCard className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-center gap-4 py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-violet-500" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">
                  AI is understanding your emotions...
                </h3>
                <div className="space-y-2">
                  <div className="h-2 w-64 bg-violet-200 dark:bg-violet-800 rounded animate-pulse"></div>
                  <div className="h-2 w-48 bg-violet-200 dark:bg-violet-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </GradientCard>
        )}

        <AnimatePresence>
          {aiSuggestion && selectedMood && (
            <>
              <MoodInsightsCard 
                aiSuggestion={aiSuggestion} 
                selectedMood={selectedMood} 
              />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={copySuggestion}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy Guidance
                </Button>
                <SaveToDashboardButton
                  itemData={{
                    title: `Mood Guidance - ${new Date().toLocaleDateString()}`,
                    content: `${MOOD_CONFIG[selectedMood]?.label || selectedMood}: ${aiSuggestion.affirmation}`,
                    details: { mood: selectedMood, context, suggestion: aiSuggestion },
                    source_page: "Mood",
                    icon: "Smile"
                  }}
                />
              </div>
            </>
          )}
        </AnimatePresence>

        <MoodTrendsChart moodHistory={moodHistory} />
      </div>
    </>
  );
}