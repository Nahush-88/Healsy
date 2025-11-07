
import React, { useEffect, useState } from "react";
import GradientCard from "../GradientCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Wind, Droplet, Quote, Loader2 } from "lucide-react";
import { useAI } from "../useAI";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AISuggestions({ latestMood = "good", userProfile = {} }) {
  const { getMoodSuggestion, calculateWaterNeeds, isLoading } = useAI();
  const [moodAdvice, setMoodAdvice] = useState(null);
  const [hydration, setHydration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const mood = await getMoodSuggestion(latestMood);
        const water = await calculateWaterNeeds(
          userProfile.age || 25,
          userProfile.weight_kg || 65,
          userProfile.activity_level || "moderate",
          userProfile.climate || "temperate"
        );
        if (!mounted) return;
        setMoodAdvice(mood);
        setHydration(water);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [
    latestMood,
    userProfile.age,
    userProfile.weight_kg,
    userProfile.activity_level,
    userProfile.climate,
    getMoodSuggestion,
    calculateWaterNeeds
  ]);

  const busy = loading || isLoading;

  return (
    <GradientCard className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl" />
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Coach</h3>
            {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>

          {/* Mood advice */}
          <div className="mt-3">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Today’s Guidance</div>
            {moodAdvice ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Quote className="w-4 h-4 text-violet-500 mt-0.5" />
                  <p className="italic text-slate-700 dark:text-slate-200">{moodAdvice.affirmation}</p>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{moodAdvice.suggestion}</p>
                <div className="flex flex-wrap gap-2">
                  {moodAdvice.activities?.slice(0, 4).map((a, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{a}</span>
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Breath: {moodAdvice.breathing_exercise}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Personalized tips are loading...</div>
            )}
          </div>

          {/* Hydration goal */}
          <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200/50 dark:border-sky-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-600" />
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Daily Hydration Goal</div>
              </div>
              <div className="text-sm font-bold text-sky-700 dark:text-sky-300">
                {hydration?.recommended_intake_ml ? `${hydration.recommended_intake_ml} ml` : '—'}
              </div>
            </div>
            {hydration?.hydration_tips?.length ? (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Tips: {hydration.hydration_tips.slice(0, 2).join(" • ")}
              </div>
            ) : null}
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to={createPageUrl("Meditation")}><Wind className="w-4 h-4" /> Start 5-min Calm</Link>
            </Button>
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Link to={createPageUrl("Water")}><Droplet className="w-4 h-4" /> Log Water</Link>
            </Button>
          </div>
        </div>
      </div>
    </GradientCard>
  );
}
