import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExerciseCard from './ExerciseCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// MASSIVE exercise database - 50+ exercises
const exerciseDatabase = [
  // CHEST (8 exercises)
  {
    id: 1,
    name: 'Push-ups',
    body_part: 'chest',
    muscle_group: 'Chest, Triceps, Shoulders',
    difficulty: 'medium',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 7,
    equipment: ['None'],
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your chest until it nearly touches the floor',
      'Push back up to starting position',
      'Repeat for desired reps'
    ],
    tips: [
      'Keep core engaged throughout movement',
      'Do not let hips sag or pike up',
      'Breathe in on the way down, out on the way up',
      'Modify on knees if needed'
    ],
    is_premium: false
  },
  {
    id: 2,
    name: 'Bench Press',
    body_part: 'chest',
    muscle_group: 'Chest, Triceps, Shoulders',
    difficulty: 'medium',
    sets: 4,
    reps: '8-12',
    calories_per_minute: 6,
    equipment: ['Barbell', 'Bench'],
    instructions: [
      'Lie flat on bench with feet planted on floor',
      'Grip bar slightly wider than shoulder width',
      'Unrack the bar and position it over your chest',
      'Lower bar to mid-chest with control',
      'Press back up to starting position'
    ],
    tips: [
      'Keep shoulder blades retracted',
      'Maintain slight arch in lower back',
      'Use spotter for safety',
      'Do not bounce bar off chest'
    ],
    is_premium: false
  },
  {
    id: 3,
    name: 'Incline Dumbbell Press',
    body_part: 'chest',
    muscle_group: 'Upper Chest, Shoulders',
    difficulty: 'medium',
    sets: 3,
    reps: '10-12',
    calories_per_minute: 6,
    equipment: ['Dumbbells', 'Incline Bench'],
    instructions: [
      'Set bench to 30-45 degree incline',
      'Hold dumbbells at chest level',
      'Press weights up until arms extended',
      'Lower with control back to start',
      'Keep feet planted throughout'
    ],
    tips: [
      'Focus on upper chest contraction',
      'Keep elbows at 45 degree angle',
      'Do not arch back excessively',
      'Control the negative portion'
    ],
    is_premium: false
  },
  {
    id: 4,
    name: 'Chest Flyes',
    body_part: 'chest',
    muscle_group: 'Chest, Shoulders',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 5,
    equipment: ['Dumbbells', 'Bench'],
    instructions: [
      'Lie on flat bench holding dumbbells above chest',
      'Keep slight bend in elbows',
      'Lower weights out to sides in wide arc',
      'Feel stretch in chest',
      'Bring weights back together above chest'
    ],
    tips: [
      'Focus on stretch and squeeze',
      'Use lighter weight than presses',
      'Keep movement controlled',
      'Maintain slight elbow bend throughout'
    ],
    is_premium: false
  },
  {
    id: 5,
    name: 'Dips',
    body_part: 'chest',
    muscle_group: 'Chest, Triceps, Shoulders',
    difficulty: 'hard',
    sets: 3,
    reps: '8-12',
    calories_per_minute: 8,
    equipment: ['Dip Bars'],
    instructions: [
      'Grip parallel bars and lift yourself up',
      'Lean forward slightly for chest emphasis',
      'Lower body by bending elbows',
      'Go until upper arms parallel to ground',
      'Push back up to start'
    ],
    tips: [
      'Lean forward to target chest more',
      'Keep elbows tucked in',
      'Do not go too deep if shoulders hurt',
      'Use resistance bands for assistance if needed'
    ],
    is_premium: false
  },
  {
    id: 6,
    name: 'Cable Crossovers',
    body_part: 'chest',
    muscle_group: 'Chest, Shoulders',
    difficulty: 'medium',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 5,
    equipment: ['Cable Machine'],
    instructions: [
      'Set cables to high position',
      'Grip handles and step forward',
      'Slight lean forward with split stance',
      'Bring handles together in front of chest',
      'Return to start with control'
    ],
    tips: [
      'Keep slight bend in elbows',
      'Focus on squeezing chest',
      'Maintain stable torso',
      'Control both concentric and eccentric'
    ],
    is_premium: true
  },
  {
    id: 7,
    name: 'Diamond Push-ups',
    body_part: 'chest',
    muscle_group: 'Triceps, Chest, Shoulders',
    difficulty: 'hard',
    sets: 3,
    reps: '8-12',
    calories_per_minute: 7,
    equipment: ['None'],
    instructions: [
      'Get in push-up position',
      'Place hands close together forming diamond with fingers',
      'Keep elbows tucked close to body',
      'Lower chest to hands',
      'Push back up'
    ],
    tips: [
      'Great for triceps development',
      'Keep core tight',
      'Harder than regular push-ups',
      'Modify on knees if needed'
    ],
    is_premium: false
  },
  {
    id: 8,
    name: 'Decline Push-ups',
    body_part: 'chest',
    muscle_group: 'Upper Chest, Shoulders, Triceps',
    difficulty: 'medium',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 7,
    equipment: ['Bench or Elevated Surface'],
    instructions: [
      'Place feet on elevated surface',
      'Hands on ground shoulder-width apart',
      'Lower chest to ground',
      'Keep body straight',
      'Push back up'
    ],
    tips: [
      'Targets upper chest more',
      'Keep hips from sagging',
      'Higher elevation equals more difficulty',
      'Maintain straight body line'
    ],
    is_premium: false
  },

  // LEGS (10 exercises)
  {
    id: 9,
    name: 'Squats',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Hamstrings',
    difficulty: 'medium',
    sets: 4,
    reps: '10-15',
    calories_per_minute: 8,
    equipment: ['None'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep chest up and core engaged',
      'Lower down as if sitting in a chair',
      'Go until thighs are parallel to ground',
      'Push through heels to return to start'
    ],
    tips: [
      'Keep knees tracking over toes',
      'Do not let knees cave inward',
      'Keep weight in heels',
      'Breathe in going down, out coming up'
    ],
    is_premium: false
  },
  {
    id: 10,
    name: 'Lunges',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Hamstrings',
    difficulty: 'easy',
    sets: 3,
    reps: '12 each leg',
    calories_per_minute: 7,
    equipment: ['None'],
    instructions: [
      'Stand tall with feet hip-width apart',
      'Step forward with one leg',
      'Lower hips until both knees bent at 90 degrees',
      'Push through front heel to return to start',
      'Alternate legs'
    ],
    tips: [
      'Keep torso upright',
      'Front knee should not go past toes',
      'Maintain balance by engaging core',
      'Start with bodyweight before adding weight'
    ],
    is_premium: false
  },
  {
    id: 11,
    name: 'Deadlifts',
    body_part: 'legs',
    muscle_group: 'Hamstrings, Glutes, Lower Back',
    difficulty: 'hard',
    sets: 4,
    reps: '6-10',
    calories_per_minute: 9,
    equipment: ['Barbell'],
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees, grip bar shoulder-width',
      'Keep back flat and chest up',
      'Drive through heels, extending hips and knees',
      'Stand tall, then lower bar with control'
    ],
    tips: [
      'Critical: Keep spine neutral throughout',
      'Bar should travel in straight line',
      'Hinge at hips, not just squat down',
      'Use proper form before adding weight'
    ],
    is_premium: false
  },
  {
    id: 12,
    name: 'Bulgarian Split Squats',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Balance',
    difficulty: 'hard',
    sets: 3,
    reps: '10-12 each',
    calories_per_minute: 7,
    equipment: ['Bench'],
    instructions: [
      'Place rear foot on bench behind you',
      'Front foot 2-3 feet from bench',
      'Lower back knee toward ground',
      'Keep front shin vertical',
      'Push through front heel to stand'
    ],
    tips: [
      'Excellent single-leg developer',
      'Keep torso upright',
      'Front knee tracks over toes',
      'Challenge balance and stability'
    ],
    is_premium: false
  },
  {
    id: 13,
    name: 'Romanian Deadlifts',
    body_part: 'legs',
    muscle_group: 'Hamstrings, Glutes, Lower Back',
    difficulty: 'medium',
    sets: 3,
    reps: '10-12',
    calories_per_minute: 7,
    equipment: ['Barbell or Dumbbells'],
    instructions: [
      'Hold weight at thighs with slight knee bend',
      'Push hips back while lowering weight',
      'Keep back flat and weight close to legs',
      'Feel stretch in hamstrings',
      'Drive hips forward to return'
    ],
    tips: [
      'Focus on hip hinge movement',
      'Keep slight knee bend throughout',
      'Feel it in hamstrings, not lower back',
      'Maintain neutral spine'
    ],
    is_premium: false
  },
  {
    id: 14,
    name: 'Leg Press',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Hamstrings',
    difficulty: 'medium',
    sets: 4,
    reps: '12-15',
    calories_per_minute: 6,
    equipment: ['Leg Press Machine'],
    instructions: [
      'Sit in machine with feet hip-width on platform',
      'Release safety and lower platform',
      'Lower until knees at 90 degrees',
      'Push through heels to extend legs',
      'Do not lock knees at top'
    ],
    tips: [
      'Keep lower back pressed against pad',
      'Do not let knees cave inward',
      'Full range of motion',
      'Controlled movement both ways'
    ],
    is_premium: true
  },
  {
    id: 15,
    name: 'Calf Raises',
    body_part: 'legs',
    muscle_group: 'Calves',
    difficulty: 'easy',
    sets: 4,
    reps: '15-20',
    calories_per_minute: 4,
    equipment: ['None or Dumbbells'],
    instructions: [
      'Stand with balls of feet on edge of step',
      'Hold dumbbells or bodyweight',
      'Raise up onto toes as high as possible',
      'Squeeze calves at top',
      'Lower heels below step level'
    ],
    tips: [
      'Full range of motion is key',
      'Pause at top for squeeze',
      'Control the negative',
      'Can do single-leg for more intensity'
    ],
    is_premium: false
  },
  {
    id: 16,
    name: 'Wall Sits',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes',
    difficulty: 'easy',
    sets: 3,
    reps: '45-60 sec',
    calories_per_minute: 5,
    equipment: ['None'],
    instructions: [
      'Lean back against wall',
      'Slide down until thighs parallel to ground',
      'Keep knees over ankles',
      'Hold position',
      'Keep back flat against wall'
    ],
    tips: [
      'Great isometric exercise',
      'Keep breathing throughout',
      'Challenge yourself with longer holds',
      'Keep weight in heels'
    ],
    is_premium: false
  },
  {
    id: 17,
    name: 'Goblet Squats',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Core',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 7,
    equipment: ['Dumbbell or Kettlebell'],
    instructions: [
      'Hold weight at chest height',
      'Feet shoulder-width apart',
      'Squat down keeping chest up',
      'Elbows track between knees',
      'Push through heels to stand'
    ],
    tips: [
      'Great for learning squat form',
      'Keep weight close to body',
      'Elbows can push knees out',
      'Good for all fitness levels'
    ],
    is_premium: false
  },
  {
    id: 18,
    name: 'Pistol Squats',
    body_part: 'legs',
    muscle_group: 'Quads, Glutes, Balance',
    difficulty: 'hard',
    sets: 3,
    reps: '5-8 each',
    calories_per_minute: 9,
    equipment: ['None'],
    instructions: [
      'Stand on one leg',
      'Extend other leg forward',
      'Squat down on standing leg',
      'Keep extended leg off ground',
      'Push back up'
    ],
    tips: [
      'Advanced move requiring strength and balance',
      'Hold onto support when learning',
      'Build up to full range',
      'Great for single-leg strength'
    ],
    is_premium: true
  },

  // CORE (10 exercises)
  {
    id: 19,
    name: 'Plank',
    body_part: 'core',
    muscle_group: 'Core, Shoulders',
    difficulty: 'easy',
    sets: 3,
    reps: '30-60 sec',
    calories_per_minute: 5,
    equipment: ['None'],
    instructions: [
      'Start in forearm plank position',
      'Elbows directly under shoulders',
      'Form straight line from head to heels',
      'Engage core and glutes',
      'Hold position for time'
    ],
    tips: [
      'Do not let hips sag or pike',
      'Keep neck neutral',
      'Breathe steadily',
      'Start with shorter holds'
    ],
    is_premium: false
  },
  {
    id: 20,
    name: 'Bicycle Crunches',
    body_part: 'core',
    muscle_group: 'Abs, Obliques',
    difficulty: 'medium',
    sets: 3,
    reps: '20 total',
    calories_per_minute: 6,
    equipment: ['None'],
    instructions: [
      'Lie on back, hands behind head',
      'Lift shoulders off ground',
      'Bring right elbow to left knee while extending right leg',
      'Switch sides in pedaling motion',
      'Continue alternating'
    ],
    tips: [
      'Focus on rotation, not just moving limbs',
      'Keep lower back pressed to floor',
      'Move with control, not speed',
      'Breathe throughout movement'
    ],
    is_premium: false
  },
  {
    id: 21,
    name: 'Mountain Climbers',
    body_part: 'core',
    muscle_group: 'Core, Shoulders, Cardio',
    difficulty: 'medium',
    sets: 3,
    reps: '30 sec',
    calories_per_minute: 10,
    equipment: ['None'],
    instructions: [
      'Start in high plank position',
      'Bring right knee toward chest',
      'Quickly switch legs',
      'Continue alternating at fast pace',
      'Keep hips level'
    ],
    tips: [
      'Maintain plank position',
      'Do not let hips bounce',
      'Move at controlled speed',
      'Great for cardio and core'
    ],
    is_premium: false
  },
  {
    id: 22,
    name: 'Russian Twists',
    body_part: 'core',
    muscle_group: 'Obliques, Abs',
    difficulty: 'medium',
    sets: 3,
    reps: '20 total',
    calories_per_minute: 6,
    equipment: ['None or Weight'],
    instructions: [
      'Sit on floor with knees bent',
      'Lean back slightly, lift feet off ground',
      'Hold weight at chest',
      'Rotate torso side to side',
      'Touch ground beside hips each rep'
    ],
    tips: [
      'Keep feet off ground for more challenge',
      'Rotate from core, not just arms',
      'Maintain balance throughout',
      'Control the movement'
    ],
    is_premium: false
  },
  {
    id: 23,
    name: 'Dead Bug',
    body_part: 'core',
    muscle_group: 'Core, Hip Flexors',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['None'],
    instructions: [
      'Lie on back with arms extended toward ceiling',
      'Lift legs with knees bent at 90 degrees',
      'Lower right arm overhead while extending left leg',
      'Return to start and switch sides',
      'Keep lower back pressed to floor'
    ],
    tips: [
      'Focus on anti-extension core work',
      'Move slowly with control',
      'Keep lower back flat',
      'Coordinate breathing with movement'
    ],
    is_premium: false
  },
  {
    id: 24,
    name: 'Hanging Leg Raises',
    body_part: 'core',
    muscle_group: 'Lower Abs, Hip Flexors',
    difficulty: 'hard',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 7,
    equipment: ['Pull-up Bar'],
    instructions: [
      'Hang from bar with overhand grip',
      'Keep legs together',
      'Raise legs up toward chest',
      'Control the descent',
      'Avoid swinging'
    ],
    tips: [
      'Keep movement controlled',
      'Do not swing or use momentum',
      'Bend knees if straight leg is too hard',
      'Focus on lower ab contraction'
    ],
    is_premium: true
  },
  {
    id: 25,
    name: 'Side Plank',
    body_part: 'core',
    muscle_group: 'Obliques, Core, Shoulders',
    difficulty: 'medium',
    sets: 3,
    reps: '30-45 sec each',
    calories_per_minute: 5,
    equipment: ['None'],
    instructions: [
      'Lie on side with elbow under shoulder',
      'Stack feet or stagger for easier',
      'Lift hips off ground',
      'Form straight line from head to feet',
      'Hold position'
    ],
    tips: [
      'Keep hips elevated',
      'Do not let them sag',
      'Stack feet for more challenge',
      'Switch sides'
    ],
    is_premium: false
  },
  {
    id: 26,
    name: 'Ab Wheel Rollouts',
    body_part: 'core',
    muscle_group: 'Abs, Shoulders, Back',
    difficulty: 'hard',
    sets: 3,
    reps: '8-12',
    calories_per_minute: 7,
    equipment: ['Ab Wheel'],
    instructions: [
      'Start on knees holding ab wheel',
      'Roll forward extending arms',
      'Keep core tight throughout',
      'Go as far as you can control',
      'Pull back to start using core'
    ],
    tips: [
      'Very challenging exercise',
      'Start with shorter range',
      'Keep lower back from arching',
      'Progress slowly'
    ],
    is_premium: true
  },
  {
    id: 27,
    name: 'V-Ups',
    body_part: 'core',
    muscle_group: 'Full Abs',
    difficulty: 'hard',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 6,
    equipment: ['None'],
    instructions: [
      'Lie flat on back',
      'Simultaneously raise legs and torso',
      'Reach hands toward toes',
      'Form V shape at top',
      'Lower back down with control'
    ],
    tips: [
      'Keep movements synchronized',
      'Do not use momentum',
      'Modify by bending knees',
      'Focus on full contraction'
    ],
    is_premium: false
  },
  {
    id: 28,
    name: 'Turkish Get-Up',
    body_part: 'core',
    muscle_group: 'Full Body, Core, Stability',
    difficulty: 'hard',
    sets: 3,
    reps: '3-5 each',
    calories_per_minute: 7,
    equipment: ['Kettlebell or Dumbbell'],
    instructions: [
      'Lie on back holding weight overhead',
      'Perform complex series of movements',
      'Stand up while keeping weight overhead',
      'Reverse movements to return to floor',
      'Repeat on other side'
    ],
    tips: [
      'Complex movement with many steps',
      'Learn without weight first',
      'Builds total body strength',
      'Excellent for core stability'
    ],
    is_premium: true
  },

  // BACK (8 exercises)
  {
    id: 29,
    name: 'Pull-ups',
    body_part: 'back',
    muscle_group: 'Lats, Biceps, Shoulders',
    difficulty: 'hard',
    sets: 3,
    reps: '6-12',
    calories_per_minute: 8,
    equipment: ['Pull-up Bar'],
    instructions: [
      'Hang from bar with palms facing away',
      'Grip slightly wider than shoulders',
      'Pull chest toward bar',
      'Lower with control',
      'Repeat'
    ],
    tips: [
      'Full range of motion is key',
      'Do not swing or kip unless intended',
      'Use resistance bands for assistance if needed',
      'Pull with back, not just arms'
    ],
    is_premium: false
  },
  {
    id: 30,
    name: 'Dumbbell Rows',
    body_part: 'back',
    muscle_group: 'Lats, Rhomboids, Biceps',
    difficulty: 'medium',
    sets: 4,
    reps: '10-12 each',
    calories_per_minute: 6,
    equipment: ['Dumbbell', 'Bench'],
    instructions: [
      'Place knee and hand on bench for support',
      'Hold dumbbell in opposite hand',
      'Pull weight to hip, keeping elbow close',
      'Squeeze shoulder blade',
      'Lower with control'
    ],
    tips: [
      'Keep back flat and parallel to ground',
      'Pull with back, not just arm',
      'Do not rotate torso',
      'Control the negative'
    ],
    is_premium: false
  },
  {
    id: 31,
    name: 'Barbell Rows',
    body_part: 'back',
    muscle_group: 'Lats, Rhomboids, Traps',
    difficulty: 'medium',
    sets: 4,
    reps: '8-12',
    calories_per_minute: 7,
    equipment: ['Barbell'],
    instructions: [
      'Hinge at hips with bar hanging',
      'Keep back flat, core tight',
      'Pull bar to lower chest',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    tips: [
      'Maintain hip hinge position',
      'Do not round back',
      'Pull to sternum, not belly',
      'Control weight throughout'
    ],
    is_premium: false
  },
  {
    id: 32,
    name: 'Lat Pulldowns',
    body_part: 'back',
    muscle_group: 'Lats, Biceps',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 5,
    equipment: ['Cable Machine'],
    instructions: [
      'Sit at lat pulldown machine',
      'Grip bar wider than shoulders',
      'Pull bar down to upper chest',
      'Squeeze lats at bottom',
      'Control the return'
    ],
    tips: [
      'Pull with elbows, not hands',
      'Keep chest up',
      'Do not lean back excessively',
      'Focus on lat contraction'
    ],
    is_premium: true
  },
  {
    id: 33,
    name: 'Face Pulls',
    body_part: 'back',
    muscle_group: 'Rear Delts, Traps, Rhomboids',
    difficulty: 'easy',
    sets: 3,
    reps: '15-20',
    calories_per_minute: 4,
    equipment: ['Cable Machine with Rope'],
    instructions: [
      'Set cable to face height',
      'Grip rope with palms facing each other',
      'Pull toward face',
      'Separate hands at end',
      'Squeeze shoulder blades'
    ],
    tips: [
      'Great for shoulder health',
      'Keep elbows high',
      'Focus on rear delts',
      'Light weight, high reps'
    ],
    is_premium: true
  },
  {
    id: 34,
    name: 'Inverted Rows',
    body_part: 'back',
    muscle_group: 'Lats, Rhomboids, Biceps',
    difficulty: 'medium',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 6,
    equipment: ['Bar or TRX'],
    instructions: [
      'Set bar at waist height',
      'Hang underneath with straight body',
      'Pull chest to bar',
      'Keep body in plank position',
      'Lower with control'
    ],
    tips: [
      'Great bodyweight back exercise',
      'Keep core tight',
      'Full range of motion',
      'Progress by lowering bar height'
    ],
    is_premium: false
  },
  {
    id: 35,
    name: 'T-Bar Rows',
    body_part: 'back',
    muscle_group: 'Lats, Traps, Rhomboids',
    difficulty: 'medium',
    sets: 4,
    reps: '10-12',
    calories_per_minute: 7,
    equipment: ['T-Bar Row Machine or Barbell'],
    instructions: [
      'Straddle T-bar with knees bent',
      'Grip handles with neutral grip',
      'Pull bar to chest',
      'Keep back flat',
      'Lower with control'
    ],
    tips: [
      'Great mass builder for back',
      'Keep core tight',
      'Do not round back',
      'Focus on pulling with elbows'
    ],
    is_premium: true
  },
  {
    id: 36,
    name: 'Superman',
    body_part: 'back',
    muscle_group: 'Lower Back, Glutes',
    difficulty: 'easy',
    sets: 3,
    reps: '15-20',
    calories_per_minute: 4,
    equipment: ['None'],
    instructions: [
      'Lie face down on floor',
      'Extend arms forward',
      'Simultaneously lift arms, chest and legs',
      'Hold briefly at top',
      'Lower back down'
    ],
    tips: [
      'Great for lower back strength',
      'Do not hyperextend',
      'Focus on contraction',
      'Can hold for time instead of reps'
    ],
    is_premium: false
  },

  // ARMS (8 exercises)
  {
    id: 37,
    name: 'Bicep Curls',
    body_part: 'arms',
    muscle_group: 'Biceps',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Keep elbows close to torso',
      'Curl weights up toward shoulders',
      'Squeeze at top',
      'Lower with control'
    ],
    tips: [
      'Do not swing weights',
      'Keep elbows stationary',
      'Focus on bicep contraction',
      'Control both up and down'
    ],
    is_premium: false
  },
  {
    id: 38,
    name: 'Hammer Curls',
    body_part: 'arms',
    muscle_group: 'Biceps, Forearms',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Dumbbells'],
    instructions: [
      'Hold dumbbells with neutral grip (palms facing)',
      'Keep elbows close to sides',
      'Curl weights up',
      'Maintain neutral grip throughout',
      'Lower with control'
    ],
    tips: [
      'Targets brachialis and forearms',
      'Keep wrists straight',
      'Do not rock body',
      'Good variation from regular curls'
    ],
    is_premium: false
  },
  {
    id: 39,
    name: 'Tricep Dips',
    body_part: 'arms',
    muscle_group: 'Triceps, Chest, Shoulders',
    difficulty: 'medium',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 6,
    equipment: ['Bench or Parallel Bars'],
    instructions: [
      'Grip edge of bench or bars',
      'Extend legs forward or use parallel bars',
      'Lower body by bending elbows',
      'Go until upper arms parallel to ground',
      'Push back up to start'
    ],
    tips: [
      'Keep elbows pointing back, not out',
      'Lean slightly forward for chest emphasis',
      'Do not go too deep if shoulders hurt',
      'Keep core engaged'
    ],
    is_premium: false
  },
  {
    id: 40,
    name: 'Overhead Tricep Extension',
    body_part: 'arms',
    muscle_group: 'Triceps',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Dumbbell'],
    instructions: [
      'Stand or sit holding dumbbell overhead',
      'Keep upper arms stationary',
      'Lower weight behind head',
      'Extend back up to start',
      'Control movement'
    ],
    tips: [
      'Keep elbows close to head',
      'Do not let elbows flare out',
      'Focus on tricep stretch and contraction',
      'Can use both arms or single arm'
    ],
    is_premium: false
  },
  {
    id: 41,
    name: 'Close-Grip Bench Press',
    body_part: 'arms',
    muscle_group: 'Triceps, Chest',
    difficulty: 'medium',
    sets: 4,
    reps: '8-12',
    calories_per_minute: 6,
    equipment: ['Barbell', 'Bench'],
    instructions: [
      'Lie on bench, grip bar shoulder-width or closer',
      'Lower bar to lower chest',
      'Keep elbows close to sides',
      'Press back up',
      'Focus on triceps'
    ],
    tips: [
      'Do not grip too narrow',
      'Keep elbows tucked',
      'Great compound tricep exercise',
      'Use less weight than regular bench'
    ],
    is_premium: false
  },
  {
    id: 42,
    name: 'Preacher Curls',
    body_part: 'arms',
    muscle_group: 'Biceps',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Preacher Bench', 'EZ Bar or Dumbbells'],
    instructions: [
      'Sit at preacher bench with arms over pad',
      'Grip bar with underhand grip',
      'Curl weight up',
      'Squeeze at top',
      'Lower with control'
    ],
    tips: [
      'Isolates biceps well',
      'Do not lift shoulders',
      'Full range of motion',
      'Control the eccentric'
    ],
    is_premium: true
  },
  {
    id: 43,
    name: 'Cable Tricep Pushdowns',
    body_part: 'arms',
    muscle_group: 'Triceps',
    difficulty: 'easy',
    sets: 3,
    reps: '15-20',
    calories_per_minute: 4,
    equipment: ['Cable Machine'],
    instructions: [
      'Stand at cable machine with rope or bar attachment',
      'Keep elbows at sides',
      'Push weight down extending arms',
      'Squeeze triceps at bottom',
      'Control the return'
    ],
    tips: [
      'Keep upper arms stationary',
      'Do not lean forward',
      'Focus on tricep contraction',
      'Good for high reps'
    ],
    is_premium: true
  },
  {
    id: 44,
    name: 'Concentration Curls',
    body_part: 'arms',
    muscle_group: 'Biceps',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15 each',
    calories_per_minute: 3,
    equipment: ['Dumbbell'],
    instructions: [
      'Sit on bench with legs spread',
      'Brace elbow against inner thigh',
      'Curl dumbbell up',
      'Squeeze bicep at top',
      'Lower with control'
    ],
    tips: [
      'Maximum bicep isolation',
      'Do not rock body',
      'Focus on mind-muscle connection',
      'Slow and controlled reps'
    ],
    is_premium: false
  },

  // SHOULDERS (6 exercises)
  {
    id: 45,
    name: 'Shoulder Press',
    body_part: 'shoulders',
    muscle_group: 'Shoulders, Triceps',
    difficulty: 'medium',
    sets: 4,
    reps: '8-12',
    calories_per_minute: 6,
    equipment: ['Dumbbells or Barbell'],
    instructions: [
      'Sit or stand with weights at shoulder height',
      'Press overhead until arms extended',
      'Lower back to shoulders with control',
      'Keep core tight',
      'Repeat'
    ],
    tips: [
      'Do not arch back excessively',
      'Press in straight line',
      'Can alternate arms with dumbbells',
      'Breathe out on press'
    ],
    is_premium: false
  },
  {
    id: 46,
    name: 'Lateral Raises',
    body_part: 'shoulders',
    muscle_group: 'Side Delts',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Keep slight bend in elbows',
      'Raise arms out to sides to shoulder height',
      'Lower with control',
      'Repeat'
    ],
    tips: [
      'Do not use momentum',
      'Lead with elbows not hands',
      'Stop at shoulder height',
      'Light weight, strict form'
    ],
    is_premium: false
  },
  {
    id: 47,
    name: 'Front Raises',
    body_part: 'shoulders',
    muscle_group: 'Front Delts',
    difficulty: 'easy',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 4,
    equipment: ['Dumbbells or Plate'],
    instructions: [
      'Stand with weights in front of thighs',
      'Keep slight bend in elbows',
      'Raise arms forward to shoulder height',
      'Lower with control',
      'Repeat'
    ],
    tips: [
      'Do not swing weights',
      'Keep torso still',
      'Can alternate arms',
      'Control the movement'
    ],
    is_premium: false
  },
  {
    id: 48,
    name: 'Arnold Press',
    body_part: 'shoulders',
    muscle_group: 'Shoulders, Triceps',
    difficulty: 'medium',
    sets: 3,
    reps: '10-12',
    calories_per_minute: 6,
    equipment: ['Dumbbells'],
    instructions: [
      'Start with dumbbells at shoulders, palms facing you',
      'Press up while rotating palms outward',
      'End with palms facing forward at top',
      'Reverse motion on way down',
      'Repeat'
    ],
    tips: [
      'Rotation adds extra shoulder work',
      'Keep movement smooth',
      'Lighter weight than regular press',
      'Great variation'
    ],
    is_premium: true
  },
  {
    id: 49,
    name: 'Upright Rows',
    body_part: 'shoulders',
    muscle_group: 'Shoulders, Traps',
    difficulty: 'medium',
    sets: 3,
    reps: '12-15',
    calories_per_minute: 5,
    equipment: ['Barbell or Dumbbells'],
    instructions: [
      'Hold bar with narrow grip at thighs',
      'Pull straight up along body',
      'Elbows lead the movement',
      'Lift to chin level',
      'Lower with control'
    ],
    tips: [
      'Do not go too heavy',
      'Keep bar close to body',
      'Avoid if shoulder issues',
      'Control the tempo'
    ],
    is_premium: false
  },
  {
    id: 50,
    name: 'Barbell Clean & Press',
    body_part: 'shoulders',
    muscle_group: 'Full Body, Shoulders, Legs',
    difficulty: 'hard',
    sets: 4,
    reps: '6-8',
    calories_per_minute: 11,
    equipment: ['Barbell'],
    instructions: [
      'Start with bar at shins',
      'Explosively pull bar to shoulders',
      'Catch in front rack position',
      'Press overhead to lockout',
      'Lower back to shoulders, then to floor'
    ],
    tips: [
      'Requires excellent technique',
      'Start with light weight',
      'Keep core braced throughout',
      'Consider coaching for form'
    ],
    is_premium: true
  },

  // CARDIO (2 exercises)
  {
    id: 51,
    name: 'Burpees',
    body_part: 'cardio',
    muscle_group: 'Full Body, Cardio',
    difficulty: 'hard',
    sets: 3,
    reps: '10-15',
    calories_per_minute: 12,
    equipment: ['None'],
    instructions: [
      'Start standing',
      'Drop into squat, place hands on floor',
      'Jump feet back into plank',
      'Perform push-up (optional)',
      'Jump feet to hands and explode up'
    ],
    tips: [
      'Pace yourself',
      'Maintain good form over speed',
      'Modify by stepping instead of jumping',
      'Great for conditioning'
    ],
    is_premium: false
  },
  {
    id: 52,
    name: 'Jumping Jacks',
    body_part: 'cardio',
    muscle_group: 'Full Body, Cardio',
    difficulty: 'easy',
    sets: 3,
    reps: '30-60 sec',
    calories_per_minute: 8,
    equipment: ['None'],
    instructions: [
      'Start with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Continue at steady pace',
      'Maintain rhythm'
    ],
    tips: [
      'Land softly on balls of feet',
      'Keep core engaged',
      'Perfect for warm-up',
      'Modify with step-jacks if needed'
    ],
    is_premium: false
  },
  {
    id: 53,
    name: 'High Knees',
    body_part: 'cardio',
    muscle_group: 'Legs, Cardio, Core',
    difficulty: 'medium',
    sets: 3,
    reps: '30-45 sec',
    calories_per_minute: 10,
    equipment: ['None'],
    instructions: [
      'Stand tall with feet hip-width',
      'Drive right knee up toward chest',
      'Quickly switch to left knee',
      'Continue alternating rapidly',
      'Pump arms for momentum'
    ],
    tips: [
      'Lift knees to hip height',
      'Stay on balls of feet',
      'Keep core tight',
      'Excellent cardio finisher'
    ],
    is_premium: false
  }
];

export default function ExerciseLibrary({ onSelectExercise }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bodyPartFilter, setBodyPartFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = useMemo(() => {
    return exerciseDatabase.filter(ex => {
      const matchesSearch = !searchQuery || 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBodyPart = bodyPartFilter === 'all' || ex.body_part === bodyPartFilter;
      const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;
      return matchesSearch && matchesBodyPart && matchesDifficulty;
    });
  }, [searchQuery, bodyPartFilter, difficultyFilter]);

  const bodyParts = ['all', 'chest', 'legs', 'core', 'back', 'arms', 'shoulders', 'cardio'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search 50+ exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(bodyPartFilter !== 'all' || difficultyFilter !== 'all') && (
              <Badge variant="secondary" className="ml-1">Active</Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Body Part</label>
              <Select value={bodyPartFilter} onValueChange={setBodyPartFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map(part => (
                    <SelectItem key={part} value={part}>
                      {part === 'all' ? 'All Body Parts' : part.charAt(0).toUpperCase() + part.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(diff => (
                    <SelectItem key={diff} value={diff}>
                      {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(bodyPartFilter !== 'all' || difficultyFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setBodyPartFilter('all');
                  setDifficultyFilter('all');
                }}
                className="self-end gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Found <span className="font-bold text-slate-900 dark:text-white">{filteredExercises.length}</span> exercises
        </p>
        {filteredExercises.some(ex => ex.is_premium) && (
          <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-1">
            <Crown className="w-3 h-3" />
            Premium Available
          </Badge>
        )}
      </div>

      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ExerciseCard 
                exercise={exercise} 
                onStart={onSelectExercise}
                compact
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No exercises found</h3>
          <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}