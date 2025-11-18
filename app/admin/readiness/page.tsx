'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  Package,
  Wrench,
  Shield,
  RefreshCw,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import {
  TheatreReadiness,
  ReadinessStats,
  ReadinessStatus
} from '@/lib/readiness/readinessTypes';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';
import { CriticalAlertsPanel, PendingTasksPanel, IncidentsPanel } from '@/components/AlertsPanels';

export default function TheatreReadinessPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('ops');
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
      router.push('/admin/sessions');
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
    } else if (viewId === 'analytics') {
      router.push('/admin/operations');
    } else if (viewId === 'acute-services') {
      router.push('/admin/acute-services');
    }
  };

  // Mock data - this will be replaced with real Firebase data from theatre staff reports
  const mockStats: ReadinessStats = {
    totalTheatres: 10,
    ready: 6,
    notReady: 2,
    inProgress: 2,
    blocked: 0,
    criticalIssues: 1,
    lastRefreshed: new Date().toISOString()
  };

  const mockTheatres: TheatreReadiness[] = [
    {
      id: 'THR-001',
      sessionInfo: {
        sessionId: 'SES-001',
        theatreId: 'THR-001',
        theatreName: 'Theatre 1',
        date: selectedDate,
        startTime: '08:00',
        endTime: '18:00',
        sessionType: 'day',
        specialty: 'Trauma & Orthopaedics',
        expectedCases: 5
      },
      overallStatus: 'ready',
      lastUpdated: new Date().toISOString(),
      staffReadiness: {
        status: 'ready',
        details: {
          consultantSurgeon: { name: 'Dr. Smith', present: true, checkedIn: new Date().toISOString() },
          scrubNurse: { name: 'Sarah Johnson', present: true, checkedIn: new Date().toISOString() },
          additionalStaff: []
        },
        missingRoles: []
      },
      inventoryReadiness: {
        status: 'ready',
        details: {
          criticalSuppliesVerified: { id: '1', name: 'Critical Supplies', status: 'completed', required: true },
          procedureSpecificEquipment: { id: '2', name: 'Procedure Equipment', status: 'completed', required: true },
          sterilePacks: { id: '3', name: 'Sterile Packs', status: 'completed', required: true },
          medications: { id: '4', name: 'Medications', status: 'completed', required: true },
          lowStockAlerts: []
        },
        criticalShortages: []
      },
      equipmentReadiness: {
        status: 'ready',
        details: {
          anaestheticMachine: { id: 'e1', name: 'Anaesthetic Machine', status: 'completed', required: true },
          ventilator: { id: 'e2', name: 'Ventilator', status: 'completed', required: true },
          monitoringEquipment: { id: 'e3', name: 'Monitoring Equipment', status: 'completed', required: true },
          surgicalLights: { id: 'e4', name: 'Surgical Lights', status: 'completed', required: true },
          operatingTable: { id: 'e5', name: 'Operating Table', status: 'completed', required: true },
          diathermy: { id: 'e6', name: 'Diathermy', status: 'completed', required: true },
          suction: { id: 'e7', name: 'Suction', status: 'completed', required: true },
          emergencyEquipment: { id: 'e8', name: 'Emergency Equipment', status: 'completed', required: true },
          specializedEquipment: []
        },
        failedChecks: []
      },
      roomSetupReadiness: {
        status: 'ready',
        details: {
          theatreCleaned: { id: 'r1', name: 'Theatre Cleaned', status: 'completed', required: true },
          environmentalControls: { id: 'r2', name: 'Environmental Controls', status: 'completed', required: true },
          whoSafetyChecklist: { id: 'r3', name: 'WHO Safety Checklist', status: 'completed', required: true },
          fireExtinguisher: { id: 'r4', name: 'Fire Extinguisher', status: 'completed', required: true },
          emergencyExits: { id: 'r5', name: 'Emergency Exits', status: 'completed', required: true },
          communicationSystems: { id: 'r6', name: 'Communication Systems', status: 'completed', required: true },
          documentationReady: { id: 'r7', name: 'Documentation Ready', status: 'completed', required: true }
        },
        pendingTasks: []
      },
      blockingIssues: [],
      readinessSignedOff: true,
      signedOffBy: 'Theatre Coordinator',
      signedOffAt: new Date().toISOString()
    },
    {
      id: 'THR-002',
      sessionInfo: {
        sessionId: 'SES-002',
        theatreId: 'THR-002',
        theatreName: 'Theatre 2',
        date: selectedDate,
        startTime: '08:00',
        endTime: '18:00',
        sessionType: 'day',
        specialty: 'General Surgery',
        expectedCases: 4
      },
      overallStatus: 'not-ready',
      lastUpdated: new Date().toISOString(),
      staffReadiness: {
        status: 'not-ready',
        details: {
          consultantSurgeon: { name: 'Dr. Jones', present: false },
          additionalStaff: []
        },
        missingRoles: ['Consultant Surgeon', 'Scrub Nurse']
      },
      inventoryReadiness: {
        status: 'ready',
        details: {
          criticalSuppliesVerified: { id: '1', name: 'Critical Supplies', status: 'completed', required: true },
          procedureSpecificEquipment: { id: '2', name: 'Procedure Equipment', status: 'completed', required: true },
          sterilePacks: { id: '3', name: 'Sterile Packs', status: 'completed', required: true },
          medications: { id: '4', name: 'Medications', status: 'completed', required: true },
          lowStockAlerts: [
            { itemId: 'I-001', itemName: 'Surgical Gloves Size 7', currentStock: 5, minimumRequired: 20 }
          ]
        },
        criticalShortages: []
      },
      equipmentReadiness: {
        status: 'ready',
        details: {
          anaestheticMachine: { id: 'e1', name: 'Anaesthetic Machine', status: 'completed', required: true },
          ventilator: { id: 'e2', name: 'Ventilator', status: 'completed', required: true },
          monitoringEquipment: { id: 'e3', name: 'Monitoring Equipment', status: 'completed', required: true },
          surgicalLights: { id: 'e4', name: 'Surgical Lights', status: 'completed', required: true },
          operatingTable: { id: 'e5', name: 'Operating Table', status: 'completed', required: true },
          diathermy: { id: 'e6', name: 'Diathermy', status: 'completed', required: true },
          suction: { id: 'e7', name: 'Suction', status: 'completed', required: true },
          emergencyEquipment: { id: 'e8', name: 'Emergency Equipment', status: 'completed', required: true },
          specializedEquipment: []
        },
        failedChecks: []
      },
      roomSetupReadiness: {
        status: 'in-progress',
        details: {
          theatreCleaned: { id: 'r1', name: 'Theatre Cleaned', status: 'completed', required: true },
          environmentalControls: { id: 'r2', name: 'Environmental Controls', status: 'pending', required: true },
          whoSafetyChecklist: { id: 'r3', name: 'WHO Safety Checklist', status: 'pending', required: true },
          fireExtinguisher: { id: 'r4', name: 'Fire Extinguisher', status: 'completed', required: true },
          emergencyExits: { id: 'r5', name: 'Emergency Exits', status: 'completed', required: true },
          communicationSystems: { id: 'r6', name: 'Communication Systems', status: 'completed', required: true },
          documentationReady: { id: 'r7', name: 'Documentation Ready', status: 'pending', required: true }
        },
        pendingTasks: ['Environmental Controls', 'WHO Safety Checklist', 'Documentation']
      },
      blockingIssues: [
        {
          id: 'BI-001',
          category: 'staff',
          priority: 'critical',
          description: 'Consultant Surgeon not checked in',
          impact: 'Cannot start session',
          reportedBy: 'Theatre Coordinator',
          reportedAt: new Date().toISOString(),
          status: 'open'
        }
      ],
      readinessSignedOff: false
    }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: ReadinessStatus) => {
    switch (status) {
      case 'ready': return 'bg-green-50 border-green-300 text-green-900';
      case 'not-ready': return 'bg-red-50 border-red-300 text-red-900';
      case 'in-progress': return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'blocked': return 'bg-orange-50 border-orange-300 text-orange-900';
      default: return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getStatusIcon = (status: ReadinessStatus) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />;
      case 'not-ready': return <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />;
      default: return <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />;
    }
  };

  const selectedTheatreData = selectedTheatre
    ? mockTheatres.find(t => t.id === selectedTheatre)
    : null;

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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
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
        <h1 className="text-2xl font-bold text-gray-900">Theatre Readiness</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time readiness status reported by theatre staff
        </p>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold flex items-center gap-1.5 truncate">
                <Activity className="w-4 h-4 flex-shrink-0" />
                Theatre Readiness
              </h1>
              <p className="text-[10px] text-white/90 truncate">Staff-reported status</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-1.5 py-1 text-[10px] rounded bg-cyan-500 text-white font-semibold border-0 w-24"
              />
              <button
                onClick={handleRefresh}
                className="p-1.5 bg-cyan-500 text-white rounded transition-colors hover:bg-cyan-600"
                disabled={refreshing}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-4">
        <div className="px-2 md:px-6 py-2 md:py-4 space-y-2 md:space-y-4">

          {/* Stats Overview - Compact */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-3">
            <div className="bg-white rounded-lg p-2 md:p-3 border border-cyan-200 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-cyan-900">{mockStats.totalTheatres}</div>
              <div className="text-[9px] md:text-xs text-cyan-600 mt-0.5">Total</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-3 border border-green-200 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-green-900">{mockStats.ready}</div>
              <div className="text-[9px] md:text-xs text-green-600 mt-0.5">Ready</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-3 border border-yellow-200 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-yellow-900">{mockStats.inProgress}</div>
              <div className="text-[9px] md:text-xs text-yellow-600 mt-0.5">Progress</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-3 border border-red-200 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-red-900">{mockStats.notReady}</div>
              <div className="text-[9px] md:text-xs text-red-600 mt-0.5">Not Ready</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-3 border border-orange-200 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-orange-900">{mockStats.blocked}</div>
              <div className="text-[9px] md:text-xs text-orange-600 mt-0.5">Blocked</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-3 border border-red-300 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-red-900">{mockStats.criticalIssues}</div>
              <div className="text-[9px] md:text-xs text-red-600 mt-0.5">Critical</div>
            </div>
          </div>

          {/* Alert Panels - Desktop Only */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            <CriticalAlertsPanel />
            <PendingTasksPanel />
            <IncidentsPanel />
          </div>

          {/* Theatre Status Cards - Compact */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-200 p-2 md:p-4">
            <h2 className="text-sm md:text-base font-bold text-teal-800 mb-2 md:mb-3 px-1">
              Today's Theatres
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {mockTheatres.map((theatre) => (
                <button
                  key={theatre.id}
                  onClick={() => setSelectedTheatre(theatre.id === selectedTheatre ? null : theatre.id)}
                  className={`border-2 rounded-lg p-2 md:p-3 text-left transition-all hover:shadow-md ${
                    selectedTheatre === theatre.id ? 'ring-2 ring-cyan-500' : ''
                  } ${getStatusColor(theatre.overallStatus)}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-xs md:text-sm truncate flex-1">{theatre.sessionInfo.theatreName}</h3>
                    {getStatusIcon(theatre.overallStatus)}
                  </div>
                  <div className="text-[10px] md:text-xs space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{theatre.sessionInfo.startTime}-{theatre.sessionInfo.endTime}</span>
                    </div>
                    <div className="font-medium truncate">{theatre.sessionInfo.specialty}</div>
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px]">
                      <span>{theatre.sessionInfo.expectedCases} cases</span>
                      {theatre.blockingIssues.length > 0 && (
                        <span className="flex items-center gap-0.5 text-red-700">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {theatre.blockingIssues.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Readiness - Compact */}
          {selectedTheatreData && (
            <div className="bg-white rounded-lg border-2 border-cyan-300 p-2 md:p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h2 className="text-sm md:text-base font-bold text-gray-900">
                  {selectedTheatreData.sessionInfo.theatreName} Details
                </h2>
                <button
                  onClick={() => setSelectedTheatre(null)}
                  className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                >
                  Close
                </button>
              </div>

              {/* Compact Readiness Sections */}
              <div className="space-y-1.5">
                {/* Staff */}
                <div className={`border rounded-lg p-2 ${getStatusColor(selectedTheatreData.staffReadiness.status)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-semibold">Staff</span>
                    {getStatusIcon(selectedTheatreData.staffReadiness.status)}
                  </div>
                  {selectedTheatreData.staffReadiness.missingRoles.length > 0 && (
                    <div className="text-[10px] md:text-xs font-medium">
                      Missing: {selectedTheatreData.staffReadiness.missingRoles.join(', ')}
                    </div>
                  )}
                </div>

                {/* Inventory */}
                <div className={`border rounded-lg p-2 ${getStatusColor(selectedTheatreData.inventoryReadiness.status)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-semibold">Inventory</span>
                    {getStatusIcon(selectedTheatreData.inventoryReadiness.status)}
                  </div>
                  {selectedTheatreData.inventoryReadiness.details.lowStockAlerts.length > 0 && (
                    <div className="text-[10px] md:text-xs">
                      {selectedTheatreData.inventoryReadiness.details.lowStockAlerts.length} low stock alert(s)
                    </div>
                  )}
                </div>

                {/* Equipment */}
                <div className={`border rounded-lg p-2 ${getStatusColor(selectedTheatreData.equipmentReadiness.status)}`}>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-semibold">Equipment</span>
                    {getStatusIcon(selectedTheatreData.equipmentReadiness.status)}
                  </div>
                </div>

                {/* Room Setup */}
                <div className={`border rounded-lg p-2 ${getStatusColor(selectedTheatreData.roomSetupReadiness.status)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-semibold">Room & Safety</span>
                    {getStatusIcon(selectedTheatreData.roomSetupReadiness.status)}
                  </div>
                  {selectedTheatreData.roomSetupReadiness.pendingTasks.length > 0 && (
                    <div className="text-[10px] md:text-xs">
                      {selectedTheatreData.roomSetupReadiness.pendingTasks.length} pending task(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Blocking Issues - Compact */}
              {selectedTheatreData.blockingIssues.length > 0 && (
                <div className="p-2 bg-red-50 border-2 border-red-300 rounded-lg">
                  <h3 className="text-xs md:text-sm font-semibold text-red-900 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Blocking Issues
                  </h3>
                  {selectedTheatreData.blockingIssues.map((issue) => (
                    <div key={issue.id} className="bg-white p-2 rounded border border-red-200 mb-1.5 last:mb-0">
                      <div className="text-[10px] md:text-xs font-medium text-red-900">{issue.description}</div>
                      <div className="text-[9px] md:text-[10px] text-red-700 mt-0.5">
                        Impact: {issue.impact}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sign-off Status */}
              <div className={`p-2 rounded-lg border ${
                selectedTheatreData.readinessSignedOff
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {selectedTheatreData.readinessSignedOff ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                        <div>
                          <div className="text-xs md:text-sm font-semibold text-green-900">Signed Off</div>
                          <div className="text-[9px] md:text-[10px] text-green-700">
                            By {selectedTheatreData.signedOffBy}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                        <div className="text-xs md:text-sm font-semibold text-gray-900">Awaiting Sign-off</div>
                      </>
                    )}
                  </div>
                  {!selectedTheatreData.readinessSignedOff && (
                    <button className="px-2 md:px-3 py-1 md:py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-[10px] md:text-xs font-semibold">
                      Sign Off
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
