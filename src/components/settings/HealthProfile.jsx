
import React, { useState, useEffect } from 'react';
import { Heart, Activity, Target, TrendingUp, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function HealthProfile({ user, onSave }) {
  const [formData, setFormData] = useState({
    age: '',
    weight_kg: '',
    activity_level: 'moderate',
    climate: 'temperate',
    goals: [],
    interests: [],
    bio: '',
    daily_water_target: 2000,
    daily_calorie_target: 2000,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || '',
        weight_kg: user.weight_kg || '',
        activity_level: user.activity_level || 'moderate',
        climate: user.climate || 'temperate',
        goals: user.goals || [],
        interests: user.interests || [],
        bio: user.bio || '',
        daily_water_target: user.daily_water_target || 2000,
        daily_calorie_target: user.daily_calorie_target || 2000,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-700/50 shadow-xl p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Health Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Customize your wellness journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Age */}
          <div>
            <Label htmlFor="age" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Age
            </Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="25"
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500"
            />
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="70"
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500"
            />
          </div>

          {/* Activity Level */}
          <div>
            <Label htmlFor="activity" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Activity Level
            </Label>
            <Select
              value={formData.activity_level}
              onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
            >
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Climate */}
          <div>
            <Label htmlFor="climate" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Climate
            </Label>
            <Select
              value={formData.climate}
              onValueChange={(value) => setFormData({ ...formData, climate: value })}
            >
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold">Cold Climate</SelectItem>
                <SelectItem value="temperate">Temperate Climate</SelectItem>
                <SelectItem value="hot">Hot Climate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Daily Water Target */}
          <div>
            <Label htmlFor="water" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              💧 Daily Water Target (ml)
            </Label>
            <Input
              id="water"
              type="number"
              value={formData.daily_water_target}
              onChange={(e) => setFormData({ ...formData, daily_water_target: parseInt(e.target.value) })}
              placeholder="2000"
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500"
            />
          </div>

          {/* Daily Calorie Target */}
          <div>
            <Label htmlFor="calories" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
              🔥 Daily Calorie Target
            </Label>
            <Input
              id="calories"
              type="number"
              value={formData.daily_calorie_target}
              onChange={(e) => setFormData({ ...formData, daily_calorie_target: parseInt(e.target.value) })}
              placeholder="2000"
              className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Personal Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself and your wellness journey..."
            className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 h-24"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 shadow-lg"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
