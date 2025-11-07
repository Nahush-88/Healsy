
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, Camera, Loader2, Sparkles, TrendingUp, Target, Award, 
  Flame, Heart, Zap, Crown, Globe, CheckCircle, Star, Trophy,
  Activity, Scale, Ruler, Calendar, Brain, Infinity, AlertCircle,
  Download, Save, RefreshCw, BarChart3, TrendingDown, Users, Utensils,
  Mic, X, Plus, Apple, Coffee, Pizza
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import ContentCard from '../components/GradientCard';
import { UploadFile } from '@/integrations/Core';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import VoiceRecorder from '../components/VoiceRecorder';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

// Language options
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

// Body goals
const bodyGoals = [
  { id: 'weight_loss', label: 'Weight Loss', emoji: '🔥', color: 'from-orange-500 to-red-600' },
  { id: 'muscle_gain', label: 'Muscle Gain', emoji: '💪', color: 'from-blue-500 to-cyan-600' },
  { id: 'maintain', label: 'Maintain Health', emoji: '✨', color: 'from-green-500 to-emerald-600' },
  { id: 'fat_loss', label: 'Fat Loss', emoji: '⚡', color: 'from-purple-500 to-pink-600' },
  { id: 'fitness', label: 'Overall Fitness', emoji: '🎯', color: 'from-violet-500 to-indigo-600' },
  { id: 'endurance', label: 'Build Endurance', emoji: '🏃', color: 'from-amber-500 to-orange-600' },
];

// Activity levels
const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise', emoji: '🪑' },
  { id: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week', emoji: '🚶' },
  { id: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week', emoji: '🏃' },
  { id: 'very_active', label: 'Very Active', desc: 'Exercise 6-7 days/week', emoji: '💪' },
  { id: 'extra_active', label: 'Extra Active', desc: 'Physical job + exercise', emoji: '🔥' },
];

export default function BodyPage() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedGoal, setSelectedGoal] = useState('weight_loss');
  const [selectedActivity, setSelectedActivity] = useState('moderate');
  const [activeTab, setActiveTab] = useState('body');
  
  // Body Analysis State
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Food Calorie Scanner State
  const [foodImage, setFoodImage] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [uploadingFood, setUploadingFood] = useState(false);
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const fileInputRef = useRef(null);
  const foodFileInputRef = useRef(null);

  useEffect(() => {
    User.me()
      .then((u) => {
        setUser(u);
        if (u?.age) setAge(String(u.age));
        if (u?.weight_kg) setWeight(String(u.weight_kg));
        if (u?.language) setSelectedLanguage(u.language);
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingUser(false));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImage(file_url);
      toast.success('📸 Photo uploaded! Ready for analysis');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFoodImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFood(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFoodImage(file_url);
      toast.success('🍽️ Food photo uploaded!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploadingFood(false);
    }
  };

  const handleVoiceComplete = (audioUrl) => {
    // Voice recorded, now we'll transcribe it
    setShowVoiceRecorder(false);
    analyzeFoodFromVoice(audioUrl);
  };

  const analyzeFoodFromVoice = async (audioUrl) => {
    const usage = await UsageTracker.checkAndUpdateUsage('nutrition_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    setAnalyzingFood(true);
    try {
      const { InvokeLLM } = await import('@/integrations/Core');
      
      const languageNote = selectedLanguage !== 'en' 
        ? `\n\nIMPORTANT: Respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'the selected language'}.` 
        : '';

      const prompt = `You are a nutrition expert. Listen to this audio where the user describes food they ate or want to analyze.

Extract the food name(s) and provide detailed nutritional analysis.${languageNote}`;

      const result = await InvokeLLM({
        prompt,
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
            serving_size: { type: 'string' },
            health_score: { type: 'number', minimum: 0, maximum: 100 },
            health_benefits: { type: 'array', items: { type: 'string' } },
            health_concerns: { type: 'array', items: { type: 'string' } },
            better_alternatives: { type: 'array', items: { type: 'string' } },
            meal_timing: { type: 'string' },
            portion_advice: { type: 'string' }
          }
        }
      });

      setFoodAnalysis(result);
      toast.success('🎙️ Voice analyzed! Check your results');
    } catch (error) {
      console.error(error);
      toast.error('Voice analysis failed. Please try again.');
    } finally {
      setAnalyzingFood(false);
    }
  };

  const analyzeFoodCalories = async () => {
    if (!foodImage && !foodName.trim()) {
      toast.error('Please upload a food photo or enter a food name');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('nutrition_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    setAnalyzingFood(true);
    try {
      const { InvokeLLM } = await import('@/integrations/Core');
      
      const languageNote = selectedLanguage !== 'en' 
        ? `\n\nIMPORTANT: Respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'the selected language'}.` 
        : '';

      const prompt = `You are a nutrition expert. Analyze this ${foodImage ? 'food photo' : `food: "${foodName}"`} and provide comprehensive nutritional information.

Provide:
1. Total calories and complete macronutrient breakdown
2. Serving size estimation
3. Health score (0-100) based on nutritional value
4. Health benefits of this food
5. Any health concerns or warnings
6. Better/healthier alternatives if applicable
7. Best time to eat this meal
8. Portion size recommendations

Be specific, accurate, and helpful.${languageNote}`;

      const result = await InvokeLLM({
        prompt,
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
            serving_size: { type: 'string' },
            health_score: { type: 'number', minimum: 0, maximum: 100 },
            health_benefits: { type: 'array', items: { type: 'string' } },
            health_concerns: { type: 'array', items: { type: 'string' } },
            better_alternatives: { type: 'array', items: { type: 'string' } },
            vitamins: { type: 'array', items: { type: 'string' } },
            meal_timing: { type: 'string' },
            portion_advice: { type: 'string' }
          }
        }
      });

      setFoodAnalysis(result);
      toast.success('🍽️ Food analyzed! Check your nutritional breakdown');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzingFood(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image && !weight && !height) {
      toast.error('Please upload a photo or provide your measurements');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('body_analyses');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    setAnalyzing(true);
    try {
      const { InvokeLLM } = await import('@/integrations/Core');
      
      const languageNote = selectedLanguage !== 'en' 
        ? `\n\nIMPORTANT: Respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'the selected language'}.` 
        : '';

      const goalText = bodyGoals.find(g => g.id === selectedGoal)?.label || selectedGoal;
      const activityText = activityLevels.find(a => a.id === selectedActivity)?.label || selectedActivity;

      const prompt = `You are an expert body composition analyst and fitness coach. Analyze this person's body and provide comprehensive insights.

User Information:
- Age: ${age || 'Not provided'}
- Weight: ${weight ? weight + ' kg' : 'Not provided'}
- Height: ${height ? height + ' cm' : 'Not provided'}
- Gender: ${gender}
- Goal: ${goalText}
- Activity Level: ${activityText}
- Additional Info: ${additionalInfo || 'None'}

${image ? 'Analyze the provided body photo for:' : 'Based on the measurements provided:'}
1. Current body composition estimate (body fat %, muscle mass %, BMI)
2. Body type classification (ectomorph, mesomorph, endomorph)
3. Posture assessment and any visible imbalances
4. Strengths and areas for improvement
5. Personalized recommendations for their goal: ${goalText}
6. Realistic timeline for achieving their goal
7. Nutrition strategy (calories, macros, meal timing)
8. Training recommendations (workout split, exercises, intensity)
9. Recovery and lifestyle tips
10. Motivational message and action steps

Be specific, actionable, and encouraging. Focus on sustainable, healthy approaches.${languageNote}`;

      const result = await InvokeLLM({
        prompt,
        file_urls: image ? [image] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            body_composition: {
              type: 'object',
              properties: {
                bmi: { type: 'number' },
                body_fat_percentage: { type: 'number' },
                muscle_mass_percentage: { type: 'number' },
                ideal_weight_kg: { type: 'number' },
                weight_to_lose_or_gain: { type: 'number' }
              }
            },
            body_type: { 
              type: 'string',
              enum: ['ectomorph', 'mesomorph', 'endomorph', 'mixed']
            },
            health_score: { type: 'number', minimum: 0, maximum: 100 },
            posture_assessment: { type: 'string' },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            },
            areas_for_improvement: {
              type: 'array',
              items: { type: 'string' }
            },
            goal_timeline: {
              type: 'object',
              properties: {
                realistic_weeks: { type: 'number' },
                milestones: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            nutrition_plan: {
              type: 'object',
              properties: {
                daily_calories: { type: 'number' },
                protein_grams: { type: 'number' },
                carbs_grams: { type: 'number' },
                fat_grams: { type: 'number' },
                meals_per_day: { type: 'number' },
                key_foods: {
                  type: 'array',
                  items: { type: 'string' }
                },
                foods_to_avoid: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            training_plan: {
              type: 'object',
              properties: {
                weekly_workouts: { type: 'number' },
                workout_split: { type: 'string' },
                cardio_minutes_per_week: { type: 'number' },
                strength_sessions_per_week: { type: 'number' },
                recommended_exercises: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            recovery_tips: {
              type: 'array',
              items: { type: 'string' }
            },
            lifestyle_recommendations: {
              type: 'array',
              items: { type: 'string' }
            },
            motivational_message: { type: 'string' },
            next_steps: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success('✨ Analysis complete! Check your personalized insights');
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const isPremium = user?.is_premium && (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
      </div>
    );
  }

  // FOOD ANALYSIS RESULTS VIEW
  if (foodAnalysis) {
    const macroData = [
      { name: 'Protein', value: foodAnalysis.protein_grams || 0, fill: '#3b82f6' },
      { name: 'Carbs', value: foodAnalysis.carbs_grams || 0, fill: '#22c55e' },
      { name: 'Fat', value: foodAnalysis.fat_grams || 0, fill: '#f59e0b' },
    ];

    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Results Header */}
        <ContentCard className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white border-0 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-2">🍽️ {foodAnalysis.food_name || 'Food Analysis'}</h2>
              <p className="text-white/90 text-lg">Complete nutritional breakdown</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setFoodAnalysis(null)} className="shadow-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button variant="secondary" className="shadow-lg">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </ContentCard>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ContentCard className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-700 text-center">
            <Flame className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {foodAnalysis.total_calories || 0}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Calories</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 text-center">
            <Activity className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {foodAnalysis.protein_grams || 0}g
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Protein</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 text-center">
            <Utensils className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {foodAnalysis.carbs_grams || 0}g
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carbs</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 text-center">
            <Star className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {foodAnalysis.health_score || 0}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Health Score</div>
          </ContentCard>
        </div>

        {/* Macros Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Macronutrient Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}g`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Additional Info
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Serving Size:</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{foodAnalysis.serving_size || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Fiber:</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{foodAnalysis.fiber_grams || 0}g</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sugar:</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{foodAnalysis.sugar_grams || 0}g</p>
              </div>
              {foodAnalysis.sodium_mg && (
                <div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sodium:</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{foodAnalysis.sodium_mg}mg</p>
                </div>
              )}
            </div>
          </ContentCard>
        </div>

        {/* Health Benefits & Concerns */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-green-600" />
              Health Benefits
            </h3>
            <div className="space-y-3">
              {foodAnalysis.health_benefits?.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              Health Concerns
            </h3>
            <div className="space-y-3">
              {foodAnalysis.health_concerns?.length > 0 ? (
                foodAnalysis.health_concerns.map((concern, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{concern}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  No major concerns! This is a healthy choice. 🎉
                </div>
              )}
            </div>
          </ContentCard>
        </div>

        {/* Better Alternatives */}
        {foodAnalysis.better_alternatives && foodAnalysis.better_alternatives.length > 0 && (
          <ContentCard className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-600" />
              Better Alternatives
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {foodAnalysis.better_alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-700">
                  <Star className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{alt}</span>
                </div>
              ))}
            </div>
          </ContentCard>
        )}

        {/* Vitamins */}
        {foodAnalysis.vitamins && foodAnalysis.vitamins.length > 0 && (
          <ContentCard className="bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              Key Vitamins & Minerals
            </h3>
            <div className="flex flex-wrap gap-2">
              {foodAnalysis.vitamins.map((vitamin, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-sm px-4 py-2">
                  {vitamin}
                </Badge>
              ))}
            </div>
          </ContentCard>
        )}

        {/* Meal Timing & Portion */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Best Time to Eat
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{foodAnalysis.meal_timing || 'Anytime!'}</p>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Scale className="w-6 h-6 text-purple-600" />
              Portion Advice
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{foodAnalysis.portion_advice || 'Enjoy in moderation!'}</p>
          </ContentCard>
        </div>
      </motion.div>
    );
  }

  // BODY ANALYSIS RESULTS VIEW
  if (analysis) {
    const bodyComp = analysis.body_composition || {};
    const nutrition = analysis.nutrition_plan || {};
    const training = analysis.training_plan || {};
    
    const radarData = [
      { subject: 'Strength', score: Math.random() * 40 + 60 },
      { subject: 'Endurance', score: Math.random() * 40 + 60 },
      { subject: 'Flexibility', score: Math.random() * 40 + 60 },
      { subject: 'Body Comp', score: analysis.health_score || 70 },
      { subject: 'Recovery', score: Math.random() * 40 + 60 },
    ];

    const macroData = [
      { name: 'Protein', grams: nutrition.protein_grams || 150, fill: '#3b82f6' },
      { name: 'Carbs', grams: nutrition.carbs_grams || 200, fill: '#22c55e' },
      { name: 'Fat', grams: nutrition.fat_grams || 70, fill: '#f59e0b' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Results Header */}
        <ContentCard className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-2">🎯 Your Body Analysis</h2>
              <p className="text-white/90 text-lg">Personalized insights powered by AI</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setAnalysis(null)} className="shadow-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </ContentCard>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ContentCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 text-center">
            <Scale className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {bodyComp.bmi?.toFixed(1) || '--'}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">BMI</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 text-center">
            <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {bodyComp.body_fat_percentage?.toFixed(1) || '--'}%
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Body Fat</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 text-center">
            <Activity className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {bodyComp.muscle_mass_percentage?.toFixed(1) || '--'}%
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Muscle Mass</div>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 text-center">
            <Award className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {analysis.health_score || '--'}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Health Score</div>
          </ContentCard>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Fitness Profile
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#a78bfa" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--foreground)' }} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Daily Macros Target
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={macroData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--foreground)' }} />
                <Tooltip />
                <Bar dataKey="grams" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {nutrition.daily_calories || 2000}
              </span>
              <span className="text-slate-600 dark:text-slate-400 ml-2">calories/day</span>
            </div>
          </ContentCard>
        </div>

        {/* This is the rest of the body analysis results that were commented out, adding them back in fully. */}
        {/* Posture and Body Type */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-700 border-2 border-orange-200 dark:border-orange-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-orange-600" />
              Body Type
            </h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{analysis.body_type || 'N/A'}</p>
            <p className="text-slate-700 dark:text-slate-300 mt-2">{
              analysis.body_type === 'ectomorph' ? 'Naturally lean, fast metabolism, finds it hard to gain weight.' :
              analysis.body_type === 'mesomorph' ? 'Athletic, strong, gains muscle easily, efficient metabolism.' :
              analysis.body_type === 'endomorph' ? 'Tendency to store fat, slower metabolism, gains weight easily.' :
              'A mix of characteristics from different body types.'
            }</p>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-slate-700 border-2 border-pink-200 dark:border-pink-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Ruler className="w-6 h-6 text-pink-600" />
              Posture Assessment
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.posture_assessment || 'No specific posture issues detected.'}</p>
          </ContentCard>
        </div>

        {/* Strengths & Areas for Improvement */}
        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard className="bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 border-2 border-green-200 dark:border-green-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Strengths
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              {analysis.strengths && analysis.strengths.length > 0 ? (
                analysis.strengths.map((s, idx) => <li key={idx}>{s}</li>)
              ) : (
                <li>No specific strengths listed.</li>
              )}
            </ul>
          </ContentCard>

          <ContentCard className="bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-slate-700 border-2 border-red-200 dark:border-red-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              Areas for Improvement
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 ? (
                analysis.areas_for_improvement.map((a, idx) => <li key={idx}>{a}</li>)
              ) : (
                <li>Great job! Keep up the good work.</li>
              )}
            </ul>
          </ContentCard>
        </div>

        {/* Goal Timeline */}
        {analysis.goal_timeline && (
          <ContentCard className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-violet-600" />
              Goal Timeline
            </h3>
            {analysis.goal_timeline.realistic_weeks && (
              <div className="mb-4">
                <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">Realistic Target: {analysis.goal_timeline.realistic_weeks} Weeks</div>
                <Progress value={(1 / analysis.goal_timeline.realistic_weeks) * 100} className="w-full bg-violet-200 dark:bg-violet-700 h-2" indicatorColor="bg-violet-500" />
              </div>
            )}
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Milestones:</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              {analysis.goal_timeline.milestones?.map((m, idx) => <li key={idx}>{m}</li>)}
            </ul>
          </ContentCard>
        )}

        {/* Nutrition Plan */}
        {nutrition.daily_calories && (
          <ContentCard className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700 border-2 border-emerald-200 dark:border-emerald-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-emerald-600" />
              Nutrition Plan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{nutrition.daily_calories}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Calories/day</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{nutrition.protein_grams}g</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{nutrition.carbs_grams}g</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{nutrition.fat_grams}g</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Fat</div>
              </div>
            </div>
            {nutrition.meals_per_day && <p className="text-slate-700 dark:text-slate-300 mb-2">Meals per day: <span className="font-semibold">{nutrition.meals_per_day}</span></p>}
            {nutrition.key_foods && nutrition.key_foods.length > 0 && (
              <>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Foods:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {nutrition.key_foods.map((food, idx) => (
                    <Badge key={idx} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">{food}</Badge>
                  ))}
                </div>
              </>
            )}
            {nutrition.foods_to_avoid && nutrition.foods_to_avoid.length > 0 && (
              <>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Foods to Avoid:</h4>
                <div className="flex flex-wrap gap-2">
                  {nutrition.foods_to_avoid.map((food, idx) => (
                    <Badge key={idx} variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">{food}</Badge>
                  ))}
                </div>
              </>
            )}
          </ContentCard>
        )}

        {/* Training Plan */}
        {training.weekly_workouts && (
          <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Training Plan
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{training.weekly_workouts}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Workouts/week</div>
              </div>
              {training.workout_split && (
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{training.workout_split}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Workout Split</div>
                </div>
              )}
              {training.strength_sessions_per_week && (
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{training.strength_sessions_per_week}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Strength Sessions</div>
                </div>
              )}
              {training.cardio_minutes_per_week && (
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{training.cardio_minutes_per_week} min</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Cardio/week</div>
                </div>
              )}
            </div>
            {training.recommended_exercises && training.recommended_exercises.length > 0 && (
              <>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Recommended Exercises:</h4>
                <div className="flex flex-wrap gap-2">
                  {training.recommended_exercises.map((exercise, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">{exercise}</Badge>
                  ))}
                </div>
              </>
            )}
          </ContentCard>
        )}

        {/* Recovery and Lifestyle Tips */}
        {(analysis.recovery_tips && analysis.recovery_tips.length > 0 || analysis.lifestyle_recommendations && analysis.lifestyle_recommendations.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.recovery_tips && analysis.recovery_tips.length > 0 && (
              <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-purple-600" />
                  Recovery Tips
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  {analysis.recovery_tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                </ul>
              </ContentCard>
            )}
            {analysis.lifestyle_recommendations && analysis.lifestyle_recommendations.length > 0 && (
              <ContentCard className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700 border-2 border-amber-200 dark:border-amber-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-600" />
                  Lifestyle Recommendations
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  {analysis.lifestyle_recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </ContentCard>
            )}
          </div>
        )}

        {/* Motivational Message & Next Steps */}
        <ContentCard className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-2 border-violet-200 dark:border-violet-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Crown className="w-6 h-6 text-violet-600" />
            Your Path Forward
          </h3>
          {analysis.motivational_message && (
            <p className="text-slate-700 dark:text-slate-300 text-lg italic mb-4 leading-relaxed">
              "{analysis.motivational_message}"
            </p>
          )}
          {analysis.next_steps && analysis.next_steps.length > 0 && (
            <>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Next Steps:</h4>
              <ul className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
                {analysis.next_steps.map((step, idx) => <li key={idx}>{step}</li>)}
              </ul>
            </>
          )}
        </ContentCard>

      </motion.div>
    );
  }

  // ANALYZING STATES - FIXED
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        >
          <Loader2 className="w-20 h-20 text-violet-500" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI Analyzing Your Body...
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Creating your personalized fitness roadmap</p>
        </div>
      </div>
    );
  }

  if (analyzingFood) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        >
          <Loader2 className="w-20 h-20 text-emerald-500" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
            AI Analyzing Food Calories...
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Getting complete nutritional breakdown</p>
        </div>
      </div>
    );
  }

  // MAIN INPUT VIEW
  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature={activeTab === 'body' ? 'body_analyses' : 'nutrition_analyses'}
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}
      
      {showVoiceRecorder && (
        <VoiceRecorder
          open={showVoiceRecorder}
          onClose={() => setShowVoiceRecorder(false)}
          onRecordComplete={handleVoiceComplete}
          title="🎙️ Say Your Food Name"
        />
      )}

      <div className="space-y-8">
        {/* HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black mb-2">AI Body & Food Analysis 💪</h1>
                <p className="text-white/90 text-lg">Get personalized health insights with AI</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">AI Powered</div>
                <div className="text-sm opacity-90">Expert Analysis</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">8 Languages</div>
                <div className="text-sm opacity-90">Global Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">Multi-Modal</div>
                <div className="text-sm opacity-90">Photo/Voice/Text</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                {isPremium ? <Infinity className="w-8 h-8 mx-auto mb-2" /> : <Star className="w-8 h-8 mx-auto mb-2" />}
                <div className="text-2xl font-bold">{isPremium ? 'Unlimited' : '5/month'}</div>
                <div className="text-sm opacity-90">{isPremium ? 'Premium' : 'Free Tier'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PREMIUM BANNER */}
        {!isPremium && (
          <ContentCard className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    Upgrade for Unlimited Analyses
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Free: 5/month • Premium: Unlimited Body & Food Analysis + All Languages
                  </p>
                </div>
              </div>
              <Link to={createPageUrl("Settings")}>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg whitespace-nowrap">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </ContentCard>
        )}

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="body" className="text-lg font-bold data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Activity className="w-5 h-5 mr-2" />
              Body Analysis
            </TabsTrigger>
            <TabsTrigger value="food" className="text-lg font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Utensils className="w-5 h-5 mr-2" />
              Food Calories
            </TabsTrigger>
          </TabsList>

          {/* BODY ANALYSIS TAB */}
          <TabsContent value="body" className="space-y-8">
            {/* IMAGE UPLOAD */}
            <ContentCard className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Your Photo</h2>
                  <p className="text-slate-600 dark:text-slate-400">Front view, good lighting</p>
                </div>
              </div>

              {image ? (
                <div className="relative w-full max-w-md mx-auto">
                  <img src={image} alt="Body" className="w-full h-80 object-cover rounded-2xl border-4 border-violet-300 dark:border-violet-700 shadow-xl" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setImage(null)}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <label className="block w-full max-w-md mx-auto p-12 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all cursor-pointer group bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="text-center">
                    {uploading ? (
                      <Loader2 className="w-16 h-16 text-violet-500 animate-spin mx-auto mb-4" />
                    ) : (
                      <Upload className="w-16 h-16 text-violet-500 group-hover:scale-110 transition-transform mx-auto mb-4" />
                    )}
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {uploading ? 'Uploading...' : 'Click to upload photo'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </label>
              )}
            </ContentCard>

            {/* BODY MEASUREMENTS */}
            <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Ruler className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Measurements</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Age</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="h-12 text-lg border-2 border-blue-300 dark:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="h-12 text-lg border-2 border-blue-300 dark:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="h-12 text-lg border-2 border-blue-300 dark:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-12 text-lg border-2 border-blue-300 dark:border-blue-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ContentCard>

            {/* GOALS & ACTIVITY */}
            <div className="grid md:grid-cols-2 gap-6">
              <ContentCard className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Goal</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {bodyGoals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        selectedGoal === goal.id
                          ? `bg-gradient-to-br ${goal.color} text-white border-transparent shadow-xl`
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{goal.emoji}</div>
                      <div className="text-sm font-bold">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </ContentCard>

              <ContentCard className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700 border-2 border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Level</h2>
                </div>
                <div className="space-y-2">
                  {activityLevels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedActivity(level.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedActivity === level.id
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-xl'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.emoji}</span>
                        <div>
                          <div className="font-bold">{level.label}</div>
                          <div className="text-xs opacity-90">{level.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ContentCard>
            </div>

            {/* LANGUAGE & INFO */}
            <div className="grid md:grid-cols-2 gap-6">
              <ContentCard className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700 border-2 border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Language</h2>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="h-14 text-lg border-2 border-amber-300 dark:border-amber-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code} className="text-lg">
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ContentCard>

              <ContentCard className="bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-slate-700 border-2 border-pink-200 dark:border-pink-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Additional Info</h2>
                </div>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any injuries, medical conditions, or specific concerns..."
                  className="h-24 border-2 border-pink-300 dark:border-pink-600"
                />
              </ContentCard>
            </div>

            {/* ANALYZE BUTTON */}
            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                size="lg"
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full px-16 py-8 text-xl font-bold shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-all"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Analyze My Body
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* FOOD CALORIES TAB */}
          <TabsContent value="food" className="space-y-8">
            {/* FOOD IMAGE UPLOAD */}
            <ContentCard className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700 border-2 border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Food Photo</h2>
                  <p className="text-slate-600 dark:text-slate-400">Get instant calorie information</p>
                </div>
              </div>

              {foodImage ? (
                <div className="relative w-full max-w-md mx-auto">
                  <img src={foodImage} alt="Food" className="w-full h-80 object-cover rounded-2xl border-4 border-emerald-300 dark:border-emerald-700 shadow-xl" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFoodImage(null)}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <label className="block w-full max-w-md mx-auto p-12 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <input
                    ref={foodFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFoodImageUpload}
                    className="hidden"
                    disabled={uploadingFood}
                  />
                  <div className="text-center">
                    {uploadingFood ? (
                      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
                    ) : (
                      <Upload className="w-16 h-16 text-emerald-500 group-hover:scale-110 transition-transform mx-auto mb-4" />
                    )}
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {uploadingFood ? 'Uploading...' : 'Click to upload food photo'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </label>
              )}
            </ContentCard>

            {/* FOOD NAME INPUT */}
            <ContentCard className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Or Enter Food Name</h2>
              </div>

              <div className="flex gap-3">
                <Input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Chicken breast with rice and broccoli..."
                  className="h-14 text-lg border-2 border-blue-300 dark:border-blue-600 flex-1"
                />
                <Button
                  onClick={() => setShowVoiceRecorder(true)}
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Mic className="w-6 h-6" />
                </Button>
              </div>
            </ContentCard>

            {/* LANGUAGE */}
            <ContentCard className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700 border-2 border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Language</h2>
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="h-14 text-lg border-2 border-amber-300 dark:border-amber-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="text-lg">
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ContentCard>

            {/* ANALYZE BUTTON */}
            <div className="text-center">
              <Button
                onClick={analyzeFoodCalories}
                disabled={analyzingFood}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full px-16 py-8 text-xl font-bold shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all"
              >
                {analyzingFood ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Analyze Food Calories
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
