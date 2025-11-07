
import React, { useState, useEffect, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from '@/entities/User';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Heart, Sparkles, Brain, Moon,
  Smile, Utensils, Trophy, Droplet, Settings, Menu, X, Dumbbell, Crown, Wind, Waves, Zap, Sun, Flame
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationProvider, useTranslation } from './components/providers/TranslationProvider';
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import ThemeToggle from "./components/ThemeToggle";
import { HeadManager } from "./components/seo/HeadManager";
import { Analytics } from "./components/seo/Analytics";

// SEO Meta Tags Setup
const setSEOMetaTags = () => {
  document.title = "Healsy AI - Smart Health & Wellness Assistant";

  const existingSEOTags = document.querySelectorAll('[data-healsy-seo="true"]');
  existingSEOTags.forEach(tag => tag.remove());

  const metaTags = [
    { name: 'description', content: 'Healsy AI is your AI-powered health & fitness assistant. Track calories, diet, mood, sleep, exercise, and glow with AI tips.' },
    { name: 'keywords', content: 'Healsy AI, health AI app, AI fitness, AI diet planner, AI yoga coach, wellness assistant, AI skin analysis, AI nutrition tracker, AI meditation, AI sleep tracker' },
    { name: 'author', content: 'Healsy AI' },
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'google-site-verification', content: 'zP0ysWQXApCDYs81GOzTqKOuLhkqEDOpcF0mNuTQqrs' },
    { property: 'og:title', content: 'Healsy AI - Smart Health & Wellness Assistant' },
    { property: 'og:description', content: 'AI-powered health app for diet, exercise, face glow, sleep, and mood tracking.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://healsy-ai.base44.app' },
    { property: 'og:image', content: 'https://healsy-ai.base44.app/_og/default.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:site_name', content: 'Healsy AI' },
    { property: 'og:locale', content: 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Healsy AI - Smart Health & Wellness Assistant' },
    { name: 'twitter:description', content: 'AI-powered health app for diet, exercise, face glow, sleep, and mood tracking.' },
    { name: 'twitter:image', content: 'https://healsy-ai.base44.app/_og/default.jpg' },
    { name: 'theme-color', content: '#8b5cf6' },
    { name: 'application-name', content: 'Healsy AI' },
    { name: 'apple-mobile-web-app-title', content: 'Healsy AI' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'format-detection', content: 'telephone=no' },
  ];

  metaTags.forEach(tag => {
    const metaElement = document.createElement('meta');
    if (tag.name) metaElement.setAttribute('name', tag.name);
    if (tag.property) metaElement.setAttribute('property', tag.property);
    metaElement.setAttribute('content', tag.content);
    metaElement.setAttribute('data-healsy-seo', 'true');
    document.head.appendChild(metaElement);
  });

  const existingStructuredData = document.querySelector('#healsy-structured-data');
  if (existingStructuredData) existingStructuredData.remove();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Healsy AI",
    "description": "AI-powered health & fitness assistant for diet, exercise, face glow, sleep, and mood tracking",
    "url": "https://healsy-ai.base44.app",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Healsy AI"
    }
  };

  const scriptElement = document.createElement('script');
  scriptElement.id = 'healsy-structured-data';
  scriptElement.type = 'application/ld+json';
  scriptElement.textContent = JSON.stringify(structuredData);
  document.head.appendChild(scriptElement);

  const existingPerfLinks = document.querySelectorAll('[data-healsy-perf="true"]');
  existingPerfLinks.forEach(el => el.remove());

  const perfLinks = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
    { rel: 'manifest', href: '/manifest' }
  ];

  perfLinks.forEach(linkData => {
    const linkElement = document.createElement('link');
    Object.entries(linkData).forEach(([key, value]) => {
      if (key === 'crossOrigin') {
        linkElement.setAttribute('crossorigin', value);
      } else {
        linkElement.setAttribute(key, value);
      }
    });
    linkElement.setAttribute('data-healsy-perf', 'true');
    document.head.appendChild(linkElement);
  });
};

// Navigation items
const appNavigationItems = [
  { title: "Dashboard", key: "dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, gradient: "from-violet-500 to-purple-600" },
  { title: "AI Coach", key: "ai_coach", url: createPageUrl("AIHealthCoach"), icon: Sparkles, gradient: "from-pink-500 to-rose-600", premium: true },
  { title: "Aura", key: "aura", url: createPageUrl("Aura"), icon: Zap, gradient: "from-purple-500 to-indigo-600" },
  { title: "AI Yoga", key: "yoga", url: createPageUrl("Yoga"), icon: Wind, gradient: "from-blue-500 to-cyan-600" },
  { title: "Meditation", key: "meditation", url: createPageUrl("Meditation"), icon: Waves, gradient: "from-indigo-500 to-blue-600" },
  { title: "Calories", key: "calories", url: createPageUrl("Calories"), icon: Flame, gradient: "from-orange-500 to-red-600" },
  { title: "Body", key: "body", url: createPageUrl("Body"), icon: Heart, gradient: "from-red-500 to-pink-600" },
  { title: "Face", key: "face", url: createPageUrl("Face"), icon: Sparkles, gradient: "from-pink-500 to-fuchsia-600", premium: true },
  { title: "Mind", key: "mind", url: createPageUrl("Mind"), icon: Brain, gradient: "from-violet-500 to-purple-600" },
  { title: "Sleep", key: "sleep", url: createPageUrl("Sleep"), icon: Moon, gradient: "from-indigo-600 to-purple-700" },
  { title: "Mood", key: "mood", url: createPageUrl("Mood"), icon: Smile, gradient: "from-amber-500 to-yellow-600" },
  { title: "Diet", key: "diet", url: createPageUrl("Diet"), icon: Utensils, gradient: "from-green-500 to-emerald-600", premium: true },
  { title: "Exercise", key: "exercise", url: createPageUrl("Exercise"), icon: Dumbbell, gradient: "from-blue-600 to-cyan-700" },
  { title: "Challenges", key: "challenges", url: createPageUrl("Challenges"), icon: Trophy, gradient: "from-amber-500 to-orange-600" },
  { title: "Water", key: "water", url: createPageUrl("Water"), icon: Droplet, gradient: "from-cyan-500 to-blue-600" }
];

const mainMobileItems = [
  appNavigationItems[0], // Dashboard
  appNavigationItems[1], // AI Coach
  appNavigationItems[5], // Calories
  appNavigationItems[3], // AI Yoga
];

function AppContent({ children }) {
  const location = useLocation();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const navLabel = (item) => {
    const key = `navigation.${item.key}`;
    const translated = t(key);
    return typeof translated === 'string' && translated !== key ? translated : item.title;
  };

  useEffect(() => {
    const initTheme = async () => {
      try {
        const userData = await User.me();
        const userTheme = userData?.theme || localStorage.getItem('healsy-theme') || 'light';
        setUser(userData);
        setTheme(userTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(userTheme);
        setIsThemeLoaded(true);
      } catch (err) {
        const defaultTheme = localStorage.getItem('healsy-theme') || 'light';
        setUser(null);
        setTheme(defaultTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(defaultTheme);
        setIsThemeLoaded(true);
      }
    };
    initTheme();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const imgs = document.querySelectorAll('img:not([data-no-lazy])');
    imgs.forEach((img) => {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }, [location.pathname]);

  const handleThemeToggle = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('healsy-theme', newTheme);
    
    if (user) {
      try {
        await User.updateMyUserData({ theme: newTheme });
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  if (!isThemeLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200 relative transition-colors duration-300">
      {/* Simplified ambient background - OPTIMIZED */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-violet-300/30 dark:bg-violet-700/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-fuchsia-300/25 dark:bg-fuchsia-700/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 rounded-full bg-indigo-300/25 dark:bg-indigo-700/20 blur-3xl" />
      </div>

      <style>{`
        :root {
          --brand: #7c3aed;
          --brand-2: #6d28d9;
          --ring: 124, 58, 237;
          --radius: 20px;
          --shadow-sm: 0 2px 16px rgba(2, 6, 23, 0.06);
          --shadow-md: 0 8px 32px rgba(2, 6, 23, 0.10);
          --shadow-lg: 0 18px 60px rgba(2, 6, 23, 0.15);
          --shadow-xl: 0 24px 80px rgba(2, 6, 23, 0.20);
        }
        html { 
          scroll-behavior: smooth;
          overflow-x: hidden;
        }
        body { 
          -webkit-font-smoothing: antialiased; 
          -moz-osx-font-smoothing: grayscale; 
          text-rendering: optimizeLegibility;
          transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        * { 
          transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        *:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(var(--ring), 0.4), 0 0 0 6px rgba(var(--ring), 0.1) !important;
          border-radius: var(--radius);
        }
        ::selection { 
          background: rgba(var(--ring), 0.20); 
          color: #1e293b;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { 
            animation-duration: 0.01ms !important; 
            animation-iteration-count: 1 !important; 
            transition-duration: 0.01ms !important; 
            scroll-behavior: auto !important; 
          }
        }
        
        /* Custom Scrollbar */
        * { 
          scrollbar-width: thin; 
          scrollbar-color: rgba(139, 92, 246, 0.5) transparent; 
        }
        *::-webkit-scrollbar { 
          width: 12px; 
          height: 12px; 
        }
        *::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.3)); 
          border-radius: 999px;
          border: 3px solid transparent;
          background-clip: padding-box;
        }
        *::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.5)); 
          background-clip: padding-box;
        }
        *::-webkit-scrollbar-track { 
          background: transparent; 
        }

        /* Typography */
        h1 { 
          font-size: clamp(2rem, 1.8rem + 1.5vw, 3.5rem); 
          line-height: 1.1; 
          letter-spacing: -0.02em; 
          font-weight: 900;
        }
        h2 { 
          font-size: clamp(1.75rem, 1.5rem + 1vw, 2.5rem); 
          line-height: 1.2; 
          letter-spacing: -0.015em; 
          font-weight: 800;
        }
        h3 { 
          font-size: clamp(1.5rem, 1.25rem + 0.75vw, 2rem); 
          line-height: 1.25; 
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        p { 
          line-height: 1.7; 
        }

        /* Glass Effect */
        .glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        /* Hover Effects - Only on devices that support hover */
        @media (hover: hover) and (pointer: fine) {
          .hover-lift:hover { 
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
          }
        }

        /* Optimize animations */
        @media (prefers-reduced-motion: no-preference) {
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        }
      `}</style>

      <div className="relative flex flex-col lg:flex-row pt-0 min-h-screen">
        {/* Desktop Sidebar */}
        <motion.nav 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:flex flex-col w-72 p-5 border-r border-white/20 dark:border-slate-700/50 glass shrink-0"
        >
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 px-4 py-5 mb-8 rounded-2xl group hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-purple-900/20 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Healsy AI
              </h1>
              {user?.is_premium && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-500">Premium</span>
                </div>
              )}
            </div>
          </Link>

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
            {appNavigationItems.map((item, index) => {
              const isActive = location.pathname === item.url;
              return (
                <div key={item.key}>
                  <Link
                    to={item.url}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 z-10 ${isActive ? 'drop-shadow-lg' : ''}`} />
                    <span className="z-10">{navLabel(item)}</span>
                    {item.premium && !user?.is_premium && (
                      <span className="ml-auto z-10 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 rounded-full px-2 py-0.5">
                        <Crown className="w-3 h-3" /> Pro
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-5 space-y-4 border-t border-slate-200/60 dark:border-slate-700/50">
            {/* Theme Toggle */}
            <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-700/80 border border-slate-200/60 dark:border-slate-600/50 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Theme</span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <ThemeToggle theme={theme} onThemeChange={handleThemeToggle} />
              </div>
            </div>

            <div>
              <Link
                to={createPageUrl("Settings")}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  location.pathname === createPageUrl("Settings")
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>{navLabel({ title: "Settings", key: "settings" })}</span>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-8">
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-end mb-4 lg:hidden">
              <div className="shrink-0 p-2.5 rounded-2xl glass shadow-lg">
                <ThemeToggle theme={theme} onThemeChange={handleThemeToggle} />
              </div>
            </div>

            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="max-w-[1600px] mx-auto w-full">
                {children}
              </div>
            </motion.div>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 dark:border-slate-700/50 z-50 shadow-2xl"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
        >
          <div className="flex justify-around items-center h-20 px-2">
            {mainMobileItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <div key={item.key} className="relative">
                  <Link
                    to={item.url}
                    className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all duration-300 w-20"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeMobile"
                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-7 h-7 transition-all z-10 ${
                      isActive ? 'text-white scale-110 drop-shadow-lg' : 'text-slate-600 dark:text-slate-400'
                    }`} />
                    <span className={`text-xs font-bold z-10 ${
                      isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {navLabel(item)}
                    </span>
                    {item.premium && !user?.is_premium && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black shadow-lg z-20">
                        <Crown className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-slate-600 dark:text-slate-400 w-20 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all"
            >
              <Menu className="w-7 h-7" />
              <span className="text-xs font-bold">{t('More')}</span>
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="absolute bottom-0 left-0 right-0 glass p-6 rounded-t-[2rem] border-t-2 border-white/20 dark:border-slate-700/50 max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-600 mb-6" />

                <h2 className="text-2xl font-black text-center mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  All Features
                </h2>

                {/* Theme Toggle in Mobile Menu */}
                <div 
                  className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-800 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/30 dark:to-purple-500/30 border-2 border-violet-300 dark:border-violet-700">
                        {theme === 'light' ? (
                          <Sun className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Moon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-800 dark:text-white">
                          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Tap to switch theme
                        </div>
                      </div>
                    </div>
                    <ThemeToggle theme={theme} onThemeChange={handleThemeToggle} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[...appNavigationItems, { title: "Settings", key: "settings", url: createPageUrl("Settings"), icon: Settings, gradient: "from-slate-500 to-gray-600" }].map((item, index) => (
                    <div key={item.key}>
                      <Link
                        to={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl text-center transition-all hover:scale-105 glass border border-transparent hover:border-violet-200 dark:hover:border-violet-800"
                      >
                        {item.premium && !user?.is_premium && (
                          <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black shadow-lg">
                            <Crown className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                          <item.icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{navLabel(item)}</span>
                      </Link>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-base font-bold"
                >
                  Close Menu
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setSEOMetaTags();
  }, []);

  // REMOVED RAZORPAY LOADING FROM LAYOUT - IT'S HANDLED IN PREMIUM PAYWALL
  // This was causing conflicts!

  useEffect(() => {
    const checkAuth = async () => {
      const currentPath = location.pathname;
      const publicPages = ['/Home', '/', '/Onboarding', '/PaymentStatus'];

      try {
        await User.me();
        setIsAuthenticated(true);
        if (currentPath === '/Home' || currentPath === '/') {
          navigate('/Dashboard', { replace: true });
        }
      } catch (error) {
        setIsAuthenticated(false);
        if (!publicPages.includes(currentPath)) {
          navigate('/Home', { replace: true });
        }
      } finally {
        setIsAuthCheckComplete(true);
      }
    };
    
    checkAuth();
  }, [location.pathname, navigate]);

  if (!isAuthCheckComplete) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <TranslationProvider>
      <ErrorBoundary>
        <HeadManager />
        <Analytics />
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center glass">
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          {isAuthenticated ? <AppContent>{children}</AppContent> : <>{children}</>}
        </Suspense>
      </ErrorBoundary>
      <Toaster 
        richColors 
        closeButton 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
          },
        }}
      />
    </TranslationProvider>
  );
}
