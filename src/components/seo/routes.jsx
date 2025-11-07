// Central routes registry with SEO metadata
export const SITE_URL = 'https://healsy-ai.base44.app';
export const SITE_NAME = 'Healsy AI';
export const SITE_TAGLINE = 'Smart Health & Wellness Assistant';

export const ROUTES = {
  home: {
    path: '/',
    slug: '',
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: 'AI-powered health & fitness assistant. Track calories, diet, mood, sleep, exercise, and glow with personalized AI tips. Your wellness journey starts here.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'Healsy AI, health AI app, AI fitness, AI diet planner, wellness assistant, AI nutrition tracker',
    noindex: false,
    priority: 1.0,
    changefreq: 'daily'
  },
  dashboard: {
    path: '/Dashboard',
    slug: 'dashboard',
    title: 'Dashboard - Your Health Overview | Healsy AI',
    description: 'View your complete health dashboard with AI insights, progress tracking, and wellness analytics. Track all your health metrics in one place.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'health dashboard, wellness tracking, AI health insights',
    noindex: false,
    priority: 0.9,
    changefreq: 'daily'
  },
  coach: {
    path: '/AIHealthCoach',
    slug: 'ai-health-coach',
    title: 'AI Health Coach - Personalized Wellness Advice | Healsy AI',
    description: 'Chat with your AI health coach for personalized fitness, nutrition, and wellness guidance. Get instant answers to your health questions 24/7.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI health coach, personalized fitness advice, wellness chatbot, nutrition guidance',
    noindex: false,
    priority: 0.9,
    changefreq: 'weekly'
  },
  face: {
    path: '/Face',
    slug: 'face-style',
    title: 'AI Face Analysis & Style Advisor | Healsy AI',
    description: 'Get AI-powered hairstyle recommendations, facial fitness exercises, and personalized skincare routines. Transform your look with intelligent beauty insights.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI face analysis, hairstyle recommendations, facial fitness, skincare routine, beauty AI',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  body: {
    path: '/Body',
    slug: 'nutrition',
    title: 'AI Nutrition Analyzer - Calorie & Meal Tracking | Healsy AI',
    description: 'Scan any meal with AI to get instant calorie counts, macros, and nutrition analysis. Track your diet effortlessly with photo-based food recognition.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI calorie scanner, nutrition analysis, meal tracking, food recognition AI, macro calculator',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  sleep: {
    path: '/Sleep',
    slug: 'sleep-tracker',
    title: 'Smart Sleep Tracker - AI Sleep Analysis | Healsy AI',
    description: 'Track sleep cycles, analyze sleep quality, and get personalized tips for better rest. Dream journal and smart wake-up recommendations included.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'sleep tracker, sleep analysis, sleep cycles, dream journal, better sleep',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  mind: {
    path: '/Mind',
    slug: 'journal',
    title: 'AI Journal - Mental Wellness & Mood Tracking | Healsy AI',
    description: 'Journal your thoughts with AI-powered insights. Track your mood, mental health patterns, and get personalized wellness recommendations.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI journal, mood tracking, mental wellness, emotional health, journaling app',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  mood: {
    path: '/Mood',
    slug: 'mood-logger',
    title: 'Mood Logger - Emotional Wellness Tracker | Healsy AI',
    description: 'Log your daily mood and emotions. Get AI insights and suggestions to improve your mental well-being and emotional balance.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'mood logger, emotional tracking, mental health, mood diary',
    noindex: false,
    priority: 0.7,
    changefreq: 'weekly'
  },
  exercise: {
    path: '/Exercise',
    slug: 'fitness',
    title: 'AI Fitness Coach - Workout Plans & Exercise Library | Healsy AI',
    description: 'Get personalized workout plans and access to 100+ exercises. Track your fitness progress with AI-powered coaching and form tips.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI fitness coach, workout plans, exercise library, fitness tracking',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  yoga: {
    path: '/Yoga',
    slug: 'yoga',
    title: 'AI Yoga Coach - Personalized Flows & Poses | Healsy AI',
    description: 'Practice yoga with AI-generated personalized flows. Get pose guidance, breathing techniques, and mindfulness practices tailored to your level.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI yoga coach, yoga flows, yoga poses, personalized yoga, mindfulness',
    noindex: false,
    priority: 0.7,
    changefreq: 'weekly'
  },
  meditation: {
    path: '/Meditation',
    slug: 'meditation',
    title: 'AI Meditation Guide - Guided Sessions & Mindfulness | Healsy AI',
    description: 'Experience AI-guided meditation sessions customized for your needs. Reduce stress, improve focus, and find inner peace with personalized practices.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI meditation, guided meditation, mindfulness, stress relief, meditation app',
    noindex: false,
    priority: 0.7,
    changefreq: 'weekly'
  },
  water: {
    path: '/Water',
    slug: 'hydration-tracker',
    title: 'Smart Hydration Tracker - Water Intake Monitor | Healsy AI',
    description: 'Track your daily water intake with smart reminders. Get personalized hydration goals based on your activity level and climate.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'hydration tracker, water intake, daily water goal, hydration reminder',
    noindex: false,
    priority: 0.6,
    changefreq: 'weekly'
  },
  diet: {
    path: '/Diet',
    slug: 'diet-planner',
    title: 'AI Diet Planner - Personalized Meal Plans | Healsy AI',
    description: 'Get AI-generated diet plans tailored to your goals. Whether weight loss, muscle gain, or healthy eating, we create the perfect plan for you.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'AI diet planner, meal plans, personalized diet, weight loss, healthy eating',
    noindex: false,
    priority: 0.8,
    changefreq: 'weekly'
  },
  aura: {
    path: '/Aura',
    slug: 'aura-scanner',
    title: 'AI Aura Scanner - Energy & Chakra Analysis | Healsy AI',
    description: 'Discover your aura color and energy levels with AI analysis. Get insights into your chakras, spiritual wellness, and energy balance.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'aura scanner, chakra analysis, energy reading, spiritual wellness, aura colors',
    noindex: false,
    priority: 0.6,
    changefreq: 'weekly'
  },
  challenges: {
    path: '/Challenges',
    slug: 'wellness-challenges',
    title: 'Wellness Challenges - 30-Day Health Transformations | Healsy AI',
    description: 'Join exciting wellness challenges to transform your health. Track progress, earn badges, and achieve your fitness and wellness goals.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'wellness challenges, 30-day challenge, fitness challenge, health transformation',
    noindex: false,
    priority: 0.7,
    changefreq: 'weekly'
  },
  settings: {
    path: '/Settings',
    slug: 'settings',
    title: 'Settings - Personalize Your Experience | Healsy AI',
    description: 'Customize your Healsy AI experience. Manage your profile, preferences, subscription, and app settings.',
    ogImage: `${SITE_URL}/_og/default.jpg`,
    keywords: 'app settings, user preferences, account settings',
    noindex: true,
    priority: 0.3,
    changefreq: 'monthly'
  }
};

export const getRouteByPath = (pathname) => {
  const route = Object.values(ROUTES).find(r => r.path === pathname);
  return route || ROUTES.home;
};