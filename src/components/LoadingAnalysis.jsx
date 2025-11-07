import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Heart, Star, Loader2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// MULTI-LANGUAGE LOADING MESSAGES
const loadingTranslations = {
  en: {
    messages: [
      { text: "AI analyzing...", icon: Brain },
      { text: "Processing patterns...", icon: Zap },
      { text: "Generating insights...", icon: Sparkles },
      { text: "Finalizing results...", icon: Heart },
      { text: "Almost ready...", icon: Star },
    ],
    aiWorking: "Our AI is working hard to give you the best personalized insights ✨",
    complete: "complete"
  },
  hi: {
    messages: [
      { text: "एआई विश्लेषण कर रहा है...", icon: Brain },
      { text: "पैटर्न प्रोसेस कर रहे हैं...", icon: Zap },
      { text: "अंतर्दृष्टि उत्पन्न कर रहे हैं...", icon: Sparkles },
      { text: "परिणाम अंतिम रूप दे रहे हैं...", icon: Heart },
      { text: "लगभग तैयार...", icon: Star },
    ],
    aiWorking: "हमारा AI आपको सर्वोत्तम व्यक्तिगत अंतर्दृष्टि देने के लिए कड़ी मेहनत कर रहा है ✨",
    complete: "पूर्ण"
  },
  es: {
    messages: [
      { text: "IA analizando...", icon: Brain },
      { text: "Procesando patrones...", icon: Zap },
      { text: "Generando información...", icon: Sparkles },
      { text: "Finalizando resultados...", icon: Heart },
      { text: "Casi listo...", icon: Star },
    ],
    aiWorking: "Nuestra IA está trabajando duro para darte los mejores conocimientos personalizados ✨",
    complete: "completo"
  },
  fr: {
    messages: [
      { text: "IA en cours d'analyse...", icon: Brain },
      { text: "Traitement des modèles...", icon: Zap },
      { text: "Génération d'informations...", icon: Sparkles },
      { text: "Finalisation des résultats...", icon: Heart },
      { text: "Presque prêt...", icon: Star },
    ],
    aiWorking: "Notre IA travaille dur pour vous donner les meilleures informations personnalisées ✨",
    complete: "terminé"
  },
  de: {
    messages: [
      { text: "KI analysiert...", icon: Brain },
      { text: "Muster werden verarbeitet...", icon: Zap },
      { text: "Erkenntnisse werden generiert...", icon: Sparkles },
      { text: "Ergebnisse werden finalisiert...", icon: Heart },
      { text: "Fast fertig...", icon: Star },
    ],
    aiWorking: "Unsere KI arbeitet hart daran, Ihnen die besten personalisierten Einblicke zu geben ✨",
    complete: "vollständig"
  },
  pt: {
    messages: [
      { text: "IA analisando...", icon: Brain },
      { text: "Processando padrões...", icon: Zap },
      { text: "Gerando insights...", icon: Sparkles },
      { text: "Finalizando resultados...", icon: Heart },
      { text: "Quase pronto...", icon: Star },
    ],
    aiWorking: "Nossa IA está trabalhando duro para dar a você os melhores insights personalizados ✨",
    complete: "completo"
  },
  ar: {
    messages: [
      { text: "الذكاء الاصطناعي يحلل...", icon: Brain },
      { text: "معالجة الأنماط...", icon: Zap },
      { text: "توليد الرؤى...", icon: Sparkles },
      { text: "وضع اللمسات الأخيرة على النتائج...", icon: Heart },
      { text: "جاهز تقريبا...", icon: Star },
    ],
    aiWorking: "يعمل الذكاء الاصطناعي لدينا بجد لمنحك أفضل الأفكار الشخصية ✨",
    complete: "مكتمل"
  },
  zh: {
    messages: [
      { text: "AI分析中...", icon: Brain },
      { text: "处理模式中...", icon: Zap },
      { text: "生成见解中...", icon: Sparkles },
      { text: "完成结果中...", icon: Heart },
      { text: "即将完成...", icon: Star },
    ],
    aiWorking: "我们的AI正在努力为您提供最佳的个性化见解 ✨",
    complete: "完成"
  }
};

export default function LoadingAnalysis({ 
  message: customMessage,
  language = "en",
  category = "analysis",
  showProgress = true,
  duration = 8000
}) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const translations = loadingTranslations[language] || loadingTranslations.en;
  const messages = translations.messages;

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1600);

    return () => clearInterval(messageInterval);
  }, [messages.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (100 - prev) * 0.1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const currentMessage = messages[currentMessageIndex];
  const MessageIcon = currentMessage.icon;

  const languageFlags = {
    en: "🇺🇸",
    hi: "🇮🇳",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇵🇹",
    ar: "🇸🇦",
    zh: "🇨🇳"
  };

  // Ensure progress is always positive
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[400px] relative py-12"
    >
      {/* Ambient background glow - FIXED */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-96 h-96 rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
      </div>

      {/* Main loading circle */}
      <div className="relative z-10 mb-8">
        {/* Rotating rings using CSS animation */}
        <div className="absolute inset-0 w-[160px] h-[160px]">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-purple-500 animate-spin" />
        </div>
        <div className="absolute inset-0 w-[160px] h-[160px]">
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-500 border-l-blue-500"
            style={{ animation: 'spin 2s linear infinite reverse' }}
          />
        </div>

        {/* Inner pulsing circle - FIXED */}
        <motion.div 
          className="w-[160px] h-[160px] rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-violet-300/30 dark:border-violet-700/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        >
          <MessageIcon className="w-16 h-16 text-violet-600 dark:text-violet-400" />
        </motion.div>
      </div>

      {/* Language Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-base px-6 py-2 shadow-lg">
          <Globe className="w-4 h-4 mr-2" />
          <span className="mr-2">{languageFlags[language]}</span>
          {language.toUpperCase()}
        </Badge>
      </motion.div>

      {/* Loading message */}
      <div className="mt-4 text-center relative z-10 max-w-2xl px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Loader2 className="w-6 h-6 text-violet-600 dark:text-violet-400 animate-spin" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {customMessage || currentMessage.text}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar - FIXED */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ duration: 0.3 }}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full shadow-lg relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${safeProgress}%` }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="absolute inset-0 shimmer-effect"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s linear infinite'
                  }}
                />
              </motion.div>
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-3">
              {Math.round(safeProgress)}% {translations.complete}
            </p>
          </motion.div>
        )}

        {/* Motivational subtext */}
        <p className="text-base text-slate-600 dark:text-slate-400 mt-6 leading-relaxed">
          {translations.aiWorking}
        </p>
      </div>

      {/* Decorative elements - FIXED */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "loop",
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}