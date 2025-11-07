import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Zap, Lock, Sparkles, X, Star } from 'lucide-react';
import GradientCard from './GradientCard';
import PremiumPaywall from './PremiumPaywall';

const ScoreCircle = ({ score, label, color, delay }) => (
  <motion.div 
    className="flex flex-col items-center gap-2"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay * 0.2 }}
  >
    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center bg-white/50 dark:bg-slate-800/50`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-slate-700" />
        <motion.path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={color}
          initial={{ strokeDasharray: "0, 100" }}
          animate={{ strokeDasharray: `${score * 10}, 100` }}
          transition={{ duration: 1, delay: delay * 0.2 + 0.5, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-gray-800 dark:text-white">{score}</span>
    </div>
    <span className="font-medium text-gray-600 dark:text-gray-300">{label}</span>
  </motion.div>
);

const RoutineStep = ({ step, natural_ingredient, recipe, application, index }) => (
  <motion.div 
    className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">{index + 1}</span>
      {step}
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ingredient:</strong> {natural_ingredient}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Recipe:</strong> {recipe}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Application:</strong> {application}</p>
  </motion.div>
);

export default function AnalysisResults({ analysis, isPremium, onReset }) {
  const [showPaywall, setShowPaywall] = React.useState(false);

  if (!analysis) return null;
  
  return (
    <>
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GradientCard className="p-4 sm:p-6" hover={false}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Your Glow Analysis</h2>
            <Button variant="ghost" size="sm" onClick={onReset}><X className="w-4 h-4 mr-2" />New Analysis</Button>
          </div>
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="routine">Natural Routine</TabsTrigger>
              <TabsTrigger value="remedies">Kitchen Recipes</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="ayurvedic" className="flex items-center gap-2" onClick={!isPremium ? (e) => { e.preventDefault(); setShowPaywall(true); } : undefined}>
                Ayurveda {isPremium ? <Sparkles className="w-4 h-4 text-yellow-500" /> : <Lock className="w-3 h-3" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-6">
              <div className="bg-amber-50/50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-200 mb-3">Holistic Assessment</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.overall_assessment}</p>
              </div>

              <div className="flex justify-around items-center flex-wrap gap-4 py-4">
                <ScoreCircle score={analysis.glow_score} label="Glow" color="text-amber-500" delay={1} />
                <ScoreCircle score={analysis.hydration_score} label="Hydration" color="text-blue-500" delay={2} />
                <ScoreCircle score={analysis.clarity_score} label="Clarity" color="text-emerald-500" delay={3} />
              </div>

              {analysis.skin_concerns?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">Areas for Natural Focus</h3>
                  <div className="flex flex-wrap gap-3">
                    {analysis.skin_concerns.map((concern, i) => (
                      <motion.div key={i} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2 * i}}>
                        <Badge variant="outline" className="text-base px-4 py-2 bg-white/50 dark:bg-slate-800/50">{concern}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="routine" className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">☀️ Morning Routine</h3>
                <div className="space-y-4">
                  {analysis.natural_routine.morning_routine.map((step, i) => <RoutineStep key={i} index={i} {...step} />)}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">🌙 Evening Routine</h3>
                <div className="space-y-4">
                  {analysis.natural_routine.evening_routine.map((step, i) => <RoutineStep key={i} index={i} {...step} />)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="remedies" className="space-y-4">
              {analysis.kitchen_remedies.map((remedy, i) => (
                <motion.div key={i} className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">{remedy.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Ingredients:</strong> {remedy.ingredients}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>How to Make:</strong> {remedy.recipe}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Benefits:</strong> {remedy.benefits}</p>
                  <Badge variant="secondary">{remedy.frequency}</Badge>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Heart className="text-rose-500 w-5 h-5"/> Natural Diet Tips</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                  {analysis.natural_diet_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
               <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Zap className="text-violet-500 w-5 h-5"/> Healthy Lifestyle Tips</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                  {analysis.natural_lifestyle_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2"><Sparkles className="text-amber-500 w-5 h-5"/> Quick Glow Hacks</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                  {analysis.quick_glow_hacks.map((hack, i) => <li key={i}><strong>{hack.name}:</strong> {hack.tip}</li>)}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="ayurvedic">
              {isPremium && analysis.ayurvedic_secrets ? (
                <div className="space-y-6 p-4 bg-gradient-to-tr from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                  <h3 className="font-bold text-xl text-amber-800 dark:text-amber-200 mb-4">Ancient Ayurvedic Secrets</h3>
                  {analysis.ayurvedic_secrets.ancient_remedies?.map((remedy, i) => (
                    <div key={i} className="pb-4 border-b border-amber-200 dark:border-amber-800 last:border-b-0">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-2">{remedy.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Ingredients:</strong> {remedy.ingredients}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1"><strong>Preparation:</strong> {remedy.preparation}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Benefits:</strong> {remedy.benefits}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Unlock Ancient Secrets</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">Upgrade to Premium to get exclusive Ayurvedic remedies and grandmother's beauty secrets.</p>
                  <Button onClick={() => setShowPaywall(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"><Star className="w-4 h-4 mr-2" />Upgrade Now</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </GradientCard>
      </motion.div>
    </>
  );
}