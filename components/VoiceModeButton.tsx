'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceModeButtonProps {
  onClick: () => void;
  voiceState?: 'idle' | 'listening' | 'processing' | 'speaking';
}

export default function VoiceModeButton({ onClick, voiceState = 'idle' }: VoiceModeButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Waveform bar heights based on state
  const getBarAnimations = () => {
    switch (voiceState) {
      case 'listening':
        return {
          heights: [0.3, 0.6, 0.9, 0.6, 0.3],
          duration: 0.6,
          repeat: Infinity
        };
      case 'processing':
        return {
          heights: [0.5, 0.5, 0.5, 0.5, 0.5],
          duration: 1.2,
          repeat: Infinity
        };
      case 'speaking':
        return {
          heights: [0.4, 0.8, 0.6, 0.9, 0.5],
          duration: 0.4,
          repeat: Infinity
        };
      default:
        return {
          heights: [0.3, 0.3, 0.3, 0.3, 0.3],
          duration: 2,
          repeat: 0
        };
    }
  };

  const animations = getBarAnimations();

  const getButtonColor = () => {
    switch (voiceState) {
      case 'listening':
        return 'from-blue-500 via-blue-600 to-indigo-600';
      case 'processing':
        return 'from-purple-500 via-purple-600 to-pink-600';
      case 'speaking':
        return 'from-teal-500 via-green-500 to-emerald-600';
      default:
        return 'from-blue-600 via-purple-600 to-pink-600';
    }
  };

  const getLabel = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Voice Mode';
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{
        top: -(window.innerHeight - 200),
        left: -(window.innerWidth - 100),
        right: window.innerWidth - 100,
        bottom: window.innerHeight - 200
      }}
      dragElastic={0.05}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      dragMomentum={false}
      onDragStart={() => {
        console.log('Drag started');
        setIsDragging(true);
      }}
      onDrag={(event, info) => {
        setPosition({ x: info.point.x, y: info.point.y });
      }}
      onDragEnd={() => {
        console.log('Drag ended');
        // Delay to prevent click after drag
        setTimeout(() => setIsDragging(false), 150);
      }}
      initial={{ x: 0, y: 0 }}
      style={{
        touchAction: 'none', // Prevent touch scrolling while dragging
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      className="fixed bottom-20 right-6 z-[9999] md:hidden flex items-center gap-3"
    >
      {/* Status Label */}
      {voiceState !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={`px-3 py-2 rounded-full backdrop-blur-md shadow-lg font-medium text-sm whitespace-nowrap ${
            voiceState === 'listening' ? 'bg-blue-500/90 text-white' :
            voiceState === 'processing' ? 'bg-purple-500/90 text-white' :
            'bg-teal-500/90 text-white'
          }`}
        >
          {getLabel()}
        </motion.div>
      )}

      {/* Voice Button */}
      <motion.button
        onTap={() => {
          // Only trigger onClick if not dragging
          if (!isDragging) {
            onClick();
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-16 h-16 bg-gradient-to-br ${getButtonColor()} text-white rounded-full shadow-2xl flex items-center justify-center group overflow-hidden relative`}
        style={{
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
          cursor: isDragging ? 'grabbing' : 'pointer'
        }}
      >
      {/* Pulsing background rings */}
      {voiceState !== 'idle' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
            animate={{
              scale: [1, 1.5, 1],
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
              scale: [1, 1.5, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </>
      )}

      {/* Waveform Icon */}
      <div className="relative z-10 flex items-center justify-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-white rounded-full"
            initial={{ height: '8px' }}
            animate={{
              height: [`${animations.heights[i] * 24}px`, `${animations.heights[4 - i] * 24}px`, `${animations.heights[i] * 24}px`]
            }}
            transition={{
              duration: animations.duration,
              repeat: animations.repeat,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* Status indicator dot */}
      {voiceState !== 'idle' && (
        <motion.div
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full z-20 ${
            voiceState === 'listening' ? 'bg-blue-400' :
            voiceState === 'processing' ? 'bg-purple-400' :
            'bg-green-400'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-50" />
        </motion.div>
      )}

      {/* Tooltip - Only show in idle state */}
      {voiceState === 'idle' && (
        <div className="absolute bottom-full mb-3 right-0 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {getLabel()}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </motion.button>
    </motion.div>
  );
}
