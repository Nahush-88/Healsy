import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Zap, Shield, Star, Flame, Trophy, Infinity, Target, Heart, Brain, Lock, Loader2, Globe, Utensils, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { PRICING, formatCurrency } from './constants/pricing';

export default function PremiumPaywall({ onClose, feature }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    console.log('🚀 Initializing payment system...');
    
    // Load Razorpay script
    if (!window.Razorpay) {
      console.log('📦 Loading Razorpay...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = () => {
          console.log('✅ Razorpay loaded');
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Razorpay load failed');
          resolve();
        };
      });
    }
    
    // Detect location
    try {
      const { data } = await base44.functions.invoke('detectUserLocation');
      setLocation(data);
      console.log('📍 Location:', data);
    } catch (err) {
      console.log('⚠️ Location detection failed, using India defaults');
      setLocation({ 
        pricingRegion: 'india', 
        currency: 'INR', 
        countryName: 'India',
        gateway: 'razorpay'
      });
    }

    setReady(true);
    console.log('✅ Payment system ready!');
  };

  const handlePayment = async () => {
    console.log('💳 PAYMENT INITIATED');

    if (!window.Razorpay) {
      toast.error('Payment system not loaded. Please refresh.');
      return;
    }

    const pricing = PRICING[location?.pricingRegion || 'india'];
    const plan = {
      monthly: {
        name: 'Monthly Premium',
        price: pricing.monthlyAmount,
        period: 'month'
      },
      yearly: {
        name: 'Yearly Premium',
        price: pricing.yearlyAmount,
        period: 'year'
      }
    }[selectedPlan];

    setProcessing(true);

    try {
      toast.loading('Creating payment order...', { id: 'payment' });
      
      const { data } = await base44.functions.invoke('createRazorpayOrder', {
        amount: plan.price,
        plan_type: selectedPlan,
        currency: location?.currency || 'INR'
      });

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.orderId || !data.keyId) {
        throw new Error('Invalid response from payment gateway');
      }

      toast.success('Opening Razorpay checkout...', { id: 'payment' });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: location?.currency || 'INR',
        name: 'Healsy AI Premium',
        description: plan.name,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            toast.loading('Verifying payment...', { id: 'verify' });
            
            const verify = await base44.functions.invoke('verifyRazorpayPayment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_type: selectedPlan,
              currency: location?.currency || 'INR'
            });

            if (verify.data.success) {
              toast.success('🎉 Payment successful!', { id: 'verify' });
              setTimeout(() => {
                window.location.href = '/PaymentStatus?success=true';
              }, 1000);
            } else {
              throw new Error('Verification failed');
            }
          } catch (err) {
            console.error('❌ Verification error:', err);
            toast.error('Verification failed. Please contact support.', { id: 'verify' });
            setProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: { 
          color: '#8b5cf6',
          backdrop_color: 'rgba(0,0,0,0.8)'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info('Payment cancelled', { id: 'payment' });
          },
          animation: true,
          confirm_close: true
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`, { id: 'payment' });
        setProcessing(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error('❌ Payment error:', err);
      toast.error(err.message || 'Payment failed. Please try again.', { id: 'payment' });
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) {
      toast.info('Please wait for payment to complete');
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // SMOOTH LOADING SCREEN
  if (!ready || !location) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            Loading Payment System...
          </h3>
          
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  const pricing = PRICING[location.pricingRegion];

  const plans = {
    monthly: {
      name: 'Monthly Premium',
      price: pricing.monthlyAmount,
      period: 'month',
      description: 'Perfect for trying premium',
      savings: 0
    },
    yearly: {
      name: 'Yearly Premium',
      price: pricing.yearlyAmount,
      originalPrice: pricing.yearlyOriginalAmount,
      period: 'year',
      savings: pricing.yearlySavingsPercent,
      description: `Save ${pricing.yearlySavingsPercent}%!`
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl shadow-2xl border border-violet-500/20 overflow-hidden my-8"
        >
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          </div>

          {/* FIXED CLOSE BUTTON - Always visible and clickable */}
          {onClose && (
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="absolute top-4 right-4 z-[250] w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all shadow-lg border-2 border-white/30 hover:border-white/50"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}

          <div className="relative z-10 p-8 md:p-12">
            {/* Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", damping: 15 }} 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6 shadow-2xl"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                <Globe className="w-4 h-4 text-violet-300" />
                <span className="text-sm text-violet-200 font-semibold">
                  {location.countryName} • {pricing.currency}
                </span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-amber-200 via-pink-200 to-violet-200 bg-clip-text mb-4">
                Upgrade to Premium
              </h2>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                {feature || 'Unlock unlimited AI-powered wellness features'}
              </p>
            </motion.div>

            {/* Plans */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              {Object.entries(plans).map(([key, plan], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  onClick={() => !processing && setSelectedPlan(key)}
                  whileHover={{ scale: processing ? 1 : 1.03 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
                    selectedPlan === key
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 border-2 border-violet-400 shadow-2xl'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                  } ${processing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {key === 'yearly' && (
                    <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold animate-pulse">
                      SAVE {plan.savings}% 🔥
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                      <p className="text-sm text-white/70">{plan.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === key ? 'border-white bg-white' : 'border-white/30'
                    }`}>
                      {selectedPlan === key && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle className="w-4 h-4 text-violet-600" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-white/50 line-through">
                        {formatCurrency(plan.originalPrice, location.pricingRegion)}
                      </span>
                    )}
                    <span className="text-5xl font-black text-white">
                      {formatCurrency(plan.price, location.pricingRegion)}
                    </span>
                    <span className="text-white/70">/{plan.period}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
            >
              {[
                { icon: Infinity, text: 'Unlimited AI' },
                { icon: Brain, text: 'AI Coach' },
                { icon: Flame, text: 'Calorie Scanner' },
                { icon: Utensils, text: 'Diet Plans' },
                { icon: Trophy, text: 'Challenges' },
                { icon: Zap, text: 'Yoga AI' },
                { icon: Target, text: 'Analytics' },
                { icon: Shield, text: 'Exports' },
                { icon: Star, text: 'Ad-Free' },
                { icon: Heart, text: 'Support' }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all"
                >
                  <f.icon className="w-8 h-8 mx-auto mb-2 text-violet-400" />
                  <p className="text-xs text-white/90 font-medium">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <Button
                onClick={handlePayment}
                disabled={processing}
                size="lg"
                className="relative px-12 py-8 text-xl font-black bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-2xl hover:shadow-violet-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-6 h-6 mr-3" />
                    Upgrade Now 💳
                    <Sparkles className="w-6 h-6 ml-3" />
                  </>
                )}
              </Button>

              <p className="text-slate-400 text-sm mt-6">
                <Lock className="w-4 h-4 inline mr-1" />
                Secure Payment • Cancel Anytime • 7-Day Refund
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}