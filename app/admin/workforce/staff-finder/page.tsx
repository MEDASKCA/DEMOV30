'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import DesktopRoster from '@/features/roster/components/DesktopRoster';
import HospitalSelector from '@/components/HospitalSelector';

export default function StaffFinderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="text-white sticky top-0 z-50 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Back</span>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Staff Finder
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Admin</span>
                </h1>
                <p className="text-sm text-white/90 mt-0.5">
                  Search & locate staff
                </p>
              </div>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <DesktopRoster />
      </div>
    </div>
  );
}
