
import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Clipboard, Save, Heart, Feather, Wand2, TrendingUp, BookOpen, Calendar, Search, Filter, Flame, Target, Award, Smile, Eye, History, Download, Share2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAI } from '../components/useAI';
import ContentCard from '../components/ContentCard';
import GradientCard from '../components/GradientCard';
import MoodSelector from '../components/MoodSelector';
import JournalAnalysisResults from '../components/JournalAnalysisResults';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import { HealthLog } from '@/entities/HealthLog';
import { JournalEntry } from '@/entities/JournalEntry';
import { User } from '@/entities/User';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import LoadingAnalysis from '../components/LoadingAnalysis';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const PremiumPaywallLazy = lazy(() => import('../components/PremiumPaywall'));

// Beautiful writing prompts library
const writingPrompts = [
  { category: "Gratitude", emoji: "🙏", prompts: [
    "Three things that made me smile today...",
    "A person I'm grateful for and why...",
    "A simple pleasure I often take for granted...",
    "Something beautiful I noticed today..."
  ]},
  { category: "Growth", emoji: "🌱", prompts: [
    "One thing I learned about myself today...",
    "A challenge I faced and how I handled it...",
    "An old pattern I'm ready to release...",
    "A new habit I want to cultivate..."
  ]},
  { category: "Dreams", emoji: "✨", prompts: [
    "If I could do anything, I would...",
    "My ideal day would look like...",
    "Five years from now, I see myself...",
    "A dream I'm afraid to voice..."
  ]},
  { category: "Reflection", emoji: "🤔", prompts: [
    "What's really going on beneath the surface?",
    "What am I avoiding right now?",
    "What does my body need today?",
    "What would I tell my younger self?"
  ]},
  { category: "Energy", emoji: "⚡", prompts: [
    "What energized me today?",
    "What drained my energy?",
    "One small step I can take tomorrow...",
    "How can I be kinder to myself?"
  ]}
];

// Journal templates
const templates = [
  { name: "Quick Check-in", emoji: "💭", template: "Today I'm feeling...\n\nWhat's on my mind:\n\nOne thing I'm grateful for:\n\nTomorrow I want to focus on:" },
  { name: "Deep Reflection", emoji: "🌊", template: "What I'm experiencing right now:\n\nEmotions present:\n\nWhere these feelings come from:\n\nWhat my heart needs:\n\nCompassionate action I can take:" },
  { name: "Dream Journal", emoji: "🌙", template: "Last night I dreamed about...\n\nSymbols and themes:\n\nHow I felt in the dream:\n\nWhat this might mean:\n\nMessage for my waking self:" },
  { name: "Gratitude Flow", emoji: "✨", template: "Today I'm grateful for:\n1.\n2.\n3.\n\nWhy these matter to me:\n\nHow I can honor this gratitude:" },
  { name: "Challenge Processing", emoji: "🎯", template: "Challenge I'm facing:\n\nHow it makes me feel:\n\nWhat I can control:\n\nWhat I can't control:\n\nOne kind action toward myself:\n\nNext small step:" }
];

export default function Mind() {
  const { analyzeJournal, isLoading } = useAI();

  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [user, setUser] = useState(null);
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // History & Stats
  const [showHistory, setShowHistory] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMoodScore: 0,
    weeklyCount: 0
  });

  // Prompts & Templates
  const [showPrompts, setShowPrompts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const calculateStats = useCallback((entries) => {
    if (!entries.length) {
      setStats({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageMoodScore: 0,
        weeklyCount: 0
      });
      return;
    }

    // Calculate streak
    const sortedDates = entries
      .map(e => e.entry_date)
      .sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Check for current streak
    if (sortedDates.includes(today)) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1]);
        const currentDate = new Date(sortedDates[i]);
        const diff = Math.round(Math.abs((prevDate - currentDate) / (1000 * 60 * 60 * 24))); // Round difference to handle time variations
        if (diff === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    } else if (sortedDates.includes(yesterday)) {
      // If today isn't logged, but yesterday was, we still count it towards the streak IF there's a continuous streak ending yesterday
      currentStreak = 1; // Start counting from yesterday
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1]);
        const currentDate = new Date(sortedDates[i]);
        const diff = Math.round(Math.abs((prevDate - currentDate) / (1000 * 60 * 60 * 24)));
        if (sortedDates[0] === yesterday && diff === 1) { // Only continue if the first entry was yesterday and consecutive
          currentStreak++;
        } else {
          break;
        }
      }
    }


    // Calculate longest streak
    if (sortedDates.length > 0) {
      longestStreak = 1;
      tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1]);
        const currentDate = new Date(sortedDates[i]);
        const diff = Math.round(Math.abs((prevDate - currentDate) / (1000 * 60 * 60 * 24)));
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1; // Reset streak
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    // Average mood score
    const moodScores = entries
      .filter(e => e.ai_insights?.mood_score)
      .map(e => e.ai_insights.mood_score);
    const avgMood = moodScores.length 
      ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1)
      : 0;

    // Weekly count
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weeklyCount = entries.filter(e => {
      const d = new Date(e.entry_date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    setStats({
      totalEntries: entries.length,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak), // Ensure longest streak captures current if it's the max
      averageMoodScore: avgMood,
      weeklyCount
    });
  }, []);

  const loadJournalHistory = useCallback(async () => {
    try {
      const entries = await JournalEntry.list('-entry_date', 50);
      setJournalHistory(entries);
      calculateStats(entries);
    } catch (e) {
      console.error('Failed to load journal history:', e);
    }
  }, [calculateStats]);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
    loadJournalHistory();
  }, [loadJournalHistory]);

  const analyzeEntry = async () => {
    if (!entry.trim()) {
      toast.error('Please write your journal first.');
      return;
    }
    const usage = await UsageTracker.checkAndUpdateUsage('journal_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    try {
      toast.info('Analyzing your journal with AI...');
      const res = await analyzeJournal(entry);
      if (!res) throw new Error('No analysis returned');
      setAnalysis(res);
      toast.success('Insights ready!');
    } catch (e) {
      console.error(e);
      toast.error('AI is busy right now. Please try again.');
    }
  };

  const copySummary = async () => {
    if (!analysis) return;
    const txt = `Mindful Insights:
- Mood Score: ${analysis.mood_score}/5
- Emotions: ${(analysis.primary_emotions || []).join(', ')}
- Themes: ${(analysis.key_themes || []).join(', ')}
- Affirmation: "${analysis.affirmation || ''}"
- Suggestions: ${(analysis.suggestions || []).slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join(' ')}`;
    try {
      await navigator.clipboard.writeText(txt);
      toast.success('Insights copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const saveEntry = async () => {
    if (!analysis) {
      toast.error('Analyze your journal first.');
      return;
    }
    if (!user) {
      toast.error('Please log in to save your journal.');
      return;
    }
    try {
      await JournalEntry.create({
        title: title || `Journal - ${format(new Date(), 'MMM d, yyyy')}`,
        content: entry,
        mood: mood || null,
        ai_insights: analysis,
        entry_date: format(new Date(), 'yyyy-MM-dd')
      });
      
      await HealthLog.create({
        log_type: 'mood_journal',
        log_date: new Date().toISOString(),
        title: title || `Journal - ${format(new Date(), 'MMM d, yyyy')}`,
        data: {
          entry,
          mood: mood || null,
          analysis
        },
        user_email: user.email
      });

      toast.success('Journal saved successfully!');
      loadJournalHistory();
      // Reset form
      setEntry('');
      setTitle('');
      setMood(null);
      setAnalysis(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save journal.');
    }
  };

  const applyTemplate = (template) => {
    setEntry(template);
    setShowTemplates(false);
    toast.success('Template applied! Start writing...');
  };

  const applyPrompt = (prompt) => {
    setEntry(prev => prev ? `${prev}\n\n${prompt}` : prompt);
    setShowPrompts(false);
    toast.success('Prompt added! Keep writing...');
  };

  const filteredHistory = journalHistory.filter(j => {
    const matchesSearch = !searchQuery || 
      j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = filterMood === 'all' || j.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="journal_analyses"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      <AnimatePresence>
        {showPaywall && (
          <Suspense fallback={null}>
            <PremiumPaywallLazy onClose={() => setShowPaywall(false)} feature="Mind Journal AI" />
          </Suspense>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border-2 border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
          <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-24 h-56 w-56 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 shadow-xl flex items-center justify-center">
              <Feather className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Mind Journal ✨
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">Write freely. Let AI reflect back insights with kindness and wisdom.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <GradientCard className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200/60 dark:border-orange-800/40">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.currentStreak}</div>
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300">Day Streak</div>
              </div>
            </div>
            <Progress value={(stats.currentStreak / (stats.longestStreak || 1)) * 100} className="h-1.5" />
          </GradientCard>

          <GradientCard className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200/60 dark:border-violet-800/40">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-violet-500" />
              <div>
                <div className="text-2xl font-black text-violet-600 dark:text-violet-400">{stats.totalEntries}</div>
                <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">Total Entries</div>
              </div>
            </div>
          </GradientCard>

          <GradientCard className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/60 dark:border-blue-800/40">
            <div className="flex items-center gap-3 mb-2">
              <Smile className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.averageMoodScore}</div>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Avg Mood</div>
              </div>
            </div>
          </GradientCard>

          <GradientCard className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.weeklyCount}</div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">This Week</div>
              </div>
            </div>
          </GradientCard>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2 border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 font-semibold"
          >
            <History className="w-4 h-4" /> 
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowPrompts(!showPrompts)}
            className="gap-2 border-2 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-semibold"
          >
            <Sparkles className="w-4 h-4" /> 
            Writing Prompts
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowTemplates(!showTemplates)}
            className="gap-2 border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-semibold"
          >
            <BookOpen className="w-4 h-4" /> 
            Templates
          </Button>
        </div>

        {/* Writing Prompts Drawer */}
        <AnimatePresence>
          {showPrompts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GradientCard className="p-5 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200/60 dark:border-pink-800/40">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Writing Prompts Library
                </h3>
                <div className="space-y-4">
                  {writingPrompts.map((cat, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                        className="w-full text-left px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border-2 border-pink-200 dark:border-pink-700 hover:border-pink-400 dark:hover:border-pink-500 transition font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between"
                      >
                        <span>{cat.emoji} {cat.category}</span>
                        <Badge className="text-xs">{cat.prompts.length}</Badge>
                      </button>
                      <AnimatePresence>
                        {selectedCategory === cat.category && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 ml-4 space-y-2"
                          >
                            {cat.prompts.map((prompt, j) => (
                              <button
                                key={j}
                                onClick={() => applyPrompt(prompt)}
                                className="w-full text-left px-3 py-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition text-sm text-slate-700 dark:text-slate-200 font-medium"
                              >
                                "{prompt}"
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </GradientCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Drawer */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GradientCard className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200/60 dark:border-purple-800/40">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Journal Templates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((template, i) => (
                    <motion.button
                      key={i}
                      onClick={() => applyTemplate(template.template)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition text-left"
                    >
                      <div className="text-3xl mb-2">{template.emoji}</div>
                      <div className="font-bold text-slate-900 dark:text-white">{template.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">Click to use this template</div>
                    </motion.button>
                  ))}
                </div>
              </GradientCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History View */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GradientCard className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-200/60 dark:border-slate-700/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-500" />
                    Journal History ({filteredHistory.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search journals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-64 h-9 text-sm border-2"
                      />
                    </div>
                    <select
                      value={filterMood}
                      onChange={(e) => setFilterMood(e.target.value)}
                      className="px-3 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium"
                    >
                      <option value="all">All Moods</option>
                      <option value="radiant">😊 Radiant</option>
                      <option value="good">🙂 Good</option>
                      <option value="okay">😐 Okay</option>
                      <option value="sad">😟 Sad</option>
                      <option value="stressed">😩 Stressed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No journal entries found.</p>
                    </div>
                  ) : (
                    filteredHistory.map((j, i) => (
                      <motion.div
                        key={j.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-white/90 dark:bg-slate-700/90 border-2 border-slate-200 dark:border-slate-600 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{j.title || 'Untitled Entry'}</h4>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(j.entry_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          {j.mood && (
                            <Badge className="shrink-0 text-xs">
                              {j.mood === 'radiant' && '😊'}
                              {j.mood === 'good' && '🙂'}
                              {j.mood === 'okay' && '😐'}
                              {j.mood === 'sad' && '😟'}
                              {j.mood === 'stressed' && '😩'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 mb-3">
                          {j.content}
                        </p>
                        {j.ai_insights && (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300">
                              Mood Score: {j.ai_insights.mood_score}/5
                            </Badge>
                            {j.ai_insights.primary_emotions?.slice(0, 3).map((emotion, idx) => (
                              <Badge key={idx} variant="outline" className="bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </GradientCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Journal Editor */}
        {!analysis && !isLoading && (
          <ContentCard className="relative overflow-hidden">
            {/* Simplified ambient background - removed problematic animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-violet-400 blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-purple-400 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-pink-400 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Feather className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Write Your Journal</h3>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Give your journal a title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base border-2 dark:bg-slate-700/50 dark:text-white dark:border-slate-600 font-semibold"
                />

                <Textarea
                  placeholder="Dear me, today felt..."
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={8}
                  className="resize-none text-base dark:bg-slate-700/50 dark:text-white dark:border-slate-600 border-2 leading-relaxed"
                />

                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <div className="font-semibold text-slate-800 dark:text-white">How do you feel right now?</div>
                  </div>
                  <MoodSelector selectedMood={mood} onMoodSelect={setMood} size="sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button 
                    onClick={analyzeEntry} 
                    disabled={isLoading || !entry.trim()} 
                    className="h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transition-all font-bold text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 border-2 font-semibold" 
                    onClick={() => {
                      setEntry('');
                      setTitle('');
                      setMood(null);
                    }} 
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </ContentCard>
        )}

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && !analysis && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContentCard className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200/60 dark:border-indigo-800/60">
                <LoadingAnalysis
                  message="AI is reading your journal with care..."
                  category="mind"
                  showProgress={true}
                  duration={9000}
                />
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <JournalAnalysisResults analysis={analysis} />

              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <Button 
                  onClick={saveEntry} 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
                <Button variant="outline" onClick={copySummary} className="border-2 font-semibold">
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy Insights
                </Button>
                <SaveToDashboardButton
                  itemData={{
                    title: title || `Mind Insights - ${format(new Date(), 'MMM d, yyyy')}`,
                    content: `Mood score: ${analysis.mood_score}/5 • Emotions: ${(analysis.primary_emotions || []).slice(0,3).join(', ')}`,
                    details: { entry, mood, analysis },
                    source_page: "Mind",
                    icon: "Brain"
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAnalysis(null);
                    setEntry('');
                    setTitle('');
                    setMood(null);
                  }}
                  className="border-2 font-semibold"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
