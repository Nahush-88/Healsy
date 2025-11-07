
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Sparkles, Target, TrendingUp, Smile, Moon, Utensils,
  Activity, Brain, Droplet, Flame, Award, CheckCircle, ArrowRight,
  Sun, Wind, Apple, Coffee, Dumbbell, Zap, Star, Loader2
} from 'lucide-react';
import { User } from '@/entities/User';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const goals = [
  { id: 'weight_loss', label: 'Lose Weight', icon: TrendingUp, color: 'from-red-500 to-orange-500' },
  { id: 'muscle_gain', label: 'Build Muscle', icon: Dumbbell, color: 'from-blue-500 to-cyan-500' },
  { id: 'better_sleep', label: 'Better Sleep', icon: Moon, color: 'from-indigo-500 to-purple-500' },
  { id: 'reduce_stress', label: 'Reduce Stress', icon: Brain, color: 'from-violet-500 to-purple-500' },
  { id: 'healthy_eating', label: 'Healthy Eating', icon: Apple, color: 'from-green-500 to-emerald-500' },
  { id: 'more_energy', label: 'More Energy', icon: Zap, color: 'from-amber-500 to-yellow-500' },
  { id: 'better_mood', label: 'Better Mood', icon: Smile, color: 'from-pink-500 to-rose-500' },
  { id: 'fitness', label: 'Overall Fitness', icon: Activity, color: 'from-purple-500 to-pink-500' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise', icon: Coffee },
  { id: 'light', label: 'Lightly Active', desc: '1-3 days/week', icon: Wind },
  { id: 'moderate', label: 'Moderately Active', desc: '3-5 days/week', icon: Activity },
  { id: 'active', label: 'Very Active', desc: '6-7 days/week', icon: Flame },
];

const climates = [
  { id: 'cold', label: 'Cold', icon: '🥶', desc: 'Below 15°C' },
  { id: 'temperate', label: 'Temperate', icon: '🌤️', desc: '15-25°C' },
  { id: 'hot', label: 'Hot', icon: '🔥', desc: 'Above 25°C' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    language: 'en',
    age: '',
    weight_kg: '',
    goals: [],
    activity_level: 'moderate',
    climate: 'temperate',
  });

  const totalSteps = 5;

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (step === 2 && (!formData.age || !formData.weight_kg)) {
      toast.error('Please enter your age and weight');
      return;
    }
    if (step === 3 && formData.goals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        ...formData,
        age: parseInt(formData.age),
        weight_kg: parseFloat(formData.weight_kg),
        onboarding_completed: true
      });
      
      toast.success('🎉 Welcome to Healsy AI!', {
        description: 'Your profile is all set up!'
      });
      
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1000);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      toast.error('Failed to save your profile. Please try again.');
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-6 shadow-xl"
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text mb-3">
                Welcome to Healsy AI
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Let's personalize your health journey
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Choose Your Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, language: lang.code })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.language === lang.code
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{lang.flag}</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {lang.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-6 shadow-xl"
              >
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text mb-3">
                About You
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Help us understand your profile
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Your Age
                </label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter your weight"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="text-lg"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-6 shadow-xl"
              >
                <Star className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-3">
                Your Goals
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                What do you want to achieve?
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <motion.button
                  key={goal.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.goals.includes(goal.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {formData.goals.includes(goal.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <goal.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {goal.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-xl"
              >
                <Activity className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text mb-3">
                Activity Level
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                How active are you?
              </p>
            </div>

            <div className="grid gap-4">
              {activityLevels.map((level) => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, activity_level: level.id })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    formData.activity_level === level.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.activity_level === level.id
                      ? 'bg-gradient-to-br from-orange-500 to-red-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <level.icon className={`w-6 h-6 ${
                      formData.activity_level === level.id
                        ? 'text-white'
                        : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-slate-800 dark:text-white">{level.label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{level.desc}</div>
                  </div>
                  {formData.activity_level === level.id && (
                    <CheckCircle className="w-6 h-6 text-orange-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-xl"
              >
                <Sun className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-3">
                Your Climate
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Where do you live?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {climates.map((climate) => (
                <motion.button
                  key={climate.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, climate: climate.id })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.climate === climate.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                  }`}
                >
                  {formData.climate === climate.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-4xl mb-3">{climate.icon}</div>
                  <div className="font-bold text-slate-800 dark:text-white mb-1">
                    {climate.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {climate.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-900/10 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-violet-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              disabled={step === 1}
              className="px-6"
            >
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
