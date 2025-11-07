import React from 'react';
import { Globe, Palette, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ContentCard from '@/components/ContentCard';
import ThemeToggle from '../ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GeneralSettings({ theme, onThemeChange, locale, onLocaleChange }) {
  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { value: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
    { value: 'fr', label: 'Français (French)', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
    { value: 'pt', label: 'Português (Portuguese)', flag: '🇵🇹' },
  ];

  return (
    <ContentCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">General Settings</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Customize your experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Setting */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <Palette className="w-4 h-4 inline mr-2" />
            Theme Preference
          </label>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          </div>
        </div>

        {/* Language Setting */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            <Globe className="w-4 h-4 inline mr-2" />
            Language
          </label>
          <Select value={locale} onValueChange={onLocaleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Change the app language (some features may remain in English)
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 my-6" />

        {/* Additional Settings */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications & Privacy
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Wellness Tips</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive daily health tips</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Product Updates</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get notified about new features</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Data Analytics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Help us improve with usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}