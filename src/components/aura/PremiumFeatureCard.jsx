import React from "react";
import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";

export default function PremiumFeatureCard({ feature, onUpgrade }) {
  return (
    <motion.div
      whileHover={feature.locked ? { scale: 1.02, y: -4 } : { scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={feature.locked ? onUpgrade : undefined}
      className={`relative p-6 rounded-2xl border-2 transition-all ${
        feature.locked
          ? "glass border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
          : "glass border-violet-200 dark:border-violet-800/50"
      }`}
    >
      {feature.locked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
        >
          <Crown className="w-4 h-4 text-white" />
        </motion.div>
      )}
      <div className="text-center space-y-3">
        <div className="text-4xl">{feature.icon}</div>
        <h4 className="font-bold text-gray-800 dark:text-white">{feature.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
        {feature.locked && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold pt-2"
          >
            <Lock className="w-4 h-4" />
            <span>Tap to Unlock</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}