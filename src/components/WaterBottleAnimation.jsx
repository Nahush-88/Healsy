import React from 'react';
import { motion } from 'framer-motion';

export default function WaterBottleAnimation({ progress = 0 }) {
  const fillHeight = Math.max(10, Math.min(90, progress * 90));
  
  return (
    <div className="relative w-32 h-48 mx-auto">
      {/* Bottle outline */}
      <svg 
        viewBox="0 0 100 150" 
        className="w-full h-full drop-shadow-lg"
      >
        {/* Bottle body */}
        <path
          d="M25 40 L25 130 Q25 140 35 140 L65 140 Q75 140 75 130 L75 40 L70 35 L70 20 Q70 15 65 15 L35 15 Q30 15 30 20 L30 35 Z"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        
        {/* Water fill */}
        <motion.path
          d={`M25 ${140 - fillHeight} L25 130 Q25 140 35 140 L65 140 Q75 140 75 130 L75 ${140 - fillHeight} Z`}
          fill="url(#waterGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Water surface animation */}
        <motion.ellipse
          cx="50"
          cy={140 - fillHeight}
          rx="25"
          ry="3"
          fill="rgba(59, 130, 246, 0.3)"
          animate={{ 
            ry: [3, 4, 3],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
        
        {/* Bottle cap */}
        <rect x="32" y="10" width="36" height="8" rx="4" fill="#64748b" />
        
        {/* Water gradient definition */}
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-lg drop-shadow-md">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}