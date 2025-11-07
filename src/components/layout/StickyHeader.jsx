
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Zap, Wind, Waves, Brain, Moon, Utensils, Dumbbell, Trophy, Droplet, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StickyHeader() {
  const nav = [
    { label: "AI Coach", icon: Sparkles, to: createPageUrl("AIHealthCoach"), premium: true },
    { label: "Aura", icon: Zap, to: createPageUrl("Aura") },
    { label: "Yoga", icon: Wind, to: createPageUrl("Yoga") },
    { label: "Meditate", icon: Waves, to: createPageUrl("Meditation") },
    { label: "Diet", icon: Utensils, to: createPageUrl("Diet") },
    { label: "Sleep", icon: Moon, to: createPageUrl("Sleep") },
    { label: "Water", icon: Droplet, to: createPageUrl("Water") },
    { label: "Exercise", icon: Dumbbell, to: createPageUrl("Exercise") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:opacity-90">
              Healsy AI
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.premium && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* New: AI Coach quick CTA visible on small+ screens */}
            <Button asChild className="hidden sm:inline-flex bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
              <Link to={createPageUrl("AIHealthCoach")}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Coach
              </Link>
            </Button>
            {/* Existing Upgrade button */}
            {/* Theme toggle lives here if present */}
            {/* It exists in project, import is in layout; header just reserves space */}
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to={createPageUrl("Settings")}>Upgrade</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
