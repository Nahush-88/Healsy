
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Loader2, Sparkles, Download, Heart, RefreshCw, Crown, Scissors, Palette, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import GradientCard from '../GradientCard';
import { UploadFile } from '@/integrations/Core';
import { HairstyleHistory } from '@/entities/HairstyleHistory';
import { UsageTracker } from '../UsageTracker';
import LoadingAnalysis from '../LoadingAnalysis';

export default function HairstyleRecommender({ user, onAnalysisComplete }) {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const faceShapes = {
    oval: {
      icon: '⭕',
      description: 'Balanced proportions, versatile',
      color: 'from-violet-500 to-purple-600'
    },
    square: {
      icon: '⬜',
      description: 'Strong jawline, angular',
      color: 'from-blue-500 to-cyan-600'
    },
    round: {
      icon: '🔵',
      description: 'Soft curves, full cheeks',
      color: 'from-pink-500 to-rose-600'
    },
    diamond: {
      icon: '💎',
      description: 'High cheekbones, narrow forehead',
      color: 'from-amber-500 to-orange-600'
    },
    heart: {
      icon: '💙',
      description: 'Wide forehead, narrow chin',
      color: 'from-red-500 to-pink-600'
    },
    oblong: {
      icon: '🔶',
      description: 'Long face, narrow width',
      color: 'from-emerald-500 to-teal-600'
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImage(file_url);
      toast.success('Photo uploaded! Ready to analyze');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const analyzeHairstyle = async () => {
    if (!image) {
      toast.error('Please upload a photo first');
      return;
    }

    const usage = await UsageTracker.checkAndUpdateUsage('face_analyses');
    if (!usage.allowed) {
      toast.error('Daily limit reached. Upgrade to Premium!');
      return;
    }

    setAnalyzing(true);
    try {
      toast.info('✂️ AI Stylist is analyzing your face...');

      const { InvokeLLM } = await import('@/integrations/Core');
      const result = await InvokeLLM({
        prompt: `Analyze this person's face photo and provide detailed hairstyle and grooming recommendations.

Analyze:
1. Face Shape: Determine if oval, square, round, diamond, heart, or oblong
2. Jawline Structure: Strong, soft, defined, etc.
3. Facial Features: Forehead size, cheekbones, chin shape
4. Current Hair: Style, length, texture (if visible)

Provide recommendations for:
- Best 5 hairstyles with detailed descriptions
- Best 3 beard/facial hair styles (if applicable)
- Top 3 hair colors that would suit them
- Styling tips and product recommendations

Be specific, practical, and encouraging. Focus on enhancing their natural features.`,
        file_urls: [image],
        response_json_schema: {
          type: 'object',
          properties: {
            face_shape: { type: 'string' },
            face_shape_confidence: { type: 'number' },
            jawline_type: { type: 'string' },
            facial_features_analysis: { type: 'string' },
            recommended_hairstyles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  why_it_works: { type: 'string' },
                  styling_tips: { type: 'string' },
                  maintenance: { type: 'string' },
                  celebrity_reference: { type: 'string' }
                }
              }
            },
            beard_styles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  maintenance_tips: { type: 'string' }
                }
              }
            },
            hair_colors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  color: { type: 'string' },
                  why_recommended: { type: 'string' },
                  maintenance: { type: 'string' }
                }
              }
            },
            styling_products: {
              type: 'array',
              items: { type: 'string' }
            },
            general_grooming_tips: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      // Save to history
      await HairstyleHistory.create({
        photo_url: image,
        face_shape: result.face_shape,
        jawline_type: result.jawline_type,
        recommended_hairstyles: result.recommended_hairstyles,
        beard_styles: result.beard_styles.map(b => b.name),
        hair_colors: result.hair_colors.map(c => c.color),
        analysis_date: new Date().toISOString(),
        user_email: user?.email
      });

      setAnalysis(result);
      toast.success('🎉 Analysis complete! Check out your recommendations');
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!analysis && !analyzing && (
        <GradientCard tone="violet">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
              <Scissors className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                AI Hairstyle & Grooming Recommender
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Upload your photo to get personalized hairstyle, beard, and color recommendations
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
                  className="w-full h-80 object-cover rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer group"
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
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Upload Photo
                  </span>
                </div>
              </motion.label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl border-2 border-dashed border-pink-300 dark:border-pink-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors group"
              >
                <div className="flex flex-col items-center gap-3">
                  <Camera className="w-8 h-8 text-pink-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Take Photo
                  </span>
                </div>
              </motion.button>
            </div>

            {image && (
              <Button
                onClick={analyzeHairstyle}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze My Face
              </Button>
            )}
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
            <GradientCard tone="violet">
              <LoadingAnalysis
                message="AI Stylist is analyzing your face shape, features, and perfect styles..."
                category="hairstyle"
                showProgress={true}
                duration={15000}
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
            {/* Face Shape Result */}
            <GradientCard tone="violet">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${faceShapes[analysis.face_shape?.toLowerCase()]?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center shadow-2xl`}>
                    <span className="text-5xl">
                      {faceShapes[analysis.face_shape?.toLowerCase()]?.icon || '👤'}
                    </span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                      {analysis.face_shape} Face
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {faceShapes[analysis.face_shape?.toLowerCase()]?.description}
                    </p>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      {Math.round(analysis.face_shape_confidence * 100)}% Confidence
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Jawline:</strong> {analysis.jawline_type}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                    {analysis.facial_features_analysis}
                  </p>
                </div>
              </div>
            </GradientCard>

            {/* Hairstyle Recommendations */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scissors className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Perfect Hairstyles For You
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.recommended_hairstyles?.map((style, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <GradientCard tone="violet" className="h-full">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                            {idx + 1}. {style.name}
                          </h4>
                          {idx === 0 && (
                            <Badge className="bg-amber-500 text-white">
                              <Crown className="w-3 h-3 mr-1" />
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {style.description}
                        </p>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-2 text-sm">
                          <p><strong>Why it works:</strong> {style.why_it_works}</p>
                          <p><strong>Styling tips:</strong> {style.styling_tips}</p>
                          <p><strong>Maintenance:</strong> {style.maintenance}</p>
                          {style.celebrity_reference && (
                            <p className="text-purple-700 dark:text-purple-300">
                              💫 Think: {style.celebrity_reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </GradientCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Beard Styles */}
            {analysis.beard_styles?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🧔</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Beard Styles That Suit You
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysis.beard_styles?.map((beard, idx) => (
                    <GradientCard key={idx} tone="blue">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                        {beard.name}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {beard.description}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Tips:</strong> {beard.maintenance_tips}
                      </p>
                    </GradientCard>
                  ))}
                </div>
              </div>
            )}

            {/* Hair Colors */}
            {analysis.hair_colors?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-6 h-6 text-pink-600" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Hair Colors To Try
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysis.hair_colors?.map((color, idx) => (
                    <GradientCard key={idx} tone="pink">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                        {color.color}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {color.why_recommended}
                      </p>
                      <p className="text-xs text-pink-700 dark:text-pink-300">
                        <strong>Maintenance:</strong> {color.maintenance}
                      </p>
                    </GradientCard>
                  ))}
                </div>
              </div>
            )}

            {/* PRO TIPS - Enhanced Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GradientCard tone="amber">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <span className="text-xl">💼</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recommended Products
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.styling_products?.map((product, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-amber-600 mt-0.5">✓</span>
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
              </GradientCard>

              <GradientCard tone="green">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-xl">✨</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Grooming Tips
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.general_grooming_tips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </GradientCard>

              <GradientCard tone="blue">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Pro Styling Tips
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      Always blow-dry in the direction of your desired style
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      Get regular trims every 4-6 weeks to maintain shape
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      Use heat protectant before any heat styling
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      Start with small amounts of product - you can always add more
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      Wash hair with lukewarm water to prevent dryness
                    </li>
                  </ul>
                </div>
              </GradientCard>
            </div>

            {/* Expert Advice Section */}
            <GradientCard tone="violet">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Expert Advice for Your {analysis.face_shape} Face
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Professional tips from top stylists
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span>🎯</span> What to Aim For
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {analysis.face_shape?.toLowerCase() === 'oval' && (
                        <>
                          <li>• Most styles work well - you're lucky!</li>
                          <li>• Add volume on top for balanced proportions</li>
                          <li>• Side parts look great on you</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'square' && (
                        <>
                          <li>• Soften angular features with texture</li>
                          <li>• Side-swept styles work beautifully</li>
                          <li>• Add height to elongate your face</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'round' && (
                        <>
                          <li>• Create height to add length</li>
                          <li>• Angular styles add definition</li>
                          <li>• Keep sides shorter than top</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'diamond' && (
                        <>
                          <li>• Balance your cheekbones with volume</li>
                          <li>• Side parts complement your angles</li>
                          <li>• Textured styles look amazing</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'heart' && (
                        <>
                          <li>• Add width at jawline for balance</li>
                          <li>• Chin-length styles work perfectly</li>
                          <li>• Side-swept bangs complement well</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'oblong' && (
                        <>
                          <li>• Add width to sides for balance</li>
                          <li>• Avoid excessive height on top</li>
                          <li>• Fringe/bangs can shorten face nicely</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span>⚠️</span> What to Avoid
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {analysis.face_shape?.toLowerCase() === 'oval' && (
                        <>
                          <li>• Heavy, blunt bangs that hide your face</li>
                          <li>• Styles that are too flat on top</li>
                          <li>• One-length cuts without layers</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'square' && (
                        <>
                          <li>• Blunt, straight-across bangs</li>
                          <li>• Styles that are too boxy or angular</li>
                          <li>• Length that ends at jawline</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'round' && (
                        <>
                          <li>• Chin-length bobs that add roundness</li>
                          <li>• Too much volume on the sides</li>
                          <li>• Tight curls all around</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'diamond' && (
                        <>
                          <li>• Slicked-back styles without volume</li>
                          <li>• Very short crops that expose cheekbones</li>
                          <li>• Center parts that emphasize width</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'heart' && (
                        <>
                          <li>• Too much volume at the crown</li>
                          <li>• Styles that end at chin without movement</li>
                          <li>• Heavy, straight-across bangs</li>
                        </>
                      )}
                      {analysis.face_shape?.toLowerCase() === 'oblong' && (
                        <>
                          <li>• Long, straight styles without layers</li>
                          <li>• Too much height on top</li>
                          <li>• Styles pulled straight back</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </GradientCard>

            {/* Maintenance Schedule */}
            <GradientCard tone="indigo">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Maintenance Schedule
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Daily</h4>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Style hair after washing</li>
                      <li>• Apply leave-in products</li>
                      <li>• Brush/comb gently</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Weekly</h4>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Deep condition treatment</li>
                      <li>• Scalp massage for growth</li>
                      <li>• Clean styling tools</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Monthly</h4>
                    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      <li>• Professional trim</li>
                      <li>• Shape beard/facial hair</li>
                      <li>• Evaluate hair health</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GradientCard>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Photo
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Download className="w-4 h-4 mr-2" />
                Save Results
              </Button>
              <Button variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                Add to Favorites
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
