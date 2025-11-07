import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Heart, Sparkles, Trophy, Settings as SettingsIcon, Crown, Zap, Loader2, Flame, Brain, Utensils, Moon, Smile, Wind, Waves, Download } from 'lucide-react';
import { PRICING, formatCurrency } from "@/components/constants/pricing";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// DIRECT IMPORTS
import PremiumPaywall from '../components/PremiumPaywall';
import UsageDisplay from '../components/UsageDisplay';
import { useTranslation } from '../components/providers/TranslationProvider';
import SubscriptionStatus from '../components/settings/SubscriptionStatus';
import HealthProfile from '../components/settings/HealthProfile';
import GeneralSettings from '../components/settings/GeneralSettings';
import AccountActions from '../components/settings/AccountActions';
import ProfileAvatar from '../components/settings/ProfileAvatar';

export default function Settings() {
  const { t, locale, setLocale } = useTranslation();
  const [user, setUser] = useState(null); // User state kept but will be null
  const [theme, setTheme] = useState('light');
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = null; // User.me() removed - User entity not available
      setUser(currentUser);
      
      const userTheme = currentUser?.theme || localStorage.getItem('healsy-theme') || 'light';
      setTheme(userTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(userTheme);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updateData) => {
    try {
      // User.updateMyUserData() removed - User entity not available
      await loadUser();
      toast.success('✨ Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('healsy-theme', newTheme);
    
    try {
      if (user) {
        // User.updateMyUserData() removed - User entity not available
        toast.success(`🎨 Theme updated to ${newTheme} mode`);
      }
    } catch (error) {
       console.error("Failed to save theme preference:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // User.logout() removed - User entity not available
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleUpgradeClick = () => {
    console.log('🔥 SETTINGS: Opening premium paywall');
    setShowPaywall(true);
  };

  const handleClosePaywall = () => {
    console.log('❌ SETTINGS: Closing paywall');
    setShowPaywall(false);
    loadUser(); // Reload user data
  };
  
  const isPremium = false; // Always false since user is null - User entity not available

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading settings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Premium Paywall */}
      {showPaywall && (
        <PremiumPaywall 
          onClose={handleClosePaywall}
          feature="Unlimited Access to All Features"
        />
      )}

      <div className="min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* HERO HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl mb-8"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <SettingsIcon className="w-10 h-10" />
                </motion.div>
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl sm:text-5xl font-black mb-2">Settings</h1>
                  <p className="text-white/90 text-lg">Manage your Healsy AI account</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Crown, label: 'Status', value: isPremium ? 'Premium' : 'Free', color: 'text-amber-300' },
                  { icon: Zap, label: 'Features', value: isPremium ? '∞' : 'Limited', color: 'text-blue-300' },
                  { icon: Heart, label: 'Member Since', value: user?.created_date ? new Date(user.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New', color: 'text-rose-300' },
                  { icon: Trophy, label: 'Status', value: 'Active', color: 'text-green-300' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center"
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <div className="space-y-6">
            
            {/* Profile Avatar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ProfileAvatar user={user} onChange={loadUser} />
            </motion.div>

            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SubscriptionStatus
                user={user}
                onUpgradeClick={handleUpgradeClick}
              />
            </motion.div>

            {/* Usage Display - FREE USERS ONLY */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-700 shadow-xl p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10" />
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Monthly Usage Limits</h3>
                        <p className="text-slate-600 dark:text-slate-400">All features limited for free users</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleUpgradeClick}
                      size="lg"
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade for Unlimited
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <UsageDisplay feature="nutrition_analyses" icon={Flame} name="AI Calories Scanner" />
                    <UsageDisplay feature="face_analyses" icon={Sparkles} name="Face & Style AI" />
                    <UsageDisplay feature="ai_coach_messages" icon={Brain} name="AI Health Coach" />
                    <UsageDisplay feature="body_analyses" icon={Heart} name="Body Analysis" />
                    <UsageDisplay feature="aura_scans" icon={Zap} name="Aura Scans" />
                    <UsageDisplay feature="diet_plans" icon={Utensils} name="Diet Plans" />
                    <UsageDisplay feature="exercise_plans" icon={Trophy} name="Exercise Plans" />
                    <UsageDisplay feature="sleep_analyses" icon={Moon} name="Sleep Analysis" />
                    <UsageDisplay feature="journal_analyses" icon={Brain} name="Mind Journal" />
                    <UsageDisplay feature="mood_logs" icon={Smile} name="Mood Tracking" />
                    <UsageDisplay feature="yoga_sessions" icon={Wind} name="AI Yoga" />
                    <UsageDisplay feature="meditation_sessions" icon={Waves} name="AI Meditation" />
                    <UsageDisplay feature="saved_items_count" icon={Heart} name="Dashboard Saves" />
                    <UsageDisplay feature="pdf_exports" icon={Download} name="PDF Exports" />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-violet-200 dark:border-violet-800">
                    <p className="text-violet-800 dark:text-violet-200 text-center font-semibold">
                      💎 <strong>Upgrade to Premium</strong> for unlimited usage of ALL features • {formatCurrency(PRICING.india.monthlyAmount, 'india')}/month or {formatCurrency(PRICING.india.yearlyAmount, 'india')}/year
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Health Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <HealthProfile user={user} onSave={handleSaveProfile} />
            </motion.div>

            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GeneralSettings 
                theme={theme} 
                onThemeChange={handleThemeChange}
                locale={locale}
                onLocaleChange={setLocale}
              />
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <AccountActions user={user} onLogout={handleLogout} />
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                <Heart className="w-5 h-5 text-rose-500" />
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Healsy AI • Your AI-Powered Wellness Companion
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}