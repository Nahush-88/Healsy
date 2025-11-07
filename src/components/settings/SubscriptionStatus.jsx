import React, { useState } from 'react';
import { Crown, Sparkles, Calendar, CheckCircle, AlertCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { User } from '@/entities/User';
import ContentCard from '@/components/ContentCard';

export default function SubscriptionStatus({ user, onUpgradeClick }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getDaysRemaining = () => {
    if (!user?.premium_expiry) return 0;
    const now = new Date();
    const expiry = new Date(user.premium_expiry);
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await User.updateMyUserData({
        is_premium: false,
        premium_plan: null,
        premium_expiry: null
      });
      
      toast.success('Subscription cancelled successfully');
      setShowCancelConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (!user?.is_premium) {
    return (
      <ContentCard>
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free Plan</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Upgrade to Premium for unlimited access to all features
          </p>
          <Button
            onClick={() => {
              console.log('🔥 UPGRADE BUTTON CLICKED in SubscriptionStatus');
              if (onUpgradeClick) {
                onUpgradeClick();
              } else {
                console.error('❌ onUpgradeClick is not defined!');
              }
            }}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </ContentCard>
    );
  }

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <>
      <ContentCard className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-violet-200 dark:border-violet-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Premium Member</h3>
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                {user.premium_plan || 'Premium'} Plan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Renewal Date</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatDate(user.premium_expiry)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Days Remaining</span>
            </div>
            <p className={`text-lg font-bold ${isExpiringSoon ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
              {daysRemaining} days
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="mb-6 p-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-200">Subscription Expiring Soon</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Your premium access expires in {daysRemaining} days. Renew now to keep enjoying unlimited features!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renew Subscription
          </Button>
          
          <Button
            onClick={() => setShowCancelConfirm(true)}
            variant="outline"
            className="w-full border-2"
          >
            Cancel Subscription
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-violet-200 dark:border-violet-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Your Premium Benefits
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Unlimited AI Analysis',
              'All Premium Features',
              'No Advertisements',
              'Priority Support',
              'Exclusive Content',
              'Advanced Analytics'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </ContentCard>

      {/* Cancel Confirmation Modal - FIXED ANIMATIONS */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Cancel Premium?
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to cancel your premium subscription? You'll lose access to all premium features immediately.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCancelConfirm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={cancelling}
                >
                  Keep Premium
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}