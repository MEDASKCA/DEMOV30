'use client';

import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TomFloatingButtonProps {
  onClick: () => void;
}

export default function TomFloatingButton({ onClick }: TomFloatingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 md:hidden group"
      style={{
        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)'
      }}
    >
      {/* Pulsing ring animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-75"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Icon */}
      <div className="relative">
        <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with TOM
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </motion.button>
  );
}
