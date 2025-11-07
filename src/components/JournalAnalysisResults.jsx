import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import ContentCard from './ContentCard';
import { Sparkles, Heart, BookOpen, Lightbulb, Quote, Brain, CheckCircle2 } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
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

export default function JournalAnalysisResults({ analysis }) {
  if (!analysis) return null;

  const insights = analysis.insights || "Beautiful reflection. Your writing shows awareness and growth. Here's a gentle path forward.";
  const mood_score = Math.max(1, Math.min(5, Number(analysis.mood_score ?? 4)));
  const primary_emotions = Array.isArray(analysis.primary_emotions) ? analysis.primary_emotions : [];
  const key_themes = Array.isArray(analysis.key_themes) ? analysis.key_themes : [];
  const suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : [];
  const affirmation = analysis.affirmation || "I am grounded, resilient, and growing every day.";
  const growth_opportunities = Array.isArray(analysis.growth_opportunities) ? analysis.growth_opportunities : [];
  const self_care_recommendations = Array.isArray(analysis.self_care_recommendations) ? analysis.self_care_recommendations : [];
  const reflection_questions = Array.isArray(analysis.reflection_questions) ? analysis.reflection_questions : [];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ContentCard>
        <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/50">
          <Sparkles className="w-8 h-8 text-violet-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">AI Mindfulness Insights</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{insights}</p>
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={Heart} title="Mood Score">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-black text-violet-600 dark:text-violet-400">{mood_score}</div>
            <div className="text-slate-600 dark:text-slate-300">
              <div className="font-semibold">How you’re feeling</div>
              <div className="text-sm opacity-80">1 = low energy • 5 = high energy</div>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-violet-500 to-purple-500"
              style={{ width: `${(mood_score / 5) * 100}%` }}
            />
          </div>
        </Section>

        <Section icon={Brain} title="Primary Emotions">
          {primary_emotions.length ? (
            <div className="flex flex-wrap gap-2">
              {primary_emotions.map((e, i) => (
                <Badge key={i} className="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200">{e}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No specific emotions detected.</p>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={BookOpen} title="Key Themes">
          {key_themes.length ? (
            <div className="flex flex-wrap gap-2">
              {key_themes.map((t, i) => (
                <Badge key={i} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">{t}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No key themes extracted.</p>
          )}
        </Section>

        <Section icon={Lightbulb} title="Suggestions">
          {suggestions.length ? (
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No suggestions available.</p>
          )}
        </Section>
      </div>

      <Section icon={Quote} title="Affirmation">
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50 text-lg font-medium text-slate-800 dark:text-slate-100">
          “{affirmation}”
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={Sparkles} title="Self-care Recommendations">
          {self_care_recommendations.length ? (
            <ul className="space-y-2">
              {self_care_recommendations.map((c, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">• {c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No self-care items provided.</p>
          )}
        </Section>

        <Section icon={BookOpen} title="Reflection Questions">
          {reflection_questions.length ? (
            <ul className="space-y-2">
              {reflection_questions.map((q, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">• {q}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No reflection questions available.</p>
          )}
        </Section>
      </div>
    </motion.div>
  );
}