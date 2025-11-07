
import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles, Leaf, Heart, Sun, CheckCircle2, BookOpen, ShoppingBag, AlertTriangle } from 'lucide-react';
import ContentCard from './ContentCard';
import { Badge } from '@/components/ui/badge';

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

export default function FaceAnalysisResults({ analysis }) {
  if (!analysis) return null;

  const overall_assessment = analysis.overall_assessment || "Your natural beauty shines! Here's a gentle care plan to enhance glow and hydration.";
  const glow_score = Number(analysis.glow_score ?? 7);
  const hydration_score = Number(analysis.hydration_score ?? 7);
  const clarity_score = Number(analysis.clarity_score ?? 7);
  const skin_concerns = Array.isArray(analysis.skin_concerns) ? analysis.skin_concerns : [];
  const natural_routine = {
    morning_routine: Array.isArray(analysis?.natural_routine?.morning_routine) ? analysis.natural_routine.morning_routine : [],
    evening_routine: Array.isArray(analysis?.natural_routine?.evening_routine) ? analysis.natural_routine.evening_routine : [],
  };
  const kitchen_remedies = Array.isArray(analysis.kitchen_remedies) ? analysis.kitchen_remedies : [];
  const quick_glow_hacks = Array.isArray(analysis.quick_glow_hacks) ? analysis.quick_glow_hacks : [];
  const natural_diet_tips = Array.isArray(analysis.natural_diet_tips) ? analysis.natural_diet_tips : [];
  const natural_lifestyle_tips = Array.isArray(analysis.natural_lifestyle_tips) ? analysis.natural_lifestyle_tips : [];

  // New fields (safe)
  const ayurveda = analysis.ayurveda || {};
  const easy_remedies = Array.isArray(analysis.easy_remedies) ? analysis.easy_remedies : [];
  const plan_7_days = Array.isArray(analysis.plan_7_days) ? analysis.plan_7_days : [];
  const affordable_products = Array.isArray(analysis.affordable_products) ? analysis.affordable_products : [];
  const caution_notes = Array.isArray(analysis.caution_notes) ? analysis.caution_notes : [];

  const scoreData = [
    { name: 'Glow', score: Math.max(0, Math.min(10, glow_score)) },
    { name: 'Hydration', score: Math.max(0, Math.min(10, hydration_score)) },
    { name: 'Clarity', score: Math.max(0, Math.min(10, clarity_score)) },
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Summary */}
      <ContentCard>
        <div className="text-center p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl border border-violet-200 dark:border-violet-800/50">
          <Sparkles className="w-8 h-8 text-violet-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">AI Beauty & Glow Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{overall_assessment}</p>
        </div>
      </ContentCard>

      {/* Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={Sun} title="Radiance Scores">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fill: 'var(--tw-prose-body)' }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--tw-prose-body)' }} width={90} />
                <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.5)' }} contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="score" barSize={28} radius={[0, 10, 10, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Higher numbers reflect stronger qualities. We’ll gently improve hydration and clarity while enhancing your natural glow.
          </div>
        </Section>

        <Section icon={Leaf} title="Skin Concerns">
          {skin_concerns.length ? (
            <div className="flex flex-wrap gap-2">
              {skin_concerns.map((c, i) => (
                <Badge key={i} className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{c}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No specific concerns detected — keep up the beautiful routine!</p>
          )}
        </Section>
      </div>

      {/* New: Ayurvedic Profile + Easy Remedies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={Leaf} title="Ayurvedic Profile">
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            {ayurveda.dominant_dosha && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 text-xs font-semibold">
                  Dominant Dosha: {ayurveda.dominant_dosha}
                </span>
              </div>
            )}
            {Array.isArray(ayurveda.traits) && ayurveda.traits.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Traits</div>
                <ul className="list-disc ml-5 space-y-1">
                  {ayurveda.traits.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(ayurveda.recommended_oils) && ayurveda.recommended_oils.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Recommended Oils</div>
                <div className="flex flex-wrap gap-2">
                  {ayurveda.recommended_oils.map((o, i) => (
                    <span key={i} className="px-2 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200 rounded-full text-xs">{o}</span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(ayurveda.daily_rituals) && ayurveda.daily_rituals.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Daily Rituals</div>
                <ul className="list-disc ml-5 space-y-1">
                  {ayurveda.daily_rituals.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(ayurveda.seasonal_care) && ayurveda.seasonal_care.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Seasonal Care</div>
                <ul className="space-y-1">
                  {ayurveda.seasonal_care.map((s, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{s.season}:</span> {s.guidance}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(ayurveda.avoid_list) && ayurveda.avoid_list.length > 0 && (
              <div className="text-xs text-rose-600 dark:text-rose-300">
                Avoid: {ayurveda.avoid_list.join(', ')}
              </div>
            )}
            {!ayurveda.dominant_dosha && (!Array.isArray(ayurveda.traits) || ayurveda.traits.length === 0) && (!Array.isArray(ayurveda.recommended_oils) || ayurveda.recommended_oils.length === 0) && (!Array.isArray(ayurveda.daily_rituals) || ayurveda.daily_rituals.length === 0) && (!Array.isArray(ayurveda.seasonal_care) || ayurveda.seasonal_care.length === 0) && (!Array.isArray(ayurveda.avoid_list) || ayurveda.avoid_list.length === 0) && (
              <p className="text-slate-500">Your unique Ayurvedic profile will appear here.</p>
            )}
          </div>
        </Section>

        <Section icon={BookOpen} title="Easy Home Remedies">
          {easy_remedies.length ? (
            <ul className="space-y-3">
              {easy_remedies.map((r, i) => (
                <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800/60">
                  <div className="font-semibold">{r.name || 'Remedy'}</div>
                  {r.ingredients && <div className="text-sm opacity-80">Ingredients: {r.ingredients}</div>}
                  {r.steps && <div className="text-sm opacity-80">Steps: {r.steps}</div>}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {r.frequency && <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 rounded-full">Frequency: {r.frequency}</span>}
                    {r?.availability?.where?.length ? (
                      <span className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200 rounded-full">
                        {r.availability.where.join(' • ')}
                      </span>
                    ) : null}
                    {r?.availability?.cost_level && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 rounded-full">
                        Cost: {r.availability.cost_level}
                      </span>
                    )}
                  </div>
                  {r.caution && <div className="mt-2 text-xs text-rose-600 dark:text-rose-300">Caution: {r.caution}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Gentle kitchen and pharmacy remedies will appear here.</p>
          )}
        </Section>
      </div>

      {/* Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={Sun} title="Morning Routine">
          <ul className="space-y-3">
            {natural_routine.morning_routine.length ? natural_routine.morning_routine.map((step, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800/60">
                <div className="font-semibold text-slate-800 dark:text-white">{step.step || 'Step'}</div>
                {step.natural_ingredient && <div className="text-sm text-violet-600 dark:text-violet-300">Ingredient: {step.natural_ingredient}</div>}
                {step.recipe && <div className="text-sm text-slate-600 dark:text-slate-300">Recipe: {step.recipe}</div>}
                {step.application && <div className="text-sm text-slate-600 dark:text-slate-300">How: {step.application}</div>}
              </li>
            )) : <li className="text-slate-500">A gentle cleanse and hydration will set a radiant tone for the day.</li>}
          </ul>
        </Section>

        <Section icon={Heart} title="Evening Routine">
          <ul className="space-y-3">
            {natural_routine.evening_routine.length ? natural_routine.evening_routine.map((step, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800/60">
                <div className="font-semibold text-slate-800 dark:text-white">{step.step || 'Step'}</div>
                {step.natural_ingredient && <div className="text-sm text-rose-600 dark:text-rose-300">Ingredient: {step.natural_ingredient}</div>}
                {step.recipe && <div className="text-sm text-slate-600 dark:text-slate-300">Recipe: {step.recipe}</div>}
                {step.application && <div className="text-sm text-slate-600 dark:text-slate-300">How: {step.application}</div>}
              </li>
            )) : <li className="text-slate-500">A nourishing cleanse and a calming oil massage help the skin repair overnight.</li>}
          </ul>
        </Section>
      </div>

      {/* New: 7-Day Radiance Plan */}
      {plan_7_days.length > 0 && (
        <Section icon={Sparkles} title="7‑Day Radiance Plan">
          <ul className="space-y-3">
            {plan_7_days.map((d, i) => (
              <li key={i} className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800/60">
                <div className="font-semibold text-slate-800 dark:text-white">{d.day || `Day ${i+1}`}</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <div><span className="font-medium">Morning:</span> {d.morning || '—'}</div>
                  <div><span className="font-medium">Evening:</span> {d.evening || '—'}</div>
                  {d.diet_tip && <div><span className="font-medium">Diet Tip:</span> {d.diet_tip}</div>}
                  {d.water_goal_ml && <div><span className="font-medium">Water Goal:</span> {d.water_goal_ml} ml</div>}
                  {d.bonus_trick && <div><span className="font-medium">Bonus:</span> {d.bonus_trick}</div>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* New: Budget-friendly Finds + Cautions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section icon={ShoppingBag} title="Budget‑Friendly Finds">
          {affordable_products.length ? (
            <ul className="space-y-3 text-sm">
              {affordable_products.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="opacity-80">{p.type || ''}{p.type && p.price_range ? ' • ' : ''}{p.price_range || ''}</div>
                    {p.where_to_find && <div className="opacity-80">Find at: {p.where_to_find}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Simple, affordable picks will show here.</p>
          )}
        </Section>

        <Section icon={AlertTriangle} title="Gentle Cautions">
          {caution_notes.length ? (
            <ul className="list-disc ml-5 space-y-1 text-sm text-rose-700 dark:text-rose-300">
              {caution_notes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          ) : (
            <p className="text-slate-500">Always patch test. If irritation persists, pause and consult a professional.</p>
          )}
        </Section>
      </div>

      {/* Remedies and tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Section icon={Leaf} title="Kitchen Remedies">
          {kitchen_remedies.length ? (
            <ul className="space-y-3">
              {kitchen_remedies.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="font-semibold">{r.name || 'Remedy'}</div>
                    {r.ingredients && <div className="opacity-80">Ingredients: {r.ingredients}</div>}
                    {r.recipe && <div className="opacity-80">How: {r.recipe}</div>}
                    {r.benefits && <div className="opacity-80">Benefits: {r.benefits}</div>}
                    {r.frequency && <div className="opacity-80">Use: {r.frequency}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Simple home remedies will appear here.</p>
          )}
        </Section>

        <Section icon={Sparkles} title="Quick Glow Hacks">
          {quick_glow_hacks.length ? (
            <ul className="space-y-2">
              {quick_glow_hacks.map((h, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {h.name || h.tip || h}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Fast glow tricks will appear here.</p>
          )}
        </Section>

        <Section icon={Sun} title="Diet & Lifestyle">
          <div className="space-y-3">
            <div>
              <div className="font-semibold mb-1">Natural Diet Tips</div>
              {natural_diet_tips.length ? (
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {natural_diet_tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              ) : <p className="text-slate-500">Eat colorful whole foods and hydrate well.</p>}
            </div>
            <div>
              <div className="font-semibold mb-1">Lifestyle Tips</div>
              {natural_lifestyle_tips.length ? (
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {natural_lifestyle_tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              ) : <p className="text-slate-500">Sleep 7–8 hours, move daily, and manage stress gently.</p>}
            </div>
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
