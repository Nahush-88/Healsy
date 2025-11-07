
import React, { useRef, useState, Suspense, lazy, useEffect } from 'react';
import { Upload, Loader2, Sparkles, Camera, RefreshCw, Download, Save, Trophy, Flame, Award, Zap, Heart, Star, TrendingUp, CheckCircle, Play, Pause, RotateCcw, Lock, Crown, Eye, Brain, Smile, Sun, Moon, Droplet, Wind, Target, Shield, Activity } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User } from '@/entities/User';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import HairstyleRecommender from '../components/face/HairstyleRecommender';
import FacialFitness from '../components/face/FacialFitness';
import SkincareGenerator from '../components/face/SkincareGenerator';
import AdvancedFaceAnalyzer from '../components/face/AdvancedFaceAnalyzer';

const PremiumPaywallLazy = lazy(() => import('../components/PremiumPaywall'));

// NO PARTICLES - REMOVED TO FIX ANIMATION ERRORS
const FuturisticParticles = () => null;
const GlowingOrbs = () => null;

export default function FaceStyleAI() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('advanced');
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    currentStreak: 0,
    glowScore: 0,
    exerciseMinutes: 0
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumAndLoad();
  }, []);

  const checkPremiumAndLoad = async () => {
    try {
      setLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser?.is_premium) {
        setShowPaywall(true);
        setLoading(false);
        return;
      }

      setStats({
        totalAnalyses: 156,
        currentStreak: 12,
        glowScore: 87,
        exerciseMinutes: 240
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const loadData = checkPremiumAndLoad;

  const tabConfig = [
    {
      value: 'advanced',
      label: 'AI Face Scanner',
      icon: '🎯',
      gradient: 'from-violet-500 via-purple-500 to-pink-500',
      description: 'Ultimate Face Analysis'
    },
    {
      value: 'hairstyle',
      label: 'Hairstyle AI',
      icon: '💇‍♂️',
      gradient: 'from-purple-500 to-pink-600',
      description: 'Perfect Hair & Beard'
    },
    {
      value: 'fitness',
      label: 'Face Fitness',
      icon: '🧘',
      gradient: 'from-blue-500 to-cyan-600',
      description: 'Jawline & Face Glow'
    },
    {
      value: 'skincare',
      label: 'Skincare',
      icon: '🧴',
      gradient: 'from-emerald-500 to-teal-600',
      description: 'AI Routine & Tracking'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  if (!user?.is_premium) {
    return (
      <>
        {showPaywall && (
          <Suspense fallback={null}>
            <PremiumPaywallLazy 
              feature="Face & Style AI - Complete Face Analysis Suite" 
              onClose={() => window.history.back()}
            />
          </Suspense>
        )}
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
          <GlowingOrbs />
          <FuturisticParticles />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-4xl w-full"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10" />
              
              <div className="relative z-10 text-center text-white">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 mb-6 shadow-2xl"
                >
                  <Lock className="w-12 h-12" />
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Face & Style AI is Premium 👑
                </h1>
                <p className="text-xl mb-8 text-violet-200">
                  Unlock ultimate face analysis with AI-powered insights
                </p>
                
                <Button
                  size="lg"
                  onClick={() => setShowPaywall(true)}
                  className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl text-lg px-8 py-6 border-2 border-white/20"
                >
                  <Crown className="w-6 h-6 mr-2" />
                  Upgrade to Premium
                </Button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                  {[
                    { icon: '🎯', title: 'AI Scanner', desc: 'Face Landmarks' },
                    { icon: '💇‍♂️', title: 'Hairstyle AI', desc: 'Perfect Styles' },
                    { icon: '🧘', title: 'Face Fitness', desc: 'Jawline Sculpting' },
                    { icon: '🧴', title: 'Skincare AI', desc: 'Custom Routines' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all"
                    >
                      <div className="text-4xl mb-2">{feature.icon}</div>
                      <div className="font-bold text-sm">{feature.title}</div>
                      <div className="text-xs text-white/60">{feature.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      {showPaywall && (
        <Suspense fallback={null}>
          <PremiumPaywallLazy 
            feature="Face & Style AI - Complete Face Analysis Suite" 
            onClose={() => setShowPaywall(false)} 
          />
        </Suspense>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 text-white relative overflow-hidden pb-8">
        <GlowingOrbs />
        <FuturisticParticles />

        <div className="relative z-10 space-y-8 p-4 sm:p-6">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 sm:p-12 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20"
                  >
                    <Sparkles className="w-5 h-5 text-violet-300" />
                    <span className="font-semibold text-violet-200">Face & Style AI</span>
                  </motion.div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Ultimate Face Analysis 🎯
                  </h1>
                  <p className="text-violet-200 text-lg">
                    Advanced AI • Face Landmarks • Glow Analysis • Perfect Results
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Trophy, label: 'Analyses', value: stats.totalAnalyses, color: 'from-violet-500 to-purple-600' },
                  { icon: Flame, label: 'Streak', value: stats.currentStreak, color: 'from-orange-500 to-red-600' },
                  { icon: Sparkles, label: 'Glow', value: stats.glowScore, color: 'from-amber-500 to-yellow-600' },
                  { icon: Zap, label: 'Minutes', value: stats.exerciseMinutes, color: 'from-blue-500 to-cyan-600' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium opacity-80">{stat.label}</span>
                    </div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-auto gap-2">
                {tabConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative rounded-xl px-4 py-4 text-sm font-semibold transition-all ${
                      activeTab === tab.value
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl border border-white/20`
                        : 'text-violet-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                      {activeTab === tab.value && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-white/80 hidden lg:block"
                        >
                          {tab.description}
                        </motion.p>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="advanced" className="mt-0">
                    <AdvancedFaceAnalyzer user={user} onAnalysisComplete={loadData} />
                  </TabsContent>

                  <TabsContent value="hairstyle" className="mt-0">
                    <HairstyleRecommender user={user} onAnalysisComplete={loadData} />
                  </TabsContent>

                  <TabsContent value="fitness" className="mt-0">
                    <FacialFitness user={user} onWorkoutComplete={loadData} />
                  </TabsContent>

                  <TabsContent value="skincare" className="mt-0">
                    <SkincareGenerator user={user} onRoutineComplete={loadData} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          {/* Motivational Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
          >
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-2xl"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">
                ✨ Your Glow Up Journey
              </h3>
              <p className="text-violet-200 mb-4">
                Consistency is the secret to lasting transformation. Track your progress daily and watch yourself shine!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge className="bg-violet-500/20 text-violet-200 border border-violet-500/30 px-4 py-2 text-sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  {stats.totalAnalyses} Analyses Done
                </Badge>
                <Badge className="bg-pink-500/20 text-pink-200 border border-pink-500/30 px-4 py-2 text-sm">
                  <Flame className="w-4 h-4 mr-2" />
                  {stats.currentStreak} Day Streak
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-4 py-2 text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {stats.exerciseMinutes} Min Trained
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
