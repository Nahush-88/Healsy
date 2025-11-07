
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wind, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, AlertCircle, Crown, Globe, Zap, Star, Heart, Target, TrendingUp, Award, Flame, CheckCircle, Infinity, Rocket, Music, Coffee, Smile, Trophy, X } from 'lucide-react';
import ContentCard from '../components/GradientCard';
import { useAI } from '../components/useAI';
import { GenerateImage } from '@/integrations/Core';
import { toast } from 'sonner';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import { getYogaFallbackImage } from '@/components/utils/imageFallbacks';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import LoadingAnalysis from '@/components/LoadingAnalysis';

// SUGGESTED GOALS with enhanced visuals
const suggestedGoals = [
  { id: 'stress_relief', label: 'Stress Relief', emoji: '😌', color: 'from-blue-500 via-cyan-500 to-teal-500', glow: 'shadow-blue-500/50' },
  { id: 'flexibility', label: 'Flexibility', emoji: '🤸', color: 'from-purple-500 via-pink-500 to-rose-500', glow: 'shadow-purple-500/50' },
  { id: 'weight_loss', label: 'Weight Loss', emoji: '🔥', color: 'from-orange-500 via-red-500 to-pink-600', glow: 'shadow-orange-500/50' },
  { id: 'back_pain', label: 'Back Pain Relief', emoji: '💪', color: 'from-emerald-500 via-teal-500 to-cyan-600', glow: 'shadow-emerald-500/50' },
  { id: 'morning_energy', label: 'Morning Energy', emoji: '☀️', color: 'from-amber-500 via-yellow-500 to-orange-600', glow: 'shadow-amber-500/50' },
  { id: 'better_sleep', label: 'Better Sleep', emoji: '🌙', color: 'from-indigo-500 via-purple-500 to-pink-600', glow: 'shadow-indigo-500/50' },
  { id: 'core_strength', label: 'Core Strength', emoji: '⚡', color: 'from-violet-500 via-fuchsia-500 to-pink-600', glow: 'shadow-violet-500/50' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘', color: 'from-pink-500 via-rose-500 to-red-600', glow: 'shadow-pink-500/50' },
];

const difficulties = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Perfect for starting out' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🌿', desc: 'Building your practice' },
  { id: 'advanced', label: 'Advanced', emoji: '🌳', desc: 'Master level flow' },
];

// Language options with enhanced display
const languages = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
];

export default function YogaPage() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [customGoal, setCustomGoal] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('stress_relief');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [routine, setRoutine] = useState(null);
  const [poseImages, setPoseImages] = useState([]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const [intensity, setIntensity] = useState(1.0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  const { generateYogaRoutine } = useAI();
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);

  useEffect(() => {
    User.me()
      .then((u) => {
        setUser(u);
        if (u?.language) setSelectedLanguage(u.language);
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingUser(false));
  }, []);

  const scaleRoutineDurations = useCallback((routineToScale, factor) => {
    if (!routineToScale) return routineToScale;
    const poses = routineToScale.poses.map(p => ({
      ...p,
      duration_seconds: Math.max(20, Math.round((p.duration_seconds || 45) * factor))
    }));
    const totalSec = poses.reduce((s, p) => s + p.duration_seconds, 0);
    return {
      ...routineToScale,
      poses,
      total_duration_minutes: Math.max(5, Math.round(totalSec / 60))
    };
  }, []);

  const speak = useCallback((text) => {
    if (isMuted || !synthRef.current) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'es' ? 'es-ES' : 'en-US';
    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  }, [isMuted, selectedLanguage]);

  useEffect(() => {
    if (routine) {
      const generateImages = async () => {
        setPoseImages([]);
        setImageError(false);

        const poses = routine.poses || [];
        if (!poses.length) return;

        const delay = (ms) => new Promise((r) => setTimeout(r, ms));

        let firstUrl = null;
        try {
          const first = await GenerateImage({ prompt: poses[0].image_prompt });
          firstUrl = first?.url || null;
        } catch (e) {
          const fallbacks = poses.map((p, i) => getYogaFallbackImage(p.pose_name, i));
          setPoseImages(fallbacks);
          return;
        }

        const urls = new Array(poses.length).fill(null);
        urls[0] = firstUrl;

        const results = await Promise.allSettled(
          poses.slice(1).map(async (pose, idx) => {
            const realIndex = idx + 1;
            try {
              await delay(150 + (idx % 4) * 75);
              const res = await GenerateImage({ prompt: pose.image_prompt });
              return { status: 'fulfilled', index: realIndex, url: res?.url || getYogaFallbackImage(pose.pose_name, realIndex) };
            } catch {
              return { status: 'rejected', index: realIndex, url: getYogaFallbackImage(pose.pose_name, realIndex) };
            }
          })
        );

        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value) {
            urls[r.value.index] = r.value.url;
          } else if (r.status === "rejected" && r.reason) {
            urls[r.reason.index] = r.reason.url;
          }
        });

        const finalUrls = urls.map((url, i) => url || getYogaFallbackImage(poses[i].pose_name, i));
        setPoseImages(finalUrls);
      };

      generateImages();
    }
  }, [routine]);

  useEffect(() => {
    if (!routine || !isSessionActive) {
      setTotalRemaining(0);
      return;
    }
    const remaining = routine.poses
      .slice(currentPoseIndex)
      .reduce((acc, p, idx) => acc + (idx === 0 ? timer : p.duration_seconds), 0);
    setTotalRemaining(remaining);
  }, [routine, isSessionActive, currentPoseIndex, timer]);

  useEffect(() => {
    const currentSynth = synthRef.current;

    if (isSessionActive && !isPaused && routine && routine.poses.length > 0) {
      const currentPose = routine.poses[currentPoseIndex];
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (currentPoseIndex < routine.poses.length - 1) {
              setCurrentPoseIndex(prevIdx => prevIdx + 1);
            } else {
              setIsSessionActive(false);
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 5000);
              toast.success("✨ Amazing work! Session complete! Namaste! 🙏", {
                duration: 5000,
                icon: '🎉'
              });
              speak("Amazing work. Session complete. Namaste.");
            }
            return 0;
          }
          if (prev === Math.floor(currentPose.duration_seconds / 2)) {
            speak(currentPose.voice_coach_tip);
          }
          if (prev === 4) {
            speak("3, 2, 1");
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      if (currentSynth) {
        currentSynth.cancel();
      }
    };
  }, [isSessionActive, isPaused, currentPoseIndex, routine, speak]);

  useEffect(() => {
    if (isSessionActive && routine && routine.poses.length > 0) {
      const currentPose = routine.poses[currentPoseIndex];
      setTimer(currentPose.duration_seconds);
      speak(`Starting with ${currentPose.pose_name}. Hold for ${currentPose.duration_seconds} seconds.`);
    }
  }, [currentPoseIndex, isSessionActive, routine, speak]);

  const handleGenerateRoutine = async () => {
    const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

    if (!isPremium) {
      const usage = await UsageTracker.checkAndUpdateUsage('yoga_sessions');
      if (!usage.allowed) {
        setUsageInfo(usage);
        setShowUsagePopup(true);
        return;
      }
    }

    setRoutine(null);
    setPoseImages([]);
    setLoading(true);

    const finalGoal = customGoal.trim() || selectedGoal;
    
    try {
      const result = await generateYogaRoutine(finalGoal, selectedDifficulty, selectedLanguage);
      if (result) {
        const scaled = scaleRoutineDurations(result, intensity);
        setRoutine(scaled);
        toast.success('🧘 Your personalized yoga routine is ready! Let\'s flow! ✨', {
          duration: 4000,
          icon: '🎉'
        });
      } else {
        throw new Error("Sorry, couldn't generate a routine. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    if (!routine || routine.poses.length === 0) return;
    setCurrentPoseIndex(0);
    setIsSessionActive(true);
    setIsPaused(false);
    toast.success('🚀 Session started! You got this!', { icon: '💪' });
  };
  
  const resetSession = () => {
    setRoutine(null);
    setPoseImages([]);
    setIsSessionActive(false);
    setIsPaused(false);
    setCurrentPoseIndex(0);
    setTimer(0);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const handleNextPose = () => {
    if (currentPoseIndex < routine.poses.length - 1) {
      setCurrentPoseIndex(prevIdx => prevIdx + 1);
      setIsPaused(false);
      toast.success('Moving to next pose! 🌟');
    } else {
      setIsSessionActive(false);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
      toast.success("✨ Yoga session complete! Well done! 🙏", {
        duration: 5000,
        icon: '🎉'
      });
      speak("Amazing work. Session complete. Namaste.");
    }
  };

  const handlePrevPose = () => {
    if (currentPoseIndex > 0) {
      setCurrentPoseIndex(prevIdx => prevIdx - 1);
      setIsPaused(false);
    }
  };

  const shuffleRoutine = () => {
    if (!routine?.poses?.length) return;
    const first = routine.poses[0];
    const last = routine.poses[routine.poses.length - 1];
    const middle = routine.poses.slice(1, -1);
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }
    const poses = [first, ...middle, last];
    const totalSec = poses.reduce((s, p) => s + p.duration_seconds, 0);
    setRoutine({
      ...routine,
      poses,
      total_duration_minutes: Math.max(5, Math.round(totalSec / 60))
    });
    toast.success('🔀 Routine shuffled! Fresh flow ready!', { icon: '✨' });
  };

  useEffect(() => {
    if (routine && !isSessionActive) {
      setRoutine(scaleRoutineDurations(routine, intensity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intensity]);

  const currentPose = routine?.poses[currentPoseIndex];
  const progressPercentage = routine ? ((currentPoseIndex + 1) / routine.poses.length) * 100 : 0;
  const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

  const selectedGoalData = suggestedGoals.find(g => g.id === selectedGoal) || suggestedGoals[0];
  const selectedLanguageData = languages.find(l => l.code === selectedLanguage) || languages[0];

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <LoadingAnalysis 
        language={selectedLanguage}
        message={null}
        showProgress={true}
      />
    );
  }

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="yoga_sessions"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}

      {/* CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-6xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Amazing!
              </h2>
              <p className="text-3xl font-bold text-violet-600">Session Complete! 🙏</p>
            </motion.div>
            {/* Confetti effect */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                initial={{
                  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
                  scale: 0
                }}
                animate={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800,
                  y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.03,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-6 pb-24">
        {/* PREMIUM HERO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 sm:p-12 text-white shadow-2xl"
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center border-4 border-white/40 shadow-2xl">
                  <Wind className="w-14 h-14" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h1 
                      className="text-5xl sm:text-6xl font-black"
                    >
                      AI Yoga Coach
                    </h1>
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-4 border-white/40 px-4 py-2 text-base shadow-xl">
                        <Crown className="w-5 h-5 mr-2" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-white/95 text-xl font-medium">
                    {isPremium ? 'Unlimited AI-powered yoga in 8 languages' : 'Personalized yoga routines powered by AI'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[220px] h-14 bg-white/15 border-3 border-white/40 text-white backdrop-blur-md text-base font-semibold">
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5" />
                        <span className="text-2xl">{selectedLanguageData.flag}</span>
                        <span>{selectedLanguageData.nativeName}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-base py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="font-semibold">{lang.name}</div>
                            <div className="text-sm text-slate-500">{lang.nativeName}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isPremium ? (
                  <Badge className="bg-emerald-500/30 backdrop-blur-md border-3 border-emerald-300/60 text-emerald-50 px-6 py-3 text-lg font-black shadow-xl">
                    <Infinity className="w-6 h-6 mr-2" />
                    Unlimited
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/30 backdrop-blur-md border-3 border-amber-300/60 text-amber-50 px-6 py-3 text-lg font-semibold shadow-xl">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    5/Month Free
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: isPremium ? Infinity : Target, label: isPremium ? "Unlimited Sessions" : "5 Free Sessions", desc: isPremium ? "No Limits Ever" : "Per Month" },
                { icon: Globe, label: "8 Languages", desc: "Speak Your Way" },
                { icon: Zap, label: isPremium ? "Priority AI" : "Custom Goals", desc: isPremium ? "Lightning Fast" : "Your Choice" },
                { icon: Heart, label: isPremium ? "Premium Support" : "AI Powered", desc: isPremium ? "24/7 Help" : "Smart Routines" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 hover:border-white/50 transition-all shadow-xl"
                >
                  <item.icon className="w-10 h-10 mb-3 text-amber-300" />
                  <h4 className="font-black text-base mb-1">{item.label}</h4>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {!isSessionActive ? (
          <>
            {/* GOAL SELECTION */}
            <ContentCard tone="violet">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">Choose Your Goal</h2>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                >
                  <Sparkles className="w-8 h-8 text-violet-500" />
                </motion.div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {suggestedGoals.map(goal => (
                  <motion.button
                    key={goal.id}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedGoal(goal.id);
                      setCustomGoal('');
                      toast.success(`🎯 Goal set: ${goal.label}`, { icon: goal.emoji });
                    }}
                    className={`relative p-6 rounded-2xl border-3 transition-all duration-300 ${
                      selectedGoal === goal.id && !customGoal
                        ? `bg-gradient-to-br ${goal.color} text-white border-white/40 shadow-2xl ${goal.glow}`
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {selectedGoal === goal.id && !customGoal && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                    <div className="text-5xl mb-3">{goal.emoji}</div>
                    <div className="font-black text-base">{goal.label}</div>
                  </motion.button>
                ))}
              </div>

              <div className="relative">
                <Input
                  placeholder="✨ Or write your custom goal... (e.g., 'increase hamstring flexibility', 'prepare body for marathon')"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="text-lg h-16 pr-32 border-3 border-violet-300 dark:border-violet-700 focus:border-violet-500 shadow-lg"
                />
                {customGoal && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 shadow-lg text-base">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Custom Goal
                    </Badge>
                  </motion.div>
                )}
              </div>
            </ContentCard>

            {/* DIFFICULTY */}
            <ContentCard tone="blue">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Select Difficulty</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {difficulties.map(level => (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDifficulty(level.id);
                      toast.success(`💪 Difficulty: ${level.label}`, { icon: level.emoji });
                    }}
                    className={`p-8 rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-2xl ${
                      selectedDifficulty === level.id
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-white/40 shadow-2xl shadow-blue-500/50'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-4xl mb-3">{level.emoji}</div>
                    <div className="font-black text-xl mb-2">{level.label}</div>
                    <div className="text-sm opacity-80">{level.desc}</div>
                  </motion.button>
                ))}
              </div>
            </ContentCard>

            {/* INTENSITY */}
            <ContentCard tone="amber">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">Intensity Level</h2>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                >
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-2xl px-6 py-3 shadow-xl font-black">
                    {(intensity * 100).toFixed(0)}%
                  </Badge>
                </motion.div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-slate-600 dark:text-slate-400 w-20">Easy</span>
                <Slider
                  value={[Math.round(intensity * 100)]}
                  min={80}
                  max={120}
                  step={5}
                  onValueChange={(v) => setIntensity((v?.[0] || 100) / 100)}
                  className="flex-1 h-3"
                />
                <span className="text-lg font-bold text-slate-600 dark:text-slate-400 w-20 text-right">
                  Intense
                </span>
              </div>
            </ContentCard>

            {/* GENERATE BUTTON */}
            <div className="flex gap-4 flex-wrap">
              <motion.div
                className="flex-1 min-w-[250px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleGenerateRoutine} 
                  disabled={loading} 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl px-10 py-8 text-2xl font-black shadow-2xl hover:shadow-violet-500/50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin mr-3" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-8 h-8 mr-3" />
                      Generate My Yoga Routine
                      <Sparkles className="w-8 h-8 ml-3" />
                    </>
                  )}
                </Button>
              </motion.div>
              {routine && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={shuffleRoutine} size="lg" className="h-full border-3 px-8 text-lg font-bold">
                      🔀 Shuffle
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={() => setRoutine(scaleRoutineDurations(routine, intensity))} size="lg" className="h-full border-3 px-8 text-lg font-bold">
                      ⏱️ Recalculate
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* ROUTINE PREVIEW */}
            {routine && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ContentCard className="border-4 border-emerald-300 dark:border-emerald-700 shadow-2xl shadow-emerald-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {routine.routine_name}
                    </h2>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                    >
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 text-xl shadow-xl">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Ready!
                      </Badge>
                    </motion.div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-8 text-xl leading-relaxed font-medium">
                    {routine.routine_description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {routine.poses.map((pose, index) => (
                      <motion.div 
                        key={index} 
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.08, y: -5 }}
                      >
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl mb-3 flex items-center justify-center overflow-hidden border-4 border-slate-300 dark:border-slate-600 shadow-xl hover:shadow-2xl transition-all">
                          {poseImages.length > index && poseImages[index] ? (
                            <img src={poseImages[index]} alt={pose.pose_name} className="w-full h-full object-cover rounded-3xl" />
                          ) : (
                            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
                          )}
                        </div>
                        <p className="font-black text-base mb-1">{pose.pose_name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">{pose.duration_seconds}s</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-center mt-10">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={startSession} 
                        size="lg" 
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl px-20 py-8 text-2xl font-black shadow-2xl hover:shadow-emerald-500/50"
                      >
                        <Play className="w-8 h-8 mr-3" />
                        Start My Yoga Session
                        <Sparkles className="w-8 h-8 ml-3" />
                      </Button>
                    </motion.div>
                  </div>
                </ContentCard>
              </motion.div>
            )}
          </>
        ) : (
          /* SESSION ACTIVE VIEW */
          <div className="space-y-6">
            {/* Progress Bar */}
            <ContentCard className="p-8 border-4 border-violet-400 dark:border-violet-700 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {routine.routine_name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xl font-semibold">
                    Pose {currentPoseIndex + 1} of {routine.poses.length} • {Math.max(0, Math.round(totalRemaining / 60))} min remaining
                  </p>
                </div>
                {routine.poses[currentPoseIndex + 1] && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-right bg-violet-50 dark:bg-violet-900/30 p-6 rounded-2xl border-3 border-violet-300 dark:border-violet-700 shadow-lg"
                  >
                    <div className="text-sm text-violet-600 dark:text-violet-400 font-bold mb-2">🔜 Next Up</div>
                    <div className="font-black text-2xl text-slate-900 dark:text-white">
                      {routine.poses[currentPoseIndex + 1].pose_name}
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 h-full shadow-lg relative overflow-hidden"
                  initial={{width:0}}
                  animate={{width: `${progressPercentage}%`}}
                  transition={{duration: 0.5}}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                  />
                </motion.div>
              </div>
            </ContentCard>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pose Image */}
              <motion.div
                className="w-full aspect-square rounded-3xl overflow-hidden border-6 border-violet-400 dark:border-violet-700 shadow-2xl"
                whileHover={{ scale: 1.02 }}
              >
                {poseImages.length > currentPoseIndex && poseImages[currentPoseIndex] ? (
                  <img src={poseImages[currentPoseIndex]} alt={currentPose.pose_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900">
                    <Loader2 className="w-24 h-24 animate-spin text-violet-500" />
                  </div>
                )}
              </motion.div>

              {/* Pose Details */}
              <div className="space-y-6">
                <ContentCard className="p-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/40 border-4 border-violet-400 dark:border-violet-700 shadow-2xl">
                  <h3 className="text-5xl font-black mb-4 text-slate-900 dark:text-white">{currentPose.pose_name}</h3>
                  <motion.div 
                    className="text-8xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4"
                    animate={{ scale: timer <= 5 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: timer <= 5 ? Infinity : 0, repeatType: timer <= 5 ? "loop" : undefined }}
                  >
                    {timer}s
                  </motion.div>
                  <p className="text-2xl text-slate-700 dark:text-slate-300 font-bold">Hold this pose</p>
                </ContentCard>

                <ContentCard className="p-8 border-3 border-blue-400 dark:border-blue-700 shadow-xl">
                  <h4 className="font-black text-2xl mb-5 flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <CheckCircle className="w-7 h-7" />
                    Instructions
                  </h4>
                  <ul className="space-y-4 list-decimal list-inside text-slate-700 dark:text-slate-300 text-lg">
                    {currentPose.instructions.map((step, i) => (
                      <motion.li 
                        key={i} 
                        className="leading-relaxed font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {step}
                      </motion.li>
                    ))}
                  </ul>
                </ContentCard>

                <ContentCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-4 border-amber-400 dark:border-amber-700 shadow-xl">
                  <h4 className="font-black text-2xl mb-4 text-amber-800 dark:text-amber-300 flex items-center gap-3">
                    <Sparkles className="w-7 h-7" />
                    Coach Tip
                  </h4>
                  <motion.p 
                    className="italic text-amber-700 dark:text-amber-200 text-xl leading-relaxed font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    "{currentPose.voice_coach_tip}"
                  </motion.p>
                </ContentCard>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={handlePrevPose} 
                  disabled={currentPoseIndex === 0} 
                  size="lg"
                  className="border-4 h-16 px-10 font-black text-xl"
                >
                  <ChevronLeft className="w-7 h-7 mr-2"/>
                  Previous
                </Button>
              </motion.div>
              
              <div className="flex gap-6">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    onClick={() => setIsPaused(!isPaused)} 
                    variant="secondary" 
                    size="lg"
                    className="h-16 w-16 rounded-full shadow-2xl"
                  >
                    {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    onClick={() => setIsMuted(!isMuted)} 
                    variant="secondary" 
                    size="lg"
                    className="h-16 w-16 rounded-full shadow-2xl"
                  >
                    {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                  </Button>
                </motion.div>
              </div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleNextPose} 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black h-16 px-10 text-xl shadow-2xl"
                >
                  {currentPoseIndex === routine.poses.length - 1 ? (
                    <>
                      <Trophy className="w-7 h-7 mr-2" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-7 h-7 ml-2"/>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            <div className="text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="destructive" 
                  onClick={resetSession} 
                  size="lg"
                  className="h-16 px-10 text-xl font-black"
                >
                  <X className="w-7 h-7 mr-2" />
                  End Session
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
