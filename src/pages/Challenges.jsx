
import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Challenge } from '@/entities/Challenge';
import { ChallengeProgress } from '@/entities/ChallengeProgress';
import { User } from '@/entities/User';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ChallengeCard from '../components/ChallengeCard';
import PremiumPaywall from '../components/PremiumPaywall';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import GradientCard from "../components/GradientCard";
import { Button } from "@/components/ui/button";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();

  // New state variables for filters
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [allChallenges, userProgress, currentUser] = await Promise.all([
          Challenge.list('-created_date'),
          ChallengeProgress.list(),
          User.me().catch(() => null)
        ]);
        setChallenges(allChallenges);
        setProgress(userProgress);
        setUser(currentUser);
      } catch (error) {
        toast.error("Failed to load challenges.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStartChallenge = async (challenge) => {
    if (challenge.is_premium && !user?.is_premium) {
      setShowPaywall(true);
      return;
    }

    try {
      const newProgress = await ChallengeProgress.create({
        challenge_id: challenge.id,
        start_date: new Date().toISOString().split('T')[0],
        current_day: 1,
        completed_days: [],
        streak: 0,
        is_completed: false,
      });
      toast.success(`Started "${challenge.title}"! Good luck!`);
      // Refresh progress
      const userProgress = await ChallengeProgress.list();
      setProgress(userProgress);
      navigate(createPageUrl(`ChallengeDetail?id=${newProgress.id}`));
    } catch (error) {
      toast.error("Failed to start challenge. You may have already started it.");
      console.error(error);
    }
  };
  
  const handleContinueChallenge = (progressId) => {
    navigate(createPageUrl(`ChallengeDetail?id=${progressId}`));
  };

  const activeProgress = progress.filter(p => !p.is_completed);
  const completedProgress = progress.filter(p => p.is_completed);

  const activeChallengeIds = activeProgress.map(p => p.challenge_id);
  const completedChallengeIds = completedProgress.map(p => p.challenge_id);
  const startedChallengeIds = [...activeChallengeIds, ...completedChallengeIds];

  const availableChallenges = challenges.filter(c => !startedChallengeIds.includes(c.id));
  const activeChallenges = challenges.filter(c => activeChallengeIds.includes(c.id));
  const completedChallenges = challenges.filter(c => completedChallengeIds.includes(c.id));

  // Function to apply filters
  const applyFilters = (list) => {
    return list.filter(c => {
      const q = query.trim().toLowerCase();
      const matchQuery = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      const matchCategory = categoryFilter === "all" || c.category === categoryFilter;
      const matchDifficulty = difficultyFilter === "all" || c.difficulty === difficultyFilter;
      const matchPremium = !premiumOnly || !!c.is_premium;
      return matchQuery && matchCategory && matchDifficulty && matchPremium;
    });
  };

  const filteredAvailableChallenges = applyFilters(availableChallenges);
  const filteredActiveChallenges = applyFilters(activeChallenges);
  const filteredCompletedChallenges = applyFilters(completedChallenges);

  const renderChallengeList = (list, type) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-96 animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      let message = "No new challenges available right now. Check back later!";
      if (type === 'active') message = 'You have no active challenges. Start one from the "Available" tab!';
      if (type === 'completed') message = "You haven't completed any challenges yet.";
      // If filters are active and no results, change message
      if (type === 'available' && (query !== "" || categoryFilter !== "all" || difficultyFilter !== "all" || premiumOnly)) {
        message = "No challenges match your current filters. Try adjusting them!";
      }
      return <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">{message}</p>;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {list.map(challenge => {
            const challengeProgress = progress.find(p => p.challenge_id === challenge.id);
            return (
              <ChallengeCard 
                key={challenge.id}
                challenge={challenge}
                progress={challengeProgress}
                onStart={() => handleStartChallenge(challenge)}
                onContinue={() => handleContinueChallenge(challengeProgress?.id)} // Use optional chaining for progressId
                isStarted={startedChallengeIds.includes(challenge.id)}
              />
            );
          })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {showPaywall && (
        <PremiumPaywall 
          feature="Premium Challenges"
          onClose={() => setShowPaywall(false)}
        />
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          Wellness Challenges 🏆
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">Push your limits, build healthy habits, and transform your life.</p>
      </motion.div>

      {/* Continue last active challenge (if any) */}
      {!isLoading && activeProgress.length > 0 && (() => {
        const last = activeProgress[0];
        const ch = challenges.find(c => c.id === last.challenge_id);
        if (!ch) return null; // Ensure challenge data is loaded
        return (
          <GradientCard className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Resume</div>
                <div className="text-xl font-bold text-slate-800 dark:text-white">{ch.title}</div>
                <div className="text-slate-600 dark:text-slate-300 text-sm">Day {last.current_day}/{ch.duration_days} • Streak {last.streak}🔥</div>
              </div>
              <Button onClick={() => handleContinueChallenge(last.id)} className="bg-blue-600 hover:bg-blue-700">
                Continue Challenge
              </Button>
            </div>
          </GradientCard>
        );
      })()}

      {/* Featured challenge banner - SIMPLIFIED */}
      {!isLoading && filteredAvailableChallenges.length > 0 && (() => {
        // Prioritize premium featured challenge, otherwise pick the first available
        const featured = filteredAvailableChallenges.find(c => c.is_premium) || filteredAvailableChallenges[0];
        if (!featured) return null; // Should not happen if filteredAvailableChallenges.length > 0, but for safety
        return (
          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
            {/* Static background - NO ANIMATION */}
            <div className="absolute -top-20 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80">Featured Challenge</div>
                  <h3 className="text-2xl font-bold mt-1">{featured.title}</h3>
                  <p className="opacity-90 mt-1 max-w-2xl">{featured.description}</p>
                  <div className="mt-2 text-sm opacity-90 capitalize">{featured.category} • {featured.difficulty} • {featured.duration_days} days</div>
                </div>
                <div className="flex items-center gap-3">
                  {featured.is_premium && <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold">Premium</div>}
                  <Button onClick={() => handleStartChallenge(featured)} className="bg-white text-violet-700 hover:bg-slate-100">
                    Start Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <Input
            placeholder="Search challenges..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white/80 dark:bg-slate-800/80"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="mind">Mind</SelectItem>
            <SelectItem value="body">Body</SelectItem>
            <SelectItem value="nutrition">Nutrition</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="skin">Skin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={premiumOnly} onCheckedChange={setPremiumOnly} id="premium-only" />
        <label htmlFor="premium-only" className="text-sm text-slate-600 dark:text-slate-300">Show Premium only</label>
      </div>

      {/* Tabs and lists */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderChallengeList(filteredActiveChallenges, 'active')}
        </TabsContent>
        <TabsContent value="available">
          {renderChallengeList(filteredAvailableChallenges, 'available')}
        </TabsContent>
        <TabsContent value="completed">
          {renderChallengeList(filteredCompletedChallenges, 'completed')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
