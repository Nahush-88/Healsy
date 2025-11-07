import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, XCircle, Loader2, Crown, Sparkles, Zap, Heart, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';

export default function PaymentStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success') === 'true';
  const token = searchParams.get('token');
  const plan = searchParams.get('plan');
  const currency = searchParams.get('currency');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      if (token && plan && currency) {
        console.log('💰 Capturing PayPal order:', token);
        
        const { data: capture } = await base44.functions.invoke('capturePayPalOrder', {
          orderId: token,
          plan_type: plan,
          currency: currency
        });

        if (!capture?.success) {
          setStatus('failed');
          return;
        }

        console.log('✅ PayPal payment captured');
      }

      const currentUser = await User.me();
      setUser(currentUser);

      if (success && currentUser?.is_premium) {
        setStatus('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#f59e0b']
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#8b5cf6', '#ec4899', '#f59e0b']
          });
        }, 250);
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#8b5cf6', '#ec4899', '#f59e0b']
          });
        }, 400);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Loader2 className="w-full h-full text-violet-500" />
          </motion.div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12 text-center relative overflow-hidden">
            {/* Static background - NO ANIMATIONS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="relative"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome to Premium! 🎉
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Your payment was successful and all premium features are now unlocked!
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
            >
              {[
                { icon: Crown, text: 'Premium Access', color: 'from-amber-400 to-orange-500' },
                { icon: Zap, text: 'Unlimited AI', color: 'from-violet-400 to-purple-500' },
                { icon: Sparkles, text: 'All Features', color: 'from-pink-400 to-rose-500' },
                { icon: Heart, text: 'No Ads', color: 'from-red-400 to-pink-500' },
                { icon: Star, text: 'Priority Support', color: 'from-yellow-400 to-amber-500' },
                { icon: Sparkles, text: 'Exclusive Content', color: 'from-blue-400 to-cyan-500' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1), type: "spring", stiffness: 200, damping: 20 }}
                  className="relative group"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-700/60 dark:to-slate-800/30 border border-white/50 dark:border-slate-600/50 backdrop-blur-sm hover:scale-105 transition-transform">
                    <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{feature.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="w-full md:w-auto px-8 py-6 text-lg font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-violet-500/50 rounded-2xl"
              >
                Start Exploring Premium
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.premium_plan === 'yearly' ? '📅 Yearly Plan' : '📆 Monthly Plan'} • 
                Expires on {user?.premium_expiry ? new Date(user.premium_expiry).toLocaleDateString() : 'N/A'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-red-900/20 dark:to-orange-900/20 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
            <XCircle className="w-14 h-14 text-white" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            Payment Failed
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Something went wrong with your payment. Please try again or contact support if the issue persists.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(createPageUrl('Settings'))}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}