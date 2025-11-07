import * as React from "react"
import { motion } from "framer-motion"

const Toggle = React.forwardRef(({ 
  checked, 
  onCheckedChange, 
  disabled = false,
  className = "",
  label,
  description,
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={`group inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      
      {(label || description) && (
        <div className="flex-1 text-left">
          {label && (
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {label}
            </div>
          )}
          {description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </div>
          )}
        </div>
      )}
      
      <motion.div
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
          checked 
            ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
            : 'bg-slate-300 dark:bg-slate-600'
        } ${disabled ? '' : 'group-hover:shadow-lg'}`}
        whileTap={disabled ? {} : { scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{
            x: checked ? 24 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
        
        {/* Glow effect when checked */}
        {checked && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-full bg-violet-400/50 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </button>
  )
})

Toggle.displayName = "Toggle"

export { Toggle }