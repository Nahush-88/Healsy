import { User } from '@/entities/User';

export class UsageTracker {
  static FEATURE_LIMITS = {
    // Limited Features - 5 uses per month for FREE users
    body_analyses: 5,
    aura_scans: 5,
    nutrition_analyses: 5,
    sleep_analyses: 5,
    mood_logs: 5,
    water_calculations: 5,
    meditation_sessions: 5,
    yoga_sessions: 5,
    journal_analyses: 5,
    exercise_plans: 5,
    
    // Save & Export - 3 uses per month for FREE users
    saved_items_count: 3,
    pdf_exports: 3,
    
    // Premium ONLY Features - 0 uses for FREE (completely blocked)
    face_analyses: 0,
    hairstyle_analyses: 0,
    skincare_analyses: 0,
    facial_exercises: 0,
    ai_coach_messages: 0,
    diet_plans: 0,
    recipe_generation: 0,
    meal_analysis: 0,
    meal_tracking: 0,
    diet_ai: 0,
    premium_challenges: 0,
    advanced_analytics: 0,
    custom_routines: 0
  };

  // Features that require premium subscription (completely blocked for free users)
  static PREMIUM_ONLY_FEATURES = [
    'face_analyses',
    'hairstyle_analyses',
    'skincare_analyses',
    'facial_exercises',
    'ai_coach_messages',
    'diet_plans',
    'recipe_generation',
    'meal_analysis',
    'meal_tracking',
    'diet_ai',
    'premium_challenges',
    'advanced_analytics',
    'custom_routines'
  ];

  static async getCurrentUsage(feature) {
    try {
      const user = await User.me();
      
      // ✨ PREMIUM USERS GET UNLIMITED EVERYTHING ✨
      if (user?.is_premium) {
        return {
          used: 0,
          remaining: 'unlimited',
          limit: 'unlimited',
          allowed: true,
          isPremium: true
        };
      }

      // Check if feature is premium-only (blocked for free users)
      if (this.PREMIUM_ONLY_FEATURES.includes(feature)) {
        return {
          used: 0,
          remaining: 0,
          limit: 0,
          allowed: false,
          requiresPremium: true,
          isPremium: false
        };
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const monthlyUsage = user?.monthly_usage || {};
      
      // Reset usage if it's a new month
      if (!monthlyUsage.month_start || monthlyUsage.month_start !== monthStart) {
        const resetUsage = { month_start: monthStart };
        Object.keys(this.FEATURE_LIMITS).forEach(key => {
          resetUsage[key] = 0;
        });
        
        await User.updateMyUserData({ monthly_usage: resetUsage });
        return {
          used: 0,
          remaining: this.FEATURE_LIMITS[feature] || 0,
          limit: this.FEATURE_LIMITS[feature] || 0,
          allowed: true,
          isPremium: false
        };
      }

      const used = monthlyUsage[feature] || 0;
      const limit = this.FEATURE_LIMITS[feature] || 0;
      const remaining = Math.max(0, limit - used);

      return {
        used,
        remaining,
        limit,
        allowed: used < limit,
        isPremium: false
      };
    } catch (error) {
      console.error('Error getting usage:', error);
      return {
        used: 999,
        remaining: 0,
        limit: 0,
        allowed: false,
        error: 'Failed to check usage limits',
        isPremium: false
      };
    }
  }

  static async checkAndUpdateUsage(feature) {
    try {
      const usage = await this.getCurrentUsage(feature);
      
      if (!usage.allowed) {
        return usage;
      }

      // If unlimited (premium), always allow
      if (usage.remaining === 'unlimited') {
        return usage;
      }

      // Update usage count for free users
      const user = await User.me();
      const monthlyUsage = { ...user.monthly_usage };
      monthlyUsage[feature] = (monthlyUsage[feature] || 0) + 1;
      
      await User.updateMyUserData({ monthly_usage: monthlyUsage });
      
      return {
        ...usage,
        used: monthlyUsage[feature],
        remaining: Math.max(0, usage.limit - monthlyUsage[feature])
      };
    } catch (error) {
      console.error('Error updating usage:', error);
      return {
        used: 999,
        remaining: 0,
        limit: 0,
        allowed: false,
        error: 'Failed to update usage'
      };
    }
  }

  static getTimeUntilReset() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
}