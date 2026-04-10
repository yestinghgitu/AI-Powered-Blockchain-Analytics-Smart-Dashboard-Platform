import React from 'react';
import { motion } from 'framer-motion';

export const BlockchainFlow = ({ verified }: { verified: boolean }) => {
  return (
    <div className="relative w-full h-32 flex items-center justify-center bg-black/40 rounded-xl border border-white/5 overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0, 229, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 229, 255, 1)" />
            <stop offset="100%" stopColor="rgba(0, 229, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Nodes */}
        {[50, 150, 250, 350].map((x, i) => (
           <motion.circle 
             key={`node-${i}`} 
             cx={x} 
             cy={50} 
             r={10} 
             fill={verified ? (i === 3 ? "#00e5ff" : "#1e293b") : "#1e293b"} 
             stroke={verified ? "#00e5ff" : "#334155"} 
             strokeWidth={2}
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ duration: 0.5, delay: i * 0.1 }}
           />
        ))}

        {/* Path Lines */}
        <path d="M 60 50 L 140 50 M 160 50 L 240 50 M 260 50 L 340 50" stroke="#334155" strokeWidth={2} fill="none" />

        {/* Animated Beam */}
        {verified && (
          <motion.rect
            x={50}
            y={48}
            width={40}
            height={4}
            fill="url(#beam)"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 350, opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </svg>
      {verified && (
         <div className="absolute top-2 right-4 text-[10px] text-[#00e5ff] font-mono tracking-widest uppercase animate-pulse">
            Sync Stable
         </div>
      )}
    </div>
  );
};
