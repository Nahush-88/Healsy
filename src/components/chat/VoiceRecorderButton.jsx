import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export default function VoiceRecorderButton({ onText, className = "" }) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        if (text && onText) onText(text);
      };
      rec.onend = () => setRecording(false);
      recRef.current = rec;
    } else {
      setSupported(false);
    }
  }, [onText]);

  const toggle = () => {
    if (!supported) return;
    if (recording) {
      try { recRef.current?.stop(); } catch {}
      setRecording(false);
    } else {
      try { recRef.current?.start(); setRecording(true); } catch {}
    }
  };

  if (!supported) {
    return (
      <button
        aria-label="Voice not supported"
        className={`px-3 py-2 rounded-lg border bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed ${className}`}
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition ${className}`}
      aria-label={recording ? "Stop recording" : "Start voice input"}
    >
      {recording ? <Square className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}