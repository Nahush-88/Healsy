import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const moods = [
  { emoji: '😊', label: 'Radiant', value: 'radiant', color: 'bg-yellow-500', darkColor: 'dark:bg-yellow-500' },
  { emoji: '🙂', label: 'Good', value: 'good', color: 'bg-green-500', darkColor: 'dark:bg-green-500' },
  { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-blue-500', darkColor: 'dark:bg-blue-500' },
  { emoji: '😟', label: 'Sad', value: 'sad', color: 'bg-orange-500', darkColor: 'dark:bg-orange-500' },
  { emoji: '😩', label: 'Stressed', value: 'stressed', color: 'bg-red-500', darkColor: 'dark:bg-red-500' }
];

export default function MoodSelector({ selectedMood, onMoodSelect, size = "lg" }) {
  const sizeClasses = {
    lg: "p-4 h-auto text-2xl",
    sm: "p-3 h-auto text-xl"
  };
  
  return (
    <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
      {moods.map((mood) => (
        <motion.div 
          key={mood.value} 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={selectedMood === mood.value ? "default" : "outline"}
            size={size}
            onClick={() => onMoodSelect(mood.value)}
            className={`flex flex-col items-center gap-2 transition-all duration-200 ${
              selectedMood === mood.value 
                ? `${mood.color} ${mood.darkColor} text-white` 
                : 'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white'
            } ${size === 'sm' ? 'w-20 h-20' : 'w-24 h-24'}`}
          >
            <span className={sizeClasses[size]}>{mood.emoji}</span>
            <span className="text-xs sm:text-sm font-medium">{mood.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}