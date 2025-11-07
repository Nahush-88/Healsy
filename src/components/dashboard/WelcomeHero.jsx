import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';

export default function WelcomeHero({ user, stats }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl mb-8"
    >
      {/* Static background elements - NO ANIMATIONS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">{greeting()}</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Friend'}! 👋
        </h1>
        <p className="text-white/80 text-lg mb-6">
          Here's your wellness journey today
        </p>

        {/* Quick Stats - NO COMPLEX ANIMATIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Progress', value: '85%', color: 'bg-white/10' },
            { icon: Heart, label: 'Health', value: stats?.health || 'Good', color: 'bg-white/10' },
            { icon: Zap, label: 'Energy', value: stats?.energy || 'High', color: 'bg-white/10' },
            { icon: Sparkles, label: 'Streak', value: stats?.streak || '7', color: 'bg-white/10' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`${stat.color} backdrop-blur-sm rounded-2xl p-4 border border-white/20`}
            >
              <stat.icon className="w-5 h-5 mb-2 text-white/80" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}