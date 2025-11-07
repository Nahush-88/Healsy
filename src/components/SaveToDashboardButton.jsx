
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Bookmark, Loader2, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import { SavedItem } from '@/entities/SavedItem';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Replace direct import with lazy loading
const PremiumPaywallLazy = lazy(() => import('./PremiumPaywall'));

const SAVE_LIMIT_FREE = 5;

export default function SaveToDashboardButton({ itemData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save items.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Premium users have unlimited saves
      if (user.is_premium) {
        await performSave();
        setIsSaving(false);
        return;
      }
      
      // Free user logic
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      let monthlyUsage = user.monthly_usage || {};
      
      // Reset usage if it's a new month
      if (monthlyUsage.month_start !== monthStart) {
        monthlyUsage = { ...monthlyUsage, month_start: monthStart, saved_items_count: 0 };
      }
      
      const currentSaves = monthlyUsage.saved_items_count || 0;

      if (currentSaves >= SAVE_LIMIT_FREE) {
        toast.error("Monthly save limit reached.", {
          description: `Upgrade to Premium for unlimited saves and insights.`,
          action: {
            label: "Upgrade",
            onClick: () => setShowPaywall(true),
          },
        });
        setIsSaving(false);
        return;
      }
      
      await performSave();
      
      // Update usage count for free user
      const updatedUsage = { ...monthlyUsage, saved_items_count: currentSaves + 1 };
      await User.updateMyUserData({ monthly_usage: updatedUsage });

    } catch (error) {
      console.error("Failed to save item:", error);
      toast.error("Could not save item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const performSave = async () => {
    await SavedItem.create({
      ...itemData,
      user_email: user.email,
    });
    setIsSaved(true);
    toast.success("Saved to Dashboard!");
  };

  if (isSaved) {
    return (
      <Button variant="outline" size="sm" disabled className="text-green-500 border-green-200 dark:text-green-400 dark:border-green-700">
        <Check className="w-4 h-4 mr-2" />
        Saved Successfully
      </Button>
    );
  }

  return (
    <>
      {showPaywall && (
        <Suspense fallback={null}>
          <PremiumPaywallLazy onClose={() => setShowPaywall(false)} feature="Unlimited Saves" />
        </Suspense>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bookmark className="w-4 h-4 mr-2" />
              )}
              Save to Dashboard
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save this analysis for later viewing on your Dashboard.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
