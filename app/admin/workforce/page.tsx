'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Users, Search, PoundSterling, Briefcase, CalendarOff, MapPin, Send, Mic, ChevronDown, User, Settings, HelpCircle, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import TomLogo from '@/components/TomLogo';
import DesktopRoster from '@/features/roster/components/DesktopRoster';
import StaffingCostCalculator from '@/components/finance/StaffingCostCalculator';
import LeaveCalculator from '@/components/finance/LeaveCalculator';
import FTEConverter from '@/components/finance/FTEConverter';
import StaffListByTeams from '@/components/workforce/StaffListByTeams';
import HospitalFinder from '@/features/duties/components/HospitalFinder';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

type SidebarTab = 'fte' | 'teams' | 'leave' | 'finder' | 'costs';

function WorkforcePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('fte');
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('ops');
  const [selectedFinderType, setSelectedFinderType] = useState<'staff' | 'hospital' | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory') => {
    setCurrentPage(page);

    if (page === 'home') {
      router.push('/admin');
    } else if (page === 'ai') {
      router.push('/admin');
    } else if (page === 'ops') {
      setDrawerType('ops');
      setShowDrawer(true);
    } else if (page === 'theatres') {
      setDrawerType('theatres');
      setShowDrawer(true);
    } else if (page === 'alerts') {
      setDrawerType('alerts');
      setShowDrawer(true);
    } else if (page === 'menu') {
      setDrawerType('menu');
      setShowDrawer(true);
    }
  };

  const handleDrawerNavigate = (viewId: string) => {
    setShowDrawer(false);

    if (viewId === 'dashboard') {
      router.push('/admin');
    } else if (viewId === 'configurations') {
      router.push('/admin/theatre-management?tab=configurations');
    } else if (viewId === 'sessions' || viewId === 'schedule') {
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
    } else if (viewId === 'profile') {
      router.push('/profile');
    } else if (viewId === 'settings' || viewId === 'help' || viewId === 'critical-alerts' || viewId === 'pending-tasks' || viewId === 'incidents') {
      // Redirect to admin page for these views
      router.push('/admin');
    } else if (viewId === 'signout') {
      router.push('/');
    }
  };

  useEffect(() => {
    setMounted(true);

    // Set active tab from URL query parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && ['fte', 'teams', 'leave', 'finder', 'costs'].includes(tabParam)) {
      setActiveTab(tabParam as SidebarTab);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'fte' as SidebarTab, label: 'FTE', icon: Briefcase, description: 'Full-time equivalent tracking' },
    { id: 'teams' as SidebarTab, label: 'Teams', icon: Users, description: 'Team structure & management' },
    { id: 'leave' as SidebarTab, label: 'Leave Allocation', icon: CalendarOff, description: 'Leave requests & absence' },
    { id: 'finder' as SidebarTab, label: 'Finder', icon: Search, description: 'Find staff or hospitals' },
    { id: 'costs' as SidebarTab, label: 'Costs', icon: PoundSterling, description: 'Workforce cost analysis' },
  ];

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);

    // Default to Staff Finder when Finder tab is selected
    if (tab === 'finder') {
      setSelectedFinderType('staff');
    } else {
      setSelectedFinderType(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Shifts
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Procedures & Preferences
            </button>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Supplies
            </button>
            <button
              onClick={() => router.push('/admin/equipment')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Equipment
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

      {/* Page Title & Description - Desktop Only */}
      <div className="hidden md:block px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Workforce Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Workforce planning, costs, and FTE tracking
        </p>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-50 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">
                Workforce
              </h1>
              <p className="text-sm text-white/90 mt-0.5">
                Workforce management & planning
              </p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-[76px] z-40 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-2 py-2 min-w-max">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200">
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-teal-50 border-l-4 border-teal-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isActive ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-sm ${
                      isActive ? 'text-teal-900' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {/* Finder - Staff View (Full Width - No Padding) */}
          {activeTab === 'finder' && selectedFinderType === 'staff' && (
              <div className="w-full h-full flex flex-col overflow-hidden">
                {/* Finder Control Banner - Desktop */}
                <div className="hidden md:flex bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-6 py-4 shadow-lg items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Staff Finder</h3>
                      <p className="text-sm text-white/80">Find qualified theatre staff for your hospital</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* TOM AI Search Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                          <TomLogo size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Ask TOM AI anything..."
                          value={staffSearchQuery}
                          onChange={(e) => setStaffSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              console.log('TOM AI search:', staffSearchQuery);
                            }
                          }}
                          className="w-80 pl-11 pr-4 py-2.5 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white bg-white/20 backdrop-blur-sm placeholder-white/70 text-white font-medium"
                        />
                      </div>
                      <button
                        onClick={() => {
                          console.log('Voice input activated');
                        }}
                        className="p-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all"
                        title="Voice input"
                      >
                        <Mic className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('TOM AI search:', staffSearchQuery);
                        }}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
                        title="Send"
                      >
                        <Send className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedFinderType('hospital')}
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm text-purple-700 rounded-lg font-semibold hover:bg-white transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Switch to Hospital Finder</span>
                    </button>
                  </div>
                </div>

                {/* Finder Control Banner - Mobile */}
                <div className="md:hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-4 py-3 shadow-lg flex-shrink-0">
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">Staff Finder</h3>
                        <p className="text-xs text-white/80">Find qualified theatre staff</p>
                      </div>
                    </div>

                    {/* TOM AI Search Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                          <TomLogo size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Ask TOM AI..."
                          value={staffSearchQuery}
                          onChange={(e) => setStaffSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              console.log('TOM AI search:', staffSearchQuery);
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white bg-white/20 backdrop-blur-sm placeholder-white/70 text-white text-sm font-medium"
                        />
                      </div>
                      <button
                        onClick={() => {
                          console.log('Voice input activated');
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all"
                        title="Voice input"
                      >
                        <Mic className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('TOM AI search:', staffSearchQuery);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
                        title="Send"
                      >
                        <Send className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>

                    {/* Switch Button */}
                    <button
                      onClick={() => setSelectedFinderType('hospital')}
                      className="w-full py-2 bg-white/90 backdrop-blur-sm text-purple-700 rounded-lg font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Switch to Hospital Finder</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <DesktopRoster hideSearch={false} />
                </div>
              </div>
            )}

          {/* Finder - Hospital View (Full Width - No Padding) */}
          {activeTab === 'finder' && selectedFinderType === 'hospital' && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {/* Finder Control Banner - Desktop */}
              <div className="hidden md:flex bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 text-white px-6 py-4 shadow-lg items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Hospital Finder</h3>
                    <p className="text-sm text-white/80">Discover available shifts at nearby hospitals</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* TOM AI Search Input */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <TomLogo size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ask TOM AI anything..."
                        value={hospitalSearchQuery}
                        onChange={(e) => setHospitalSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            console.log('TOM AI search:', hospitalSearchQuery);
                          }
                        }}
                        className="w-80 pl-11 pr-4 py-2.5 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white bg-white/20 backdrop-blur-sm placeholder-white/70 text-white font-medium"
                      />
                    </div>
                    <button
                      onClick={() => {
                        console.log('Voice input activated');
                      }}
                      className="p-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('TOM AI search:', hospitalSearchQuery);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
                      title="Send"
                    >
                      <Send className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedFinderType('staff')}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-700 rounded-lg font-semibold hover:bg-white transition-all flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Switch to Staff Finder</span>
                  </button>
                </div>
              </div>

              {/* Finder Control Banner - Mobile */}
              <div className="md:hidden bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 text-white px-4 py-3 shadow-lg flex-shrink-0">
                <div className="flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Hospital Finder</h3>
                      <p className="text-xs text-white/80">Find available shifts nearby</p>
                    </div>
                  </div>

                  {/* TOM AI Search Input */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                        <TomLogo size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ask TOM AI..."
                        value={hospitalSearchQuery}
                        onChange={(e) => setHospitalSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            console.log('TOM AI search:', hospitalSearchQuery);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white bg-white/20 backdrop-blur-sm placeholder-white/70 text-white text-sm font-medium"
                      />
                    </div>
                    <button
                      onClick={() => {
                        console.log('Voice input activated');
                      }}
                      className="p-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('TOM AI search:', hospitalSearchQuery);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
                      title="Send"
                    >
                      <Send className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>

                  {/* Switch Button */}
                  <button
                    onClick={() => setSelectedFinderType('staff')}
                    className="w-full py-2 bg-white/90 backdrop-blur-sm text-blue-700 rounded-lg font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Switch to Staff Finder</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <HospitalFinder hideSearch={false} />
              </div>
            </div>
          )}

          {/* Other Tabs with Padding */}
          <div className="md:p-4 p-6">
            {/* FTE Tab */}
            {activeTab === 'fte' && (
              <div className="w-full mx-auto">
                <FTEConverter />
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="w-full mx-auto">
                <StaffListByTeams />
              </div>
            )}

            {/* Leave Allocation Tab */}
            {activeTab === 'leave' && (
              <div className="w-full mx-auto">
                <LeaveCalculator />
              </div>
            )}

            {/* Costs Tab */}
            {activeTab === 'costs' && (
              <div className="w-full mx-auto">
                <StaffingCostCalculator />
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}

export default function WorkforcePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkforcePageContent />
    </Suspense>
  );
}
