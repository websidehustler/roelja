import React from 'react';
import { motion } from 'motion/react';

interface BreathingCircleProps {
  isBreathing: boolean;
  duration: number; // Duration of one full cycle (inhale + exhale)
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ isBreathing, duration }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={isBreathing ? {
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-48 h-48 rounded-full bg-amber-500/20 blur-3xl"
      />

      {/* Main Circle */}
      <motion.div
        animate={isBreathing ? {
          scale: [1, 2.2, 1],
        } : {}}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 rounded-full border border-amber-400/50 flex items-center justify-center"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-200/10 to-transparent" />
        
        {/* Inner Core */}
        <motion.div 
          animate={isBreathing ? {
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]" 
        />
      </motion.div>

      {/* Breathing Text Guide */}
      <motion.div
        animate={isBreathing ? {
          opacity: [0, 1, 0, 1, 0],
        } : { opacity: 0 }}
        transition={{
          duration: duration,
          repeat: Infinity,
          times: [0, 0.2, 0.5, 0.7, 1],
          ease: "easeInOut",
        }}
        className="absolute -bottom-16 text-amber-200/60 font-light tracking-[0.2em] uppercase text-xs"
      >
        <span className="inline-block w-24 text-center">
          {/* This is a bit tricky with pure CSS/Motion for text swap, 
              we'll handle the text swap in the parent if needed, 
              but for now let's just show a pulse */}
          Breathe
        </span>
      </motion.div>
    </div>
  );
};
