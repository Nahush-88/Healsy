import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Utensils, Sparkles, User as UserIcon, Loader2, Info, Download, Clipboard, ChefHat, ShoppingCart, Heart, Calendar, Plus, Search, Filter, Flame, Target, TrendingUp, CheckCircle, X, Clock, Users, Trophy, Camera, Upload, BarChart3, BookMarked, Settings, Award, Zap } from 'lucide-react';
import { useAI } from '../components/useAI';
import { User } from '@/entities/User';
import { HealthLog } from '@/entities/HealthLog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCard from '../components/ContentCard';
import GradientCard from '../components/GradientCard';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import MacrosRing from '../components/diet/MacrosRing';
import { exportNutritionReport } from "@/functions/exportNutritionReport";
import LoadingAnalysis from '../components/LoadingAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadFile } from '@/integrations/Core';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { format, startOfWeek, addDays } from 'date-fns';

const PremiumPaywallLazy = lazy(() => import('../components/PremiumPaywall'));

// Meal Analyzer Component
const MealAnalyzer = ({ user, onAnalysisComplete }) => {
  const { analyzeFood, isLoading } = useAI();
  const [mealDescription, setMealDescription] = useState('');
  const [mealImage, setMealImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const quickMeals = [
    'Grilled chicken breast with brown rice and steamed broccoli',
    'Greek yogurt with mixed berries and granola',
    'Salmon fillet with quinoa and roasted vegetables',
    'Whole wheat pasta with marinara sauce and grilled vegetables',
    'Tofu stir-fry with mixed vegetables and brown rice',
    'Oatmeal with banana, almond butter and chia seeds'
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setMealImage(file_url);
      toast.success('Meal photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const analyzeMeal = async () => {
    if (!mealDescription.trim() && !mealImage) {
      toast.error('Please describe your meal or upload a photo');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('nutrition_analyses');
    if (!usage.allowed) {
      toast.error('Daily analysis limit reached. Upgrade to Premium for unlimited!');
      return;
    }

    try {
      const analysis = await analyzeFood(mealDescription, mealImage);
      
      // Save to history
      await HealthLog.create({
        log_type: 'meal',
        log_date: new Date().toISOString(),
        title: mealDescription || 'Meal Analysis',
        data: analysis,
        user_email: user.email
      });

      onAnalysisComplete(analysis);
      toast.success('Meal analyzed successfully!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    }
  };

  return (
    <ContentCard>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Meal Analyzer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Get instant nutrition insights</p>
          </div>
        </div>

        {/* Quick meal suggestions */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Quick Add</Label>
          <div className="flex flex-wrap gap-2">
            {quickMeals.map((meal, idx) => (
              <button
                key={idx}
                onClick={() => setMealDescription(meal)}
                className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all border border-green-200 dark:border-green-800"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                {meal.length > 30 ? meal.substring(0, 30) + '...' : meal}
              </button>
            ))}
          </div>
        </div>

        {/* Meal description */}
        <div className="space-y-2">
          <Label htmlFor="meal-description" className="text-sm font-semibold">Describe Your Meal</Label>
          <Textarea
            id="meal-description"
            placeholder="e.g., Grilled chicken salad with olive oil dressing, cherry tomatoes, cucumber..."
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            rows={3}
            className="resize-none text-base"
          />
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Or Upload Meal Photo</Label>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => document.getElementById('meal-upload').click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : mealImage ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Photo Added
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
            {mealImage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMealImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <input
            id="meal-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Preview */}
        {mealImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl overflow-hidden"
          >
            <img 
              src={mealImage} 
              alt="Meal preview"
              className="w-full h-48 object-cover"
            />
          </motion.div>
        )}

        {/* Analyze button */}
        <Button 
          onClick={analyzeMeal}
          disabled={isLoading || (!mealDescription.trim() && !mealImage)}
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Meal
            </>
          )}
        </Button>
      </div>
    </ContentCard>
  );
};

// Recipe Generator Component
const RecipeGenerator = ({ user, onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState('');
  const [cuisineType, setCuisineType] = useState('any');
  const [mealType, setMealType] = useState('any');
  const [dietaryGoal, setDietaryGoal] = useState('balanced');
  const [servings, setServings] = useState(2);
  const [cookingTime, setCookingTime] = useState('30');
  const [generating, setGenerating] = useState(false);

  const quickIngredients = [
    'Chicken breast, rice, broccoli',
    'Eggs, spinach, cheese, tomatoes',
    'Salmon, quinoa, asparagus, lemon',
    'Ground beef, pasta, tomato sauce',
    'Tofu, bell peppers, soy sauce, ginger',
    'Chickpeas, tahini, lemon, garlic',
    'Paneer, tomatoes, cream, spices',
    'Sweet potato, black beans, avocado'
  ];

  const cuisines = ['any', 'indian', 'italian', 'mexican', 'chinese', 'thai', 'mediterranean', 'american', 'japanese', 'korean', 'french', 'greek'];
  const mealTypes = ['any', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const goals = [
    { value: 'balanced', label: 'Balanced & Healthy' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'high_protein', label: 'High Protein' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'keto', label: 'Keto' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'gluten_free', label: 'Gluten Free' }
  ];

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      toast.error('Please enter ingredients you have');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('diet_plans');
    if (!usage.allowed) {
      toast.error('Daily recipe limit reached. Upgrade to Premium for unlimited!');
      return;
    }

    setGenerating(true);
    try {
      toast.info('🧑‍🍳 AI Chef is creating your perfect recipe...');
      
      const { InvokeLLM } = await import('@/integrations/Core');
      const prompt = `Create a delicious, healthy recipe using these ingredients: ${ingredients}

User Profile:
- Age: ${user?.age || 25}
- Weight: ${user?.weight_kg || 65} kg
- Activity Level: ${user?.activity_level || 'moderate'}
- Dietary Goal: ${dietaryGoal}

Recipe Requirements:
- Cuisine Type: ${cuisineType === 'any' ? 'flexible' : cuisineType}
- Meal Type: ${mealType === 'any' ? 'flexible' : mealType}
- Servings: ${servings}
- Max Cooking Time: ${cookingTime} minutes

Please create a recipe that is:
1. Delicious and appealing
2. Nutritionally balanced for their goals
3. Easy to follow with clear instructions
4. Uses the ingredients provided (can add common pantry items)
5. Includes meal prep and storage tips

Return a complete recipe with full nutritional breakdown.`;

      const schema = {
        type: 'object',
        properties: {
          recipe_name: { type: 'string' },
          description: { type: 'string' },
          cuisine: { type: 'string' },
          meal_type: { type: 'string' },
          prep_time_minutes: { type: 'number' },
          cook_time_minutes: { type: 'number' },
          servings: { type: 'number' },
          difficulty_level: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                amount: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          },
          instructions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step_number: { type: 'number' },
                instruction: { type: 'string' },
                tip: { type: 'string' }
              }
            }
          },
          nutrition_per_serving: {
            type: 'object',
            properties: {
              calories: { type: 'number' },
              protein_g: { type: 'number' },
              carbs_g: { type: 'number' },
              fat_g: { type: 'number' },
              fiber_g: { type: 'number' },
              sugar_g: { type: 'number' }
            }
          },
          health_benefits: {
            type: 'array',
            items: { type: 'string' }
          },
          chef_tips: {
            type: 'array',
            items: { type: 'string' }
          },
          substitutions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                original: { type: 'string' },
                substitute: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          meal_prep_friendly: { type: 'boolean' },
          storage_instructions: { type: 'string' },
          pairing_suggestions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      };

      const recipe = await InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      onRecipeGenerated(recipe);
      toast.success('✨ Recipe created! Bon appétit!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ContentCard>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Recipe Generator</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create delicious recipes from your ingredients</p>
          </div>
        </div>

        {/* Quick ingredient suggestions */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Quick Add Ingredients</Label>
          <div className="flex flex-wrap gap-2">
            {quickIngredients.map((ing, idx) => (
              <button
                key={idx}
                onClick={() => setIngredients(ing)}
                className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 hover:from-orange-200 hover:to-red-200 dark:hover:from-orange-900/50 dark:hover:to-red-900/50 transition-all border border-orange-200 dark:border-orange-800"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                {ing}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients input */}
        <div className="space-y-2">
          <Label htmlFor="ingredients" className="text-sm font-semibold">Your Ingredients</Label>
          <Textarea
            id="ingredients"
            placeholder="e.g., chicken, rice, broccoli, garlic, olive oil..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={3}
            className="resize-none text-base"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">Separate ingredients with commas. The AI will suggest what to add!</p>
        </div>

        {/* Recipe preferences grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Cuisine Type</Label>
            <Select value={cuisineType} onValueChange={setCuisineType}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cuisines.map(c => (
                  <SelectItem key={c} value={c}>
                    {c === 'any' ? 'Any Cuisine' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map(m => (
                  <SelectItem key={m} value={m}>
                    {m === 'any' ? 'Any Meal' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Dietary Goal</Label>
            <Select value={dietaryGoal} onValueChange={setDietaryGoal}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goals.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Max Cooking Time</Label>
            <Select value={cookingTime} onValueChange={setCookingTime}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Servings */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Number of Servings</Label>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setServings(Math.max(1, servings - 1))}
              disabled={servings <= 1}
            >
              -
            </Button>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{servings}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">servings</div>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setServings(Math.min(12, servings + 1))}
              disabled={servings >= 12}
            >
              +
            </Button>
          </div>
        </div>

        {/* Generate button */}
        <Button 
          onClick={handleGenerate}
          disabled={generating || !ingredients.trim()}
          size="lg"
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Recipe...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Recipe
            </>
          )}
        </Button>
      </div>
    </ContentCard>
  );
};

// Meal Analysis Results Component
const MealAnalysisResults = ({ analysis, onClose }) => {
  const copyAnalysis = async () => {
    const text = `Nutrition Analysis:
Calories: ${analysis.total_calories} kcal
Health Score: ${analysis.health_score}/100

Macros:
- Protein: ${analysis.protein_grams}g
- Carbs: ${analysis.carbs_grams}g
- Fat: ${analysis.fat_grams}g

Health Benefits:
${(analysis.health_benefits || []).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Recommendations:
${(analysis.dietary_recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Analysis copied to clipboard!');
    } catch {
      toast.error('Could not copy analysis');
    }
  };

  const exportPDF = async () => {
    try {
      const { data } = await exportNutritionReport({ analysis });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal_analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success('Analysis exported!');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <GradientCard tone="emerald" className="relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-500/90 text-white">
                Health Score: {analysis.health_score}/100
              </Badge>
              <Badge className="bg-blue-500/90 text-white">
                {analysis.total_calories} cal
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Nutrition Analysis
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              {analysis.nutritionist_notes || 'Complete nutritional breakdown of your meal'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Protein</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{analysis.protein_grams}g</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Carbs</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{analysis.carbs_grams}g</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Fat</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{analysis.fat_grams}g</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Score</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{analysis.health_score}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={copyAnalysis} variant="secondary" className="gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800">
            <Clipboard className="w-4 h-4" />
            Copy Analysis
          </Button>
          <Button onClick={exportPDF} variant="secondary" className="gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <SaveToDashboardButton
            itemData={{
              title: `Meal Analysis - ${format(new Date(), 'MMM dd, yyyy')}`,
              content: `${analysis.total_calories} cal, Health Score: ${analysis.health_score}/100`,
              details: analysis,
              source_page: 'Diet',
              icon: 'Utensils'
            }}
            variant="secondary"
            className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800"
          />
        </div>
      </GradientCard>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macros Ring */}
        <ContentCard>
          <h3 className="font-bold text-lg mb-4">Macronutrient Breakdown</h3>
          <div className="h-64">
            <MacrosRing distribution={{
              protein: `${analysis.macronutrients?.protein || 0}%`,
              carbs: `${analysis.macronutrients?.carbs || 0}%`,
              fat: `${analysis.macronutrients?.fat || 0}%`
            }} />
          </div>
        </ContentCard>

        {/* Health Benefits */}
        <ContentCard>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Health Benefits
          </h3>
          <ul className="space-y-2">
            {(analysis.health_benefits || []).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </ContentCard>
      </div>

      {/* Recommendations */}
      <ContentCard>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          Nutritionist Recommendations
        </h3>
        <ul className="space-y-2">
          {(analysis.dietary_recommendations || []).map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-violet-500 font-bold flex-shrink-0">{idx + 1}.</span>
              <span className="text-slate-700 dark:text-slate-300">{rec}</span>
            </li>
          ))}
        </ul>
      </ContentCard>

      {/* Ingredients Analysis */}
      {analysis.ingredients_analysis && analysis.ingredients_analysis.length > 0 && (
        <ContentCard>
          <h3 className="font-bold text-lg mb-4">Ingredient Breakdown</h3>
          <div className="space-y-3">
            {analysis.ingredients_analysis.map((ing, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">{ing.name}</span>
                  <Badge className={`${
                    ing.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                    ing.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                    {ing.color}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{ing.health_impact}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      )}
    </motion.div>
  );
};

// Recipe Display Component
const RecipeDisplay = ({ recipe, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const toggleStep = (stepNum) => {
    setCompletedSteps(prev => 
      prev.includes(stepNum) 
        ? prev.filter(s => s !== stepNum)
        : [...prev, stepNum]
    );
  };

  const copyRecipe = async () => {
    const text = `${recipe.recipe_name}

${recipe.description}

Servings: ${recipe.servings} | Prep: ${recipe.prep_time_minutes}m | Cook: ${recipe.cook_time_minutes}m

INGREDIENTS:
${recipe.ingredients.map(ing => `- ${ing.amount} ${ing.item}${ing.notes ? ` (${ing.notes})` : ''}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map(inst => `${inst.step_number}. ${inst.instruction}${inst.tip ? `\nTip: ${inst.tip}` : ''}`).join('\n\n')}

NUTRITION (per serving):
Calories: ${recipe.nutrition_per_serving.calories} | Protein: ${recipe.nutrition_per_serving.protein_g}g | Carbs: ${recipe.nutrition_per_serving.carbs_g}g | Fat: ${recipe.nutrition_per_serving.fat_g}g`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recipe copied to clipboard!');
    } catch {
      toast.error('Could not copy recipe');
    }
  };

  const exportPDF = async () => {
    try {
      const { data } = await exportNutritionReport({ analysis: recipe });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.recipe_name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success('Recipe exported!');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  // Get recipe image from Unsplash based on cuisine/meal type
  const getRecipeImage = () => {
    const cuisineImages = {
      indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      italian: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80',
      mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
      chinese: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&q=80',
      thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
      mediterranean: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
      japanese: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
      american: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      korean: 'https://images.unsplash.com/photo-1580650109855-143ca3b68398?w=800&q=80',
      french: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
      greek: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    };
    return cuisineImages[recipe.cuisine?.toLowerCase()] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
  };

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const nutrition = recipe.nutrition_per_serving;
  const macrosForRing = {
    protein: `${nutrition.protein_g}g`,
    carbs: `${nutrition.carbs_g}g`,
    fat: `${nutrition.fat_g}g`
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <GradientCard tone="amber" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={getRecipeImage()} 
            alt={recipe.recipe_name}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-orange-500/90 text-white">
                  {recipe.cuisine || 'International'}
                </Badge>
                <Badge className="bg-blue-500/90 text-white">
                  {recipe.meal_type || 'Main Dish'}
                </Badge>
                <Badge className="bg-green-500/90 text-white">
                  {recipe.difficulty_level}
                </Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                {recipe.recipe_name}
              </h2>
              <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-3xl">
                {recipe.description}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="flex-shrink-0 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Total Time</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{totalTime}m</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Servings</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{recipe.servings}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Calories</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{nutrition.calories}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Protein</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{nutrition.protein_g}g</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={copyRecipe} variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Clipboard className="w-4 h-4" />
              Copy Recipe
            </Button>
            <Button onClick={exportPDF} variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <SaveToDashboardButton
              itemData={{
                title: recipe.recipe_name,
                content: recipe.description,
                details: recipe,
                source_page: 'Diet',
                icon: 'Utensils'
              }}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            />
          </div>
        </div>
      </GradientCard>

      {/* Tabs for detailed info */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Health Benefits
              </h3>
              <ul className="space-y-2">
                {(recipe.health_benefits || []).map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </ContentCard>

            <ContentCard>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Chef's Tips
              </h3>
              <ul className="space-y-2">
                {(recipe.chef_tips || []).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 font-bold flex-shrink-0">{idx + 1}.</span>
                    <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </ContentCard>
          </div>

          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <ContentCard>
              <h3 className="font-bold text-lg mb-4">🔄 Ingredient Substitutions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipe.substitutions.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{sub.original}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{sub.substitute}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{sub.reason}</p>
                  </div>
                ))}
              </div>
            </ContentCard>
          )}

          {recipe.meal_prep_friendly && (
            <ContentCard className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">
                🥡 Meal Prep Friendly
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {recipe.storage_instructions || 'This recipe stores well! Make ahead for easy meal prep.'}
              </p>
              {recipe.pairing_suggestions && recipe.pairing_suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Pairs well with:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.pairing_suggestions.map((pair, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                        {pair}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </ContentCard>
          )}
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4 mt-6">
          <ContentCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                Ingredients List
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Servings:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                >
                  -
                </Button>
                <span className="text-sm font-bold min-w-[40px] text-center">
                  {Math.round(recipe.servings * servingMultiplier)}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setServingMultiplier(Math.min(5, servingMultiplier + 0.5))}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {(recipe.ingredients || []).map((ing, idx) => {
                // Simple multiplier for amounts (works for most cases)
                const scaledAmount = ing.amount.replace(/[\d.]+/g, (match) => 
                  (parseFloat(match) * servingMultiplier).toFixed(1)
                );
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-700 dark:text-green-300">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{scaledAmount}</span>
                        <span className="text-slate-700 dark:text-slate-300">{ing.item}</span>
                      </div>
                      {ing.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ing.notes}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ContentCard>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4 mt-6">
          <ContentCard>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Cooking Instructions
            </h3>
            <div className="space-y-4">
              {(recipe.instructions || []).map((inst, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    completedSteps.includes(inst.step_number)
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStep(inst.step_number)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                        completedSteps.includes(inst.step_number)
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                      }`}
                    >
                      {completedSteps.includes(inst.step_number) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        inst.step_number
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-base leading-relaxed ${
                        completedSteps.includes(inst.step_number)
                          ? 'text-slate-600 dark:text-slate-400 line-through'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {inst.instruction}
                      </p>
                      {inst.tip && (
                        <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            💡 <span className="font-semibold">Tip:</span> {inst.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {completedSteps.length === recipe.instructions.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center"
              >
                <Trophy className="w-12 h-12 mx-auto mb-3" />
                <h4 className="text-2xl font-bold mb-2">Cooking Complete! 🎉</h4>
                <p>Time to enjoy your delicious meal!</p>
              </motion.div>
            )}
          </ContentCard>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard>
              <h3 className="font-bold text-lg mb-4">Macronutrient Breakdown</h3>
              <div className="h-64">
                <MacrosRing distribution={{
                  protein: `${Math.round((nutrition.protein_g * 4 / nutrition.calories) * 100)}%`,
                  carbs: `${Math.round((nutrition.carbs_g * 4 / nutrition.calories) * 100)}%`,
                  fat: `${Math.round((nutrition.fat_g * 9 / nutrition.calories) * 100)}%`
                }} />
              </div>
            </ContentCard>

            <ContentCard>
              <h3 className="font-bold text-lg mb-4">Nutrition Facts (per serving)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Calories</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{nutrition.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Protein</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{nutrition.protein_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Carbohydrates</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{nutrition.carbs_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Fat</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{nutrition.fat_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Fiber</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{nutrition.fiber_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Sugar</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{nutrition.sugar_g}g</span>
                </div>
              </div>
            </ContentCard>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// Main Diet Page
export default function Diet() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('home'); // 'home', 'analyzer', 'recipe', 'meal-result', 'recipe-result'
  const [mealAnalysis, setMealAnalysis] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <>
      {showPaywall && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-[99]" />}>
          <PremiumPaywallLazy 
            feature="Unlimited Nutrition Analysis & Recipe Generation"
            onClose={() => setShowPaywall(false)}
          />
        </Suspense>
      )}

      <div className="space-y-8">
        {activeView === 'home' && (
          <>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Nutrition Hub 🥗
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                AI-powered nutrition analysis, recipe generation & meal planning
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <GradientCard 
                  tone="emerald" 
                  interactive 
                  onClick={() => setActiveView('analyzer')}
                  className="cursor-pointer h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Meal Analyzer
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Snap a photo or describe your meal for instant nutrition insights, macro breakdown, and health tips
                      </p>
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Start Analyzing
                      </div>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <GradientCard 
                  tone="amber" 
                  interactive 
                  onClick={() => setActiveView('recipe')}
                  className="cursor-pointer h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Recipe Generator
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Turn your available ingredients into delicious, healthy recipes with step-by-step instructions
                      </p>
                      <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Create Recipe
                      </div>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            </div>

            {/* Info Card */}
            <GradientCard tone="violet" className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800">
              <div className="flex items-start gap-4">
                <Info className="w-12 h-12 text-violet-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-violet-900 dark:text-violet-100 text-lg mb-2">
                    Your Complete Nutrition Assistant
                  </h3>
                  <ul className="space-y-2 text-violet-800 dark:text-violet-200 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Get instant nutrition analysis for any meal with AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Generate personalized recipes based on your ingredients and goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Track macros, calories, and get expert nutritionist recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Save favorite meals and recipes to your dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
            </GradientCard>
          </>
        )}

        {activeView === 'analyzer' && !mealAnalysis && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meal Analyzer</h2>
            </div>
            <MealAnalyzer 
              user={user} 
              onAnalysisComplete={(analysis) => {
                setMealAnalysis(analysis);
                setActiveView('meal-result');
              }}
            />
          </>
        )}

        {activeView === 'meal-result' && mealAnalysis && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setMealAnalysis(null);
                  setActiveView('home');
                }}
              >
                ← Back to Home
              </Button>
            </div>
            <MealAnalysisResults 
              analysis={mealAnalysis}
              onClose={() => {
                setMealAnalysis(null);
                setActiveView('home');
              }}
            />
          </>
        )}

        {activeView === 'recipe' && !recipe && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recipe Generator</h2>
            </div>
            <RecipeGenerator 
              user={user}
              onRecipeGenerated={(generatedRecipe) => {
                setRecipe(generatedRecipe);
                setActiveView('recipe-result');
              }}
            />
          </>
        )}

        {activeView === 'recipe-result' && recipe && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setRecipe(null);
                  setActiveView('home');
                }}
              >
                ← Back to Home
              </Button>
            </div>
            <RecipeDisplay 
              recipe={recipe}
              onClose={() => {
                setRecipe(null);
                setActiveView('home');
              }}
            />
          </>
        )}
      </div>
    </>
  );
}