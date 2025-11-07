
import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadFile } from "@/integrations/Core";
import { motion } from "framer-motion";

export default function CameraCaptureModal({ open, onClose, onCapture, overlay = "none" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const stopStream = () => {
    try {
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch (e) {
      // console.error("Error stopping stream:", e);
    }
    streamRef.current = null;
  };

  const startStream = async (mode = "user") => {
    setError(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setError("Camera access denied or unavailable.");
      console.error("Error starting stream:", e);
    }
  };

  useEffect(() => {
    if (open) {
      setPreviewDataUrl(null);
      startStream(facingMode);
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const flipCamera = async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startStream(next);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewDataUrl(dataUrl);
    setIsCapturing(false);
    // pause stream preview to save battery
    try { video.pause(); } catch (e) {
      // console.error("Error pausing video:", e);
    }
  };

  const retake = async () => {
    setPreviewDataUrl(null);
    try { await videoRef.current?.play(); } catch (e) {
      // console.error("Error playing video:", e);
    }
  };

  const confirmAndUpload = async () => {
    if (!previewDataUrl) return;
    setIsUploading(true);
    try {
      const res = await fetch(previewDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "aura_capture.jpg", { type: "image/jpeg" });
      const { file_url } = await UploadFile({ file });
      onCapture?.(file_url);
      onClose?.();
    } catch (e) {
      setError("Failed to upload the captured photo. Please try again.");
      console.error("Error uploading photo:", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-md w-[92vw] sm:w-[480px] overflow-hidden p-0 border-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Take Photo
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
            {!previewDataUrl ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-64 object-cover bg-black"
                />
                {/* Aura overlay if requested */}
                {overlay === "aura" && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0"
                      style={{
                        background: "radial-gradient(60% 60% at 50% 60%, rgba(139,92,246,0.35), rgba(59,130,246,0.18), transparent 70%)"
                      }}
                    />
                    {/* Animated rings */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.18), transparent 40%)"
                      }}
                      animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Sparkles */}
                    {Array.from({ length: 18 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute w-1 h-1 bg-white/70 rounded-full"
                        style={{
                          left: `${(i * 37) % 100}%`,
                          top: `${(i * 19) % 100}%`,
                          filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))"
                        }}
                        animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 3 + (i % 5) * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <motion.img
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                src={previewDataUrl}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            {!previewDataUrl ? (
              <>
                <Button variant="outline" onClick={flipCamera} className="col-span-1">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Flip
                </Button>
                <Button
                  onClick={captureFrame}
                  disabled={isCapturing}
                  className="col-span-2 bg-violet-600 hover:bg-violet-700"
                >
                  {isCapturing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Capture
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={retake} className="col-span-1">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={confirmAndUpload}
                  disabled={isUploading}
                  className="col-span-2 bg-violet-600 hover:bg-violet-700"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Use Photo
                </Button>
              </>
            )}
          </div>

          <div className="mt-3 flex justify-center">
            <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
