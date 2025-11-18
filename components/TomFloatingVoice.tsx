'use client';

import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import MedaskLogo from './MedaskLogo';

interface TomFloatingVoiceProps {
  onClick: () => void;
}

export default function TomFloatingVoice({ onClick }: TomFloatingVoiceProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 md:hidden group overflow-hidden"
      style={{
        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)'
      }}
    >
      {/* Pulsing rings animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Icon - Small MEDASKCA logo */}
      <div className="relative z-10">
        <img
          src="/medaskca-logo.png"
          alt="MEDASKCA Logo"
          className="w-9 h-9 object-contain"
        />
      </div>

      {/* Mic badge */}
      <motion.div
        className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-20"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Mic className="w-3.5 h-3.5 text-purple-600" strokeWidth={2.5} />
      </motion.div>

      {/* Sparkle badge */}
      <Sparkles className="w-4 h-4 absolute -bottom-0.5 -left-0.5 text-yellow-300 animate-pulse z-20" />

      {/* Tooltip */}
      <div className="absolute bottom-full mb-3 right-0 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Talk to TOM AI
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </motion.button>
  );
}
