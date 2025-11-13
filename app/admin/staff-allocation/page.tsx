"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, Filter, Plus, Save, X, Trash2, ChevronLeft, ChevronRight, ChevronDown, User, Settings, HelpCircle, LogOut, ClipboardList, Grid3x3 } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay, isSameDay } from 'date-fns';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';
import AllocationView from '@/components/views/AllocationView';
import StaffRequirementMapper from '@/components/staffing/StaffRequirementMapper';
import AllocationConfigManager from '@/components/staffing/AllocationConfigManager';
import DefaultTheatreStaffing from '@/components/staffing/DefaultTheatreStaffing';
import AdvancedTemplateBuilder from '@/components/staffing/AdvancedTemplateBuilder';

interface Consultant {
  id: string;
  name: string;
  role: string;
  specialties: string[];
}

interface DayConfiguration {
  date: string;
  theatreId: string;
  sessionTypeId: string;
  specialty?: string;
  consultantSurgeonId?: string;
  assistingSurgeonId?: string;
  consultantAnaesthetistId?: string;
  assistingAnaesthetistId?: string;
}

interface Theatre {
  id: string;
  name: string;
  unitId?: string;
  theatreType?: string;
}

interface StaffRole {
  id: string;
  role: string;
  count: number;
}

interface SessionStaffing {
  sessionId: string; // `${theatreId}-${date}`
  roles: StaffRole[];
}

interface DailyAuxiliaryStaffing {
  date: string;
  unitId: string;
  roles: StaffRole[];
}

// Auxiliary roles (per unit per day)
const AUXILIARY_ROLES = [
  'Floor Coordinator',
  'Anaes N/P Bleep',
  'Anaes N/P Support',
  'Scrub N/P (Orthopaedic) Floater'
];

// Night staff roles (per unit per night)
const NIGHT_STAFF_ROLES = [
  'Night Floor Coordinator',
  'Night Anaes N/P',
  'Night Scrub N/P',
  'Night HCA'
];

// Default auxiliary staffing per unit per day
const DEFAULT_AUXILIARY_STAFFING: StaffRole[] = [
  { id: 'default-floor-coord', role: 'Floor Coordinator', count: 1 },
  { id: 'default-anaes-bleep', role: 'Anaes N/P Bleep', count: 2 },
  { id: 'default-anaes-support', role: 'Anaes N/P Support', count: 1 },
  { id: 'default-ortho-floater', role: 'Scrub N/P (Orthopaedic) Floater', count: 1 }
];

// Default night staffing per unit per night
const DEFAULT_NIGHT_STAFFING: StaffRole[] = [
  { id: 'default-night-floor-coord', role: 'Night Floor Coordinator', count: 1 },
  { id: 'default-night-scrub', role: 'Night Scrub N/P', count: 6 },
  { id: 'default-night-anaes', role: 'Night Anaes N/P', count: 3 },
  { id: 'default-night-hca', role: 'Night HCA', count: 2 }
];

// Available theatre roles
const THEATRE_ROLES = [
  'Scrub N/P',
  'Anaes N/P',
  'Recovery N/P',
  'HCA',
  'Surgical Care Practitioner',
  'Theatre Nurse Assistant',
  'Senior Sister/Charge Nurse',
  'Matron',
  'Theatre Manager',
  'Clinical Services Manager'
];

// Default staffing template
const DEFAULT_STAFFING: StaffRole[] = [
  { id: 'default-anaes', role: 'Anaes N/P', count: 1 },
  { id: 'default-scrub-1', role: 'Scrub N/P', count: 2 },
  { id: 'default-hca', role: 'HCA', count: 1 }
];

export default function StaffAllocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Get URL parameters for date range
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlStartDate = searchParams?.get('start');
  const initialDate = urlStartDate ? new Date(urlStartDate) : new Date('2025-10-01');

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(initialDate, { weekStartsOn: 1 })); // Monday
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [configurations, setConfigurations] = useState<DayConfiguration[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('all');
  const [staffAllocations, setStaffAllocations] = useState<Map<string, StaffRole[]>>(new Map());
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DayConfiguration | null>(null);
  const [currentRoles, setCurrentRoles] = useState<StaffRole[]>([]);
  const [auxiliaryStaffing, setAuxiliaryStaffing] = useState<Map<string, StaffRole[]>>(new Map());
  const [showAuxiliaryModal, setShowAuxiliaryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentAuxiliaryRoles, setCurrentAuxiliaryRoles] = useState<StaffRole[]>([]);
  const [nightStaffing, setNightStaffing] = useState<Map<string, StaffRole[]>>(new Map());
  const [showNightStaffModal, setShowNightStaffModal] = useState(false);
  const [currentNightRoles, setCurrentNightRoles] = useState<StaffRole[]>([]);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [summaryDate, setSummaryDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu'>('ops');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'template' | 'builder' | 'allocation'>('roles');

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu') => {
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
    loadData();
  }, [currentWeekStart]);

  // Calculate date range - show 12 weeks (84 days) for continuous scrolling
  const weekStart = currentWeekStart;
  const weekEnd = addDays(weekStart, 83); // 12 weeks
  const weekDays = Array.from({ length: 84 }, (_, i) => addDays(weekStart, i));
  const today = startOfDay(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Starting data load...');
      console.log('Week range:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));

      // Load theatres
      const { getTheatres } = await import('@/lib/scheduling/theatreService');
      const loadedTheatres = await getTheatres();
      console.log(`✅ Loaded ${loadedTheatres.length} theatres`);
      setTheatres(loadedTheatres);

      // Load calendar configurations for the week
      const { loadCalendarConfigurations } = await import('@/lib/scheduling/theatreService');
      const theatreIds = loadedTheatres.map(t => t.id);
      const loadedConfigs = await loadCalendarConfigurations(weekStart, weekEnd, theatreIds);
      console.log(`✅ Loaded ${loadedConfigs.length} configurations for week`);
      if (loadedConfigs.length > 0) {
        console.log('Sample config:', loadedConfigs[0]);
        console.log('Date range in configs:',
          loadedConfigs[0]?.date,
          'to',
          loadedConfigs[loadedConfigs.length - 1]?.date
        );
      } else {
        console.warn('⚠️ NO CONFIGURATIONS LOADED!');
      }
      setConfigurations(loadedConfigs);

      // Load consultants
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const consultantsSnapshot = await getDocs(collection(db, 'consultants'));
      const loadedConsultants = consultantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Consultant[];
      console.log(`✅ Loaded ${loadedConsultants.length} consultants`);
      setConsultants(loadedConsultants);

      // Load staff allocations from Firebase
      const staffAllocationsSnapshot = await getDocs(collection(db, 'staffAllocations'));
      const loadedAllocations = new Map<string, StaffRole[]>();
      staffAllocationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        loadedAllocations.set(data.sessionId, data.roles || []);
      });
      console.log(`✅ Loaded ${loadedAllocations.size} staff allocations from Firebase`);
      setStaffAllocations(loadedAllocations);

      // Load auxiliary staffing allocations from Firebase
      const auxiliarySnapshot = await getDocs(collection(db, 'auxiliaryStaffing'));
      const loadedAuxiliary = new Map<string, StaffRole[]>();
      auxiliarySnapshot.docs.forEach(doc => {
        const data = doc.data();
        loadedAuxiliary.set(data.date, data.roles || []);
      });
      console.log(`✅ Loaded ${loadedAuxiliary.size} auxiliary staffing allocations from Firebase`);
      setAuxiliaryStaffing(loadedAuxiliary);

      // Load night staffing allocations from Firebase
      const nightStaffingSnapshot = await getDocs(collection(db, 'nightStaffing'));
      const loadedNightStaffing = new Map<string, StaffRole[]>();
      nightStaffingSnapshot.docs.forEach(doc => {
        const data = doc.data();
        loadedNightStaffing.set(data.date, data.roles || []);
      });
      console.log(`✅ Loaded ${loadedNightStaffing.size} night staffing allocations from Firebase`);
      setNightStaffing(loadedNightStaffing);

      console.log(`✅ DATA LOAD COMPLETE`);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter configurations
  const filteredConfigurations = configurations.filter(config => {
    if (selectedSpecialty !== 'all' && config.specialty !== selectedSpecialty) return false;
    if (selectedSessionType !== 'all' && config.sessionTypeId !== selectedSessionType) return false;
    return config.sessionTypeId !== 'closed'; // Don't show closed sessions
  });

  // Group by date
  const configsByDate = filteredConfigurations.reduce((acc, config) => {
    if (!acc[config.date]) {
      acc[config.date] = [];
    }
    acc[config.date].push(config);
    return acc;
  }, {} as Record<string, DayConfiguration[]>);

  const getConsultantName = (id?: string): string => {
    if (!id) return 'Not assigned';
    const consultant = consultants.find(c => c.id === id);
    return consultant?.name || id;
  };

  const getConsultantLastName = (id?: string): string => {
    if (!id) return '';
    const consultant = consultants.find(c => c.id === id);
    return consultant?.name?.split(' ').pop()?.toUpperCase() || '';
  };

  const getTheatreName = (theatreId: string): string => {
    const theatre = theatres.find(t => t.id === theatreId);
    return theatre?.name || theatreId;
  };

  // Get unique specialties and session types from configurations
  const specialties = Array.from(new Set(configurations.map(c => c.specialty).filter(Boolean))) as string[];
  const sessionTypes = Array.from(new Set(configurations.map(c => c.sessionTypeId).filter(s => s !== 'closed')));

  const openStaffModal = (config: DayConfiguration) => {
    setSelectedSession(config);
    const sessionId = `${config.theatreId}-${config.date}`;
    const existingRoles = staffAllocations.get(sessionId);

    // If no existing roles, use default staffing with unique IDs
    if (!existingRoles || existingRoles.length === 0) {
      // Check if this is an emergency theatre
      const theatre = theatres.find(t => t.id === config.theatreId);
      const isEmergency = theatre?.theatreType === 'emergency';

      // Default staffing - 3 Scrub N/P for emergency, 2 for others
      const defaultRoles: StaffRole[] = [
        { id: 'default-anaes', role: 'Anaes N/P', count: 1 },
        { id: 'default-scrub', role: 'Scrub N/P', count: isEmergency ? 3 : 2 },
        { id: 'default-hca', role: 'HCA', count: 1 }
      ];

      setCurrentRoles(defaultRoles.map(role => ({
        ...role,
        id: `${role.role}-${Date.now()}-${Math.random()}`
      })));
    } else {
      setCurrentRoles(existingRoles);
    }
    setShowStaffModal(true);
  };

  const removeAllStaff = async (config: DayConfiguration) => {
    const sessionId = `${config.theatreId}-${config.date}`;

    if (!confirm(`Remove all staff from ${getTheatreName(config.theatreId)} on ${format(new Date(config.date), 'MMM d, yyyy')}?`)) {
      return;
    }

    try {
      // Delete from Firebase
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'staffAllocations', sessionId));

      // Update local state
      const newAllocations = new Map(staffAllocations);
      newAllocations.delete(sessionId);
      setStaffAllocations(newAllocations);

      console.log('✅ Staff allocation removed from Firebase');
    } catch (error) {
      console.error('❌ Error removing staff allocation:', error);
      alert('Failed to remove staff allocation. Please try again.');
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const addRole = (role: string) => {
    const newRole: StaffRole = {
      id: `role-${Date.now()}`,
      role,
      count: 1
    };
    setCurrentRoles([...currentRoles, newRole]);
  };

  const updateRoleCount = (roleId: string, count: number) => {
    setCurrentRoles(currentRoles.map(r =>
      r.id === roleId ? { ...r, count: Math.max(0, count) } : r
    ));
  };

  const removeRole = (roleId: string) => {
    setCurrentRoles(currentRoles.filter(r => r.id !== roleId));
  };

  const saveStaffAllocation = async () => {
    if (!selectedSession) return;

    try {
      const sessionId = `${selectedSession.theatreId}-${selectedSession.date}`;
      const roles = currentRoles.filter(r => r.count > 0);

      // Save to Firebase
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await setDoc(doc(db, 'staffAllocations', sessionId), {
        sessionId,
        theatreId: selectedSession.theatreId,
        date: selectedSession.date,
        sessionTypeId: selectedSession.sessionTypeId,
        specialty: selectedSession.specialty || '',
        consultantSurgeonId: selectedSession.consultantSurgeonId || '',
        assistingSurgeonId: selectedSession.assistingSurgeonId || '',
        consultantAnaesthetistId: selectedSession.consultantAnaesthetistId || '',
        assistingAnaesthetistId: selectedSession.assistingAnaesthetistId || '',
        roles,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const newAllocations = new Map(staffAllocations);
      newAllocations.set(sessionId, roles);
      setStaffAllocations(newAllocations);

      setShowStaffModal(false);
      setSelectedSession(null);
      setCurrentRoles([]);

      console.log('✅ Staff allocation saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving staff allocation:', error);
      alert('Failed to save staff allocation. Please try again.');
    }
  };

  const getSessionStaffCount = (theatreId: string, date: string): number => {
    const sessionId = `${theatreId}-${date}`;
    const roles = staffAllocations.get(sessionId) || [];
    return roles.reduce((sum, role) => sum + role.count, 0);
  };

  const openAuxiliaryModal = (date: string) => {
    setSelectedDate(date);
    const existing = auxiliaryStaffing.get(date);

    if (!existing || existing.length === 0) {
      setCurrentAuxiliaryRoles(DEFAULT_AUXILIARY_STAFFING.map(role => ({
        ...role,
        id: `${role.role}-${Date.now()}-${Math.random()}`
      })));
    } else {
      setCurrentAuxiliaryRoles(existing);
    }
    setShowAuxiliaryModal(true);
  };

  const addAuxiliaryRole = (role: string) => {
    const newRole: StaffRole = {
      id: `role-${Date.now()}`,
      role,
      count: 1
    };
    setCurrentAuxiliaryRoles([...currentAuxiliaryRoles, newRole]);
  };

  const updateAuxiliaryRoleCount = (roleId: string, count: number) => {
    setCurrentAuxiliaryRoles(currentAuxiliaryRoles.map(r =>
      r.id === roleId ? { ...r, count: Math.max(0, count) } : r
    ));
  };

  const removeAuxiliaryRole = (roleId: string) => {
    setCurrentAuxiliaryRoles(currentAuxiliaryRoles.filter(r => r.id !== roleId));
  };

  const saveAuxiliaryStaffing = async () => {
    if (!selectedDate) return;

    try {
      const roles = currentAuxiliaryRoles.filter(r => r.count > 0);

      // Save to Firebase
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await setDoc(doc(db, 'auxiliaryStaffing', selectedDate), {
        date: selectedDate,
        roles,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const newAuxiliary = new Map(auxiliaryStaffing);
      newAuxiliary.set(selectedDate, roles);
      setAuxiliaryStaffing(newAuxiliary);

      setShowAuxiliaryModal(false);
      setSelectedDate('');
      setCurrentAuxiliaryRoles([]);

      console.log('✅ Auxiliary staffing saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving auxiliary staffing:', error);
      alert('Failed to save auxiliary staffing. Please try again.');
    }
  };

  const getAuxiliaryStaffCount = (date: string): number => {
    const roles = auxiliaryStaffing.get(date) || [];
    return roles.reduce((sum, role) => sum + role.count, 0);
  };

  // Night Staff Functions
  const openNightStaffModal = (date: string) => {
    setSelectedDate(date);
    const existing = nightStaffing.get(date);

    if (!existing || existing.length === 0) {
      setCurrentNightRoles(DEFAULT_NIGHT_STAFFING.map(role => ({
        ...role,
        id: `${role.role}-${Date.now()}-${Math.random()}`
      })));
    } else {
      setCurrentNightRoles([...existing]);
    }

    setShowNightStaffModal(true);
  };

  const addNightRole = (roleName: string) => {
    const newRole: StaffRole = {
      id: `night-${Date.now()}-${Math.random()}`,
      role: roleName,
      count: 1
    };
    setCurrentNightRoles([...currentNightRoles, newRole]);
  };

  const updateNightRoleCount = (roleId: string, count: number) => {
    setCurrentNightRoles(currentNightRoles.map(role =>
      role.id === roleId ? { ...role, count } : role
    ));
  };

  const removeNightRole = (roleId: string) => {
    setCurrentNightRoles(currentNightRoles.filter(role => role.id !== roleId));
  };

  const saveNightStaffing = async () => {
    if (!selectedDate) return;

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const docRef = doc(db, 'nightStaffing', selectedDate);
      await setDoc(docRef, {
        date: selectedDate,
        roles: currentNightRoles,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updated = new Map(nightStaffing);
      updated.set(selectedDate, currentNightRoles);
      setNightStaffing(updated);

      setShowNightStaffModal(false);
      setSelectedDate('');
      setCurrentNightRoles([]);

      console.log('✅ Night staffing saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving night staffing:', error);
      alert('Failed to save night staffing. Please try again.');
    }
  };

  const getNightStaffCount = (date: string): number => {
    const roles = nightStaffing.get(date) || [];
    return roles.reduce((sum, role) => sum + role.count, 0);
  };

  const calculateDailySummary = (date: string) => {
    const dayConfigs = configsByDate[date] || [];
    const roleTally = new Map<string, number>();
    const roleByShiftType = new Map<string, { day: number; longDay: number; night: number }>();

    // Count theatre session requirements by shift type
    dayConfigs.forEach(config => {
      const sessionId = `${config.theatreId}-${date}`;
      const allocation = staffAllocations.get(sessionId);

      if (allocation) {
        allocation.forEach(role => {
          // Total count
          const current = roleTally.get(role.role) || 0;
          roleTally.set(role.role, current + role.count);

          // Count by shift type based on session type
          if (!roleByShiftType.has(role.role)) {
            roleByShiftType.set(role.role, { day: 0, longDay: 0, night: 0 });
          }
          const shiftCounts = roleByShiftType.get(role.role)!;

          // Map session type to shift type
          if (config.sessionTypeId === 'long-day') {
            shiftCounts.longDay += role.count;
          } else if (config.sessionTypeId === 'day') {
            shiftCounts.day += role.count;
          } else if (config.sessionTypeId === 'night') {
            shiftCounts.night += role.count;
          } else {
            // Default to day shift for unknown session types
            shiftCounts.day += role.count;
          }
        });
      }
    });

    // Add auxiliary staffing (typically day shift)
    const auxRoles = auxiliaryStaffing.get(date) || [];
    auxRoles.forEach(role => {
      const current = roleTally.get(role.role) || 0;
      roleTally.set(role.role, current + role.count);

      // Auxiliary staff are typically day shift
      if (!roleByShiftType.has(role.role)) {
        roleByShiftType.set(role.role, { day: 0, longDay: 0, night: 0 });
      }
      const shiftCounts = roleByShiftType.get(role.role)!;
      shiftCounts.day += role.count;
    });

    // Add night staffing - normalize role names by removing "Night " prefix
    const nightRoles = nightStaffing.get(date) || [];
    nightRoles.forEach(role => {
      // Normalize role name: remove "Night " prefix to integrate with main roles
      // e.g., "Night Scrub N/P" → "Scrub N/P", "Night Floor Coordinator" → "Floor Coordinator"
      const normalizedRole = role.role.replace(/^Night\s+/i, '');

      const current = roleTally.get(normalizedRole) || 0;
      roleTally.set(normalizedRole, current + role.count);

      // Night staff go to night shift
      if (!roleByShiftType.has(normalizedRole)) {
        roleByShiftType.set(normalizedRole, { day: 0, longDay: 0, night: 0 });
      }
      const shiftCounts = roleByShiftType.get(normalizedRole)!;
      shiftCounts.night += role.count;
    });

    const totalStaff = Array.from(roleTally.values()).reduce((sum, count) => sum + count, 0);
    const totalSessions = dayConfigs.length;

    return {
      roleTally,
      roleByShiftType,
      totalStaff,
      totalSessions,
      auxiliaryCount: auxRoles.reduce((sum, r) => sum + r.count, 0),
      nightCount: nightRoles.reduce((sum, r) => sum + r.count, 0)
    };
  };

  const openDailySummary = (date: string) => {
    setSummaryDate(date);
    setShowDailySummary(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Static Admin Demo Header */}
      <div
        onClick={() => router.push('/')}
        className="w-full bg-purple-600 text-white flex items-center justify-center gap-3 px-4 cursor-pointer hover:bg-purple-700 transition-colors"
        style={{ height: '28px' }}
      >
        <p className="text-sm font-bold whitespace-nowrap">ADMIN DEMO ACCOUNT</p>
        <p className="text-[10px] font-medium whitespace-nowrap opacity-90">Click here to switch</p>
      </div>

      {/* TOM by MEDASKCA Header - Desktop Only */}
      <div className="hidden md:block text-white shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
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
              onClick={() => {}}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Requirements
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
              Cases
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

      {/* Page Title & Tabs - Desktop Only */}
      <div className="hidden md:block px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Staff Requirements</h1>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Define staffing templates and requirements
        </p>

        {/* Desktop Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'roles'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'template'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Builder
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'allocation'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Allocation
          </button>
        </div>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-50 shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">
                Requirements
              </h1>
              <p className="text-sm text-white/90 mt-0.5">
                Staffing templates & allocation
              </p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-[76px] z-40 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-2 py-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'roles'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'template'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Template
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            Builder
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'allocation'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Allocation
          </button>
        </div>
      </div>

      {/* Roles Tab Content */}
      {activeTab === 'roles' && (
        <div className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Step 1: Define Roles */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
                <Settings className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
                <span>Step 1: Define Roles</span>
              </h2>
              <p className="text-xs sm:text-sm mt-1 text-white/90">Configure unit coordinators, special units, and staff pool sections</p>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <AllocationConfigManager />
            </div>
          </div>

          {/* Step 2: Configure Default Theatre Staffing */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
                <span>Step 2: Configure Default Theatre Staffing</span>
              </h2>
              <p className="text-xs sm:text-sm mt-1 text-white/90">Set default staffing requirements for theatre sessions</p>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <DefaultTheatreStaffing />
            </div>
          </div>

          {/* Step 3: Map Additional Requirements */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
                <ClipboardList className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
                <span>Step 3: Map Additional Requirements</span>
              </h2>
              <p className="text-xs sm:text-sm mt-1 text-white/90">Map procedure keywords to additional staffing requirements</p>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <StaffRequirementMapper />
            </div>
          </div>
        </div>
      )}

      {/* Template Tab Content */}
      {activeTab === 'template' && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200 m-2 sm:m-3 md:m-4">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
              <ClipboardList className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
              <span>Staffing Requirements Template</span>
            </h2>
            <p className="text-xs sm:text-sm mt-1 text-white/90">Shows required roles and default quantities for each theatre - used for auto-rostering based on staff availability and competency</p>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <AllocationView templateMode={true} />
          </div>
        </div>
      )}

      {/* Builder Tab Content */}
      {activeTab === 'builder' && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200 m-2 sm:m-3 md:m-4">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
              <Grid3x3 className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
              <span>Template Builder</span>
            </h2>
            <p className="text-xs sm:text-sm mt-1 text-white/90">Create custom staffing templates with drag-drop, resizing, multi-cell selection, and advanced formatting</p>
          </div>
          <div className="p-0">
            <AdvancedTemplateBuilder />
          </div>
        </div>
      )}

      {/* Allocation Tab Content */}
      {activeTab === 'allocation' && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-orange-200 m-2 sm:m-3 md:m-4">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-orange-200" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
              <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
              <span>Staff Allocation</span>
            </h2>
            <p className="text-xs sm:text-sm mt-1 text-white/90">View and manage staff allocations across theatre sessions</p>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <AllocationView />
          </div>
        </div>
      )}

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
