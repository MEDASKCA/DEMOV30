'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Building2, Calendar, Users, ClipboardList, Settings, CheckCircle, AlertCircle, Loader2, ChevronDown, User, HelpCircle, LogOut } from 'lucide-react';
import {
  getHospitalConfig,
  saveHospitalConfig,
  getTheatres,
  HospitalConfig
} from '@/lib/scheduling/theatreService';
import TheatreUnitsManager from '@/components/scheduling/TheatreUnitsManager';
import SpecialtyManager from '@/components/configuration/SpecialtyManager';
import SessionTypesManager from '@/components/configuration/SessionTypesManager';
import SpecialtyTheatreMapping from '@/components/scheduling/SpecialtyTheatreMapping';
import TheatreConfiguration from '@/components/scheduling/TheatreConfiguration';
import HospitalSelector from '@/components/HospitalSelector';
import PoolView from '@/components/views/PoolView';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

type TabType = 'configurations' | 'sessions' | 'requirements' | 'list';
type ConfigSubTab = 'specialties' | 'sessionTypes' | 'units' | 'mapping' | 'theatres';

function TheatreManagementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams?.get('tab') as TabType) || 'configurations');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('specialties');
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('theatres');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory') => {
    setCurrentPage(page);

    if (page === 'home') {
      router.push('/admin');
    } else if (page === 'ai') {
      router.push('/admin'); // Navigate to main admin and show AI
    } else if (page === 'ops') {
      // Show ops drawer
      setDrawerType('ops');
      setShowDrawer(true);
    } else if (page === 'theatres') {
      // Show logistics drawer
      setDrawerType('theatres');
      setShowDrawer(true);
    } else if (page === 'alerts') {
      // Show alerts drawer
      setDrawerType('alerts');
      setShowDrawer(true);
    } else if (page === 'menu') {
      // Show account drawer
      setDrawerType('menu');
      setShowDrawer(true);
    }
  };

  const handleDrawerNavigate = (viewId: string) => {
    setShowDrawer(false);

    // Handle navigation based on the view
    if (viewId === 'dashboard') {
      router.push('/admin');
    } else if (viewId === 'configurations') {
      // Already on configurations page, just close drawer
    } else if (viewId === 'sessions') {
      router.push('/admin/schedule');
    } else if (viewId === 'schedule') {
      router.push('/admin/schedule');
    } else if (viewId === 'list') {
      router.push('/admin/theatre-management?tab=list');
    } else if (viewId === 'requirements') {
      router.push('/admin/staff-allocation');
    } else if (viewId === 'workforce') {
      router.push('/admin/workforce');
    } else if (viewId === 'inventory') {
      router.push('/admin/inventory');
    } else if (viewId === 'opcs4-database') {
      router.push('/admin/procedures/opcs4-database');
    } else if (viewId === 'preference-cards') {
      router.push('/admin/procedures/preference-cards');
    }
  };

  // Hospital config state
  const [hospitalName, setHospitalName] = useState('');
  const [savingHospital, setSavingHospital] = useState(false);
  const [hospitalSaveStatus, setHospitalSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);


  useEffect(() => {
    loadHospitalConfig();
  }, []);

  useEffect(() => {
    // Sync activeTab with URL parameter changes
    const tabParam = searchParams?.get('tab') as TabType;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Update URL when tab changes
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.pushState({}, '', url.toString());
  }, [activeTab]);

  const loadHospitalConfig = async () => {
    setLoadingConfig(true);
    try {
      const config = await getHospitalConfig();
      if (config) {
        setHospitalName(config.name);
      }
    } catch (error) {
      console.error('Error loading hospital config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveHospitalConfig = async () => {
    // Validate hospital name is filled
    if (!hospitalName || hospitalName.trim() === '') {
      setHospitalSaveStatus('error');
      alert('Please enter a hospital or facility name before saving.');
      return;
    }

    setSavingHospital(true);
    setHospitalSaveStatus('idle');
    try {
      await saveHospitalConfig({
        name: hospitalName,
        numberOfTheatres: 0,
        emergencyTheatres: 0,
        specialties: []
      });
      setHospitalSaveStatus('success');
      setTimeout(() => setHospitalSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving hospital config:', error);
      setHospitalSaveStatus('error');
    } finally {
      setSavingHospital(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/schedule')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Schedule
            </button>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Workforce
            </button>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Inventory
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Procedures & Preferences
            </button>
            <button
              onClick={() => router.push('/admin/readiness')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Readiness
            </button>
            <button
              onClick={() => router.push('/admin/operations')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Page Title & Description - Desktop Only - Show only for Configurations */}
      {activeTab === 'configurations' && (
        <div className="hidden md:block px-6 py-4 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">Theatre Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure theatre units, specialties, and settings
          </p>
        </div>
      )}

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                {activeTab === 'configurations' && 'Configurations'}
                {activeTab === 'sessions' && 'Sessions'}
                {activeTab === 'requirements' && 'Requirements'}
                {activeTab === 'list' && 'Schedule Pool'}
              </h1>
              <p className="text-xs text-white/90 mt-0.5">
                {activeTab === 'configurations' && 'Units, specialties & theatre setup'}
                {activeTab === 'sessions' && 'Theatre session planning'}
                {activeTab === 'requirements' && 'Staff requirements & planning'}
                {activeTab === 'list' && 'Year-long theatre schedule pool'}
              </p>
            </div>
            <HospitalSelector />
          </div>
        </div>

        {/* Configuration Sub-Tabs - Only show when in configurations */}
        {activeTab === 'configurations' && (
          <div className="bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setConfigSubTab('specialties')}
                className={`flex-1 min-w-fit px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  configSubTab === 'specialties'
                    ? 'text-teal-700 bg-teal-50 border-teal-700'
                    : 'text-gray-700 border-transparent hover:text-teal-700 hover:bg-gray-50'
                }`}
              >
                Specialties
              </button>
              <button
                onClick={() => setConfigSubTab('units')}
                className={`flex-1 min-w-fit px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  configSubTab === 'units'
                    ? 'text-teal-700 bg-teal-50 border-teal-700'
                    : 'text-gray-700 border-transparent hover:text-teal-700 hover:bg-gray-50'
                }`}
              >
                Units
              </button>
              <button
                onClick={() => setConfigSubTab('sessionTypes')}
                className={`flex-1 min-w-fit px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  configSubTab === 'sessionTypes'
                    ? 'text-teal-700 bg-teal-50 border-teal-700'
                    : 'text-gray-700 border-transparent hover:text-teal-700 hover:bg-gray-50'
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setConfigSubTab('mapping')}
                className={`flex-1 min-w-fit px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  configSubTab === 'mapping'
                    ? 'text-teal-700 bg-teal-50 border-teal-700'
                    : 'text-gray-700 border-transparent hover:text-teal-700 hover:bg-gray-50'
                }`}
              >
                Mapping
              </button>
              <button
                onClick={() => setConfigSubTab('theatres')}
                className={`flex-1 min-w-fit px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  configSubTab === 'theatres'
                    ? 'text-teal-700 bg-teal-50 border-teal-700'
                    : 'text-gray-700 border-transparent hover:text-teal-700 hover:bg-gray-50'
                }`}
              >
                Theatres
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="w-full h-full pb-20 md:pb-0">
        {activeTab === 'configurations' && (
          <div className="w-full">
            {/* Main Content - Configuration Forms */}
            <div>
              {/* Hospital Configuration */}
              <div className="space-y-4">
                {loadingConfig ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 p-16">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Loading configuration...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Surgical Specialties */}
                    {configSubTab === 'specialties' && (
                      <div className="bg-white">
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                          <h2 className="text-sm md:text-base font-semibold text-teal-800 tracking-tight">Surgical Specialties</h2>
                          <p className="text-xs text-teal-600 mt-0.5">Configure surgical specialties and subspecialties</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <SpecialtyManager />
                        </div>
                      </div>
                    )}

                    {/* Theatre Units */}
                    {configSubTab === 'units' && (
                      <div className="bg-white">
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                          <h2 className="text-sm md:text-base font-semibold text-teal-800 tracking-tight">Theatre Units & Locations</h2>
                          <p className="text-xs text-teal-600 mt-0.5">Define theatre units and their configurations</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <TheatreUnitsManager />
                        </div>
                      </div>
                    )}

                    {/* Session Types */}
                    {configSubTab === 'sessionTypes' && (
                      <div className="bg-white">
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                          <h2 className="text-sm md:text-base font-semibold text-teal-800 tracking-tight">Session Types</h2>
                          <p className="text-xs text-teal-600 mt-0.5">Configure theatre session types and durations</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <SessionTypesManager />
                        </div>
                      </div>
                    )}

                    {/* Specialty-Theatre Mapping */}
                    {configSubTab === 'mapping' && (
                      <div className="bg-white">
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                          <h2 className="text-sm md:text-base font-semibold text-teal-800 tracking-tight">Specialty-Theatre Mapping</h2>
                          <p className="text-xs text-teal-600 mt-0.5">Map specialties to specific theatre locations</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <SpecialtyTheatreMapping />
                        </div>
                      </div>
                    )}

                    {/* Theatre Configuration */}
                    {configSubTab === 'theatres' && (
                      <div className="bg-white">
                        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                          <h2 className="text-sm md:text-base font-semibold text-teal-800 tracking-tight">Theatre Configuration</h2>
                          <p className="text-xs text-teal-600 mt-0.5">Configure theatres with specialty priorities and session preferences</p>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <TheatreConfiguration />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="h-[calc(100vh-14rem)]">
            <PoolView />
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <AdminBottomNav
          currentPage={currentPage}
          onNavigate={handleBottomNavClick}
        />
      </div>

      {/* Admin Drawer */}
      <AdminDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        drawerType={drawerType}
        onNavigate={handleDrawerNavigate}
      />

      {/* Optimized styles */}
      <style jsx global>{`
        /* Touch-friendly tap targets */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* Smooth scrolling for tabs */
        .scrollbar-thin::-webkit-scrollbar {
          height: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Professional focus states */
        input:focus,
        button:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #14B8A6;
          outline-offset: 2px;
        }

        /* Typography */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Smooth, professional transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Button styling */
        button {
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Better text rendering */
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }

        /* iOS safe area support */
        @supports (padding: max(0px)) {
          body {
            padding-left: max(0px, env(safe-area-inset-left));
            padding-right: max(0px, env(safe-area-inset-right));
          }
        }

        /* Compact mobile design */
        @media (max-width: 640px) {
          body {
            font-size: 14px;
          }
        }

        /* Professional hover states */
        button:active:not(:disabled) {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}

export default function TheatreManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TheatreManagementPageContent />
    </Suspense>
  );
}
