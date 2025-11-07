import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { User } from '@/entities/User';
import get from 'lodash/get';

const TranslationContext = createContext();

const loadLocaleData = (locale) => {
  switch (locale) {
    case 'hi':
      return import('../locales/hi');
    case 'es':
      return import('../locales/es');
    // Note: Add 'mr' and 'ta' cases here when translations are ready
    default:
      return import('../locales/en');
  }
};

export const TranslationProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchUserAndTranslations = async () => {
      setIsLoaded(false);
      let loadedLocale = localStorage.getItem('healsy-locale') || 'en';
      try {
        const currentUser = await User.me();
        if (currentUser?.language) {
            loadedLocale = currentUser.language;
        }
      } catch (error) {
        console.log("User not logged in, using default language from storage.");
      }
      
      setLocale(loadedLocale);
      const localeData = await loadLocaleData(loadedLocale);
      setTranslations(localeData.default);
      setIsLoaded(true);
    };
    fetchUserAndTranslations();
  }, []);

  const handleSetLocale = async (newLocale) => {
    if (newLocale === locale) return;
    
    setIsLoaded(false);
    setLocale(newLocale);
    localStorage.setItem('healsy-locale', newLocale);

    try {
      const localeData = await loadLocaleData(newLocale);
      setTranslations(localeData.default);
      await User.updateMyUserData({ language: newLocale });
    } catch (error) {
      console.error("Failed to update language:", error);
      const fallbackData = await loadLocaleData(locale); // Revert to old locale if update fails
      setTranslations(fallbackData.default);
    } finally {
      setIsLoaded(true);
    }
  };

  const t = useMemo(() => (key, params = {}) => {
    const translation = get(translations, key, key);
    if (typeof translation === 'string') {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(`{${paramKey}}`, paramValue);
      }, translation);
    }
    return translation;
  }, [translations]);

  const value = {
    locale,
    setLocale: handleSetLocale,
    t,
    isLoaded,
  };

  if (!isLoaded) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
            <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};