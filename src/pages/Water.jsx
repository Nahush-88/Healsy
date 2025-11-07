
import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, Trash2, Loader2, Sparkles, Clipboard, Download, CheckCircle2 } from 'lucide-react';
import { WaterLog } from '@/entities/WaterLog';
import { User } from '@/entities/User';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ContentCard from '../components/ContentCard';
import WaterBottleAnimation from '../components/WaterBottleAnimation';
import { Button } from '@/components/ui/button';
import { useAI } from '../components/useAI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import WeeklyHydrationChart from '../components/water/WeeklyHydrationChart';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import { exportWaterReport } from "@/functions/exportWaterReport";

export default function Water() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2000);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ age: '', weight_kg: '', activity_level: 'moderate', climate: 'temperate' });
  const { calculateWaterNeeds, isLoading: isAiLoading } = useAI();
  const [aiExplanation, setAiExplanation] = useState("");
  const [weeklyData, setWeeklyData] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [aiTips, setAiTips] = useState([]);

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setWaterTarget(currentUser?.daily_water_target || 2000);
      setProfile({
        age: currentUser?.age || '',
        weight_kg: currentUser?.weight_kg || '',
        activity_level: currentUser?.activity_level || 'moderate',
        climate: currentUser?.climate || 'temperate',
      });
      
      const today = new Date().toISOString().split('T')[0];
      const logs = await WaterLog.filter({ log_date: today }, '-log_time');
      const totalIntake = logs.reduce((sum, log) => sum + log.amount_ml, 0);
      
      setWaterIntake(totalIntake);
      setHistory(logs);

      // Load last 14 days and build weekly series (last 7 days)
      const recent = await WaterLog.list('-log_date', 200);
      const byDate = {};
      recent.forEach(l => {
        const d = (l.log_date || '').slice(0, 10);
        if (!d) return;
        byDate[d] = byDate[d] || { intake: 0, target: l.target_ml || currentUser?.daily_water_target || 2000 };
        byDate[d].intake += Number(l.amount_ml || 0);
        // prefer the latest target if present
        if (l.target_ml) byDate[d].target = l.target_ml;
      });

      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const item = byDate[dateStr] || { intake: 0, target: currentUser?.daily_water_target || 2000 };
        dates.push({ date: label, intake: item.intake, target: item.target });
      }
      setWeeklyData(dates);

    } catch (error) {
      toast.error("Failed to load water data.");
      console.error('Load error:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRecalculateGoal = async () => {
    if (!profile.age || !profile.weight_kg) {
      toast.error("Please complete your Age and Weight in Settings to get a personalized goal.");
      return;
    }
    const result = await calculateWaterNeeds(profile.age, profile.weight_kg, profile.activity_level, profile.climate);
    if (result) {
      setWaterTarget(result.recommended_intake_ml);
      setAiExplanation(result.explanation);
      setAiTips(Array.isArray(result.hydration_tips) ? result.hydration_tips : []);
      await User.updateMyUserData({ 
        daily_water_target: result.recommended_intake_ml,
        age: Number(profile.age),
        weight_kg: Number(profile.weight_kg),
        activity_level: profile.activity_level,
        climate: profile.climate
      });
      toast.success("Your personalized water goal has been updated!");
      // Refresh weekly chart targets with new goal for upcoming days
      loadWaterData();
    }
  };

  const addWater = async (amount) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await WaterLog.create({
        amount_ml: amount,
        log_date: today,
        log_time: new Date().toISOString(),
        target_ml: waterTarget,
      });

      // Refresh data from database to ensure consistency
      await loadWaterData();
      toast.success(`💧 Added ${amount}ml of water!`);
      setCustomAmount('');
    } catch (error) {
      toast.error('Failed to log water intake.');
      console.error('Add error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustom = () => {
    const val = Number(customAmount);
    if (!val || val <= 0) {
      toast.error("Enter a valid amount (ml)");
      return;
    }
    addWater(val);
  };

  const deleteWaterLog = async (logId) => {
    if (deletingIds.has(logId)) return; // Prevent multiple delete attempts

    setDeletingIds(prev => new Set(prev).add(logId)); // Add to deleting set

    try {
        await WaterLog.delete(logId); // Perform API call
        
        // Refresh data from database to ensure consistency
        await loadWaterData();
        toast.success(`Water log removed`);

    } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete water log. Refreshing data...');
        // On failure, reload all data to ensure consistency
        await loadWaterData();
    } finally {
        setDeletingIds(prev => {
            const n = new Set(prev);
            n.delete(logId);
            return n;
        });
    }
  };

  const achieved = waterIntake >= waterTarget;

  const computeStreak = () => {
    // Count consecutive days from today backwards where intake >= target
    let streak = 0;
    // We built weeklyData oldest->newest; ensure we end with newest
    const series = weeklyData;
    for (let i = series.length - 1; i >= 0; i--) {
      const d = series[i];
      if ((d?.intake || 0) >= (d?.target || waterTarget)) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  };

  const copySummary = async () => {
    const avg = Math.round(
      (weeklyData.reduce((s, d) => s + (d.intake || 0), 0) / Math.max(weeklyData.length, 1))
    );
    const streak = computeStreak();
    const txt = `Hydration Summary
- Today: ${waterIntake} / ${waterTarget} ml (${Math.round(Math.min(100, (waterIntake / Math.max(1, waterTarget)) * 100))}%)
- 7-day average: ${avg} ml
- Current streak (meeting goal): ${streak} day(s)
${aiExplanation ? `- AI Note: ${aiExplanation}` : ''}${aiTips?.length ? `\nTips: ${aiTips.slice(0,3).map((t,i)=>`${i+1}. ${t}`).join(' ')}` : ''}`;
    try {
      await navigator.clipboard.writeText(txt);
      toast.success("Summary copied");
    } catch {
      toast.error("Could not copy summary");
    }
  };

  const handleExport = async () => {
    const today = { intake: waterIntake, target: waterTarget };
    const { data } = await exportWaterReport({
      today,
      weekly: weeklyData,
      tips: aiTips
    });
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hydration_report.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const waterProgress = Math.min(1, waterIntake / waterTarget);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent mb-2">
          Hydration Hub 💧
        </h1>
        <p className="text-lg text-slate-500">Your personal space to track and optimize hydration.</p>
      </motion.div>

      {/* Celebration banner */}
      {achieved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold">Goal Achieved</div>
              <div className="text-sm opacity-90">You reached your {waterTarget} ml target today. Great job!</div>
            </div>
          </div>
          <div className="hidden sm:block text-sm opacity-90">Keep the streak going!</div>
        </motion.div>
      )}

      {/* Progress + Quick Add */}
      <ContentCard className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
          <div className="flex-shrink-0">
            <WaterBottleAnimation progress={waterProgress} />
          </div>
          <div className="flex-1 text-center space-y-4 w-full">
            <div>
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {waterIntake} <span className="text-2xl">ml</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400">of {waterTarget}ml goal</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[200, 250, 300, 500, 750].map(a => (
                <Button
                  key={a}
                  size="sm"
                  onClick={() => addWater(a)}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                >
                  +{a}ml
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
              <Input
                placeholder="Custom ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                type="number"
                className="dark:bg-slate-700/50"
              />
              <Button onClick={handleAddCustom} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* AI personalization */}
      <ContentCard className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Sparkles className="text-amber-400" /> AI Personalization</h3>
        {aiExplanation && (
          <motion.div initial={{opacity:0, y: -10}} animate={{opacity:1, y:0}} className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
            {aiExplanation}
          </motion.div>
        )}
        {aiTips && aiTips.length > 0 && (
          <div className="grid gap-2 mb-4">
            {aiTips.slice(0,5).map((tip, idx) => (
              <div key={idx} className="text-sm text-slate-700 dark:text-slate-300">• {tip}</div>
            ))}
          </div>
        )}
        {/* ... keep existing code (selectors and recalc button) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
          {/* ... keep existing code (left selectors) ... */}
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Activity Level</Label>
              <Select value={profile.activity_level} onValueChange={(v) => setProfile(p => ({...p, activity_level: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Your Climate</Label>
              <Select value={profile.climate} onValueChange={(v) => setProfile(p => ({...p, climate: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 text-center md:text-left">Based on your age ({profile.age || 'N/A'}) and weight ({profile.weight_kg || 'N/A'} kg)</p>
            <Button 
              onClick={handleRecalculateGoal} 
              disabled={isAiLoading} 
              size="lg" 
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform"
            >
              {isAiLoading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Sparkles className="mr-2 w-4 h-4" />}
              Calculate My Personalized Goal
            </Button>
          </div>
        </div>
      </ContentCard>

      {/* Weekly chart */}
      <ContentCard className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Weekly Hydration</h3>
        <WeeklyHydrationChart data={weeklyData} />
      </ContentCard>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={copySummary}>
          <Clipboard className="w-4 h-4 mr-2" />
          Copy Summary
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <SaveToDashboardButton 
          itemData={{
            title: `Hydration - ${new Date().toLocaleDateString()}`,
            content: `${waterIntake}/${waterTarget} ml • ${Math.round(waterProgress*100)}% of goal`,
            details: { weeklyData, aiExplanation, aiTips, waterIntake, waterTarget },
            source_page: "Water",
            icon: "Droplet"
          }}
        />
      </div>

      {/* Today's log list */}
      <ContentCard className="p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Today's Log</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {history.length > 0 ? (
            history.map((log, index) => (
              <motion.div 
                key={log.id || `temp-${index}`} 
                className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">{log.amount_ml}ml</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {log.log_time ? new Date(log.log_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  {log.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWaterLog(log.id)}
                      disabled={deletingIds.has(log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 p-1 h-8 w-8 disabled:opacity-50"
                    >
                      {deletingIds.has(log.id) ? 
                        <Loader2 className="w-3 h-3 animate-spin" /> : 
                        <Trash2 className="w-3 h-3" />
                      }
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">No water logged yet today.</p>
          )}
        </div>
      </ContentCard>
    </div>
  );
}
