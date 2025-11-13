'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings, Calendar, Users, ClipboardList, Loader2, ChevronDown, User, HelpCircle, LogOut, UserCircle, Grid3x3, List } from 'lucide-react';
import {
  getHospitalConfig,
  saveHospitalConfig,
  getTheatres,
  HospitalConfig
} from '@/lib/scheduling/theatreService';
import TheatreUnitsManager from '@/components/scheduling/TheatreUnitsManager';
import SpecialtyManager from '@/components/configuration/SpecialtyManager';
import SpecialtyTheatreMapping from '@/components/scheduling/SpecialtyTheatreMapping';
import SessionsContent from '@/components/scheduling/SessionsContent';
import StaffAllocationContent from '@/components/scheduling/StaffAllocationContent';
import ProceduresPoolContent from '@/components/scheduling/ProceduresPoolContent';
import ConsultantPreferencesContent from '@/components/scheduling/ConsultantPreferencesContent';
import SurgeonProfilesManager from '@/components/configuration/SurgeonProfilesManager';
import WaitingListManager from '@/components/waitingList/WaitingListManager';
import StaffRequirementMapper from '@/components/staffing/StaffRequirementMapper';
import StaffingTemplateAllocation from '@/components/staffing/StaffingTemplateAllocation';
import AdvancedTemplateBuilder from '@/components/staffing/AdvancedTemplateBuilder';
import AllocationView from '@/components/views/AllocationView';
import AllocationConfigManager from '@/components/staffing/AllocationConfigManager';
import DefaultTheatreStaffing from '@/components/staffing/DefaultTheatreStaffing';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

type SidebarTab = 'configurations' | 'sessions' | 'requirements' | 'list' | 'consultants' | 'surgeons';
type ConfigSubTab = 'specialties' | 'units' | 'mapping';
type RequirementsSubTab = 'roles' | 'template' | 'builder' | 'allocation';
type ListSubTab = 'waiting-list' | 'procedures-pool';

function AdminSchedulePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SidebarTab>((searchParams?.get('tab') as SidebarTab) || 'configurations');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('specialties');
  const [requirementsSubTab, setRequirementsSubTab] = useState<RequirementsSubTab>('roles');
  const [listSubTab, setListSubTab] = useState<ListSubTab>('waiting-list');
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('ops');
  const [hospitalName, setHospitalName] = useState('');
  const [savingHospital, setSavingHospital] = useState(false);
  const [hospitalSaveStatus, setHospitalSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
    }
  };

  useEffect(() => {
    if (activeTab === 'configurations') {
      loadHospitalConfig();
    }
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

  const sidebarItems = [
    { id: 'configurations' as SidebarTab, label: 'Configurations', icon: Settings, description: 'Theatre units & setup' },
    { id: 'sessions' as SidebarTab, label: 'Sessions', icon: Calendar, description: 'Theatre sessions & bookings' },
    { id: 'requirements' as SidebarTab, label: 'Requirements', icon: Users, description: 'Staffing requirements' },
    { id: 'list' as SidebarTab, label: 'Lists', icon: ClipboardList, description: 'Waiting list & procedures pool' },
    { id: 'consultants' as SidebarTab, label: 'Consultant Preferences', icon: UserCircle, description: 'Manage consultant availability & preferences' },
    { id: 'surgeons' as SidebarTab, label: 'Surgeon Profiles', icon: Users, description: 'Manage surgeon & anaesthetist profiles' },
  ];

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Static Admin Demo Header */}
      <div
        onClick={() => router.push('/')}
        className="w-full bg-purple-600 text-white flex items-center justify-center gap-3 px-4 cursor-pointer hover:bg-purple-700 transition-colors print:hidden"
        style={{ height: '28px' }}
      >
        <p className="text-sm font-bold whitespace-nowrap">ADMIN DEMO ACCOUNT</p>
        <p className="text-[10px] font-medium whitespace-nowrap opacity-90">Click here to switch</p>
      </div>

      {/* TOM by MEDASKCA Header - Desktop Only */}
      <div className="hidden md:block text-white shadow-lg print:hidden" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TOM by MEDASKCA</h1>
            <p className="text-sm text-white/90">Theatre Operations Manager</p>
            <p className="text-xs italic text-white/80">Demo for NHSCEP Cohort 10</p>
          </div>
          <div className="flex items-center gap-2">
            <HospitalSelector />

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                {/* Profile Photo */}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
                  AM
                </div>

                {/* User Info */}
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Alexander Monterubio</p>
                  <p className="text-xs text-white/70">Team Leader</p>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors">
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-gray-200 print:hidden">
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Schedule
            </button>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Shifts
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Cases
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
      <div className="hidden md:block px-6 py-4 bg-gray-50 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure theatres, manage sessions, and define staffing requirements
        </p>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 print:hidden">
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
        <div className="flex-1 overflow-auto bg-gray-50 pb-20 md:pb-4">
          <div className="md:p-4 p-6">
            {/* Configurations Tab */}
            {activeTab === 'configurations' && (
              <div className="w-full mx-auto">
                {loadingConfig ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 p-16">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Loading configuration...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {/* Configuration Sub-Tabs */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex gap-2">
                      <button
                        onClick={() => setConfigSubTab('specialties')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          configSubTab === 'specialties'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Specialties
                      </button>
                      <button
                        onClick={() => setConfigSubTab('units')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          configSubTab === 'units'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Units
                      </button>
                      <button
                        onClick={() => setConfigSubTab('mapping')}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          configSubTab === 'mapping'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Mapping
                      </button>
                    </div>

                    {/* Surgical Specialties */}
                    {configSubTab === 'specialties' && (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl">
                        <div className="px-4 py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-base font-bold flex items-center gap-2 text-white">
                            <ClipboardList className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Surgical Specialties</span>
                          </h2>
                          <p className="text-sm mt-1 text-white/90">Add and manage surgical specialties available at this hospital</p>
                        </div>
                        <div className="p-5">
                          <SpecialtyManager />
                        </div>
                      </div>
                    )}

                    {/* Theatre Units */}
                    {configSubTab === 'units' && (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl">
                        <div className="px-4 py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-base font-bold flex items-center gap-2 text-white">
                            <Settings className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Theatre Units & Locations</span>
                          </h2>
                          <p className="text-sm mt-1 text-white/90">Create and manage theatre units with assigned specialties</p>
                        </div>
                        <div className="p-5">
                          <TheatreUnitsManager />
                        </div>
                      </div>
                    )}

                    {/* Specialty-Theatre Mapping */}
                    {configSubTab === 'mapping' && (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl">
                        <div className="px-4 py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-base font-bold flex items-center gap-2 text-white">
                            <Settings className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Specialty-Theatre Mapping</span>
                          </h2>
                          <p className="text-sm mt-1 text-white/90">Map specialties to specific theatres with priority for AI-assisted scheduling</p>
                        </div>
                        <div className="p-5">
                          <SpecialtyTheatreMapping />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="w-full mx-auto">
                <SessionsContent />
              </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="w-full mx-auto">
                <div className="space-y-4 md:space-y-6">
                  {/* Requirements Sub-Tabs */}
                  <div className="bg-white rounded-lg shadow-md p-4 flex gap-2 overflow-x-auto print:hidden">
                    <button
                      onClick={() => setRequirementsSubTab('roles')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                        requirementsSubTab === 'roles'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Roles
                    </button>
                    <button
                      onClick={() => setRequirementsSubTab('template')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                        requirementsSubTab === 'template'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Template
                    </button>
                    <button
                      onClick={() => setRequirementsSubTab('builder')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                        requirementsSubTab === 'builder'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Template Builder
                    </button>
                    <button
                      onClick={() => setRequirementsSubTab('allocation')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                        requirementsSubTab === 'allocation'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Allocation
                    </button>
                  </div>

                  {/* Roles Sub-Tab */}
                  {requirementsSubTab === 'roles' && (
                    <div className="space-y-6">
                      {/* Step 1: Define Roles */}
                      <div className="w-full bg-white rounded-lg shadow border border-gray-200">
                        <div className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50" style={{//  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-gray-900">
                            <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span>Step 1: Define Roles</span>
                          </h2>
                          <p className="text-xs md:text-sm mt-1 text-gray-600">Configure unit coordinators, special units, and staff pool sections</p>
                        </div>
                        <div className="p-2 md:p-4">
                          <AllocationConfigManager />
                        </div>
                      </div>

                      {/* Step 2: Configure Default Theatre Staffing */}
                      <div className="w-full bg-white rounded-lg shadow border border-gray-200">
                        <div className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50" style={{//  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-gray-900">
                            <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span>Step 2: Configure Default Theatre Staffing</span>
                          </h2>
                          <p className="text-xs md:text-sm mt-1 text-gray-600">Set default staffing requirements for theatre sessions</p>
                        </div>
                        <div className="p-2 md:p-4">
                          <DefaultTheatreStaffing />
                        </div>
                      </div>

                      {/* Step 3: Map Additional Requirements */}
                      <div className="w-full bg-white rounded-lg shadow border border-gray-200">
                        <div className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50" style={{//  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                          <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-gray-900">
                            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span>Step 3: Map Additional Requirements</span>
                          </h2>
                          <p className="text-xs md:text-sm mt-1 text-gray-600">Map procedure keywords to additional staffing requirements</p>
                        </div>
                        <div className="p-2 md:p-4">
                          <StaffRequirementMapper />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template Sub-Tab */}
                  {requirementsSubTab === 'template' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl print:border-0 print:shadow-none">
                      <div className="px-4 py-3 border-b border-orange-200 print:hidden" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                        <h2 className="text-base font-bold flex items-center gap-2 text-white">
                          <ClipboardList className="w-5 h-5 text-white flex-shrink-0" />
                          <span>Staffing Requirements Template</span>
                        </h2>
                        <p className="text-sm mt-1 text-white/90">Shows required roles and default quantities for each theatre - used for auto-rostering based on staff availability and competency</p>
                      </div>
                      <div className="p-5 print:p-0">
                        <AllocationView templateMode={true} />
                      </div>
                    </div>
                  )}

                  {/* Template Builder Sub-Tab */}
                  {requirementsSubTab === 'builder' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl">
                      <div className="px-4 py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                        <h2 className="text-base font-bold flex items-center gap-2 text-white">
                          <Grid3x3 className="w-5 h-5 text-white flex-shrink-0" />
                          <span>Template Builder</span>
                        </h2>
                        <p className="text-sm mt-1 text-white/90">Create custom staffing templates with drag-drop, resizing, multi-cell selection, and advanced formatting</p>
                      </div>
                      <div className="p-0">
                        <AdvancedTemplateBuilder />
                      </div>
                    </div>
                  )}

                  {/* Allocation Sub-Tab */}
                  {requirementsSubTab === 'allocation' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 transition-all hover:shadow-xl print:border-0 print:shadow-none">
                      <div className="px-4 py-3 border-b border-orange-200 print:hidden" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                        <h2 className="text-base font-bold flex items-center gap-2 text-white">
                          <Users className="w-5 h-5 text-white flex-shrink-0" />
                          <span>Staff Allocation</span>
                        </h2>
                        <p className="text-sm mt-1 text-white/90">View and manage staff allocations across theatre sessions</p>
                      </div>
                      <div className="p-5 print:p-0">
                        <AllocationView />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lists Tab with Sub-Tabs */}
            {activeTab === 'list' && (
              <div className="w-full mx-auto">
                <div className="space-y-4 md:space-y-6">
                  {/* List Sub-Tabs */}
                  <div className="bg-white rounded-lg shadow-md p-3 md:p-4 flex gap-2">
                    <button
                      onClick={() => setListSubTab('waiting-list')}
                      className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                        listSubTab === 'waiting-list'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      Waiting List
                    </button>
                    <button
                      onClick={() => setListSubTab('procedures-pool')}
                      className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                        listSubTab === 'procedures-pool'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Procedures Pool
                    </button>
                  </div>

                  {/* Waiting List Sub-Tab */}
                  {listSubTab === 'waiting-list' && (
                    <WaitingListManager />
                  )}

                  {/* Procedures Pool Sub-Tab */}
                  {listSubTab === 'procedures-pool' && (
                    <ProceduresPoolContent />
                  )}
                </div>
              </div>
            )}

            {/* Consultant Preferences Tab */}
            {activeTab === 'consultants' && (
              <div className="w-full mx-auto">
                <ConsultantPreferencesContent />
              </div>
            )}

            {/* Surgeon Profiles Tab */}
            {activeTab === 'surgeons' && (
              <div className="w-full mx-auto">
                <SurgeonProfilesManager />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden print:hidden">
        <AdminBottomNav
          currentPage={currentPage}
          onNavigate={handleBottomNavClick}
        />
      </div>

      {/* Admin Drawer */}
      <div className="print:hidden">
        <AdminDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          drawerType={drawerType}
          onNavigate={handleDrawerNavigate}
        />
      </div>
    </div>
  );
}

export default function AdminSchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSchedulePageContent />
    </Suspense>
  );
}
