import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuraShareGenerator({ imageUrl, analysis }) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      canvas.width = 1080;
      canvas.height = 1080;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1080);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#312e81");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Load and draw user image
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const imgSize = 600;
      const imgX = (1080 - imgSize) / 2;
      const imgY = 150;

      // Draw glowing aura effect
      const auraColor = analysis?.color_hex || "#FFD700";
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.15 - i * 0.02;
        ctx.shadowColor = auraColor;
        ctx.shadowBlur = 40 + i * 20;
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 + i * 20, 0, Math.PI * 2);
        ctx.fillStyle = auraColor;
        ctx.fill();
        ctx.restore();
      }

      // Clip and draw image
      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${analysis?.aura_color || "Golden"} Aura`, 540, 850);

      ctx.font = "32px sans-serif";
      ctx.fillStyle = "#d1d5db";
      ctx.fillText("Healsy AI • Aura Energy Scan", 540, 920);

      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `healsy-aura-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Aura image downloaded! Share it on social media ✨");
      }, "image/png");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate share image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="text-center space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={generateShareImage}
          disabled={isGenerating}
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
          ) : (
            <><Download className="w-5 h-5 mr-2" />Download Glow Image</>
          )}
        </Button>
      </motion.div>
      <p className="text-sm text-slate-500">
        Create a stunning Instagram-ready image with your aura glow effect
      </p>
    </div>
  );
}