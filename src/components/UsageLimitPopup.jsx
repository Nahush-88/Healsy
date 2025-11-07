import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Crown, X, Zap, Sparkles, Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsageTracker } from './UsageTracker';

export default function UsageLimitPopup({ feature, usageInfo, onClose, onUpgrade }) {
  const getFeatureDisplayName = (featureName) => {
    const names = {
      face_analyses: 'Face & Style AI',
      body_analyses: 'Body Analysis',
      nutrition_analyses: 'Nutrition Analysis',
      diet_plans: 'Diet Plans',
      exercise_plans: 'Exercise Plans',
      journal_analyses: 'Mind Journal Analysis',
      sleep_analyses: 'Sleep Analysis',
      aura_scans: 'Aura Reading',
      yoga_sessions: 'AI Yoga',
      meditation_sessions: 'AI Meditation',
      mood_logs: 'Mood Tracking',
      water_calculations: 'Water Calculator',
      saved_items_count: 'Dashboard Saves',
      pdf_exports: 'PDF Exports',
      ai_coach_messages: 'AI Health Coach',
      premium_challenges: 'Premium Challenges'
    };
    return names[featureName] || featureName;
  };

  const displayName = getFeatureDisplayName(feature);
  const isPremiumOnly = usageInfo?.requiresPremium;
  const resetTime = UsageTracker.getTimeUntilReset();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden"
      >
        {/* Header */}
        <div className={`relative ${isPremiumOnly ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'} px-6 py-8 text-white`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              {isPremiumOnly ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <AlertCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isPremiumOnly ? 'Premium Feature' : 'Monthly Limit Reached'}
            </h2>
            <p className="text-white/90">
              {isPremiumOnly 
                ? `${displayName} is a premium-only feature`
                : `You've used all your free ${displayName} for this month`
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isPremiumOnly && (
            <div className="text-center mb-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-300">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">
                    {usageInfo.used} / {usageInfo.limit} used this month
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Resets in {resetTime}
                </p>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upgrade to Premium for <span className="font-bold text-violet-600 dark:text-violet-400">unlimited access</span> to all AI features, exclusive challenges, and advanced insights!
            </p>
          </div>

          {/* Premium Benefits */}
          <div className="space-y-3 mb-6 bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Premium Benefits
            </h3>
            <div className="space-y-2">
              {[
                'Unlimited Face & Style AI Analysis',
                'Unlimited AI Health Coach 24/7',
                'All Premium Challenges Unlocked',
                'Unlimited Diet, Exercise & Yoga Plans',
                'Unlimited PDF Exports & Saves',
                'Ad-Free Experience',
                'Priority Support'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium Now
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
            Join 10,000+ users • Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
      </motion.div>
    </div>
  );
}