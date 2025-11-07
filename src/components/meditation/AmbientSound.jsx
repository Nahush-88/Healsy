import React from "react";
import { Volume2, VolumeX, Play, Pause, Radio } from "lucide-react";

// Lightweight ambient generator using Web Audio API (looped soft noise)
export default function AmbientSound() {
  const ctxRef = React.useRef(null);
  const sourceRef = React.useRef(null);
  const gainRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(0.15);

  const createNoiseBuffer = (ctx) => {
    const duration = 2; // seconds
    const sampleRate = ctx.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Simple brownish noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const brown = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brown;
      data[i] = brown * 0.3; // keep soft
    }
    return buffer;
  };

  const start = async () => {
    if (playing) return;
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain).connect(ctx.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
    setPlaying(true);
  };

  const stop = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setPlaying(false);
  };

  const toggle = () => (playing ? stop() : start());

  const onVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  React.useEffect(() => {
    return () => {
      try { stop(); } catch {}
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch {}
      }
    };
  }, []);

  return (
    <div className="flex w-full items-center justify-between gap-3 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 opacity-90" />
        <span className="text-sm font-medium">Ambient Sound</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
          aria-label={playing ? "Pause ambient" : "Play ambient"}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2">
          {volume > 0 ? <Volume2 className="w-4 h-4 opacity-90" /> : <VolumeX className="w-4 h-4 opacity-90" />}
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={volume}
            onChange={onVolume}
            className="w-28 accent-white"
          />
        </div>
      </div>
    </div>
  );
}