
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadFile } from "@/integrations/Core";
import { toast } from "sonner";

export default function VoiceRecorder({ open, onClose, onRecordComplete, title = "Voice Scan" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerData, setVisualizerData] = useState(Array(20).fill(0));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isRecording]); // `isRecording` is a dependency here

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, stopRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analyzer for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualizer animation
      const updateVisualizer = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const normalized = Array.from(dataArray.slice(0, 20)).map(v => v / 255);
        setVisualizerData(normalized);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started! 🎤");
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied or unavailable");
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const confirmAndUpload = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    try {
      const file = new File([audioBlob], `voice_scan_${Date.now()}.webm`, { type: "audio/webm" });
      const { file_url } = await UploadFile({ file });
      toast.success("Voice uploaded! 🎤✨");
      onRecordComplete?.(file_url);
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload voice recording");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-md w-[92vw] sm:w-[480px] overflow-hidden p-0 border-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-6">
          {/* Visualizer */}
          <div className="relative h-48 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center gap-1 px-4 pb-8">
              {visualizerData.map((height, idx) => (
                <motion.div
                  key={idx}
                  className="w-2 bg-gradient-to-t from-violet-500 to-purple-500 rounded-full"
                  animate={{ height: isRecording ? `${Math.max(10, height * 100)}%` : "10%" }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isRecording ? "bg-red-500" : "bg-violet-500"
                } shadow-2xl`}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
              <p className="mt-4 text-2xl font-bold text-violet-600 dark:text-violet-400">
                {formatTime(recordingTime)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {!audioBlob ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-full ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-r from-violet-600 to-purple-600"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={playAudio}>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Button variant="outline" onClick={deleteRecording}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={confirmAndUpload}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Use
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-slate-500">
            {audioBlob ? "Your voice has been recorded" : "Speak naturally about your energy, mood, and feelings"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
