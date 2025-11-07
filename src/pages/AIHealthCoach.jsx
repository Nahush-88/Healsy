import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadFile } from "@/integrations/Core";
import { healthCoachChat } from "@/functions/healthCoachChat";
import VoiceRecorderButton from "@/components/chat/VoiceRecorderButton";
import { User } from "@/entities/User";
import { toast } from "sonner";
import { 
  Camera, Image as ImageIcon, Send, Loader2, X, RefreshCw, Shield, Heart, 
  Sparkles, Brain, Zap, Droplet, Moon, Sun, Utensils, Dumbbell, Wind, 
  TrendingUp, Star, Clock, Copy, Download, Save, Plus, Smile, AlertCircle,
  MessageSquare, BookOpen, Target, Award, Coffee, Apple, Activity, CheckCircle,
  Trophy, Crown, Flame, Globe, Mic
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ULTRA SMOOTH TYPING INDICATOR
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-2 border-violet-200 dark:border-violet-700 max-w-[200px] shadow-lg"
  >
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-2.5 h-2.5 bg-violet-500 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2.5 h-2.5 bg-violet-500 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2.5 h-2.5 bg-violet-500 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
      />
    </div>
    <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI thinking...</span>
  </motion.div>
);

// PREMIUM MESSAGE BUBBLE
const MessageBubble = ({ message, isUser, onCopy }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[85%] relative ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">Healsy AI Coach</span>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
        
        <div className={`
          rounded-2xl px-6 py-4 shadow-xl
          ${isUser 
            ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white' 
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-violet-200 dark:border-violet-700'
          }
        `}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
            {message}
          </p>
        </div>

        <AnimatePresence>
          {showActions && !isUser && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-10 left-0 flex items-center gap-2"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopy?.(message)}
                className="h-8 px-3 text-xs bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// QUICK ACTION CARDS - PREMIUM STYLE
const QuickActionCard = ({ icon: Icon, title, description, prompt, onClick, gradient }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(prompt)}
    className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
        <Icon className="w-7 h-7" />
      </div>
      <Badge className="bg-white/20 text-white text-xs">Quick</Badge>
    </div>
    <h4 className="font-black text-xl mb-2">{title}</h4>
    <p className="text-sm text-white/90 leading-relaxed">{description}</p>
  </motion.div>
);

export default function AIHealthCoach() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "👋 Hi! I'm your Healsy AI Coach. I'm here to help you with:\n\n💧 Hydration & nutrition plans\n🏋️ Personalized workouts\n😴 Sleep optimization\n🧘 Meditation & yoga\n✨ Skin glow tips\n\nAsk me anything, attach photos for analysis, or use voice input. Let's crush your wellness goals together!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState([]);
  const [sending, setSending] = useState(false);
  const [modelInfo, setModelInfo] = useState({ model: null, provider: null });
  const messagesEndRef = useRef(null);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Camera modal state
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");

  // Language options
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ];

  useEffect(() => {
    User.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setCheckingPremium(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const quickActions = [
    {
      icon: Droplet,
      title: "Hydration Plan",
      description: "Get personalized water intake goals",
      prompt: "Create a hydration plan for me today based on my activity level",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Utensils,
      title: "Meal Ideas",
      description: "Healthy recipes for your goals",
      prompt: "Suggest 3 healthy meal ideas for today that are easy to make",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: Dumbbell,
      title: "Quick Workout",
      description: "20-min exercise routine",
      prompt: "Create a 20-minute full-body workout I can do at home",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Moon,
      title: "Sleep Better",
      description: "Improve your sleep quality",
      prompt: "Give me tips to improve my sleep quality tonight",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: Wind,
      title: "Breathing Exercise",
      description: "Calm your mind instantly",
      prompt: "Guide me through a 5-minute breathing exercise for stress relief",
      gradient: "from-sky-500 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "Glow Tips",
      description: "Natural skin radiance",
      prompt: "What can I do today to improve my skin glow naturally?",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(ms);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
          videoRef.current.play();
        }
      }, 60);
    } catch (e) {
      toast.error("Camera not available or permission denied.");
    }
  };
  
  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
  };
  
  const toggleFacing = async () => {
    setFacingMode((p) => (p === "user" ? "environment" : "user"));
    if (showCamera) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    if (facingMode === "user") { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, w, h);
    c.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const { file_url } = await UploadFile({ file });
        setPendingImages((prev) => [...prev, file_url]);
        toast.success("Photo added! 📸");
        stopCamera();
      } catch {
        toast.error("Failed to process photo");
      }
    }, "image/jpeg", 0.9);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info("Uploading image...");
      const { file_url } = await UploadFile({ file });
      setPendingImages((prev) => [...prev, file_url]);
      toast.success("Image attached! 📎");
    } catch {
      toast.error("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const sendMessage = async (text, images = null) => {
    const msg = text?.trim();
    if (!msg && (!images || !images.length) && !pendingImages.length) return;

    // Add language instruction
    const languageInstruction = selectedLanguage !== "en" 
      ? `\n\nIMPORTANT: Please respond in ${languages.find(l => l.code === selectedLanguage)?.name || 'English'}.` 
      : '';

    const finalMessage = msg + languageInstruction;

    const newUserMsg = { role: "user", content: msg || "(image attached)" };
    setMessages((m) => [...m, newUserMsg]);
    setInput("");
    
    const imagesToSend = images || pendingImages;
    setPendingImages([]);
    setSending(true);

    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      const { data } = await healthCoachChat({ 
        message: finalMessage || "Please analyze the attached image(s) and provide wellness insights.", 
        history, 
        image_urls: imagesToSend 
      });
      
      if (data?.error) {
        toast.error(data.error);
        setMessages((m) => [...m, { role: "assistant", content: "❌ " + data.error }]);
      } else {
        const answer = data?.answer || "I couldn't generate a reply. Please try again.";
        setMessages((m) => [...m, { role: "assistant", content: answer }]);
        
        if (data?.model || data?.provider) {
          setModelInfo({ model: data.model || null, provider: data.provider || null });
        }
      }
    } catch (e) {
      toast.error("AI is temporarily busy. Please retry!");
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ I'm experiencing high demand. Please try again in a moment!" }]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    setActiveTab("chat");
    setTimeout(() => {
      sendMessage(prompt, []);
    }, 300);
  };

  const clearChat = () => {
    setMessages([
      { 
        role: "assistant", 
        content: "👋 Chat cleared! I'm here to help. What would you like to know?" 
      }
    ]);
    setModelInfo({ model: null, provider: null });
    toast.success("Chat cleared!");
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

  const exportChat = () => {
    const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'AI Coach'}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healsy-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported!");
  };

  if (checkingPremium) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!user?.is_premium) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-5xl font-black mb-4">
              AI Health Coach
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Your personal AI wellness expert. Get unlimited guidance for hydration, diet, workouts, sleep, mood, meditation, and skin glow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: MessageSquare, text: "Unlimited AI Conversations" },
                { icon: Camera, text: "Image & Selfie Analysis" },
                { icon: Globe, text: "8 Languages Support" },
                { icon: Zap, text: "Lightning Fast Responses" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-white">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-2xl font-black text-lg">
                <Link to={createPageUrl("Settings")}>
                  <Crown className="w-6 h-6 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link to={createPageUrl("Dashboard")}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PREMIUM HERO */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-2xl"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black mb-2">AI Health Coach</h1>
              <p className="text-lg text-white/90">Your 24/7 wellness companion powered by advanced AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {modelInfo.model && (
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
                {modelInfo.provider ? `${modelInfo.provider}: ` : ""}{modelInfo.model}
              </Badge>
            )}
            <Badge className="bg-emerald-500/20 backdrop-blur-sm border-emerald-400/30 text-emerald-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Premium Active
            </Badge>
            <Badge className="bg-amber-500/20 backdrop-blur-sm border-amber-400/30 text-amber-100">
              <Flame className="w-3 h-3 mr-1" />
              Unlimited
            </Badge>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2 text-base font-bold">
            <MessageSquare className="w-5 h-5" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2 text-base font-bold">
            <Zap className="w-5 h-5" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-700 shadow-2xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">AI Conversation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Powered by advanced AI models</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-slate-700 border-2 border-violet-200 dark:border-violet-700">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {languages.find(l => l.code === selectedLanguage)?.flag} {languages.find(l => l.code === selectedLanguage)?.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button size="sm" variant="outline" onClick={exportChat} disabled={messages.length <= 1}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearChat}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto pr-2 space-y-4 mb-4">
                <AnimatePresence>
                  {messages.map((m, i) => (
                    <MessageBubble 
                      key={i} 
                      message={m.content} 
                      isUser={m.role === "user"}
                      onCopy={copyMessage}
                    />
                  ))}
                  {sending && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Pending Images */}
              {pendingImages.length > 0 && (
                <div className="mb-4 flex gap-2 flex-wrap">
                  {pendingImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-violet-300 dark:border-violet-600 shadow-md">
                      <img src={url} alt="attachment" className="w-full h-full object-cover" />
                      <button
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90 transition"
                        onClick={() => setPendingImages((prev) => prev.filter((u) => u !== url))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Ask me anything about your health and wellness..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input, pendingImages);
                    }
                  }}
                  rows={2}
                  className="flex-1 resize-none bg-white dark:bg-slate-700 border-2 border-violet-300 dark:border-violet-600 rounded-xl text-base"
                />
                
                <div className="flex flex-col gap-2">
                  <VoiceRecorderButton 
                    onText={(txt) => setInput((p) => (p ? `${p} ${txt}` : txt))}
                    className="h-12 w-12"
                  />
                  
                  <label className="h-12 w-12 flex items-center justify-center rounded-xl border-2 border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-700 hover:bg-violet-50 dark:hover:bg-slate-600 cursor-pointer transition shadow-lg">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    <ImageIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </label>
                  
                  <Button 
                    size="icon"
                    onClick={startCamera}
                    className="h-12 w-12 bg-white dark:bg-slate-700 border-2 border-violet-300 dark:border-violet-600 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-600 shadow-lg"
                  >
                    <Camera className="w-6 h-6" />
                  </Button>
                  
                  <Button 
                    size="icon"
                    onClick={() => sendMessage(input, pendingImages)} 
                    disabled={sending || (!input.trim() && pendingImages.length === 0)}
                    className="h-12 w-12 bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl"
                  >
                    {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </Button>
                </div>
              </div>

              {/* Safety Note */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>AI wellness guidance only. Consult healthcare professionals for medical advice.</span>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-xl">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Droplet className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg">Hydration Pro Tip</h4>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  Drink a glass of water immediately after waking up to kickstart your metabolism and rehydrate your body after sleep.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Apple className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg">Nutrition Pro Tip</h4>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  Eat the rainbow! Different colored fruits and vegetables provide unique nutrients your body needs.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-xl">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-lg">Fitness Pro Tip</h4>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  Move for 2 minutes every hour. Small bursts of activity throughout the day add up significantly!
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* QUICK ACTIONS TAB */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <QuickActionCard key={idx} {...action} onClick={handleQuickAction} />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4 flex items-center gap-2">
                <Star className="w-8 h-8 text-amber-300" />
                Custom Requests
              </h3>
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                You can also ask me anything specific:
              </p>
              <ul className="space-y-3 text-base text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-violet-300 mt-0.5 font-bold">✓</span>
                  "Create a 7-day meal plan for weight loss"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-300 mt-0.5 font-bold">✓</span>
                  "Design a beginner yoga routine for flexibility"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-300 mt-0.5 font-bold">✓</span>
                  "Analyze this photo of my meal for calories"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-300 mt-0.5 font-bold">✓</span>
                  "Help me build a bedtime routine for better sleep"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-300 mt-0.5 font-bold">✓</span>
                  "What supplements should I take for energy?"
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border-2 border-slate-300 dark:border-slate-600 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Take Photo</h3>
                <button onClick={stopCamera} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black mb-4">
                <video ref={videoRef} className="w-full h-auto" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" onClick={toggleFacing} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Flip
                </Button>
                <Button variant="outline" onClick={stopCamera} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={capturePhoto} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}