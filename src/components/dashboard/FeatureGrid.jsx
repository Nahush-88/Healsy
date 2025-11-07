
import React from "react";
import FeatureCard from "./FeatureCard";
import { Zap, Wind, Waves, Utensils, Heart, Sparkles, Moon, Smile, Dumbbell, Trophy, Droplet, Brain, HeartHandshake } from "lucide-react";
import { createPageUrl } from "@/utils";

const items = [
  { title: "AI Health Coach", description: "Ask anything—voice, images, or text.", icon: HeartHandshake, to: createPageUrl("AIHealthCoach"), gradient: "from-violet-600 to-purple-600" },
  { title: "Aura Scanner", description: "Scan your aura and get instant insights.", icon: Zap, to: createPageUrl("Aura"), gradient: "from-amber-500 to-orange-600" },
  { title: "AI Yoga Coach", description: "Personalized flows for strength and calm.", icon: Wind, to: createPageUrl("Yoga"), gradient: "from-sky-500 to-blue-600" },
  { title: "Meditation Hub", description: "Breath pacers and soundscapes for focus.", icon: Waves, to: createPageUrl("Meditation"), gradient: "from-purple-500 to-indigo-600" },
  { title: "Diet Planner", description: "Smart nutrition insights and meal logging.", icon: Utensils, to: createPageUrl("Body"), gradient: "from-rose-500 to-pink-600" },
  { title: "Body Health", description: "Track calories and macros with AI.", icon: Heart, to: createPageUrl("Body"), gradient: "from-emerald-500 to-teal-600" },
  { title: "Glow & Skin", description: "Face analysis with gentle, natural tips.", icon: Sparkles, to: createPageUrl("Face"), gradient: "from-fuchsia-500 to-violet-600" },
  { title: "Sleep Assistant", description: "Better nights with personalized insights.", icon: Moon, to: createPageUrl("Sleep"), gradient: "from-indigo-500 to-violet-600" },
  { title: "Mood Check-ins", description: "Track your feelings with micro-actions.", icon: Smile, to: createPageUrl("Mood"), gradient: "from-amber-500 to-yellow-600" },
  { title: "Exercise Hub", description: "Workout guidance and tracking.", icon: Dumbbell, to: createPageUrl("Exercise"), gradient: "from-cyan-500 to-sky-600" },
  { title: "Challenges", description: "Daily goals with streaks and rewards.", icon: Trophy, to: createPageUrl("Challenges"), gradient: "from-orange-500 to-red-600" },
  { title: "Hydration", description: "Meet your water goals with ease.", icon: Droplet, to: createPageUrl("Water"), gradient: "from-blue-500 to-cyan-600" },
  { title: "Mind Journal", description: "Reflect with AI-powered insights.", icon: Brain, to: createPageUrl("Mind"), gradient: "from-pink-500 to-rose-600" },
];

export default function FeatureGrid() {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Explore Healsy AI</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Beautiful, guided tools to support your wellness journey.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
