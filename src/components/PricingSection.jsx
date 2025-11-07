
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import { PRICING, formatInr } from "@/components/constants/pricing";

const plans = {
  monthly: {
    name: "Monthly",
    price: formatInr(PRICING.monthlyInr),
    period: "/month",
    cta: "Start Monthly",
    badge: "Best Value", // added star badge for monthly
    features: [
      { text: "50 AI Scans / month", included: true },
      { text: "Basic Diet & Exercise Hub", included: true },
      { text: "Basic Meditation", included: true },
      { text: "Essential Health Trackers", included: true },
      { text: "Advanced AI Yoga Coach", included: false },
      { text: "Daily Challenges & Rewards", included: false },
      { text: "Full Meditation Hub", included: false },
      { text: "AI-Powered Reports", included: false },
      { text: "Early Access to New Features", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  yearly: {
    name: "Yearly",
    price: formatInr(PRICING.yearlyInr),
    period: "/year",
    badge: "Best Value", // unify badge naming
    value: `Just ${formatInr(PRICING.yearlyMonthlyEquivalentInr)}/month`,
    savings: PRICING.yearlySavingsLabel,
    cta: "Go Pro – Best Value",
    primary: true,
    features: [
      { text: "✨ Unlimited AI Scans", included: true },
      { text: "🧘 Advanced AI Yoga Coach", included: true },
      { text: "💪 Advanced AI Diet Coach", included: true },
      { text: "🏆 Daily Challenges & Rewards", included: true },
      { text: "🥗 Full Meditation Hub", included: true },
      { text: "📈 AI-Powered Reports", included: true },
      { text: "🚀 Early Access to New Features", included: true },
      { text: "👑 Priority Support", included: true },
    ],
  },
};

const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed", error);
    }
};

const PricingCard = ({ plan, index }) => {
  const isPrimary = plan.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`
        relative flex flex-col rounded-2xl p-8 border overflow-hidden
        ${isPrimary 
          ? 'bg-white dark:bg-slate-900 border-violet-500 shadow-2xl shadow-violet-500/20' 
          : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}
      `}
    >
      {/* Show a star badge on any plan that has one (both monthly and yearly) */}
      {plan.badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1
          ${isPrimary ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'}`}>
          <Star className="w-4 h-4" />
          {plan.badge}
        </div>
      )}

      {/* subtle animated glow */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-400 to-fuchsia-400 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 blur-3xl" />
      </div>

      <div className="flex-grow relative z-10">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {plan.name}
          <Star className="w-4 h-4 text-yellow-500" />
        </h3>
        {isPrimary && (
            <div className="flex items-center gap-2 mt-2">
                <p className="text-violet-600 dark:text-violet-400 font-semibold">{plan.value}</p>
                {plan.savings && (
                  <span className="text-xs font-bold text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50 px-2 py-1 rounded-full">{plan.savings}</span>
                )}
            </div>
        )}

        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
          <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
        </div>

        <ul className="mt-8 space-y-4">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <X className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
              <span className={`
                ${feature.included 
                  ? 'text-slate-700 dark:text-slate-300' 
                  : 'text-slate-500 dark:text-slate-500 line-through'}`
                }>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-10 relative z-10">
        <Button 
            onClick={handleLogin}
            size="lg" 
            className={`w-full text-base font-bold ${isPrimary 
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30' 
                : 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
        >
            {plan.cta}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white"
          >
            Choose Your <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300"
          >
            Start your wellness journey with our free features, or unlock the full power of AI with Premium.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {Object.values(plans).map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* trust row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Secure Razorpay checkout</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Best Value on both plans</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Instant Premium access</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-8 max-w-3xl mx-auto border border-violet-100 dark:border-violet-800">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Why Choose Healsy Premium?</h3>
              <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Join thousands of users who've transformed their health with unlimited AI analysis, 
              personalized coaching, and premium wellness tools. Start your journey today! 🌟
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
