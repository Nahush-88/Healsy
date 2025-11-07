
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Sparkles, Loader2, RefreshCw, Eye, Brain, Smile, Heart, Target, Shield, Activity, Zap, TrendingUp, Sun, Moon, Droplet, Wind, Award, Star, CheckCircle, AlertCircle, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { UsageTracker } from '@/components/UsageTracker';
import { toast } from 'sonner';
import CameraCaptureModal from '@/components/CameraCaptureModal';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

export default function AdvancedFaceAnalyzer({ user, onAnalysisComplete }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImage(file_url);
      toast.success('📸 Photo uploaded! Ready for ultimate analysis');
    } catch (error) {
      toast.error('Upload failed. Please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = (capturedImage) => {
    setImage(capturedImage);
    setShowCamera(false);
    toast.success('📸 Photo captured! Ready for AI analysis');
  };

  const analyzeFace = async () => {
    if (!image) {
      toast.error('Please upload or capture a photo first');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('face_analyses');
    if (!usage.allowed) {
      toast.error('Usage limit reached. Upgrade to Premium!');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      toast.info('🎯 AI is performing deep face analysis...');

      const result = await InvokeLLM({
        prompt: `You are an ULTIMATE EXPERT in facial analysis with PhD-level knowledge in dermatology, facial aesthetics, and health assessment.

Perform ULTRA-DEEP ADVANCED ANALYSIS of this face photo:

🎯 FACE LANDMARKS & STRUCTURE:
- Detect and analyze ALL facial landmarks: eyes, eyebrows, nose, lips, jawline, cheekbones, forehead
- Face shape classification (oval, square, round, diamond, heart, oblong)
- Symmetry score (0-100)
- Golden ratio analysis
- Facial proportions and balance
- Bone structure assessment

👁️ EYE ANALYSIS:
- Eye shape, size, spacing
- Under-eye darkness/puffiness (0-100 scale)
- Eye brightness and clarity
- Crow's feet and fine lines
- Eyelid health

👃 NOSE ANALYSIS:
- Nose shape and size
- Nostril symmetry
- Bridge structure
- Proportion to face

👄 LIPS & MOUTH ANALYSIS:
- Lip fullness and shape
- Lip color and hydration
- Smile lines
- Mouth corners
- Teeth visibility (if smiling)

💎 SKIN ANALYSIS:
- Skin type (oily, dry, normal, combination, sensitive)
- Glow score (0-100)
- Hydration level (0-100)
- Texture quality (0-100)
- Pores visibility
- Dark spots, blemishes, acne
- Fine lines and wrinkles
- Skin tone evenness
- Redness or inflammation
- Sun damage assessment

🧬 AGE ESTIMATION:
- Estimated age range
- Biological age indicators
- Age-related features
- Youth markers present
- Aging signs detected

😊 MOOD & EXPRESSION:
- Detected mood/emotion
- Expression analysis
- Facial tension areas
- Stress indicators
- Energy level assessment

❤️ HEALTH INDICATORS:
- Overall facial health score (0-100)
- Vitality indicators
- Fatigue signs
- Hydration status
- Sleep quality indicators
- Stress level markers
- Nutrition reflection on skin

🎭 BEAUTY & AESTHETICS:
- Attractiveness score (0-100)
- Unique features
- Best facial features
- Areas for enhancement
- Natural beauty markers

💪 FACIAL FITNESS:
- Jawline definition score (0-100)
- Cheekbone prominence
- Face muscle tone
- Double chin presence
- Neck line assessment

🌟 RECOMMENDATIONS:
Provide 10+ actionable recommendations for:
- Skincare routine (morning & night)
- Facial exercises for enhancement
- Lifestyle changes
- Diet suggestions
- Sleep optimization
- Hydration tips
- Stress management
- Professional treatments to consider

Return COMPREHENSIVE JSON with ALL details, scores, and insights!`,
        file_urls: [image],
        response_json_schema: {
          type: 'object',
          properties: {
            face_landmarks: {
              type: 'object',
              properties: {
                face_shape: { type: 'string' },
                symmetry_score: { type: 'number' },
                golden_ratio_score: { type: 'number' },
                facial_balance: { type: 'string' },
                bone_structure: { type: 'string' }
              }
            },
            eye_analysis: {
              type: 'object',
              properties: {
                shape: { type: 'string' },
                under_eye_darkness: { type: 'number' },
                brightness: { type: 'number' },
                fine_lines: { type: 'string' }
              }
            },
            nose_analysis: {
              type: 'object',
              properties: {
                shape: { type: 'string' },
                symmetry: { type: 'string' },
                proportion: { type: 'string' }
              }
            },
            lips_analysis: {
              type: 'object',
              properties: {
                fullness: { type: 'string' },
                shape: { type: 'string' },
                hydration: { type: 'number' },
                color: { type: 'string' }
              }
            },
            skin_analysis: {
              type: 'object',
              properties: {
                skin_type: { type: 'string' },
                glow_score: { type: 'number' },
                hydration_level: { type: 'number' },
                texture_quality: { type: 'number' },
                pores: { type: 'string' },
                blemishes: { type: 'array', items: { type: 'string' } },
                tone_evenness: { type: 'number' },
                aging_signs: { type: 'array', items: { type: 'string' } }
              }
            },
            age_estimation: {
              type: 'object',
              properties: {
                estimated_age_range: { type: 'string' },
                biological_age_markers: { type: 'array', items: { type: 'string' } },
                youth_indicators: { type: 'array', items: { type: 'string' } }
              }
            },
            mood_expression: {
              type: 'object',
              properties: {
                detected_mood: { type: 'string' },
                expression_analysis: { type: 'string' },
                stress_indicators: { type: 'array', items: { type: 'string' } },
                energy_level: { type: 'number' }
              }
            },
            health_indicators: {
              type: 'object',
              properties: {
                overall_health_score: { type: 'number' },
                vitality_score: { type: 'number' },
                fatigue_signs: { type: 'array', items: { type: 'string' } },
                hydration_status: { type: 'string' },
                sleep_quality_indicators: { type: 'string' },
                nutrition_reflection: { type: 'string' }
              }
            },
            beauty_aesthetics: {
              type: 'object',
              properties: {
                attractiveness_score: { type: 'number' },
                unique_features: { type: 'array', items: { type: 'string' } },
                best_features: { type: 'array', items: { type: 'string' } },
                enhancement_areas: { type: 'array', items: { type: 'string' } }
              }
            },
            facial_fitness: {
              type: 'object',
              properties: {
                jawline_score: { type: 'number' },
                cheekbone_prominence: { type: 'number' },
                muscle_tone: { type: 'number' },
                double_chin_presence: { type: 'string' }
              }
            },
            recommendations: {
              type: 'object',
              properties: {
                skincare_routine: {
                  type: 'object',
                  properties: {
                    morning: { type: 'array', items: { type: 'string' } },
                    night: { type: 'array', items: { type: 'string' } }
                  }
                },
                facial_exercises: { type: 'array', items: { type: 'string' } },
                lifestyle_changes: { type: 'array', items: { type: 'string' } },
                diet_suggestions: { type: 'array', items: { type: 'string' } },
                hydration_tips: { type: 'array', items: { type: 'string' } },
                professional_treatments: { type: 'array', items: { type: 'string' } }
              }
            },
            overall_summary: { type: 'string' }
          }
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysis(result);
      toast.success('🎉 Ultimate face analysis complete!');
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (error) {
      clearInterval(progressInterval);
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysis(null);
  };

  // Radar chart data
  const getRadarData = () => {
    if (!analysis) return [];
    return [
      { subject: 'Glow', score: analysis.skin_analysis?.glow_score || 0, fullMark: 100 },
      { subject: 'Symmetry', score: analysis.face_landmarks?.symmetry_score || 0, fullMark: 100 },
      { subject: 'Health', score: analysis.health_indicators?.overall_health_score || 0, fullMark: 100 },
      { subject: 'Jawline', score: analysis.facial_fitness?.jawline_score || 0, fullMark: 100 },
      { subject: 'Beauty', score: analysis.beauty_aesthetics?.attractiveness_score || 0, fullMark: 100 },
    ];
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10" />
          
          <div className="relative z-10 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative inline-block"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-dashed border-violet-400/30 rounded-full"
              />
            </motion.div>

            <div>
              <h2 className="text-4xl font-black text-white mb-3">
                🎯 Ultimate AI Face Scanner
              </h2>
              <p className="text-xl text-violet-200 mb-2">
                Advanced Face Landmark Detection & Deep Analysis
              </p>
              <p className="text-sm text-violet-300 max-w-2xl mx-auto">
                AI-powered analysis of face structure, skin health, age estimation, mood detection, and comprehensive beauty assessment with personalized recommendations
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
                  className="w-full h-96 object-cover rounded-2xl border-2 border-violet-400/50 shadow-2xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetAnalysis}
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl border-2 border-dashed border-violet-400/50 hover:border-violet-400 transition-colors cursor-pointer group bg-white/5 backdrop-blur-sm"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-3">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-semibold text-white">
                    Upload Photo
                  </span>
                </div>
              </motion.label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCamera(true)}
                className="p-6 rounded-2xl border-2 border-dashed border-pink-400/50 hover:border-pink-400 transition-colors group bg-white/5 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <Camera className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white">
                    Take Photo
                  </span>
                </div>
              </motion.button>
            </div>

            {image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={analyzeFace}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl px-8 py-6 text-lg border-2 border-white/20"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Start Ultimate Analysis
                </Button>
              </motion.div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
              {[
                { icon: Eye, label: 'Face Landmarks', color: 'from-violet-500 to-purple-600' },
                { icon: Brain, label: 'Age Detection', color: 'from-pink-500 to-rose-600' },
                { icon: Smile, label: 'Mood Analysis', color: 'from-blue-500 to-cyan-600' },
                { icon: Heart, label: 'Health Score', color: 'from-emerald-500 to-teal-600' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white text-center">{feature.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading with Progress */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-12 shadow-2xl"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative inline-block"
              >
                <div className="w-24 h-24 border-4 border-violet-500 border-t-transparent rounded-full" />
                <div className="absolute inset-0 w-24 h-24 border-4 border-pink-500 border-b-transparent rounded-full animate-ping" />
              </motion.div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎯 AI is Performing Deep Analysis...
                </h3>
                <p className="text-violet-200 mb-6">
                  Analyzing face landmarks, skin health, age, mood, and health indicators...
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <Progress value={analysisProgress} className="h-3 bg-white/10" />
                <p className="text-sm text-violet-300">{analysisProgress}% Complete</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {[
                  { label: 'Face Structure', icon: Target },
                  { label: 'Skin Analysis', icon: Sparkles },
                  { label: 'Age Detection', icon: Brain },
                  { label: 'Health Score', icon: Heart },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: analysisProgress > i * 25 ? 1 : 0.3,
                      scale: analysisProgress > i * 25 ? 1 : 0.9
                    }}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                  >
                    <step.icon className={`w-6 h-6 mx-auto mb-1 ${analysisProgress > i * 25 ? 'text-violet-400' : 'text-gray-500'}`} />
                    <p className="text-xs text-white">{step.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
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
            {/* Overall Summary */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-4xl font-black text-white">
                      Analysis Complete! 🎯
                    </h2>
                    <p className="text-violet-200">Ultimate AI Face Scan Results</p>
                  </div>
                </motion.div>

                <p className="text-lg text-white max-w-3xl mx-auto leading-relaxed">
                  {analysis.overall_summary}
                </p>

                {/* Radar Chart */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Overall Scores</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" stroke="#fff" />
                      <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" />
                      <Radar
                        name="Scores"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Face Landmarks */}
            {analysis.face_landmarks && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Face Structure & Landmarks</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-1">Face Shape</p>
                    <p className="text-2xl font-bold text-white">{analysis.face_landmarks.face_shape}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-1">Symmetry Score</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.face_landmarks.symmetry_score} className="flex-1 h-2 bg-white/10" />
                      <span className="text-2xl font-bold text-white">{analysis.face_landmarks.symmetry_score}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-1">Golden Ratio</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.face_landmarks.golden_ratio_score} className="flex-1 h-2 bg-white/10" />
                      <span className="text-2xl font-bold text-white">{analysis.face_landmarks.golden_ratio_score}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-1">Bone Structure</p>
                    <p className="text-lg font-semibold text-white">{analysis.face_landmarks.bone_structure}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Skin Analysis */}
            {analysis.skin_analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Skin Health & Glow</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-5 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <p className="text-sm text-amber-200 font-semibold">Glow Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.skin_analysis.glow_score} className="flex-1 h-3 bg-white/10" />
                      <span className="text-3xl font-black text-white">{analysis.skin_analysis.glow_score}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-blue-400" />
                      <p className="text-sm text-blue-200 font-semibold">Hydration</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.skin_analysis.hydration_level} className="flex-1 h-3 bg-white/10" />
                      <span className="text-3xl font-black text-white">{analysis.skin_analysis.hydration_level}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      <p className="text-sm text-purple-200 font-semibold">Texture</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.skin_analysis.texture_quality} className="flex-1 h-3 bg-white/10" />
                      <span className="text-3xl font-black text-white">{analysis.skin_analysis.texture_quality}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-2">Skin Type</p>
                    <Badge className="bg-violet-500/20 text-violet-200 border border-violet-500/30 text-base px-4 py-1">
                      {analysis.skin_analysis.skin_type}
                    </Badge>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-2">Tone Evenness</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.skin_analysis.tone_evenness} className="flex-1 h-2 bg-white/10" />
                      <span className="text-xl font-bold text-white">{analysis.skin_analysis.tone_evenness}</span>
                    </div>
                  </div>
                </div>

                {analysis.skin_analysis.blemishes && analysis.skin_analysis.blemishes.length > 0 && (
                  <div className="mt-4 bg-red-500/10 backdrop-blur-sm rounded-xl p-5 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-sm text-red-200 font-semibold">Detected Issues</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skin_analysis.blemishes.map((blemish, i) => (
                        <Badge key={i} className="bg-red-500/20 text-red-200 border border-red-500/30">
                          {blemish}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Age & Mood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.age_estimation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Age Estimation</h3>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 mb-4">
                    <p className="text-sm text-violet-300 mb-1">Estimated Age</p>
                    <p className="text-3xl font-black text-white">{analysis.age_estimation.estimated_age_range}</p>
                  </div>
                  {analysis.age_estimation.youth_indicators && analysis.age_estimation.youth_indicators.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-300 font-semibold mb-2">✨ Youth Indicators:</p>
                      {analysis.age_estimation.youth_indicators.map((indicator, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {analysis.mood_expression && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Smile className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Mood & Expression</h3>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 mb-4">
                    <p className="text-sm text-violet-300 mb-1">Detected Mood</p>
                    <p className="text-2xl font-bold text-white">{analysis.mood_expression.detected_mood}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 mb-4">
                    <p className="text-sm text-violet-300 mb-2">Energy Level</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.mood_expression.energy_level} className="flex-1 h-2 bg-white/10" />
                      <span className="text-xl font-bold text-white">{analysis.mood_expression.energy_level}</span>
                    </div>
                  </div>
                  <p className="text-sm text-violet-200 leading-relaxed">{analysis.mood_expression.expression_analysis}</p>
                </motion.div>
              )}
            </div>

            {/* Health Indicators */}
            {analysis.health_indicators && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-green-900/40 backdrop-blur-2xl border border-emerald-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Health Indicators</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-emerald-300 mb-2">Overall Health</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.health_indicators.overall_health_score} className="flex-1 h-3 bg-white/10" />
                      <span className="text-3xl font-black text-white">{analysis.health_indicators.overall_health_score}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-emerald-300 mb-2">Vitality Score</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.health_indicators.vitality_score} className="flex-1 h-3 bg-white/10" />
                      <span className="text-3xl font-black text-white">{analysis.health_indicators.vitality_score}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-emerald-300 mb-1">Hydration Status</p>
                    <p className="text-lg font-semibold text-white">{analysis.health_indicators.hydration_status}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-emerald-300 mb-1">Sleep Quality</p>
                    <p className="text-lg font-semibold text-white">{analysis.health_indicators.sleep_quality_indicators}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Facial Fitness */}
            {analysis.facial_fitness && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Facial Fitness</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-2">Jawline Definition</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.facial_fitness.jawline_score} className="flex-1 h-2 bg-white/10" />
                      <span className="text-2xl font-bold text-white">{analysis.facial_fitness.jawline_score}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-2">Cheekbone Prominence</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.facial_fitness.cheekbone_prominence} className="flex-1 h-2 bg-white/10" />
                      <span className="text-2xl font-bold text-white">{analysis.facial_fitness.cheekbone_prominence}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <p className="text-sm text-violet-300 mb-2">Muscle Tone</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.facial_fitness.muscle_tone} className="flex-1 h-2 bg-white/10" />
                      <span className="text-2xl font-bold text-white">{analysis.facial_fitness.muscle_tone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Beauty & Aesthetics */}
            {analysis.beauty_aesthetics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Beauty & Aesthetics</h3>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30 mb-6">
                  <p className="text-sm text-pink-200 mb-2">Attractiveness Score</p>
                  <div className="flex items-center gap-4">
                    <Progress value={analysis.beauty_aesthetics.attractiveness_score} className="flex-1 h-4 bg-white/10" />
                    <span className="text-4xl font-black text-white">{analysis.beauty_aesthetics.attractiveness_score}</span>
                  </div>
                </div>

                {analysis.beauty_aesthetics.best_features && analysis.beauty_aesthetics.best_features.length > 0 && (
                  <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-5 border border-green-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-green-200 font-semibold">✨ Your Best Features</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.beauty_aesthetics.best_features.map((feature, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-200 border border-green-500/30 text-sm px-3 py-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.beauty_aesthetics.unique_features && analysis.beauty_aesthetics.unique_features.length > 0 && (
                  <div className="bg-violet-500/10 backdrop-blur-sm rounded-xl p-5 border border-violet-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-violet-400" />
                      <p className="text-sm text-violet-200 font-semibold">🎯 Unique Features</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.beauty_aesthetics.unique_features.map((feature, i) => (
                        <Badge key={i} className="bg-violet-500/20 text-violet-200 border border-violet-500/30 text-sm px-3 py-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-2xl border border-violet-500/30 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🎯 Personalized Recommendations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skincare Routine */}
                  {analysis.recommendations.skincare_routine && (
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-5 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Sun className="w-5 h-5 text-amber-400" />
                          <p className="text-lg font-bold text-white">Morning Routine</p>
                        </div>
                        <ol className="space-y-2">
                          {analysis.recommendations.skincare_routine.morning?.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white">
                              <span className="font-bold text-amber-400 flex-shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="bg-indigo-500/10 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Moon className="w-5 h-5 text-indigo-400" />
                          <p className="text-lg font-bold text-white">Night Routine</p>
                        </div>
                        <ol className="space-y-2">
                          {analysis.recommendations.skincare_routine.night?.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white">
                              <span className="font-bold text-indigo-400 flex-shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Other Recommendations */}
                  <div className="space-y-4">
                    {analysis.recommendations.facial_exercises && analysis.recommendations.facial_exercises.length > 0 && (
                      <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-5 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-blue-400" />
                          <p className="text-lg font-bold text-white">Facial Exercises</p>
                        </div>
                        <ul className="space-y-2">
                          {analysis.recommendations.facial_exercises.map((exercise, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white">
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{exercise}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.recommendations.diet_suggestions && analysis.recommendations.diet_suggestions.length > 0 && (
                      <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-5 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-5 h-5 text-green-400" />
                          <p className="text-lg font-bold text-white">Diet Suggestions</p>
                        </div>
                        <ul className="space-y-2">
                          {analysis.recommendations.diet_suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetAnalysis}
                size="lg"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Analyze Another Photo
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl border-2 border-white/20"
              >
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
