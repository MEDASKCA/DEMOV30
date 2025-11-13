'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Database, CheckCircle, AlertCircle, Lock, Building2, X, Plus, Edit2, Trash2, Loader2, Calendar, Users, Package, Warehouse, ClipboardList, FileCheck, Activity, ChevronDown, User, Settings as SettingsIcon, HelpCircle, LogOut } from 'lucide-react';
import { THEATRES } from '@/lib/scheduling/theatreData';
import { Theatre } from '@/lib/schedulingTypes';
import { ALL_SPECIALTIES } from '@/lib/scheduling/sessionTypes';
import HospitalSelector from '@/components/HospitalSelector';
import {
  getHospitalConfig,
  saveHospitalConfig,
  getTheatres,
  saveTheatre,
  deleteTheatre,
  initializeTheatresFromStatic,
  generateTheatreSessions,
  saveCalendarConfigurations,
  HospitalConfig
} from '@/lib/scheduling/theatreService';
import TheatreCalendar from '@/components/scheduling/TheatreCalendar';
import TheatreUnitsManager from '@/components/scheduling/TheatreUnitsManager';
import InventoryView from '@/components/views/InventoryView';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';
import TomAIView from '@/components/views/TomAIView';
import FeedsView from '@/components/views/FeedsView';
import DashboardViewNew from '@/components/views/DashboardViewNew';
import SettingsView from '@/components/views/SettingsView';
import HelpSupportView from '@/components/views/HelpSupportView';
import FloatingMessenger from '@/components/FloatingMessenger';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('home');
  const [currentView, setCurrentView] = useState<string>('feeds');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hospital config state
  const [hospitalName, setHospitalName] = useState('');
  const [savingHospital, setSavingHospital] = useState(false);
  const [hospitalSaveStatus, setHospitalSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Theatre management state
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loadingTheatres, setLoadingTheatres] = useState(false);
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | null>(null);
  const [deletingTheatreId, setDeletingTheatreId] = useState<string | null>(null);

  // Session generation state
  const [generatingSessions, setGeneratingSessions] = useState(false);
  const [sessionGenerationStatus, setSessionGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Bottom nav handler
  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory') => {
    setCurrentPage(page);

    if (page === 'ai') {
      // Show TOM AI chat view
      setCurrentView('chat');
      setShowDrawer(false);
    } else if (page === 'home') {
      // Show feeds/social media view
      setCurrentView('feeds');
      setShowDrawer(false);
    } else if (page === 'ops') {
      // Show ops drawer (always show it, even if already on an ops view)
      setDrawerType('ops');
      setShowDrawer(true);
      setCurrentView(''); // Clear current view to show drawer
    } else if (page === 'theatres') {
      // Show logistics drawer (always show it, even if already on a logistics view)
      setDrawerType('theatres');
      setShowDrawer(true);
      setCurrentView(''); // Clear current view to show drawer
    } else if (page === 'alerts') {
      // Show alerts drawer (always show it, even if already on an alerts view)
      setDrawerType('alerts');
      setShowDrawer(true);
      setCurrentView(''); // Clear current view to show drawer
    } else if (page === 'menu') {
      // Show account drawer (always show it, even if already on a menu view)
      setDrawerType('menu');
      setShowDrawer(true);
      setCurrentView(''); // Clear current view to show drawer
    }
  };

  const handleDrawerNavigate = (viewId: string) => {
    // Handle profile navigation - redirect to profile page
    if (viewId === 'profile') {
      router.push('/profile');
      setShowDrawer(false);
      return;
    }

    // Handle signout - redirect to home
    if (viewId === 'signout') {
      router.push('/');
      setShowDrawer(false);
      return;
    }

    setCurrentView(viewId);
    setShowDrawer(false);

    // Update current page based on view
    if (['substantive', 'temporary'].includes(viewId)) {
      setCurrentPage('workforce');
    } else if (['stock', 'storage', 'reorder', 'requests'].includes(viewId)) {
      setCurrentPage('inventory');
    } else if (['readiness', 'analytics', 'settings', 'help'].includes(viewId)) {
      setCurrentPage('menu');
    }
  };

  // Load hospital config and theatres when needed
  useEffect(() => {
    if (currentView === 'theatres' || currentView === 'theatre-management' || currentView === 'schedule' || currentView === 'staff-allocation') {
      loadHospitalConfig();
      loadTheatres();
    }
  }, [currentView]);

  const loadHospitalConfig = async () => {
    try {
      const config = await getHospitalConfig();
      if (config) {
        setHospitalName(config.name);
      }
    } catch (error) {
      console.error('Error loading hospital config:', error);
    }
  };

  const loadTheatres = async () => {
    setLoadingTheatres(true);
    try {
      const loadedTheatres = await getTheatres();
      setTheatres(loadedTheatres);
    } catch (error) {
      console.error('Error loading theatres:', error);
    } finally {
      setLoadingTheatres(false);
    }
  };

  const handleSaveHospitalConfig = async () => {
    // First check if hospital already exists
    try {
      const existingConfig = await getHospitalConfig();

      if (existingConfig && existingConfig.name && existingConfig.name !== hospitalName) {
        // Hospital exists with different name - ask user what to do
        const userChoice = confirm(
          `A hospital configuration already exists: "${existingConfig.name}"\n\n` +
          `Would you like to load and update the existing configuration?\n\n` +
          `Click OK to load existing configuration, or Cancel to overwrite with new hospital.`
        );

        if (userChoice) {
          // Load existing configuration
          setHospitalName(existingConfig.name);
          await loadUnitsForSchedule();
          alert('Existing hospital configuration loaded. You can now update the units.');
          return;
        }
        // If user clicks Cancel, continue to save new config
      }
    } catch (error) {
      console.error('Error checking existing hospital:', error);
    }

    setSavingHospital(true);
    setHospitalSaveStatus('idle');
    try {
      await saveHospitalConfig({
        name: hospitalName,
        numberOfTheatres: 0, // Deprecated, will be calculated from units
        emergencyTheatres: 0, // Deprecated
        specialties: [] // Deprecated, now managed per unit
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

  const handleInitializeTheatres = async () => {
    if (!hospitalName) {
      alert('Please save hospital configuration first');
      return;
    }

    setLoadingTheatres(true);
    try {
      // Load theatre units
      const { getTheatreUnits } = await import('@/lib/scheduling/theatreService');
      const units = await getTheatreUnits();

      if (units.length === 0) {
        alert('Please create at least one theatre unit first');
        setLoadingTheatres(false);
        return;
      }

      // Generate theatres based on units
      const generatedTheatres: Theatre[] = [];

      for (const unit of units) {
        for (let i = 1; i <= unit.numberOfTheatres; i++) {
          const theatreId = `${unit.id}-T${String(i).padStart(2, '0')}`;
          const theatre: Theatre = {
            id: theatreId,
            name: `${unit.name} ${i}`,
            location: unit.location,
            capacity: 1,
            specialties: unit.specialties || [], // Use unit-specific specialties
            equipment: [],
            status: 'available',
            unitId: unit.id,
            openingHours: {
              start: '08:00',
              end: '18:00'
            },
            sessionDuration: 240 // 4 hours default
          };
          generatedTheatres.push(theatre);
        }
      }

      // Save all generated theatres
      await initializeTheatresFromStatic(generatedTheatres);
      await loadTheatres();
    } catch (error) {
      console.error('Error initializing theatres:', error);
      alert('Failed to generate theatres');
    } finally {
      setLoadingTheatres(false);
    }
  };

  const handleDeleteTheatre = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theatre?')) return;

    setDeletingTheatreId(id);
    try {
      await deleteTheatre(id);
      await loadTheatres();
    } catch (error) {
      console.error('Error deleting theatre:', error);
      alert('Failed to delete theatre');
    } finally {
      setDeletingTheatreId(null);
    }
  };

  const handleGenerateSessions = async () => {
    if (!confirm('Generate theatre sessions for the next 3 months?')) return;

    setGeneratingSessions(true);
    setSessionGenerationStatus('idle');
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      await generateTheatreSessions(startDate, endDate, theatres);
      setSessionGenerationStatus('success');
      setTimeout(() => setSessionGenerationStatus('idle'), 5000);
    } catch (error) {
      console.error('Error generating sessions:', error);
      setSessionGenerationStatus('error');
    } finally {
      setGeneratingSessions(false);
    }
  };

  // Schedule Configuration state
  const [selectedHospitalForSchedule, setSelectedHospitalForSchedule] = useState('');
  const [selectedUnitForSchedule, setSelectedUnitForSchedule] = useState('all');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  // Load units for schedule configuration
  useEffect(() => {
    if ((currentView === 'theatres' || currentView === 'theatre-management' || currentView === 'schedule') && hospitalName) {
      loadUnitsForSchedule();
    }
  }, [currentView, hospitalName]);

  const loadUnitsForSchedule = async () => {
    try {
      const { getTheatreUnits } = await import('@/lib/scheduling/theatreService');
      const units = await getTheatreUnits();
      setAvailableUnits(units.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen" style={{backgroundColor: '#F0F9FF'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{backgroundColor: '#F0F9FF'}}>
      {/* Static Admin Demo Header */}
      <div
        className="w-full bg-purple-600 text-white flex items-center justify-center gap-3 px-4 flex-shrink-0"
        style={{ height: '28px' }}
      >
        <p className="text-sm font-bold whitespace-nowrap">ADMIN DEMO ACCOUNT</p>
      </div>

      {/* Header Banner - Mobile: Only on chat, Desktop: Always visible */}
      <div className={`text-white flex-shrink-0 shadow-lg ${currentView === 'chat' ? '' : 'hidden md:block'}`} style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between" style={{display: currentView === 'dashboard' ? 'none' : 'flex'}}>
          {/* Left: Branding */}
          <div>
            <h1 className="text-xl font-bold">TOM by MEDASKCA</h1>
            <p className="text-sm text-white/90">Theatre Operations Manager</p>
            <p className="text-xs italic text-white/80">Demo for NHSCEP Cohort 10</p>
          </div>

          {/* Right: User Profile & Hospital Selector (Desktop Only) */}
          <div className="flex items-center gap-3">
            {/* Hospital Selector */}
            <div className="hidden md:block">
              <HospitalSelector />
            </div>

            {/* User Profile - Desktop Only */}
            <div className="hidden md:block relative">
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
                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setCurrentPage('menu');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('help');
                      setCurrentPage('menu');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help and Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => {
                      router.push('/');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs - Hidden on Mobile */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => {
                setCurrentView('feeds');
                setCurrentPage('home');
              }}
              className={`px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                currentView === 'feeds'
                  ? 'border-transparent'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
              style={currentView === 'feeds' ? {color: '#06B6D4', borderBottom: '2px solid #06B6D4'} : {}}
            >
              Home
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/schedule')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Schedule
            </button>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Shifts
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Cases
            </button>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Supplies
            </button>
            <button
              onClick={() => router.push('/admin/equipment')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Equipment
            </button>
            <button
              onClick={() => {
                setCurrentView('readiness');
              }}
              className={`px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                currentView === 'readiness'
                  ? 'border-transparent'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
              style={currentView === 'readiness' ? {color: '#06B6D4', borderBottom: '2px solid #06B6D4'} : {}}
            >
              Readiness
            </button>
            <button
              onClick={() => {
                setCurrentView('analytics');
              }}
              className={`px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'border-transparent'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
              style={currentView === 'analytics' ? {color: '#06B6D4', borderBottom: '2px solid #06B6D4'} : {}}
            >
              Analytics
            </button>
            <button
              onClick={() => {
                setCurrentView('settings');
                setCurrentPage('menu');
              }}
              className={`px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                currentView === 'settings'
                  ? 'border-transparent'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
              style={currentView === 'settings' ? {color: '#06B6D4', borderBottom: '2px solid #06B6D4'} : {}}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content - Full Width */}
      <div className="flex-1 overflow-hidden flex flex-col pb-16 md:pb-0">
        <div className="w-full flex-1 overflow-auto md:px-4 md:py-4">

        {/* TOM AI View */}
        {currentView === 'chat' && (
          <div className="h-[calc(100vh-10rem)]">
            <TomAIView />
          </div>
        )}

        {/* Social Media / Feeds View */}
        {currentView === 'feeds' && (
          <div className="h-full">
            <FeedsView />
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="h-[calc(100vh-10rem)]">
            <DashboardViewNew onBack={() => {
              setCurrentPage('ops');
              setDrawerType('ops');
              setShowDrawer(true);
            }} />
          </div>
        )}

        {/* Workforce Views */}
        {currentView === 'substantive' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Substantive Staff</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Navigate to the Workforce page to manage permanent staff, costs, leave, and FTE.</p>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md md:rounded-lg hover:shadow-lg transition-all"
            >
              Go to Workforce Management
            </button>
          </div>
        )}

        {currentView === 'temporary' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Temporary Staff</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Navigate to the Workforce page to manage bank & agency staff finder and costing.</p>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md md:rounded-lg hover:shadow-lg transition-all"
            >
              Go to Workforce Management
            </button>
          </div>
        )}

        {/* Inventory Views */}
        {currentView === 'stock' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Stock Management</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">View and manage current inventory levels across all storage locations.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-md md:rounded-lg p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-bold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-xs md:text-sm text-blue-800">Stock management features will be available in a future update.</p>
            </div>
          </div>
        )}

        {currentView === 'storage' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Storage Locations</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Configure storage zones, shelving units, and inventory locations.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-md md:rounded-lg p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-bold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-xs md:text-sm text-blue-800">Storage management features will be available in a future update.</p>
            </div>
          </div>
        )}

        {currentView === 'reorder' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Reorder Management</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Set minimum stock levels and configure automated reorder alerts.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-md md:rounded-lg p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-bold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-xs md:text-sm text-blue-800">Reorder management features will be available in a future update.</p>
            </div>
          </div>
        )}

        {currentView === 'requests' && (
          <div className="bg-white md:rounded-lg border-b md:border border-gray-200 p-3 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Purchase Requests</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Manage purchase orders and supply requests from theatre staff.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-md md:rounded-lg p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-bold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-xs md:text-sm text-blue-800">Purchase request features will be available in a future update.</p>
            </div>
          </div>
        )}

        {currentView === 'inventory' && (
          <div className="h-[calc(100vh-14rem)]">
            <InventoryView isAdmin={true} />
          </div>
        )}

        {currentView === 'theatres' && (
          <div className="space-y-4">
            {/* Hospital Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Hospital Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up theatre units, specialties, and operating schedules
                </p>
              </div>

              <div className="space-y-3">
                {/* Hospital Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g., St. Mary's Hospital"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                {/* Theatre Units/Suites */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theatre Units / Suites
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Create units and assign specialties per unit
                  </p>
                  <TheatreUnitsManager />
                </div>

                {/* Save Button */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={handleSaveHospitalConfig}
                    disabled={savingHospital}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                  >
                    {savingHospital && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Configuration
                  </button>

                  {hospitalSaveStatus === 'success' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">Hospital configuration saved successfully!</span>
                    </div>
                  )}

                  {hospitalSaveStatus === 'error' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">Error saving configuration</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure session times and specialties for theatres
                </p>
              </div>

              {/* Configuration Selectors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital *
                  </label>
                  <select
                    value={hospitalName || ''}
                    onChange={(e) => setSelectedHospitalForSchedule(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">{hospitalName || 'Select'}</option>
                    {hospitalName && <option value={hospitalName}>{hospitalName}</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={selectedUnitForSchedule}
                    onChange={(e) => setSelectedUnitForSchedule(e.target.value)}
                    disabled={!hospitalName}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="all">All Units</option>
                    {availableUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleStartDate}
                    onChange={(e) => setScheduleStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleEndDate}
                    onChange={(e) => setScheduleEndDate(e.target.value)}
                    min={scheduleStartDate}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Load Schedule Button */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => router.push('/admin/schedule')}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                >
                  <Calendar className="w-4 h-4" />
                  View Full Schedule
                </button>
                <span className="text-sm text-gray-500">
                  Opens seeded schedule (Oct 1 - Dec 30, 2025)
                </span>
              </div>

              {/* Theatre Calendar */}
              {showScheduleCalendar && theatres.length > 0 && scheduleStartDate && scheduleEndDate && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Use abbreviations for quick entry (D=Day, LD=Long Day, AM=Early, PM=Afternoon, etc.)
                  </p>

                  <TheatreCalendar
                    theatres={theatres}
                    startDate={new Date(scheduleStartDate)}
                    endDate={new Date(scheduleEndDate)}
                    onSave={async (configurations) => {
                      try {
                        await saveCalendarConfigurations(configurations);
                        alert('Calendar configuration saved successfully!');
                      } catch (error) {
                        console.error('Error saving calendar:', error);
                        alert('Failed to save calendar configuration');
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'staff-allocation' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Staff Allocation Templates</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create staffing templates based on theatre schedules, sessions, and specialties
              </p>
            </div>

            <div className="space-y-4">
              {/* Template selector */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Select Theatre Schedule</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Templates will be created based on the theatre schedules you've configured. Select a date range to view and create staffing templates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      id="staffing-start-date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      defaultValue="2025-10-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      id="staffing-end-date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      defaultValue="2025-10-31"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <button
                      onClick={() => {
                        const startDate = (document.getElementById('staffing-start-date') as HTMLInputElement)?.value || '2025-10-01';
                        const endDate = (document.getElementById('staffing-end-date') as HTMLInputElement)?.value || '2025-10-31';
                        router.push(`/admin/staff-allocation?start=${startDate}&end=${endDate}`);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      Load Templates
                    </button>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-orange-900 mb-1">How Staff Allocation Works</h4>
                <ul className="text-sm text-orange-800 space-y-1 ml-4 list-disc">
                  <li>Templates are based on theatre sessions (AM, PM, Day, Long Day, etc.)</li>
                  <li>Each template defines required roles and staffing levels per specialty</li>
                  <li>Templates can be copied across dates with similar sessions</li>
                  <li>Staff are allocated based on their competencies and availability</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentView === 'readiness' && (
          <div className="space-y-4">
            {/* Page Title & Description */}
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Readiness Display Configuration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure what information is displayed on the main Readiness page
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Checklist Categories */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Checklist Categories</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Select which categories to display on the Readiness checklist
                  </p>

                  <div className="space-y-2">
                    {['Equipment Status', 'Staff Availability', 'Supplies Inventory', 'Theatre Cleanliness', 'Safety Checks', 'Emergency Protocols'].map((category) => (
                      <label key={category} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Alert Thresholds */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Alert Thresholds</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Critical Alert Percentage
                      </label>
                      <input
                        type="number"
                        defaultValue="50"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Show critical alerts when readiness falls below this percentage</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warning Alert Percentage
                      </label>
                      <input
                        type="number"
                        defaultValue="75"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Show warning alerts when readiness falls below this percentage</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                  Save Readiness Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-4">
            {/* Page Title & Description */}
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Analytics Display Configuration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure which metrics and charts are displayed on the main Analytics page
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Dashboard Widgets */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Dashboard Widgets</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Select which analytics widgets to display
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Theatre Utilization',
                      'Procedure Volume',
                      'Average Turnover Time',
                      'Staff Efficiency',
                      'Equipment Usage',
                      'Cost Analysis',
                      'Patient Flow',
                      'Cancellation Rate',
                      'On-Time Start Rate',
                      'Overtime Analysis',
                      'Supply Consumption',
                      'Quality Metrics'
                    ].map((widget) => (
                      <label key={widget} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">{widget}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Chart Types */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Default Chart Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilization Chart
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option>Line Chart</option>
                        <option>Bar Chart</option>
                        <option>Area Chart</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Procedure Volume Chart
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option>Bar Chart</option>
                        <option>Line Chart</option>
                        <option>Pie Chart</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Range Defaults */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Default Date Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default View Period
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>Year to Date</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refresh Interval
                      </label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option>Real-time</option>
                        <option>5 minutes</option>
                        <option>15 minutes</option>
                        <option>1 hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                  Save Analytics Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="h-full">
            <SettingsView onBack={() => {
              setCurrentPage('menu');
              setDrawerType('menu');
              setShowDrawer(true);
            }} />
          </div>
        )}

        {currentView === 'help' && (
          <div className="h-full">
            <HelpSupportView onBack={() => {
              setCurrentPage('menu');
              setDrawerType('menu');
              setShowDrawer(true);
            }} />
          </div>
        )}
        </div>
      </div>

      {/* Floating Messenger */}
      <FloatingMessenger />

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
        onClose={() => {
          setShowDrawer(false);
        }}
        drawerType={drawerType}
        onNavigate={handleDrawerNavigate}
      />

      {/* Add/Edit Theatre Modal */}
      {showTheatreModal && (
        <TheatreModal
          theatre={editingTheatre}
          onClose={() => {
            setShowTheatreModal(false);
            setEditingTheatre(null);
          }}
          onSave={async (theatre) => {
            try {
              await saveTheatre(theatre);
              await loadTheatres();
              setShowTheatreModal(false);
              setEditingTheatre(null);
            } catch (error) {
              console.error('Error saving theatre:', error);
              alert('Failed to save theatre');
            }
          }}
        />
      )}
    </div>
  );
}

// Theatre Modal Component
interface TheatreModalProps {
  theatre: Theatre | null;
  onClose: () => void;
  onSave: (theatre: Theatre) => Promise<void>;
}

function TheatreModal({ theatre, onClose, onSave }: TheatreModalProps) {
  const [formData, setFormData] = useState<Theatre>(
    theatre || {
      id: '',
      name: '',
      location: '',
      floor: 1,
      capacity: 1,
      specialties: [],
      equipment: [],
      status: 'available',
      openingHours: {
        start: '08:00',
        end: '18:00'
      },
      sessionDuration: 240
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate ID if new theatre
    if (!formData.id) {
      const maxId = 10; // You might want to calculate this dynamically
      const newId = `THR-${String(maxId + 1).padStart(3, '0')}`;
      formData.id = newId;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:p-4">
      <div className="bg-white md:rounded-lg shadow-xl max-w-3xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {theatre ? 'Edit Theatre' : 'Add New Theatre'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theatre Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Theatre 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Theatre Suite"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="20"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (Tables) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Theatre['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="60"
                  max="480"
                  step="30"
                  value={formData.sessionDuration}
                  onChange={(e) => setFormData({ ...formData, sessionDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Opening Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.openingHours?.start || '08:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    openingHours: { ...formData.openingHours, start: e.target.value, end: formData.openingHours?.end || '18:00' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.openingHours?.end || '18:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    openingHours: { start: formData.openingHours?.start || '08:00', ...formData.openingHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Specialties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ALL_SPECIALTIES.map((specialty) => (
                <label key={specialty.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty.name)}
                    onChange={() => toggleSpecialty(specialty.name)}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{specialty.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Equipment (Optional)</h3>
            <textarea
              value={formData.equipment.join('\n')}
              onChange={(e) => setFormData({
                ...formData,
                equipment: e.target.value.split('\n').filter(item => item.trim())
              })}
              placeholder="Enter equipment items, one per line"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {theatre ? 'Update Theatre' : 'Create Theatre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
