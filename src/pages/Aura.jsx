
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Mic, Sparkles, Loader2, Share2, Download, Crown, Zap, Heart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAI } from '../components/useAI';
import ContentCard from '../components/ContentCard';
import { UsageTracker } from '../components/UsageTracker';
import UsageLimitPopup from '../components/UsageLimitPopup';
import { UploadFile } from '@/integrations/Core';
import { User } from '@/entities/User';
import { HealthLog } from '@/entities/HealthLog';
import SaveToDashboardButton from '../components/SaveToDashboardButton';
import CameraCaptureModal from '../components/CameraCaptureModal';
import AuraColorDonut from '../components/aura/AuraColorDonut';
import ChakraMeter from '../components/aura/ChakraMeter';
import PremiumFeatureCard from '../components/aura/PremiumFeatureCard';
import AuraShareGenerator from '../components/aura/AuraShareGenerator';
import VoiceRecorder from '../components/VoiceRecorder';
import LoadingAnalysis from '../components/LoadingAnalysis';

const PremiumPaywallLazy = lazy(() => import('../components/PremiumPaywall'));

// Simplified particle animation - FIXED
const SimpleParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-violet-400"
        style={{
          left: `${(i * 8 + 10) % 90}%`,
          top: `${(i * 12 + 10) % 90}%`,
        }}
        animate={{
          y: [-10, 0, -10],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 3 + (i % 3),
          repeat: Infinity,
          repeatType: "loop",
          delay: i * 0.3,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export default function Aura() {
  const { analyzeAura, isLoading } = useAI();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [user, setUser] = useState(null);
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImageUrl(file_url);
      setImageFile(file);
      toast.success('Photo uploaded! Ready to scan your aura ✨');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = (url) => {
    setImageUrl(url);
    setShowCamera(false);
    toast.success('Photo captured! Ready to scan your aura ✨');
  };

  const handleVoiceComplete = (url) => {
    setVoiceUrl(url);
    setShowVoiceRecorder(false);
    toast.success('Voice recorded! Add a photo to complete your scan ✨');
  };

  const scanAura = async () => {
    if (!imageUrl) {
      toast.error('Please upload or capture a photo first');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('aura_scans');
    if (!usage.allowed) {
      setUsageInfo(usage);
      setShowUsagePopup(true);
      return;
    }

    try {
      toast.info('✨ Scanning your aura energy field...');
      setAnalysis(null);
      const result = await analyzeAura(imageUrl, voiceUrl);
      setAnalysis(result);
      toast.success('🌟 Your aura has been revealed!');
    } catch (err) {
      console.error(err);
      toast.error('Aura scan failed. Please try again.');
    }
  };

  const saveToLog = async () => {
    if (!analysis || !user) return;
    try {
      await HealthLog.create({
        log_type: 'aura',
        log_date: new Date().toISOString(),
        title: `Aura Reading - ${analysis.aura_color}`,
        data: { imageUrl, analysis, voiceUrl },
        user_email: user.email,
      });
      toast.success('Aura reading saved to Health Log');
    } catch (err) {
      toast.error('Failed to save aura reading');
    }
  };

  const premiumFeatures = [
    {
      title: 'Aura History Tracker',
      description: 'Track your aura changes daily/weekly and see your spiritual growth journey',
      icon: '📊',
      locked: !user?.is_premium,
    },
    {
      title: 'Aura Compatibility',
      description: 'Compare your aura with friends or partner and discover your energetic harmony',
      icon: '❤️',
      locked: !user?.is_premium,
    },
    {
      title: 'Lucky Color of the Day',
      description: 'Get daily color recommendations for fashion, decor, and energy alignment',
      icon: '🌟',
      locked: !user?.is_premium,
    },
    {
      title: 'Healing Suggestions',
      description: 'Personalized foods, yoga poses, mantras, and crystals for aura balance',
      icon: '🌿',
      locked: !user?.is_premium,
    },
  ];

  return (
    <>
      {showUsagePopup && (
        <UsageLimitPopup
          feature="aura_scans"
          usageInfo={usageInfo}
          onClose={() => setShowUsagePopup(false)}
          onUpgrade={() => {
            setShowUsagePopup(false);
            setShowPaywall(true);
          }}
        />
      )}
      
      <AnimatePresence>
        {showPaywall && (
          <Suspense fallback={null}>
            <PremiumPaywallLazy onClose={() => setShowPaywall(false)} feature="Unlimited Aura Scans" />
          </Suspense>
        )}
      </AnimatePresence>

      <CameraCaptureModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        overlay="aura"
      />

      <VoiceRecorder
        open={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onRecordComplete={handleVoiceComplete}
        title="Voice Aura Scan"
      />

      <div className="space-y-8 relative">
        <SimpleParticles />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ✨ Aura Energy Scan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover your spiritual energy, aura colors, chakra balance, and receive personalized healing guidance
          </p>
        </motion.div>

        {/* Upload Section */}
        {!analysis && !isLoading && (
          <ContentCard className="glow-border">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Capture Your Energy Field
              </h2>

              {imageUrl && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full max-w-md mx-auto"
                >
                  <div className="relative rounded-2xl overflow-hidden border-2 border-violet-300 dark:border-violet-700 shadow-2xl">
                    <img
                      src={imageUrl}
                      alt="Your photo"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-radial from-violet-500/20 via-purple-500/10 to-transparent" />
                      <motion.div
                        className="absolute inset-0"
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          background: "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.3), transparent 60%)"
                        }}
                      />
                    </div>
                  </div>
                  {voiceUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Voice scan added ✓</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {!imageUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <motion.label
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass glow-border p-6 rounded-2xl cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-3">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-violet-500 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Upload Photo</span>
                      <span className="text-xs text-slate-500">From gallery</span>
                    </div>
                  </motion.label>

                  <motion.button
                    onClick={() => setShowCamera(true)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass glow-border p-6 rounded-2xl group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Camera className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Take Photo</span>
                      <span className="text-xs text-slate-500">Live capture</span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowVoiceRecorder(true)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass glow-border p-6 rounded-2xl group relative"
                  >
                    {voiceUrl && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <Mic className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Voice Scan</span>
                      <span className="text-xs text-slate-500">{voiceUrl ? 'Recorded' : 'Record now'}</span>
                    </div>
                  </motion.button>
                </div>
              )}

              {imageUrl && !isLoading && (
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={scanAura}
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Scan My Aura
                  </Button>
                  {!voiceUrl && (
                    <Button
                      variant="outline"
                      onClick={() => setShowVoiceRecorder(true)}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Add Voice
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImageUrl(null);
                      setImageFile(null);
                      setVoiceUrl(null);
                      setAnalysis(null);
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          </ContentCard>
        )}

        {/* Loading */}
        <AnimatePresence>
          {isLoading && !analysis && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ContentCard className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200/60 dark:border-purple-800/60">
                <LoadingAnalysis 
                  message="Scanning your aura energy field..."
                  category="aura"
                  showProgress={true}
                  duration={10000}
                />
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Main Aura Color Card */}
              <ContentCard className="glass glow-border premium-shimmer">
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-40 h-40 mx-auto"
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-3xl opacity-50"
                      style={{ backgroundColor: analysis.color_hex || "#FFD700" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${analysis.color_hex || "#FFD700"}, transparent 70%)`
                      }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-6xl"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                    >
                      ✨
                    </motion.div>
                  </motion.div>

                  <div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: analysis.color_hex || "#FFD700" }}>
                      {analysis.aura_color || "Golden"} Aura
                    </h2>
                    <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                      {analysis.spiritual_meaning || "Your aura radiates beautiful energy and spiritual light."}
                    </p>
                  </div>

                  {/* Aura Strength Meter */}
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Aura Strength</span>
                      <span className="font-bold">{analysis.aura_strength || 92}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.aura_strength || 92}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      />
                    </div>
                  </div>

                  {/* Energy Keywords */}
                  {analysis.energy_keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {analysis.energy_keywords.map((keyword, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 font-semibold text-sm"
                        >
                          {keyword}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </ContentCard>

              {/* Aura Color Distribution + Chakra */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ContentCard className="glass">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-violet-500" />
                    Energy Color Distribution
                  </h3>
                  <AuraColorDonut analysis={analysis} />
                </ContentCard>

                <ContentCard className="glass">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-500" />
                    Chakra Balance
                  </h3>
                  <ChakraMeter analysis={analysis} />
                </ContentCard>
              </div>

              {/* Life Guidance */}
              {analysis.life_guidance && (
                <ContentCard className="glass">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    🌟 Your Spiritual Guidance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-bold text-violet-600 dark:text-violet-400">Meditation Practice</h4>
                      <p className="text-slate-700 dark:text-slate-300">{analysis.life_guidance.meditation_practice}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-purple-600 dark:text-purple-400">Daily Affirmation</h4>
                      <p className="text-slate-700 dark:text-slate-300 italic">"{analysis.life_guidance.affirmation}"</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Crystal Healing</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.life_guidance.crystal_healing?.map((crystal, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm">
                            {crystal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-emerald-600 dark:text-emerald-400">Energy Foods</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.life_guidance.energy_foods?.map((food, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ContentCard>
              )}

              {/* Past Life Insight */}
              {analysis.past_life_insight && (
                <ContentCard className="glass bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">🔮 Past Life Insight</h3>
                    <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                      {analysis.past_life_insight}
                    </p>
                  </div>
                </ContentCard>
              )}

              {/* Premium Features Grid */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                  ✨ Unlock Premium Aura Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {premiumFeatures.map((feature, idx) => (
                    <PremiumFeatureCard
                      key={idx}
                      feature={feature}
                      onUpgrade={() => setShowPaywall(true)}
                    />
                  ))}
                </div>
              </div>

              {/* Share Generator */}
              {imageUrl && (
                <ContentCard className="glass">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                    📸 Share Your Aura Glow
                  </h3>
                  <AuraShareGenerator
                    imageUrl={imageUrl}
                    analysis={analysis}
                  />
                </ContentCard>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={saveToLog} variant="outline">
                  Save to Health Log
                </Button>
                <SaveToDashboardButton
                  itemData={{
                    title: `Aura Reading - ${analysis.aura_color}`,
                    content: `${analysis.aura_color} aura with ${analysis.aura_strength}% strength`,
                    details: { imageUrl, analysis, voiceUrl },
                    source_page: "Aura",
                    icon: "Sparkles"
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysis(null);
                    setImageUrl(null);
                    setVoiceUrl(null);
                  }}
                >
                  Scan Another Aura
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
