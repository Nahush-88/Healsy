
import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Utensils, Sparkles, CheckCircle, Leaf, Lightbulb, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ContentCard from './ContentCard';

const COLORS = {
  protein: '#3b82f6', // blue-500
  carbs: '#22c55e',   // green-500
  fat: '#f59e0b',      // amber-500
  score_fill: '#8b5cf6', // violet-500
  score_bg: '#ede9fe',   // violet-100
};

const Section = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default function NutritionAnalysisResults({ analysis }) {
  if (!analysis) return null;

  // Flexible, robust field mapping (supports both legacy and normalized shapes)
  const total_calories = Number(analysis.total_calories || 0);
  const health_score = Number(analysis.health_score || 0);

  const protein_grams = Number(
    analysis.protein_grams ??
    analysis.macronutrients?.protein ??
    0
  );
  const carbs_grams = Number(
    analysis.carbs_grams ??
    analysis.macronutrients?.carbs ??
    0
  );
  const fat_grams = Number(
    analysis.fat_grams ??
    analysis.macronutrients?.fat ??
    0
  );

  const summary =
    analysis.summary ||
    analysis.nutritionist_notes ||
    (Array.isArray(analysis.health_benefits) && analysis.health_benefits.length
      ? `Benefits: ${analysis.health_benefits.slice(0, 3).join(', ')}`
      : 'Balanced meal with good nutritional profile.');

  const food_items = Array.isArray(analysis.food_items) && analysis.food_items.length
    ? analysis.food_items
    : (Array.isArray(analysis.ingredients_analysis)
        ? analysis.ingredients_analysis.map(i => i?.name).filter(Boolean)
        : []);

  const healthier_alternatives =
    Array.isArray(analysis.healthier_alternatives) && analysis.healthier_alternatives.length
      ? analysis.healthier_alternatives
      : (Array.isArray(analysis.dietary_recommendations)
          ? analysis.dietary_recommendations
          : []);

  const portion_assessment = analysis.portion_assessment || '';
  const meal_timing_advice = analysis.meal_timing_advice || '';
  const allergen_warnings = Array.isArray(analysis.allergen_warnings) ? analysis.allergen_warnings : [];
  const micronutrients = analysis.micronutrients && typeof analysis.micronutrients === 'object' ? analysis.micronutrients : {};

  const macrosData = [
    { name: 'Protein', value: protein_grams, fill: COLORS.protein },
    { name: 'Carbs', value: carbs_grams, fill: COLORS.carbs },
    { name: 'Fat', value: fat_grams, fill: COLORS.fat },
  ];

  const scoreData = [
    { name: 'Score', value: Math.max(0, Math.min(100, health_score)) },
    { name: 'Remaining', value: Math.max(0, 100 - Math.max(0, Math.min(100, health_score))) },
  ];

  // Build top micronutrients list (up to 6)
  const micronutrientEntries = Object.entries(micronutrients || {})
    .filter(([k, v]) => v !== null && v !== undefined)
    .slice(0, 6);

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {/* Summary */}
      <motion.div>
        <div className="text-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl border border-rose-200 dark:border-rose-800/50">
          <Sparkles className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">AI Nutritionist Summary</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{summary}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calories & Health Score */}
        <motion.div className="lg:col-span-1 space-y-8">
          <Section icon={TrendingUp} title="Overall Score">
            <div className="relative h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={COLORS.score_fill} />
                    <Cell fill={COLORS.score_bg} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-violet-600 dark:text-violet-400">{Math.round(health_score)}</span>
                <span className="text-sm font-medium text-slate-500">Health Score</span>
              </div>
            </div>
          </Section>
          <Section icon={Utensils} title="Total Calories">
            <div className="text-center">
              <span className="text-6xl font-black text-rose-500">{Math.round(total_calories)}</span>
              <span className="text-xl font-bold text-slate-500 ml-2">kcal</span>
            </div>
          </Section>
        </motion.div>

        {/* Macros */}
        <motion.div className="lg:col-span-2">
          <Section icon={Leaf} title="Macronutrient Breakdown">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macrosData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--tw-prose-body)' }} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]}>
                    <Cell fill={COLORS.protein} />
                    <Cell fill={COLORS.carbs} />
                    <Cell fill={COLORS.fat} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-4 text-center">
              {macrosData.map(macro => (
                <div key={macro.name}>
                  <p className="font-bold text-xl" style={{ color: macro.fill }}>{Math.round(macro.value)}g</p>
                  <p className="text-sm text-slate-500">{macro.name}</p>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Food Items */}
        <motion.div>
          <Section icon={CheckCircle} title="Identified Foods">
            {food_items.length ? (
              <div className="flex flex-wrap gap-3">
                {food_items.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-base bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No specific food items identified.</p>
            )}
          </Section>
        </motion.div>

        {/* Alternatives */}
        <motion.div>
          <Section icon={Lightbulb} title="Healthier Alternatives">
            {healthier_alternatives.length ? (
              <ul className="space-y-3">
                {healthier_alternatives.map((alt, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 mt-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No alternative suggestions provided.</p>
            )}
          </Section>
        </motion.div>
      </div>

      {/* Extra Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Section icon={Leaf} title="Micronutrients">
          {micronutrientEntries.length ? (
            <div className="flex flex-wrap gap-2">
              {micronutrientEntries.map(([k, v], idx) => (
                <Badge key={idx} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 capitalize">
                  {k.replace(/_/g, ' ')}: {Math.round(Number(v) || 0)}%
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Micronutrient details not available.</p>
          )}
        </Section>

        <Section icon={Sparkles} title="Portion & Timing">
          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Portion:</span> {portion_assessment || 'Looks reasonable for a balanced meal.'}</p>
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Best Time:</span> {meal_timing_advice || 'Great for lunch or post-workout refuel.'}</p>
          </div>
        </Section>

        <Section icon={Lightbulb} title="Allergen Warnings">
          {allergen_warnings.length ? (
            <div className="flex flex-wrap gap-2">
              {allergen_warnings.map((a, i) => (
                <Badge key={i} className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{a}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No allergens detected.</p>
          )}
        </Section>
      </div>
    </motion.div>
  );
}
