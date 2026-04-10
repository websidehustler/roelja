import React from 'react';
import { motion } from 'motion/react';

export const SacredGeometry: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        scale: [0.95, 1, 0.95],
        rotate: 360 
      }}
      transition={{ 
        opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 120, repeat: Infinity, ease: "linear" }
      }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none -z-5"
    >
      <svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] text-amber-500/20"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)" stroke="currentColor" fill="none" strokeWidth="0.5">
          {/* Metatron's Cube simplified representation */}
          <circle cx="300" cy="300" r="280" />
          <circle cx="300" cy="300" r="140" />
          
          {/* Hexagon points */}
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 300 + 140 * Math.cos(rad);
            const y = 300 + 140 * Math.sin(rad);
            const x2 = 300 + 280 * Math.cos(rad);
            const y2 = 300 + 280 * Math.sin(rad);
            
            return (
              <React.Fragment key={angle}>
                <circle cx={x} cy={y} r="40" />
                <circle cx={x2} cy={y2} r="40" />
                <line x1="300" y1="300" x2={x2} y2={y2} />
              </React.Fragment>
            );
          })}
          
          {/* Connecting lines */}
          <polygon points="300,20 542,160 542,440 300,580 58,440 58,160" />
          <polygon points="300,160 421,230 421,370 300,440 179,370 179,230" />
        </g>
      </svg>
    </motion.div>
  );
};
