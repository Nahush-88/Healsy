
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, Droplet, Loader2, CheckCircle, TrendingUp, Calendar, Award, Target, Flame, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import GradientCard from '../GradientCard';
import LoadingAnalysis from '../LoadingAnalysis';
import { SkincareRoutine } from '@/entities/SkincareRoutine';
import { format } from 'date-fns';

const skinTypes = [
  { value: 'oily', label: 'Oily', emoji: '💧', description: 'Shiny, large pores, prone to breakouts' },
  { value: 'dry', label: 'Dry', emoji: '🏜️', description: 'Tight, flaky, rough texture' },
  { value: 'normal', label: 'Normal', emoji: '✨', description: 'Balanced, smooth, few issues' },
  { value: 'combination', label: 'Combination', emoji: '🎭', description: 'Oily T-zone, dry cheeks' },
  { value: 'sensitive', label: 'Sensitive', emoji: '🌸', description: 'Easily irritated, red, reactive' }
];

export default function SkincareGenerator({ user, onRoutineComplete }) {
  const [selectedSkinType, setSelectedSkinType] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [stats, setStats] = useState({
    currentRoutine: null,
    streak: 0,
    glowScore: 0,
    hydrationScore: 0
  });

  useEffect(() => {
    loadCurrentRoutine();
  }, []);

  const loadCurrentRoutine = async () => {
    try {
      const routines = await SkincareRoutine.list('-routine_date', 10);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRoutine = routines.find(r => r.routine_date === today);
      
      if (todayRoutine) {
        setStats({
          currentRoutine: todayRoutine,
          streak: todayRoutine.streak_days || 0,
          glowScore: todayRoutine.glow_score || 0,
          hydrationScore: todayRoutine.hydration_score || 0
        });
        setRoutine(todayRoutine);
        setTodayCompleted(todayRoutine.completed_today);
      }
    } catch (error) {
      console.error('Failed to load routine:', error);
    }
  };

  const saveRoutine = async () => {
    if (!routine) return;
    
    try {
      await SkincareRoutine.create({
        skin_type: routine.skin_type,
        morning_routine: routine.morning_routine,
        night_routine: routine.night_routine,
        glow_score: routine.glow_score || 0,
        hydration_score: routine.hydration_level || 0,
        routine_date: format(new Date(), 'yyyy-MM-dd'),
        completed_today: false,
        streak_days: 0,
        user_email: user?.email
      });

      toast.success('Skincare routine saved!');
      if (onRoutineComplete) onRoutineComplete();
    } catch (error) {
      console.error('Failed to save routine:', error);
      toast.error('Failed to save routine');
    }
  };

  const generateRoutine = async () => {
    if (!selectedSkinType) {
      toast.error('Please select your skin type first');
      return;
    }

    setGenerating(true);
    try {
      toast.info('🧴 Creating your perfect skincare routine...');

      const { InvokeLLM } = await import('@/integrations/Core');
      const result = await InvokeLLM({
        prompt: `Create a personalized skincare routine for someone with ${selectedSkinType} skin.

Provide:
1. Morning Routine (5-7 steps)
2. Night Routine (6-8 steps)
3. Weekly treatments
4. Product recommendations (specific types, not brands)
5. Pro tips for ${selectedSkinType} skin
6. Ingredients to look for and avoid

Make it:
- Practical and easy to follow
- Budget-conscious with alternatives
- Focused on visible results
- Include timings for each step`,
        response_json_schema: {
          type: 'object',
          properties: {
            morning_routine: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'number' },
                  product: { type: 'string' },
                  purpose: { type: 'string' },
                  timing: { type: 'string' },
                  application: { type: 'string' }
                }
              }
            },
            night_routine: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'number' },
                  product: { type: 'string' },
                  purpose: { type: 'string' },
                  timing: { type: 'string' },
                  application: { type: 'string' }
                }
              }
            },
            weekly_treatments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  treatment: { type: 'string' },
                  frequency: { type: 'string' },
                  benefits: { type: 'string' }
                }
              }
            },
            product_recommendations: {
              type: 'array',
              items: { type: 'string' }
            },
            ingredients_to_seek: {
              type: 'array',
              items: { type: 'string' }
            },
            ingredients_to_avoid: {
              type: 'array',
              items: { type: 'string' }
            },
            pro_tips: {
              type: 'array',
              items: { type: 'string' }
            },
            expected_results_timeline: { type: 'string' }
          }
        }
      });

      // Save routine
      const newRoutine = await SkincareRoutine.create({
        skin_type: selectedSkinType,
        morning_routine: result.morning_routine,
        night_routine: result.night_routine,
        routine_date: format(new Date(), 'yyyy-MM-dd'),
        glow_score: 70,
        hydration_score: 75,
        completed_today: false,
        streak_days: stats.streak,
        user_email: user?.email
      });

      setRoutine({ ...result, ...newRoutine });
      toast.success('✨ Your personalized skincare routine is ready!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate routine. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const markRoutineComplete = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const newStreak = stats.streak + 1;
      
      await SkincareRoutine.update(routine.id, {
        completed_today: true,
        streak_days: newStreak,
        glow_score: Math.min(100, stats.glowScore + 5),
        hydration_score: Math.min(100, stats.hydrationScore + 5)
      });

      setTodayCompleted(true);
      setStats(prev => ({
        ...prev,
        streak: newStreak,
        glowScore: Math.min(100, prev.glowScore + 5),
        hydrationScore: Math.min(100, prev.hydrationScore + 5)
      }));

      toast.success('🎉 Routine completed! Keep up the great work!', {
        description: `${newStreak} day streak! Your glow is improving.`
      });
    } catch (error) {
      console.error('Failed to mark complete:', error);
      toast.error('Failed to save progress');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      {stats.currentRoutine && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GradientCard tone="pink">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Glow Score</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.glowScore}</h3>
              </div>
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <Progress value={stats.glowScore} className="mt-2 h-2" />
          </GradientCard>

          <GradientCard tone="blue">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Hydration</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.hydrationScore}</h3>
              </div>
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <Progress value={stats.hydrationScore} className="mt-2 h-2" />
          </GradientCard>

          <GradientCard tone="amber">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Streak</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak}</h3>
              </div>
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
          </GradientCard>

          <GradientCard tone="green">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Today</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {todayCompleted ? '✅ Done' : '⏳ Pending'}
                </h3>
              </div>
              <CheckCircle className={`w-6 h-6 ${todayCompleted ? 'text-green-600' : 'text-slate-400'}`} />
            </div>
          </GradientCard>
        </div>
      )}

      {/* Skin Type Selector */}
      {!routine && !generating && (
        <GradientCard tone="pink">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                AI Skincare Routine Generator
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Get your personalized morning & night routine based on your skin type
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold text-slate-900 dark:text-white mb-4 block">
                What's your skin type?
              </Label>
              <RadioGroup value={selectedSkinType} onValueChange={setSelectedSkinType}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skinTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedSkinType === type.value
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{type.emoji}</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {type.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={generateRoutine}
              disabled={!selectedSkinType}
              size="lg"
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Routine
            </Button>
          </div>
        </GradientCard>
      )}

      {/* Loading */}
      <AnimatePresence>
        {generating && (
          <GradientCard tone="pink">
            <LoadingAnalysis
              message="Creating your perfect skincare routine..."
              category="skincare"
              showProgress={true}
              duration={10000}
            />
          </GradientCard>
        )}
      </AnimatePresence>

      {/* Routine Display */}
      <AnimatePresence>
        {routine && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Morning Routine */}
            <GradientCard tone="amber">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Morning Routine</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Start your day fresh</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {routine.morning_routine?.length} steps
                  </Badge>
                </div>

                <div className="space-y-3">
                  {routine.morning_routine?.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{step.product}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{step.purpose}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{step.timing}</Badge>
                          <Badge variant="outline">{step.application}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GradientCard>

            {/* Night Routine */}
            <GradientCard tone="indigo">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Night Routine</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Repair & rejuvenate</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {routine.night_routine?.length} steps
                  </Badge>
                </div>

                <div className="space-y-3">
                  {routine.night_routine?.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{step.product}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{step.purpose}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{step.timing}</Badge>
                          <Badge variant="outline">{step.application}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GradientCard>

            {/* Weekly Treatments & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routine.weekly_treatments && (
                <GradientCard tone="green">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Weekly Treatments
                  </h3>
                  <div className="space-y-3">
                    {routine.weekly_treatments.map((treatment, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                          {treatment.treatment}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {treatment.frequency}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {treatment.benefits}
                        </p>
                      </div>
                    ))}
                  </div>
                </GradientCard>
              )}

              <GradientCard tone="violet">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  Pro Tips
                </h3>
                <ul className="space-y-2">
                  {routine.pro_tips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-violet-600 mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </GradientCard>
            </div>

            {/* PRO SKINCARE TIPS */}
            <GradientCard tone="pink">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Pro Skincare Tips for {routine.skin_type} Skin
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Expert advice for glowing, healthy skin
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 mb-3 flex items-center gap-2">
                      <span>💧</span> Application Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600 mt-0.5">•</span>
                        <span>Always apply products on damp skin for better absorption</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600 mt-0.5">•</span>
                        <span>Use upward motions to fight gravity and prevent sagging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600 mt-0.5">•</span>
                        <span>Tap products gently - don't rub or pull on delicate skin</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600 mt-0.5">•</span>
                        <span>Wait 30 seconds between each product layer</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span>⏰</span> Timing Matters
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Morning: Focus on protection (sunscreen is a MUST!)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Night: Time for repair and active ingredients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Retinol always at night - it's sun-sensitive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Vitamin C in morning for antioxidant protection</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <span>🚫</span> Common Mistakes
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Don't skip sunscreen even on cloudy days!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Avoid hot water - it strips natural oils</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Never sleep with makeup on!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>Don't over-exfoliate - 2-3 times/week is enough</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-violet-600" />
                    Golden Rules for {routine.skin_type} Skin
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routine.skin_type === 'oily' && (
                      <>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">✅ Do This:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Use oil-free, non-comedogenic products</li>
                            <li>• Clay masks 2x/week to control oil</li>
                            <li>• Lightweight, gel-based moisturizers</li>
                            <li>• Blotting papers during the day</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">❌ Avoid:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Heavy, creamy products</li>
                            <li>• Over-washing (strips oil, causes more)</li>
                            <li>• Pore-clogging ingredients</li>
                            <li>• Alcohol-based toners (too harsh)</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {routine.skin_type === 'dry' && (
                      <>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">✅ Do This:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Rich, creamy moisturizers with ceramides</li>
                            <li>• Hyaluronic acid for deep hydration</li>
                            <li>• Face oils to lock in moisture</li>
                            <li>• Humidifier in your room at night</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">❌ Avoid:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Harsh, foaming cleansers</li>
                            <li>• Hot water on your face</li>
                            <li>• Over-exfoliating (damages barrier)</li>
                            <li>• Alcohol and fragrances</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {routine.skin_type === 'combination' && (
                      <>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">✅ Do This:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Gentle, balanced cleansers</li>
                            <li>• Different products for different zones</li>
                            <li>• Lightweight, hydrating serums</li>
                            <li>• Clay mask on T-zone only</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">❌ Avoid:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• One-size-fits-all approach</li>
                            <li>• Heavy creams all over</li>
                            <li>• Harsh mattifying products</li>
                            <li>• Ignoring dry patches</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {routine.skin_type === 'sensitive' && (
                      <>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">✅ Do This:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Fragrance-free, gentle products</li>
                            <li>• Patch test everything new</li>
                            <li>• Minimal, simple routine</li>
                            <li>• Soothing ingredients like aloe</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">❌ Avoid:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Fragrances and essential oils</li>
                            <li>• Harsh exfoliants and acids</li>
                            <li>• Trying too many products at once</li>
                            <li>• Very hot or very cold water</li>
                          </ul>
                        </div>
                      </>
                    )}
                    {routine.skin_type === 'normal' && (
                      <>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">✅ Do This:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Maintain with balanced routine</li>
                            <li>• Add anti-aging ingredients early</li>
                            <li>• Weekly masks for extra glow</li>
                            <li>• SPF every single day</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">❌ Avoid:</p>
                          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <li>• Getting complacent with routine</li>
                            <li>• Skipping prevention steps</li>
                            <li>• Over-doing active ingredients</li>
                            <li>• Ignoring sun protection</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Boost Your Results
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">💤</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Sleep on silk pillowcase</strong>
                        <p className="text-slate-600 dark:text-slate-400">Reduces friction, prevents wrinkles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">💧</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Drink 8+ glasses of water</strong>
                        <p className="text-slate-600 dark:text-slate-400">Hydration starts from within</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">🥗</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Eat antioxidant-rich foods</strong>
                        <p className="text-slate-600 dark:text-slate-400">Berries, greens boost skin health</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">🧘</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Manage stress levels</strong>
                        <p className="text-slate-600 dark:text-slate-400">Stress shows up on your skin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GradientCard>

            {/* Complete Button */}
            {!todayCompleted && (
              <div className="text-center">
                <Button
                  onClick={markRoutineComplete}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark Today's Routine Complete
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
