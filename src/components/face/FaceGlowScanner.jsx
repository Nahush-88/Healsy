
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Sparkles, Loader2, Download, Save, Star, Zap, Heart, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Eye, Droplet, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { UsageTracker } from '@/components/UsageTracker';
import { toast } from 'sonner';
import LoadingAnalysis from '@/components/LoadingAnalysis';
import CameraCaptureModal from '@/components/CameraCaptureModal';
import SaveToDashboardButton from '@/components/SaveToDashboardButton';
import GradientCard from '@/components/GradientCard';
import { format } from 'date-fns';

// Floating glow particles
const GlowParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: `radial-gradient(circle, ${['#FFD700', '#FFC0CB', '#87CEEB', '#98FB98'][i % 4]}, transparent)`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 1, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Issue Badge Component
const IssueBadge = ({ issue, severity }) => {
  const severityColors = {
    mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    severe: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  };

  return (
    <Badge className={`${severityColors[severity] || severityColors.mild} px-3 py-1`}>
      {issue}
    </Badge>
  );
};

// Remedy Card Component
const RemedyCard = ({ remedy, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-violet-900/20 rounded-xl p-5 border-2 border-violet-200 dark:border-violet-700 shadow-lg hover:shadow-xl transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{remedy.name}</h4>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold text-violet-600 dark:text-violet-400">Ingredients:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-1">{remedy.ingredients}</p>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 pt-2"
                >
                  <div>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">How to Apply:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{remedy.application}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">Frequency:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1">{remedy.frequency}</p>
                  </div>

                  {remedy.benefits && (
                    <div>
                      <span className="font-semibold text-violet-600 dark:text-violet-400">Benefits:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">{remedy.benefits}</p>
                    </div>
                  )}

                  {remedy.caution && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">{remedy.caution}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-2 text-xs text-violet-600 dark:text-violet-400">
              <span>{expanded ? '▼ Click to collapse' : '▶ Click for details'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function FaceGlowScanner({ user, onAnalysisComplete }) {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImage(file_url);
      toast.success('✨ Photo uploaded! Ready to analyze your glow');
    } catch (error) {
      toast.error('Upload failed. Please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async (capturedImage) => {
    setImage(capturedImage);
    setShowCamera(false);
    toast.success('📸 Photo captured! Ready for glow analysis');
  };

  const analyzeGlow = async () => {
    if (!image) {
      toast.error('Please upload or take a photo first');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('face_analyses');
    if (!usage.allowed) {
      toast.error('Daily limit reached. Upgrade to Premium!');
      return;
    }

    setAnalyzing(true);
    try {
      toast.info('✨ AI is analyzing your skin for glow...');

      const result = await InvokeLLM({
        prompt: `You are an expert dermatologist and skincare specialist with 20+ years of experience. Analyze this face photo in extreme detail and provide comprehensive, actionable advice.

CRITICAL ANALYSIS REQUIRED:
1. Scan for ALL skin issues: pimples, acne, blackheads, whiteheads, dark spots, pigmentation, fine lines, wrinkles, dullness, uneven tone, redness, dryness, oiliness
2. Assess skin texture, pores, hydration levels, elasticity, and overall glow
3. Identify problem areas with precision (forehead, cheeks, nose, chin, under-eyes)
4. Rate severity of each issue (mild/moderate/severe)

PROVIDE:
- Ultra-detailed skin assessment with specific locations of issues
- Glow score (0-100) based on radiance, texture, hydration, clarity
- Hydration score, texture score, clarity score (0-100 each)
- 8-12 POWERFUL homemade remedies with exact measurements
- Each remedy must include: ingredients (exact amounts), application method, frequency, benefits, caution
- Professional skincare routine (morning & night) with product types
- Diet recommendations for glowing skin
- Lifestyle tips (sleep, stress, exercise, hydration)
- Quick glow hacks for instant results
- 7-day transformation plan with daily steps
- Expected timeline for visible results

Be EXTREMELY specific, practical, and encouraging. Focus on natural, affordable, easily available ingredients. Give hope and actionable steps!`,
        file_urls: [image],
        response_json_schema: {
          type: 'object',
          properties: {
            overall_assessment: { type: 'string' },
            glow_score: { type: 'number' },
            hydration_score: { type: 'number' },
            texture_score: { type: 'number' },
            clarity_score: { type: 'number' },
            skin_issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  issue: { type: 'string' },
                  severity: { type: 'string' },
                  location: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            homemade_remedies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  ingredients: { type: 'string' },
                  application: { type: 'string' },
                  frequency: { type: 'string' },
                  benefits: { type: 'string' },
                  caution: { type: 'string' }
                }
              }
            },
            professional_routine: {
              type: 'object',
              properties: {
                morning: { type: 'array', items: { type: 'string' } },
                night: { type: 'array', items: { type: 'string' } }
              }
            },
            diet_recommendations: { type: 'array', items: { type: 'string' } },
            lifestyle_tips: { type: 'array', items: { type: 'string' } },
            quick_glow_hacks: { type: 'array', items: { type: 'string' } },
            transformation_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  morning: { type: 'string' },
                  evening: { type: 'string' },
                  tip: { type: 'string' }
                }
              }
            },
            expected_results: { type: 'string' }
          }
        }
      });

      setAnalysis(result);
      toast.success('🎉 Analysis complete! Check out your personalized glow roadmap');
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-6">
      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}

      {!analysis && !analyzing && (
        <GradientCard tone="amber">
          <div className="text-center space-y-6 relative">
            <GlowParticles />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl mb-6"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                ✨ Face Glow Scanner
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                AI-Powered Skin Analysis & Glow Tips
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-2xl mx-auto">
                Get instant analysis of pimples, dark spots, dullness & more with personalized homemade remedies and professional skincare advice
              </p>
            </div>

            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md mx-auto"
              >
                <img
                  src={image}
                  alt="Your photo"
                  className="w-full h-96 object-cover rounded-2xl border-2 border-amber-300 dark:border-amber-700 shadow-2xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetAnalysis}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto relative z-10">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors cursor-pointer group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-3">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Upload Photo
                  </span>
                </div>
              </motion.label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCamera(true)}
                className="p-6 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <Camera className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Take Photo
                  </span>
                </div>
              </motion.button>
            </div>

            {image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <Button
                  onClick={analyzeGlow}
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xl hover:shadow-3xl px-8 py-6 text-lg"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Analyze My Glow Now
                </Button>
              </motion.div>
            )}

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto relative z-10 pt-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <Eye className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Deep Analysis</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Pimples, spots, texture & more</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <Sparkles className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Homemade Remedies</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Natural, affordable solutions</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">7-Day Plan</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Step-by-step transformation</p>
              </div>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Loading */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GradientCard tone="amber">
              <LoadingAnalysis
                message="AI is deeply analyzing your skin... Checking for pimples, dark spots, texture, hydration, and overall glow..."
                category="face_glow"
                showProgress={true}
                duration={18000}
              />
            </GradientCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Scores */}
            <GradientCard tone="amber">
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-3 mb-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Glow Score: {analysis.glow_score}/100
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Your AI-powered skin analysis</p>
                    </div>
                  </motion.div>
                  
                  <p className="text-slate-700 dark:text-slate-300 text-lg max-w-3xl mx-auto">
                    {analysis.overall_assessment}
                  </p>
                </div>

                {/* Score Meters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">Hydration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.hydration_score} className="flex-1 h-3" />
                      <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{analysis.hydration_score}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">Texture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.texture_score} className="flex-1 h-3" />
                      <span className="font-bold text-xl text-purple-600 dark:text-purple-400">{analysis.texture_score}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">Clarity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.clarity_score} className="flex-1 h-3" />
                      <span className="font-bold text-xl text-green-600 dark:text-green-400">{analysis.clarity_score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GradientCard>

            {/* Skin Issues */}
            {analysis.skin_issues && analysis.skin_issues.length > 0 && (
              <GradientCard tone="red">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Skin Issues Detected
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.skin_issues.map((issue, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <IssueBadge issue={issue.issue} severity={issue.severity} />
                              <Badge variant="outline">{issue.location}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{issue.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GradientCard>
            )}

            {/* Homemade Remedies */}
            {analysis.homemade_remedies && analysis.homemade_remedies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    🌿 Powerful Homemade Remedies
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Natural, affordable solutions you can make at home. Click each card for full details!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.homemade_remedies.map((remedy, idx) => (
                    <RemedyCard key={idx} remedy={remedy} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Professional Routine */}
            {analysis.professional_routine && (
              <GradientCard tone="blue">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Professional Skincare Routine
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Morning Routine</h4>
                      </div>
                      <ol className="space-y-2">
                        {analysis.professional_routine.morning?.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Night Routine</h4>
                      </div>
                      <ol className="space-y-2">
                        {analysis.professional_routine.night?.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </GradientCard>
            )}

            {/* Diet & Lifestyle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.diet_recommendations && analysis.diet_recommendations.length > 0 && (
                <GradientCard tone="green">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Diet for Glowing Skin
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.diet_recommendations.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GradientCard>
              )}

              {analysis.lifestyle_tips && analysis.lifestyle_tips.length > 0 && (
                <GradientCard tone="purple">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Lifestyle Tips
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.lifestyle_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GradientCard>
              )}
            </div>

            {/* Quick Glow Hacks */}
            {analysis.quick_glow_hacks && analysis.quick_glow_hacks.length > 0 && (
              <GradientCard tone="amber">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      ⚡ Quick Glow Hacks
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.quick_glow_hacks.map((hack, idx) => (
                      <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{hack}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientCard>
            )}

            {/* 7-Day Transformation Plan */}
            {analysis.transformation_plan && analysis.transformation_plan.length > 0 && (
              <GradientCard tone="violet">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      📅 Your 7-Day Glow Transformation Plan
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.transformation_plan.map((day, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-700"
                      >
                        <h4 className="font-bold text-lg text-violet-600 dark:text-violet-400 mb-2">{day.day}</h4>
                        <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          <p><strong>Morning:</strong> {day.morning}</p>
                          <p><strong>Evening:</strong> {day.evening}</p>
                          <p className="text-violet-600 dark:text-violet-400"><strong>💡 Tip:</strong> {day.tip}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GradientCard>
            )}

            {/* Expected Results */}
            {analysis.expected_results && (
              <GradientCard tone="green">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      🎯 Expected Results Timeline
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">{analysis.expected_results}</p>
                  </div>
                </div>
              </GradientCard>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={resetAnalysis} size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                Analyze Another Photo
              </Button>
              <SaveToDashboardButton
                title={`Face Glow Analysis - ${format(new Date(), 'MMM d, yyyy')}`}
                content={`Glow Score: ${analysis.glow_score}/100 - ${analysis.skin_issues?.length || 0} issues detected`}
                details={analysis}
                sourcePage="Face Glow"
                icon="Sparkles"
              />
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
