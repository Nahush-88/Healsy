import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Play, CheckCircle, Flame, Clock, Target, AlertCircle, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GradientCard from '../GradientCard';

export default function ExerciseCard({ exercise, onStart, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
    }
  };

  const getMuscleColor = (muscle) => {
    const colors = {
      chest: 'from-red-500 to-pink-600',
      arms: 'from-blue-500 to-cyan-600',
      legs: 'from-green-500 to-emerald-600',
      back: 'from-purple-500 to-indigo-600',
      core: 'from-amber-500 to-orange-600',
      shoulders: 'from-violet-500 to-purple-600',
      cardio: 'from-rose-500 to-pink-600',
    };
    return colors[exercise.body_part] || 'from-slate-500 to-slate-600';
  };

  // Exercise demonstration image (Unsplash)
  const getExerciseImage = () => {
    const imageMap = {
      'Push-ups': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      'Squats': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
      'Plank': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'Lunges': 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=600&q=80',
      'Burpees': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80',
      'Mountain Climbers': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'Jumping Jacks': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      'Bicycle Crunches': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'Deadlifts': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
      'Bench Press': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
      'Pull-ups': 'https://images.unsplash.com/photo-1598266663439-2056a4d7a1fa?w=600&q=80',
      'Dumbbell Rows': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    };
    
    return imageMap[exercise.name] || `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80`;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="relative h-40 overflow-hidden">
          <img 
            src={getExerciseImage()} 
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${getMuscleColor()} opacity-40 group-hover:opacity-30 transition-opacity`} />
          <Badge className={`absolute top-3 right-3 ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{exercise.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 capitalize">{exercise.muscle_group}</p>
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {exercise.sets} sets
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> {exercise.reps} reps
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" /> {exercise.calories_per_minute} cal/min
            </span>
          </div>

          <Button 
            onClick={() => onStart?.(exercise)} 
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" /> Start Exercise
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <GradientCard className="overflow-hidden">
      {/* Exercise Image Header */}
      <div className="relative h-64 -m-6 mb-4">
        <img 
          src={getExerciseImage()} 
          alt={exercise.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${getMuscleColor()} opacity-50`} />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-sm">
              {exercise.body_part.toUpperCase()}
            </Badge>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">{exercise.name}</h2>
            <p className="text-white/90 text-lg capitalize drop-shadow-md">{exercise.muscle_group}</p>
          </div>
        </div>
      </div>

      {/* Exercise Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/50">
          <Target className="w-6 h-6 mx-auto mb-2 text-violet-600 dark:text-violet-400" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{exercise.sets}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Sets</div>
        </div>
        
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
          <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{exercise.reps}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Reps</div>
        </div>
        
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50">
          <Flame className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{exercise.calories_per_minute}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Cal/min</div>
        </div>
      </div>

      {/* Equipment */}
      {exercise.equipment?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Equipment Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {exercise.equipment.map((item, i) => (
              <Badge key={i} variant="outline" className="bg-slate-50 dark:bg-slate-800/50">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Instructions */}
      <div className="mb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/50 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Step-by-Step Instructions ({exercise.instructions?.length || 0} steps)
          </h3>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {(exercise.instructions || []).map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pro Tips */}
      {exercise.tips?.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Pro Tips & Safety
          </h3>
          <ul className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <Button 
        onClick={() => onStart?.(exercise)}
        className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300"
        size="lg"
      >
        <Play className="w-5 h-5 mr-2" /> Start This Exercise
      </Button>
    </GradientCard>
  );
}