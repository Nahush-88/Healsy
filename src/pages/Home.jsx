import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Heart, Brain, Moon, Activity, Utensils, Droplet, 
  Trophy, Wind, Waves, Zap, Star, Crown, Globe, Target, Award,
  ArrowRight, CheckCircle, Users, TrendingUp, Shield, Rocket,
  Coffee, Smile, Sun, Apple
} from 'lucide-react';
import { User } from '@/entities/User';

// Feature highlights
const features = [
  { 
    icon: Brain, 
    title: 'AI Health Coach', 
    desc: 'Personal AI assistant for health & wellness',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/50'
  },
  { 
    icon: Wind, 
    title: 'AI Yoga', 
    desc: 'Custom yoga routines in 8 languages',
    color: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/50'
  },
  { 
    icon: Waves, 
    title: 'AI Meditation', 
    desc: 'Guided meditation for any goal',
    color: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/50'
  },
  { 
    icon: Sparkles, 
    title: 'Face Analysis', 
    desc: 'AI skincare & beauty recommendations',
    color: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/50'
  },
  { 
    icon: Utensils, 
    title: 'Smart Nutrition', 
    desc: 'Photo-based calorie & nutrition tracking',
    color: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/50'
  },
  { 
    icon: Activity, 
    title: 'Body Analytics', 
    desc: 'Complete body composition analysis',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/50'
  },
  { 
    icon: Moon, 
    title: 'Sleep Tracking', 
    desc: 'AI-powered sleep quality insights',
    color: 'from-indigo-600 to-blue-700',
    glow: 'shadow-indigo-500/50'
  },
  { 
    icon: Trophy, 
    title: 'Challenges', 
    desc: 'Gamified wellness challenges',
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/50'
  },
];

// Stats
const stats = [
  { icon: Users, value: '50K+', label: 'Active Users' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Globe, value: '8', label: 'Languages' },
  { icon: Zap, value: '100K+', label: 'AI Sessions' },
];

// Benefits
const benefits = [
  { icon: CheckCircle, text: 'AI-powered personalized insights' },
  { icon: CheckCircle, text: 'Multi-language support (8 languages)' },
  { icon: CheckCircle, text: 'Unlimited premium features' },
  { icon: CheckCircle, text: 'Photo & voice-based analysis' },
  { icon: CheckCircle, text: 'Track all aspects of wellness' },
  { icon: CheckCircle, text: 'Gamification & challenges' },
];

export default function HomePage() {
  const handleGetStarted = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-violet-300/30 dark:bg-violet-700/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-fuchsia-300/25 dark:bg-fuchsia-700/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 rounded-full bg-indigo-300/25 dark:bg-indigo-700/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Healsy AI
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-2xl shadow-violet-500/50"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-6 py-2 text-base mb-8 border-2 border-violet-300 dark:border-violet-700">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Wellness Platform
            </Badge>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Health Journey
              </span>
            </h1>

            <p className="text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Your personal AI health coach in <strong>8 languages</strong>. Track nutrition, fitness, mental wellness, sleep, and more with cutting-edge AI technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-12 py-8 rounded-2xl text-2xl font-black shadow-2xl shadow-violet-500/50 hover:shadow-3xl hover:shadow-violet-500/70 transition-all"
              >
                <Rocket className="w-8 h-8 mr-3" />
                Get Started Free
                <Sparkles className="w-8 h-8 ml-3" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-3 border-violet-400 dark:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-12 py-8 rounded-2xl text-2xl font-bold"
              >
                <Star className="w-7 h-7 mr-3 text-amber-500" />
                See Premium
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-12">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-lg text-slate-600 dark:text-slate-400 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-6 py-2 text-base mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive AI-powered tools for every aspect of your wellness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all ${feature.glow}`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-6 py-2 text-base mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Why Healsy AI?
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Your Complete Wellness Partner
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xl text-slate-700 dark:text-slate-300 font-semibold">
                      {benefit.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl bg-white dark:bg-slate-900 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-6">🚀</div>
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Start Today
                    </h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                      Join thousands transforming their health
                    </p>
                    <Button 
                      onClick={handleGetStarted}
                      size="lg"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-6 rounded-2xl text-xl font-bold shadow-xl"
                    >
                      Get Started Now
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-16 text-center text-white shadow-2xl"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                Ready to Transform Your Health?
              </h2>
              <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
                Start your journey to better health today with AI-powered insights
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-violet-600 hover:bg-slate-100 px-12 py-8 rounded-2xl text-2xl font-black shadow-2xl hover:shadow-3xl transition-all"
              >
                <Rocket className="w-8 h-8 mr-3" />
                Get Started Free
                <Sparkles className="w-8 h-8 ml-3" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Healsy AI
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              © 2024 Healsy AI. Transform your health journey with AI.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}