import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, ChevronsRight, Star, User, Heart, Mic } from 'lucide-react';
import GradientCard from './GradientCard';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HairstyleResults({ analysis, onReset }) {

  if (!analysis) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GradientCard className="p-4 sm:p-6" hover={false}>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Scissors className="text-blue-500"/>
            Your AI Style Analysis
          </h2>
          {/* onReset is handled on the parent now, so no need for a button here */}
        </div>

        <div className="space-y-8">
          {/* Face Shape Analysis */}
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2"><User /> Face Shape Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.face_shape_analysis}</p>
            </div>
          </motion.div>

          {/* Hairstyle Suggestions */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Top 3 AI Recommended Hairstyles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.hairstyle_suggestions.map((style, i) => (
                <motion.div 
                  key={i} 
                  className={`p-4 rounded-lg border h-full flex flex-col transition-all duration-300 ${
                    style.name === analysis.best_choice.name
                      ? 'bg-blue-100/50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-lg'
                      : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">{style.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{style.description}</p>
                  {style.name === analysis.best_choice.name && (
                     <Badge className="mt-3 w-fit bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"><Star className="w-3 h-3 mr-1" />Best Choice</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Best Choice Deep Dive */}
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.5}}>
            <div className="p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
              <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500"/> Deep Dive: Why '{analysis.best_choice.name}' is Perfect For You
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{analysis.best_choice.reason}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-500"/> What to Tell Your Barber/Stylist:
                  </h4>
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{analysis.barber_instructions}"</p>
                  </div>
                </div>
                <div>
                   <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-blue-500"/> How to Style at Home:
                   </h4>
                   <ul className="space-y-2">
                    {analysis.styling_guide.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ChevronsRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/> 
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {analysis.celebrity_inspiration && (
                 <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">⭐ Celebrity Inspiration: <span className="font-normal text-blue-500">{analysis.celebrity_inspiration}</span></h4>
                 </div>
              )}
            </div>
          </motion.div>
        </div>
      </GradientCard>
    </motion.div>
  );
}