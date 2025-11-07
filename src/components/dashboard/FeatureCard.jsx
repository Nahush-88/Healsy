import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FeatureCard({ title, description, icon: Icon, to, gradient = "from-violet-500 to-indigo-600" }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group"
    >
      <Link to={to} className="block">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-all">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-lg shadow-violet-500/20`}>
            <Icon className="w-5 h-5" />
          </div>
          <h4 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-4 text-sm font-semibold text-violet-700 dark:text-violet-300">
            Explore <span className="inline-block transform group-hover:translate-x-0.5 transition-transform">→</span>
          </div>

          <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />
        </div>
      </Link>
    </motion.div>
  );
}