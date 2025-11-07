
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Waves, Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, X, Crown, Globe, Zap, Star, Heart, Brain, Moon, Target, Award, Flame, CheckCircle, Infinity } from 'lucide-react';
import ContentCard from '../components/GradientCard';
import { useAI } from '../components/useAI';
import { GenerateImage } from '@/integrations/Core';
import { toast } from 'sonner';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import { getMeditationFallbackImage } from '@/components/utils/imageFallbacks';
import AmbientSound from '../components/meditation/AmbientSound';
import BreathPacer from '../components/meditation/BreathPacer';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import LoadingAnalysis from '../components/LoadingAnalysis';

// SUGGESTED GOALS - Beautiful categories
const suggestedGoals = [
  { id: 'stress_relief', label: 'Stress Relief', emoji: '😌', color: 'from-blue-500 to-cyan-600' },
  { id: 'focus', label: 'Deep Focus', emoji: '🎯', color: 'from-purple-500 to-pink-600' },
  { id: 'sleep_prep', label: 'Sleep Preparation', emoji: '🌙', color: 'from-indigo-500 to-purple-600' },
  { id: 'gratitude', label: 'Gratitude Practice', emoji: '🙏', color: 'from-amber-500 to-orange-600' },
  { id: 'anxiety_relief', label: 'Anxiety Relief', emoji: '🕊️', color: 'from-emerald-500 to-teal-600' },
  { id: 'morning_energy', label: 'Morning Energy', emoji: '☀️', color: 'from-yellow-500 to-amber-600' },
  { id: 'healing', label: 'Inner Healing', emoji: '💚', color: 'from-green-500 to-emerald-600' },
  { id: 'creativity', label: 'Creative Flow', emoji: '🎨', color: 'from-pink-500 to-rose-600' },
];

const durations = [
  { id: '3', label: '3 min', emoji: '⚡' },
  { id: '5', label: '5 min', emoji: '🌟' },
  { id: '10', label: '10 min', emoji: '🔥' },
  { id: '15', label: '15 min', emoji: '💎' },
  { id: '20', label: '20 min', emoji: '👑' },
];

// Language options
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export default function MeditationPage() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [customGoal, setCustomGoal] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('stress_relief');
  const [selectedDuration, setSelectedDuration] = useState('5');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [sessionData, setSessionData] = useState(null);
  const [stepImages, setStepImages] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const [paceIntensity, setPaceIntensity] = useState(1.0);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false); // New state for overall generation loading

  const { generateMeditation } = useAI(); // isLoading from useAI is not used for overall process now.
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);

  useEffect(() => {
    User.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setCheckingUser(false));
  }, []);

  const speak = useCallback((text) => {
    if (isMuted || !synthRef.current) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    // Set language for speech synthesis if available and not 'en'
    if (selectedLanguage !== 'en') {
      const voices = synthRef.current.getVoices();
      const targetVoice = voices.find(
        voice => voice.lang.startsWith(selectedLanguage) && voice.name.includes("Google")
      ) || voices.find(voice => voice.lang.startsWith(selectedLanguage));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }
    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  }, [isMuted, selectedLanguage]);

  const scaleDurations = useCallback((session, factor) => {
    if (!session) return session;
    const steps = session.steps.map(s => ({
      ...s,
      duration_seconds: Math.max(20, Math.round((s.duration_seconds || 45) * factor))
    }));
    return { ...session, steps };
  }, []);

  useEffect(() => {
    const currentSynth = synthRef.current;

    if (!isPaused && sessionData) {
      const currentStep = sessionData.steps[currentStepIndex];
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (currentStepIndex < sessionData.steps.length - 1) {
              setCurrentStepIndex(prevIdx => prevIdx + 1);
            } else {
              toast.success("✨ Meditation complete! Feel the peace.");
              speak("Your session is complete. Namaste.");
              handleEndSession();
            }
            return 0;
          }
          if (prev === Math.floor(currentStep.duration_seconds / 2)) {
            speak(currentStep.voice_coach_tip);
          }
          if (prev < 4 && prev > 1) {
             speak(String(prev - 1));
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
  }, [isPaused, currentStepIndex, sessionData, speak]);

  useEffect(() => {
    if (sessionData && currentStepIndex < sessionData.steps.length) {
      const currentStep = sessionData.steps[currentStepIndex];
      setTimer(currentStep.duration_seconds);
      speak(`Next, ${currentStep.instruction}`);
    }
  }, [currentStepIndex, sessionData, speak]);

  const handleGenerateSession = async () => {
    const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

    if (!isPremium) {
      const usage = await UsageTracker.checkAndUpdateUsage('meditation_sessions');
      if (!usage.allowed) {
        setUsageInfo(usage);
        setShowUsagePopup(true);
        return;
      }
    }

    setSessionData(null);
    setStepImages([]);
    setIsGeneratingSession(true); // Start overall loading

    const finalGoal = customGoal.trim() || selectedGoal;

    try {
      // Pass language parameter directly - no need for language instruction in goal
      const result = await generateMeditation(finalGoal, parseInt(selectedDuration), selectedLanguage);
      if (result) {
        const scaled = scaleDurations(result, paceIntensity);
        setSessionData(scaled);
        toast.success('🧘‍♂️ Your personalized meditation is ready!'); // Updated toast message
      } else {
        throw new Error("Sorry, couldn't generate a meditation session. Please try again.");
      }

      const steps = result?.steps || []; // Use result here, not scaled, as scaled only changes durations
      if (!steps.length) {
        setStepImages([]);
        return;
      }

      let firstUrl = null;
      try {
        const first = await GenerateImage({ prompt: steps[0].image_prompt });
        firstUrl = first?.url || null;
      } catch (e) {
        // If first image fails, set fallbacks for all and continue
        setStepImages(steps.map((s, i) => getMeditationFallbackImage(s.instruction, i)));
        toast.warning("Could not generate images. Using fallback visuals.");
        return;
      }

      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const urls = new Array(steps.length).fill(null);
      urls[0] = firstUrl;

      const results = await Promise.allSettled(
        steps.slice(1).map(async (step, idx) => {
          const realIndex = idx + 1;
          try {
            await delay(150 + (idx % 4) * 75);
            const res = await GenerateImage({ prompt: step.image_prompt });
            return { index: realIndex, url: res?.url || getMeditationFallbackImage(step.instruction, realIndex) };
          } catch (e) {
            console.warn(`Image generation failed for step ${realIndex}:`, e);
            return { index: realIndex, url: getMeditationFallbackImage(step.instruction, realIndex), reason: e };
          }
        })
      );

      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          urls[r.value.index] = r.value.url;
        } else if (r.status === "rejected") {
          // If a specific image generation failed, ensure a fallback is used
          const i = r.reason?.index ?? 0; 
          const step = steps[i] || {}; 
          urls[i] = getMeditationFallbackImage(step.instruction, i);
        }
      });

      setStepImages(urls);
      toast.success("✨ Visuals ready! Let's begin.");
    } catch (error) {
      console.error("Failed to generate meditation session:", error);
      toast.error(error.message || "Sorry, couldn't create a session. Please try again.");
    } finally {
      setIsGeneratingSession(false); // End overall loading
    }
  };

  const handleEndSession = () => {
    setSessionData(null);
    setCurrentStepIndex(0);
    setStepImages([]);
  };

  const handleNext = () => {
    if (currentStepIndex < sessionData.steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());
  const hasGeneratedContent = sessionData && stepImages.length > 0;

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
      </div>
    );
  }

  // Use the new local loading state
  if (isGeneratingSession) {
    return (
      <LoadingAnalysis 
        language={selectedLanguage} // Pass selectedLanguage to LoadingAnalysis
        message={null}
        showProgress={true}
        category="meditation"
      />
    );
  }

  if (hasGeneratedContent) {
    const currentStep = sessionData.steps[currentStepIndex];
    const totalDuration = sessionData.steps.reduce((sum, step) => sum + step.duration_seconds, 0);
    const elapsedDuration = sessionData.steps.slice(0, currentStepIndex).reduce((sum, step) => sum + step.duration_seconds, 0) + (currentStep.duration_seconds - timer);
    const progressPercentage = (elapsedDuration / totalDuration) * 100;

    return (
       <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
          <ContentCard className="p-6 bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700">
              <div className="flex justify-between items-center mb-4">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{sessionData.session_title}</h2>
                      <p className="text-violet-600 dark:text-violet-400 font-semibold">Step {currentStepIndex + 1} of {sessionData.steps.length}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleEndSession} className="shadow-lg">
                    <X className="w-4 h-4 mr-2" /> End Session
                  </Button>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg" 
                    animate={{width: `${progressPercentage}%`}} 
                    transition={{duration: 1}}
                  />
              </div>
          </ContentCard>

          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20 border-4 border-white dark:border-slate-700">
              <AnimatePresence mode="wait">
                  {stepImages[currentStepIndex] ? (
                      <motion.img 
                          key={currentStepIndex}
                          src={stepImages[currentStepIndex]} 
                          alt={currentStep.instruction} 
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                          <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />
                      </div>
                  )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>

              <div className="absolute top-6 right-6 z-10 space-y-3">
                  <BreathPacer isPaused={isPaused} />
                  <AmbientSound isMuted={isMuted} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
                  <motion.p 
                    key={currentStep.instruction}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl lg:text-3xl font-bold mb-6 drop-shadow-2xl"
                  >
                      {currentStep.instruction}
                  </motion.p>
                  <div className="flex items-center gap-6">
                    <div className="text-7xl font-black drop-shadow-2xl">{timer}s</div>
                    <div className="text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                      <div className="font-semibold mb-1">Coach Tip:</div>
                      <div className="text-white/90">{currentStep.voice_coach_tip}</div>
                    </div>
                  </div>
              </div>
          </div>
          
          <div className="flex justify-between items-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePrev} 
                disabled={currentStepIndex === 0}
                className="w-20"
              >
                <ChevronLeft className="w-6 h-6"/>
              </Button>
              <div className="flex items-center gap-4">
                  <Button 
                    size="lg" 
                    className="w-28 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg" 
                    onClick={() => setIsPaused(!isPaused)}
                  >
                      {isPaused ? <><Play className="w-6 h-6 mr-2"/> Play</> : <><Pause className="w-6 h-6 mr-2"/> Pause</>}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-20"
                  >
                      {isMuted ? <VolumeX className="w-6 h-6"/> : <Volume2 className="w-6 h-6"/>}
                  </Button>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleNext} 
                disabled={currentStepIndex === sessionData.steps.length - 1}
                className="w-20"
              >
                <ChevronRight className="w-6 h-6"/>
              </Button>
          </div>
      </motion.div>
    );
  }

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="meditation_sessions"
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
        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-12 text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
                <Waves className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black mb-2">AI Guided Meditation 🧘</h1>
                <p className="text-white/90 text-lg">Find your inner peace with personalized sessions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">AI Powered</div>
                <div className="text-sm opacity-90">Smart Sessions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">8 Languages</div>
                <div className="text-sm opacity-90">Global Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">Custom Goals</div>
                <div className="text-sm opacity-90">Your Journey</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                {isPremium ? <Infinity className="w-8 h-8 mx-auto mb-2" /> : <Star className="w-8 h-8 mx-auto mb-2" />}
                <div className="text-2xl font-bold">{isPremium ? 'Unlimited' : '5/month'}</div>
                <div className="text-sm opacity-90">{isPremium ? 'Premium' : 'Free Tier'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PREMIUM UPGRADE BANNER */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ContentCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      Upgrade to Premium for Unlimited Meditation
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Free: 5 sessions/month • Premium: Unlimited + All Languages + Priority AI
                    </p>
                  </div>
                </div>
                <Link to={createPageUrl("Settings")}>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg whitespace-nowrap">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </ContentCard>
          </motion.div>
        )}

        {/* CUSTOM GOAL INPUT */}
        <ContentCard className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Meditation Goal</h2>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          
          <Input
            placeholder="Type your custom goal (e.g., 'Help me overcome fear', 'Boost my confidence')..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="mb-4 h-14 text-lg border-2 border-violet-300 dark:border-violet-600 focus:border-violet-500 dark:focus:border-violet-400"
          />
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 bg-violet-100 dark:bg-violet-900/30 p-3 rounded-lg">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Write anything you want! Our AI will create a personalized meditation just for you.
          </p>

          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Or choose a suggested goal:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestedGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal.id);
                    setCustomGoal('');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedGoal === goal.id && !customGoal
                      ? `bg-gradient-to-br ${goal.color} text-white border-transparent shadow-xl`
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{goal.emoji}</div>
                  <div className="text-sm font-semibold">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>
        </ContentCard>

        {/* DURATION & LANGUAGE */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Duration</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {durations.map(duration => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration.id)}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedDuration === duration.id
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-transparent shadow-xl'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{duration.emoji}</div>
                  <div className="text-sm font-bold">{duration.label}</div>
                </button>
              ))}
            </div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700 border-2 border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Language</h2>
            </div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-14 text-lg border-2 border-emerald-300 dark:border-emerald-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code} className="text-lg">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ContentCard>
        </div>

        {/* INTENSITY CONTROL */}
        <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Session Pace</h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold min-w-[80px]">Gentle</span>
            <Slider
              value={[paceIntensity]}
              onValueChange={(val) => setPaceIntensity(val[0])}
              min={0.7}
              max={1.3}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-semibold min-w-[80px] text-right">Intense</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
            Current pace: <span className="font-bold text-purple-600 dark:text-purple-400">{paceIntensity.toFixed(1)}x</span>
          </p>
        </ContentCard>

        {/* GENERATE BUTTON */}
        <div className="text-center">
          <Button 
            onClick={handleGenerateSession} 
            disabled={isGeneratingSession} // Use new overall loading state
            size="lg" 
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full px-16 py-8 text-xl font-bold shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-all"
          >
            {isGeneratingSession ? ( // Use new overall loading state
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3"/> 
                Creating Your Session...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3"/> 
                Create My Meditation
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
