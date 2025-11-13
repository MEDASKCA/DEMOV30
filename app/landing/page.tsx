'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 50%, #F3E8FF 100%)'}}>
      <div className="text-center max-w-2xl">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent mb-4" style={{backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
          TOM by MEDASKCA
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-700 font-medium mb-2">
          Theatre Operations Manager
        </p>

        <p className="text-gray-600 mb-12 max-w-lg mx-auto">
          Intelligent theatre operations management for NHS trusts
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push('/signup')}
            className="w-full sm:w-auto px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
          >
            Get Connected
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 transition-all"
            style={{borderColor: '#06B6D4'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#06B6D4';
              e.currentTarget.style.borderColor = '#8B5CF6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.borderColor = '#06B6D4';
            }}
          >
            Sign In
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-12">
          Demo for NHS Clinical Entrepreneur Programme
        </p>
      </div>
    </div>
  );
}
