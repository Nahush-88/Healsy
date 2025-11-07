import React from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentCard from '../ContentCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from '../providers/TranslationProvider';

export default function AccountActions({ user, onLogout }) {
  const { t } = useTranslation();

  return (
    <ContentCard>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('settings.account')}</h3>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">{t('settings.logged_in_as', { email: user.email })}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex="0">
                  <Button variant="outline" className="dark:text-white w-full sm:w-auto" disabled>
                    <Shield className="w-4 h-4 mr-2" />{t('settings.change_password')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Password is managed by your login provider (e.g., Google).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="destructive" onClick={onLogout} className="sm:ml-auto">
            <LogOut className="w-4 h-4 mr-2" />
            {t('settings.logout')}
          </Button>
        </div>
      </div>
    </ContentCard>
  );
}