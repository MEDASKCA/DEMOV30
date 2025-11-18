'use client';

import React, { useState, useEffect, Suspense } from 'react';
import TomLeftPanel from '@/components/TomLeftPanel';
import VoiceModeButton from '@/components/VoiceModeButton';
import HospitalSelector from '@/components/HospitalSelector';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTomCollapsed, setIsTomCollapsed] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showTomPanel, setShowTomPanel] = useState(true); // Default to true since default view is chat

  // Only show TOM panel on chat view, hide on feeds/home view
  useEffect(() => {
    const currentView = searchParams?.get('view');
    if (currentView) {
      setShowTomPanel(currentView === 'chat');
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-account-menu]')) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAccountMenu]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Global Headers - Static across ALL admin pages */}

      {/* ADMIN DEMO ACCOUNT Header */}
      <div
        onClick={() => router.push('/')}
        className="w-full bg-purple-600 text-white flex items-center justify-center gap-3 px-4 cursor-pointer hover:bg-purple-700 transition-colors flex-shrink-0 z-[110]"
        style={{ height: '28px' }}
      >
        <p className="text-sm font-bold whitespace-nowrap">ADMIN DEMO ACCOUNT</p>
      </div>

      {/* TOM by MEDASKCA Header */}
      <div className="text-white flex-shrink-0 shadow-lg z-[110]" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between">
          {/* Left: Branding */}
          <div>
            <h1 className="text-xl font-bold">TOM by MEDASKCA</h1>
            <p className="text-sm text-white/90">Theatre Operations Manager</p>
            <p className="text-xs italic text-white/80">Demo for NHSCEP Cohort 10</p>
          </div>

          {/* Right: Hospital Selector & User Profile */}
          <div className="flex items-center gap-2">
            <HospitalSelector />

            {/* User Profile Dropdown */}
            <div className="relative" data-account-menu>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <img
                  src="/profile/alexander-monterubio.jpg"
                  alt="Alexander Monterubio"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                  onError={(e) => {
                    // Fallback to initials if image not found
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30';
                    fallback.textContent = 'AM';
                    e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
                  }}
                />
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-white">Alexander Monterubio</p>
                  <p className="text-xs text-white/70">Team Leader</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[120]">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      // TODO: Navigate to settings
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      // TODO: Navigate to help
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with TOM Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* TOM Left Panel - Desktop Only - Show only on chat view */}
        {showTomPanel && (
          <div className="hidden md:block">
            <TomLeftPanel
              isOpen={true}
              onClose={() => {}}
              onCollapseChange={setIsTomCollapsed}
              isMobile={false}
            />
          </div>
        )}

        {/* Voice Mode Button - Mobile Only */}
        <VoiceModeButton
          onClick={() => {
            router.push('/admin?view=chat');
          }}
          voiceState="idle"
        />

        {/* Main Content - Adjusted for TOM panel */}
        <div className={`flex-1 transition-all duration-300 overflow-hidden ${showTomPanel && (isTomCollapsed ? 'md:pl-16' : 'md:pl-80')}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-600 to-purple-600 flex items-center justify-center">
      <div className="text-white text-lg font-semibold">Loading...</div>
    </div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
