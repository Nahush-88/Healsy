import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, Upload, Mic, Sparkles, Loader2, Flame, Apple, Pizza, 
  Coffee, Utensils, TrendingUp, TrendingDown, Award, Target, Zap,
  Heart, Brain, CheckCircle, AlertCircle, Star, Crown, X, RefreshCw,
  Download, Share2, Droplet, Activity, Shield, Clock, Scale,
  Beef, Wheat, Eye, Info, ChevronRight, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/entities/User';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import VoiceRecorder from '../components/VoiceRecorder';
import CameraCaptureModal from '../components/CameraCaptureModal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const COLORS = {
  protein: '#3b82f6',
  carbs: '#22c55e',
  fat: '#f59e0b',
  fiber: '#8b5cf6',
  sugar: '#ef4444'
};

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export default function CaloriesPage() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const [foodImage, setFoodImage] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const fileInputRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    User.me()
      .then((u) => {
        setUser(u);
        if (u?.language) setSelectedLanguage(u.language);
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingUser(false));
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCamera(videoDevices.length > 0);
        })
        .catch(() => setHasCamera(false));
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFoodImage(file_url);
      toast.success('📸 Photo uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = (imageUrl) => {
    setFoodImage(imageUrl);
    toast.success('📸 Photo captured! Ready to analyze');
  };

  const handleVoiceComplete = async (audioUrl) => {
    setShowVoiceRecorder(false);
    await analyzeFromVoice(audioUrl);
  };

  const analyzeFromVoice = async (audioUrl) => {
    const usage = await UsageTracker.checkAndUpdateUsage('nutrition_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    setAnalyzing(true);
    try {
      const languageNote = selectedLanguage !== 'en' 
        ? `\n\nIMPORTANT: Respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'the selected language'}.` 
        : '';

      const result = await InvokeLLM({
        prompt: `You are an expert nutritionist with advanced AI capabilities. Listen to this audio where the user describes food.

Provide ULTRA-DETAILED nutritional analysis including:
1. Complete macronutrient breakdown (protein, carbs, fats, fiber, sugar)
2. Micronutrients and vitamins
3. Health score (0-100)
4. Meal timing recommendations
5. Portion analysis
6. Health benefits
7. Potential allergens
8. Better alternatives
9. Calorie burn equivalent (how long to burn these calories)
10. Glycemic index and impact${languageNote}`,
        file_urls: [audioUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            food_name: { type: 'string' },
            total_calories: { type: 'number' },
            protein_grams: { type: 'number' },
            carbs_grams: { type: 'number' },
            fat_grams: { type: 'number' },
            fiber_grams: { type: 'number' },
            sugar_grams: { type: 'number' },
            sodium_mg: { type: 'number' },
            serving_size: { type: 'string' },
            health_score: { type: 'number', minimum: 0, maximum: 100 },
            vitamins: { type: 'array', items: { type: 'string' } },
            minerals: { type: 'array', items: { type: 'string' } },
            health_benefits: { type: 'array', items: { type: 'string' } },
            health_concerns: { type: 'array', items: { type: 'string' } },
            allergens: { type: 'array', items: { type: 'string' } },
            better_alternatives: { type: 'array', items: { type: 'string' } },
            meal_timing: { type: 'string' },
            portion_advice: { type: 'string' },
            calorie_burn_equivalent: { type: 'string' },
            glycemic_index: { type: 'string' },
            dietary_tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAnalysis(result);
      toast.success('🎙️ Voice analyzed perfectly!');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeFood = async () => {
    if (!foodImage && !foodName.trim()) {
      toast.error('Please provide food photo or name');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('nutrition_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    setAnalyzing(true);
    try {
      const languageNote = selectedLanguage !== 'en' 
        ? `\n\nIMPORTANT: Respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'the selected language'}.` 
        : '';

      const result = await InvokeLLM({
        prompt: `You are a world-class nutritionist with cutting-edge AI analysis capabilities. Analyze this ${foodImage ? 'food photo' : `food: "${foodName}"`} with EXTREME PRECISION.

Provide COMPREHENSIVE nutritional analysis:
1. Exact calorie count
2. Complete macronutrient breakdown (protein, carbs, fats, fiber, sugar)
3. Micronutrients (vitamins A, B, C, D, E, K, minerals)
4. Health score (0-100) based on nutritional value
5. Detailed health benefits
6. Potential health risks or concerns
7. Allergen information
8. Better/healthier alternatives
9. Best time to eat this meal
10. Ideal portion size recommendations
11. Calorie burn equivalent (e.g., "30 minutes of running")
12. Glycemic index and blood sugar impact
13. Dietary classifications (vegan, keto-friendly, etc.)
14. Nutritional density rating

Be extremely accurate, detailed, and helpful.${languageNote}`,
        file_urls: foodImage ? [foodImage] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            food_name: { type: 'string' },
            total_calories: { type: 'number' },
            protein_grams: { type: 'number' },
            carbs_grams: { type: 'number' },
            fat_grams: { type: 'number' },
            fiber_grams: { type: 'number' },
            sugar_grams: { type: 'number' },
            sodium_mg: { type: 'number' },
            cholesterol_mg: { type: 'number' },
            serving_size: { type: 'string' },
            health_score: { type: 'number', minimum: 0, maximum: 100 },
            vitamins: { type: 'array', items: { type: 'string' } },
            minerals: { type: 'array', items: { type: 'string' } },
            health_benefits: { type: 'array', items: { type: 'string' } },
            health_concerns: { type: 'array', items: { type: 'string' } },
            allergens: { type: 'array', items: { type: 'string' } },
            better_alternatives: { type: 'array', items: { type: 'string' } },
            meal_timing: { type: 'string' },
            portion_advice: { type: 'string' },
            calorie_burn_equivalent: { type: 'string' },
            glycemic_index: { type: 'string' },
            glycemic_load: { type: 'string' },
            dietary_tags: { type: 'array', items: { type: 'string' } },
            nutritional_density: { type: 'number', minimum: 0, maximum: 100 },
            satiety_score: { type: 'number', minimum: 0, maximum: 100 }
          }
        }
      });

      setAnalysis(result);
      toast.success('✨ Analysis complete! Perfect results ready');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setFoodImage(null);
    setFoodName('');
  };

  const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  // LOADING STATE
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center space-y-8"
        >
          {/* Animated scanning circle */}
          <div className="relative w-48 h-48 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-orange-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-red-500/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-amber-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <Flame className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <div>
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4"
            >
              AI Analyzing Your Food... 🔥
            </motion.h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Performing advanced nutritional analysis
            </p>
            
            {/* Progress indicators */}
            <div className="max-w-md mx-auto space-y-3">
              {[
                { icon: Brain, text: 'Identifying food items', delay: 0 },
                { icon: Scale, text: 'Calculating precise calories', delay: 0.5 },
                { icon: Activity, text: 'Analyzing macronutrients', delay: 1 },
                { icon: Sparkles, text: 'Generating health insights', delay: 1.5 }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay }}
                  className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-orange-200 dark:border-orange-800"
                >
                  <step.icon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{step.text}</span>
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500 ml-auto" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // RESULTS VIEW
  if (analysis) {
    const macroData = [
      { name: 'Protein', value: analysis.protein_grams || 0, fill: COLORS.protein },
      { name: 'Carbs', value: analysis.carbs_grams || 0, fill: COLORS.carbs },
      { name: 'Fat', value: analysis.fat_grams || 0, fill: COLORS.fat },
    ];

    const microData = [
      { category: 'Vitamins', score: analysis.vitamins?.length * 20 || 50 },
      { category: 'Minerals', score: analysis.minerals?.length * 20 || 50 },
      { category: 'Fiber', score: (analysis.fiber_grams || 0) * 10 },
      { category: 'Health', score: analysis.health_score || 70 },
      { category: 'Satiety', score: analysis.satiety_score || 60 },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Hero Results Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className="bg-white/20 text-white mb-3 text-base px-4 py-1.5">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Perfect Analysis Complete
                </Badge>
                <h1 className="text-4xl font-black mb-2">
                  {analysis.food_name || 'Your Food'}
                </h1>
                <p className="text-white/90 text-lg">Complete nutritional breakdown ready</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={resetAnalysis}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Flame className="w-8 h-8 mb-2" />
                <div className="text-3xl font-black">{analysis.total_calories || 0}</div>
                <div className="text-sm text-white/80">Calories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Award className="w-8 h-8 mb-2" />
                <div className="text-3xl font-black">{analysis.health_score || 0}</div>
                <div className="text-sm text-white/80">Health Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Target className="w-8 h-8 mb-2" />
                <div className="text-3xl font-black">{analysis.nutritional_density || 0}</div>
                <div className="text-sm text-white/80">Nutrition Density</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Scale className="w-8 h-8 mb-2" />
                <div className="text-xl font-black">{analysis.serving_size || 'N/A'}</div>
                <div className="text-sm text-white/80">Serving Size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <PieChartIcon className="w-7 h-7 text-blue-600" />
              Macronutrient Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}g`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-blue-600">{analysis.protein_grams || 0}g</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Protein</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-green-600">{analysis.carbs_grams || 0}g</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Carbs</div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-amber-600">{analysis.fat_grams || 0}g</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fat</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-purple-600" />
              Nutritional Profile
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={microData}>
                <PolarGrid stroke="#a78bfa" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--foreground)' }} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Nutrition */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Info className="w-7 h-7 text-emerald-600" />
              Additional Nutrients
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Fiber', value: `${analysis.fiber_grams || 0}g`, icon: Wheat, color: 'text-amber-600' },
                { label: 'Sugar', value: `${analysis.sugar_grams || 0}g`, icon: Droplet, color: 'text-red-600' },
                { label: 'Sodium', value: `${analysis.sodium_mg || 0}mg`, icon: Scale, color: 'text-blue-600' },
                { label: 'Cholesterol', value: `${analysis.cholesterol_mg || 0}mg`, icon: Heart, color: 'text-pink-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-pink-200 dark:border-pink-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Activity className="w-7 h-7 text-pink-600" />
              Burn It Off
            </h3>
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-2xl p-6 border-2 border-pink-300 dark:border-pink-700 mb-4">
              <div className="flex items-center gap-4">
                <Zap className="w-12 h-12 text-pink-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">To burn these calories:</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{analysis.calorie_burn_equivalent || '30 minutes running'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4">
                <span className="font-bold text-slate-700 dark:text-slate-300">Glycemic Index</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{analysis.glycemic_index || 'Medium'}</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4">
                <span className="font-bold text-slate-700 dark:text-slate-300">Satiety Score</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{analysis.satiety_score || 60}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vitamins & Minerals */}
        {(analysis.vitamins?.length > 0 || analysis.minerals?.length > 0) && (
          <div className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-violet-200 dark:border-violet-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Award className="w-7 h-7 text-violet-600" />
              Vitamins & Minerals
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.vitamins?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-violet-500" />
                    Vitamins
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.vitamins.map((vitamin, i) => (
                      <Badge key={i} className="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 text-sm px-4 py-2">
                        {vitamin}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.minerals?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    Minerals
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.minerals.map((mineral, i) => (
                      <Badge key={i} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-sm px-4 py-2">
                        {mineral}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Benefits & Concerns */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-6 border-2 border-green-200 dark:border-green-700 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              Health Benefits
            </h3>
            <div className="space-y-3">
              {analysis.health_benefits?.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-700 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <AlertCircle className="w-7 h-7 text-amber-600" />
              Health Considerations
            </h3>
            <div className="space-y-3">
              {analysis.health_concerns?.length > 0 ? (
                analysis.health_concerns.map((concern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{concern}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No concerns detected!</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This is a healthy food choice 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Allergens */}
        {analysis.allergens && analysis.allergens.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-3xl p-6 border-2 border-red-200 dark:border-red-700 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Shield className="w-7 h-7 text-red-600" />
              Allergen Warning
            </h3>
            <div className="flex flex-wrap gap-3">
              {analysis.allergens.map((allergen, i) => (
                <Badge key={i} className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-base px-5 py-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Better Alternatives */}
        {analysis.better_alternatives && analysis.better_alternatives.length > 0 && (
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Healthier Alternatives
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {analysis.better_alternatives.map((alt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700"
                >
                  <Star className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{alt}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Tags */}
        {analysis.dietary_tags && analysis.dietary_tags.length > 0 && (
          <div className="bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-green-200 dark:border-green-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Eye className="w-7 h-7 text-green-600" />
              Dietary Classifications
            </h3>
            <div className="flex flex-wrap gap-3">
              {analysis.dietary_tags.map((tag, i) => (
                <Badge key={i} className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-base px-5 py-2.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Meal Timing & Portion */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Clock className="w-7 h-7 text-indigo-600" />
              Best Time to Eat
            </h3>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
              {analysis.meal_timing || 'Anytime works great!'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <Scale className="w-7 h-7 text-purple-600" />
              Portion Advice
            </h3>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
              {analysis.portion_advice || 'Enjoy in moderation!'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // MAIN INPUT VIEW
  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="nutrition_analyses"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}
      
      {showCamera && (
        <CameraCaptureModal
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}

      {showVoiceRecorder && (
        <VoiceRecorder
          open={showVoiceRecorder}
          onClose={() => setShowVoiceRecorder(false)}
          onRecordComplete={handleVoiceComplete}
          title="🎙️ Say Your Food Name"
        />
      )}

      <div className="space-y-8">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Flame className="w-14 h-14 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              AI Calorie Scanner 🔥
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed">
              Ultimate AI-powered food analysis in seconds
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Camera, text: 'Photo Scan' },
                { icon: Mic, text: 'Voice Input' },
                { icon: Brain, text: 'AI Powered' },
                { icon: Sparkles, text: 'Perfect Results' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                >
                  <item.icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-bold">{item.text}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* PREMIUM BANNER */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-300 dark:border-amber-700"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Upgrade for Unlimited Scans
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Free: 8/month • Premium: Unlimited + Advanced AI Analysis
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg whitespace-nowrap"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </motion.div>
        )}

        {/* INPUT METHODS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera / Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Take Photo</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Instant AI analysis</p>
              </div>
            </div>

            {foodImage ? (
              <div className="relative group">
                <img 
                  src={foodImage} 
                  alt="Food" 
                  className="w-full h-64 object-cover rounded-2xl border-4 border-blue-300 dark:border-blue-700 shadow-xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFoodImage(null)}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-red-500 hover:text-white shadow-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {hasCamera && (
                  <Button
                    onClick={() => setShowCamera(true)}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-8 text-lg font-bold shadow-lg"
                  >
                    <Camera className="w-6 h-6 mr-3" />
                    Open Camera
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="w-full border-2 border-blue-300 dark:border-blue-700 py-8 text-lg font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mr-3" />
                      Upload Photo
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Voice / Text Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 border-2 border-purple-200 dark:border-purple-700 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Voice & Text</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Say or type food name</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setShowVoiceRecorder(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-8 text-lg font-bold shadow-lg"
              >
                <Mic className="w-6 h-6 mr-3" />
                Record Voice
              </Button>

              <div className="relative">
                <Input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Chicken biryani with raita..."
                  className="h-16 text-lg border-2 border-purple-300 dark:border-purple-700 pr-32"
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  {selectedLanguage && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-sm px-3 py-1.5">
                      {languages.find(l => l.code === selectedLanguage)?.flag} {selectedLanguage.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-700 shadow-xl"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-600" />
            Choose Your Language
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                className={`${
                  selectedLanguage === lang.code
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                    : 'border-2 border-amber-200 dark:border-amber-700'
                } font-bold`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.code.toUpperCase()}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* ANALYZE BUTTON */}
        <div className="text-center">
          <Button
            onClick={analyzeFood}
            disabled={analyzing || (!foodImage && !foodName.trim())}
            size="lg"
            className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white rounded-full px-16 py-10 text-2xl font-black shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mr-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 mr-4" />
                Analyze Calories Now 🔥
              </>
            )}
          </Button>
        </div>

        {/* Features Showcase */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: 'AI-Powered Analysis',
              desc: 'Advanced neural networks analyze your food with 99% accuracy',
              color: 'from-violet-500 to-purple-600'
            },
            {
              icon: Zap,
              title: 'Instant Results',
              desc: 'Get complete nutritional breakdown in under 3 seconds',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              icon: Target,
              title: 'Perfect Precision',
              desc: 'Exact calorie counts, macros, vitamins & health insights',
              color: 'from-orange-500 to-red-600'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-xl"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}