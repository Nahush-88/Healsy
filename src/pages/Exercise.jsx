import React, { useState, useEffect } from 'react';
import { Dumbbell, Sparkles, User as UserIcon, Loader2, Info, Download, Clipboard, Save as SaveIcon, Library, Play, TrendingUp, Award } from 'lucide-react';
import { useAI } from '../components/useAI';
import { User } from '@/entities/User';
import { HealthLog } from '@/entities/HealthLog';
import { ExerciseLog } from '@/entities/ExerciseLog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCard from '../components/ContentCard';
import GradientCard from '../components/GradientCard';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import PremiumPaywall from '../components/PremiumPaywall';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import WorkoutSummaryChart from "../components/exercise/WorkoutSummaryChart";
import { exportExerciseReport } from "@/functions/exportExerciseReport";
import LoadingAnalysis from '../components/LoadingAnalysis';
import ExerciseLibrary from '../components/exercise/ExerciseLibrary';
import ExerciseCard from '../components/exercise/ExerciseCard';
import WorkoutSession from '../components/exercise/WorkoutSession';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExercisePlanResults = ({ analysis, onCopy, onExport, onLog }) => {
  if (!analysis) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GradientCard>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Personalized Workout Plan</h3>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{analysis.weekly_overview}</p>
        
        <div className="space-y-4">
          {(analysis.workout_plan || []).map((workout, index) => (
            <div key={index} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <p className="font-bold text-slate-900 dark:text-white mb-2">{workout.day} - {workout.workout_type}</p>
              <ul className="space-y-1.5">
                {(workout.exercises || []).map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>{ex.name}: {ex.sets} sets of {ex.reps} reps</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Visual summary */}
        <div className="mt-6 p-4 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Exercises per Day</h4>
          <WorkoutSummaryChart workoutPlan={analysis.workout_plan || []} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Button variant="outline" onClick={onCopy} className="gap-2">
            <Clipboard className="w-4 h-4" />
            Copy Plan
          </Button>
          <Button onClick={onExport} className="bg-rose-600 hover:bg-rose-700 gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="secondary" onClick={onLog} className="gap-2">
            <SaveIcon className="w-4 h-4" />
            Save to Health Log
          </Button>
        </div>
      </GradientCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Warm-up Routine</h4>
          <p className="text-slate-700 dark:text-slate-300">{analysis.warm_up_routine}</p>
        </ContentCard>
        <ContentCard>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Cool-down Routine</h4>
          <p className="text-slate-700 dark:text-slate-300">{analysis.cool_down_routine}</p>
        </ContentCard>
        <ContentCard>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Equipment Needed</h4>
          <ul className="list-disc list-inside space-y-1">
            {(analysis.equipment_needed || []).map((item, index) => (
              <li key={index} className="text-slate-700 dark:text-slate-300">{item}</li>
            ))}
          </ul>
        </ContentCard>
        <ContentCard>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Fitness Tips</h4>
          <ul className="list-disc list-inside space-y-1">
            {(analysis.fitness_tips || []).map((item, index) => (
              <li key={index} className="text-slate-700 dark:text-slate-300">{item}</li>
            ))}
          </ul>
        </ContentCard>
      </div>

       <div className="flex justify-center pt-4">
          <SaveToDashboardButton 
            itemData={{
              title: `Exercise Plan - ${new Date().toLocaleDateString()}`,
              content: `A plan focusing on ${analysis.workout_plan?.[0]?.workout_type || 'overall fitness'}.`,
              details: analysis,
              source_page: "Exercise",
              icon: "Dumbbell"
            }}
          />
        </div>
    </motion.div>
  );
};

export default function Exercise() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [analysis, setAnalysis] = useState(null);
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  
  // Exercise Library & Session
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showSession, setShowSession] = useState(false);
  
  const { generateExercisePlan, isLoading } = useAI();
  
  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleGeneratePlan = async () => {
    if (!user) {
      toast.error("Please log in to generate an exercise plan.");
      return;
    }
    if (!goals.trim()) {
      toast.error("Please specify your fitness goals.");
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('exercise_plans');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    try {
      toast.info("AI Fitness Coach is creating your workout plan...");
      const userProfile = {
        age: user.age,
        weight_kg: user.weight_kg,
        activity_level: user.activity_level,
      };
      const result = await generateExercisePlan(userProfile, goals, experienceLevel);
      setAnalysis(result);
      toast.success("Your workout plan is ready!");
    } catch (error) {
      toast.error("Failed to generate workout plan. Please try again.");
      console.error(error);
    }
  };

  const copyPlan = async () => {
    if (!analysis) return;
    const lines = [];
    lines.push(`Exercise Plan Summary (${new Date().toLocaleDateString()}):`);
    lines.push(`- Overview: ${analysis.weekly_overview || '-'}`);
    lines.push('');
    lines.push('Workouts:');
    (analysis.workout_plan || []).forEach((w, idx) => {
      const exCount = Array.isArray(w.exercises) ? w.exercises.length : 0;
      lines.push(`${idx + 1}. ${w.day || 'Day'} • ${w.workout_type || 'Workout'} • ${exCount} exercises`);
      (w.exercises || []).forEach((ex, i) => {
        lines.push(`   - ${ex.name || 'Exercise'}${ex.sets ? ` — ${ex.sets} sets` : ''}${ex.reps ? ` x ${ex.reps}` : ''}`);
      });
    });
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.success('Plan copied to clipboard');
    } catch {
      toast.error('Could not copy plan');
    }
  };

  const exportPdf = async () => {
    if (!analysis) return;
    try {
      const { data } = await exportExerciseReport({ analysis });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exercise-plan.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Exercise plan exported as PDF');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export PDF');
    }
  };

  const logPlan = async () => {
    if (!analysis || !user) {
      toast.error('Please generate a plan and log in first.');
      return;
    }
    try {
      await HealthLog.create({
        log_type: 'exercise_plan',
        log_date: new Date().toISOString(),
        title: `Exercise Plan - ${new Date().toLocaleDateString()}`,
        data: analysis,
        user_email: user.email
      });
      toast.success('Saved to your Health Log');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save to Health Log');
    }
  };

  const handleStartExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowSession(true);
  };

  const handleWorkoutComplete = async (sessionData) => {
    try {
      if (user) {
        await ExerciseLog.create({
          ...sessionData,
          body_part: selectedExercise.body_part,
          muscle_group: selectedExercise.muscle_group,
          difficulty: selectedExercise.difficulty,
          user_rating: 5,
          log_date: new Date().toISOString().split('T')[0]
        });
      }
      setShowSession(false);
      setSelectedExercise(null);
      toast.success('Workout logged successfully! 💪');
    } catch (e) {
      console.error(e);
      toast.error('Failed to log workout');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="exercise_plans"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => { setShowUsagePopup(false); setShowPaywall(true); }}
        />
      )}
      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} feature="Personalized Exercise Plans" />}
      
      {showSession && selectedExercise && (
        <WorkoutSession
          exercise={selectedExercise}
          onComplete={handleWorkoutComplete}
          onCancel={() => {
            setShowSession(false);
            setSelectedExercise(null);
          }}
        />
      )}
    
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            💪 AI Fitness Coach
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Your complete exercise companion with personalized plans & guided workouts</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="planner" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Planner
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Library className="w-4 h-4" />
              Exercise Library
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ContentCard className="bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200/60 dark:border-red-800/60">
                    <LoadingAnalysis 
                      message="AI Trainer is building your workout plan..."
                      category="exercise"
                      showProgress={true}
                      duration={10000}
                    />
                  </ContentCard>
                </motion.div>
              ) : analysis ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ExercisePlanResults
                    analysis={analysis}
                    onCopy={copyPlan}
                    onExport={exportPdf}
                    onLog={logPlan}
                  />
                  <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => setAnalysis(null)} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate New Plan
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ContentCard>
                    <div className="flex items-center gap-3 mb-4">
                      <UserIcon className="w-6 h-6 text-orange-500" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Profile</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Age</div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.age || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Weight</div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.weight_kg ? `${user.weight_kg} kg` : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Activity Level</div>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">{user.activity_level || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="experience" className="text-lg font-semibold text-slate-900 dark:text-white block mb-2">
                          What is your experience level?
                        </label>
                        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="goals" className="text-lg font-semibold text-slate-900 dark:text-white block mb-2">
                          What are your fitness goals?
                        </label>
                        <Textarea
                          id="goals"
                          placeholder="e.g., fat loss, muscle gain, improve stamina, general fitness..."
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          className="mt-2 min-h-[100px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={handleGeneratePlan} disabled={isLoading || !goals.trim()} size="lg" className="gap-2">
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                          Generate My Workout
                        </Button>
                      </div>
                    </div>
                  </ContentCard>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="library">
            <ExerciseLibrary onSelectExercise={handleStartExercise} />
          </TabsContent>

          <TabsContent value="progress">
            <ContentCard>
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Progress Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Your workout history, personal records, and achievements will appear here as you complete exercises.
                </p>
                <Button onClick={() => setActiveTab('library')} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Your First Workout
                </Button>
              </div>
            </ContentCard>
          </TabsContent>
        </Tabs>

        <GradientCard className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200/60 dark:border-orange-800/60">
          <div className="flex items-start gap-4">
            <Info className="w-10 h-10 text-orange-600 dark:text-orange-400 flex-shrink-0"/>
            <div>
              <h3 className="font-bold text-orange-900 dark:text-orange-200 text-lg mb-1">Safety First!</h3>
              <p className="text-orange-800 dark:text-orange-300">
                Always consult with a healthcare professional before starting any new exercise program. The AI-generated plan is a suggestion and should be adapted to your personal fitness level and health conditions. Listen to your body and stop if you feel pain.
              </p>
            </div>
          </div>
        </GradientCard>
      </div>
    </>
  );
}