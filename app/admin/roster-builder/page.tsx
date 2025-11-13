'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Users, Clock, AlertCircle, Plus, X, ArrowLeft, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TomSuggestionsPanel from '@/components/roster/TomSuggestionsPanel';
import AutoFillButton from '@/components/roster/AutoFillButton';
import TomLogo from '@/components/TomLogo';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import { scoreStaffForShift, type ScoredCandidate, type ShiftRequirement } from '@/lib/roster/aiScoringService';

// Shift types and patterns - NHS Theatre shift patterns
const SHIFT_PATTERNS = {
  'Day': { start: '08:00', end: '18:00', hours: 10, color: 'bg-blue-100 border-blue-400 text-blue-900', abbrev: 'D' },
  'Long Day': { start: '08:00', end: '20:00', hours: 12, color: 'bg-green-100 border-green-400 text-green-900', abbrev: 'LD' },
  'Night': { start: '20:00', end: '08:00', hours: 12, color: 'bg-indigo-100 border-indigo-400 text-indigo-900', abbrev: 'N' },
  'd': { start: '08:00', end: '18:00', hours: 10, color: 'bg-blue-100 border-blue-400 text-blue-900', abbrev: 'D' },
  'ld': { start: '08:00', end: '20:00', hours: 12, color: 'bg-green-100 border-green-400 text-green-900', abbrev: 'LD' },
  'n': { start: '20:00', end: '08:00', hours: 12, color: 'bg-indigo-100 border-indigo-400 text-indigo-900', abbrev: 'N' },
  'day': { start: '08:00', end: '18:00', hours: 10, color: 'bg-blue-100 border-blue-400 text-blue-900', abbrev: 'D' },
  'long-day': { start: '08:00', end: '20:00', hours: 12, color: 'bg-green-100 border-green-400 text-green-900', abbrev: 'LD' },
  'night': { start: '20:00', end: '08:00', hours: 12, color: 'bg-indigo-100 border-indigo-400 text-indigo-900', abbrev: 'N' },
  'CD-D': { start: '08:00', end: '18:00', hours: 10, color: 'bg-cyan-100 border-cyan-400 text-cyan-900', abbrev: 'CD-D' },
  'CD-LD': { start: '08:00', end: '20:00', hours: 12, color: 'bg-teal-100 border-teal-400 text-teal-900', abbrev: 'CD-LD' },
  'MD': { start: '08:00', end: '18:00', hours: 10, color: 'bg-amber-100 border-amber-400 text-amber-900', abbrev: 'MD' },
  'Early': { start: '07:30', end: '15:30', hours: 8, color: 'bg-cyan-100 border-cyan-400 text-cyan-900', abbrev: 'E' },
  'Late': { start: '13:30', end: '21:30', hours: 8, color: 'bg-purple-100 border-purple-400 text-purple-900', abbrev: 'L' },
  'Twilight': { start: '16:00', end: '22:00', hours: 6, color: 'bg-orange-100 border-orange-400 text-orange-900', abbrev: 'TW' },
  'On Call': { start: '00:00', end: '23:59', hours: 0, color: 'bg-yellow-100 border-yellow-400 text-yellow-900', abbrev: 'OC' }
};

const LEAVE_TYPES = {
  'Annual Leave': { color: 'bg-green-200 border-green-500 text-green-900', abbrev: 'A/L' },
  'Sickness': { color: 'bg-red-200 border-red-500 text-red-900', abbrev: 'Sick' },
  'Study Leave': { color: 'bg-purple-200 border-purple-500 text-purple-900', abbrev: 'Study' },
  'Management Day': { color: 'bg-amber-200 border-amber-500 text-amber-900', abbrev: 'Mgmt' },
  'Governance Meeting': { color: 'bg-pink-200 border-pink-500 text-pink-900', abbrev: 'Gov' },
  'Training': { color: 'bg-teal-200 border-teal-500 text-teal-900', abbrev: 'Train' },
  'Other': { color: 'bg-gray-200 border-gray-500 text-gray-900', abbrev: 'Other' }
};

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  roles: string[];
  band: string;
}

interface Shift {
  id: string;
  staffId: string;
  date: string;
  shiftType: keyof typeof SHIFT_PATTERNS;
  startTime: string;
  endTime: string;
  hours: number;
  role?: string;
  status?: string;
}

interface LeaveRecord {
  id: string;
  staffId: string;
  type: keyof typeof LEAVE_TYPES;
  startDate: string;
  endDate: string;
  hours: number;
  status: string;
  notes?: string;
}

interface Roster {
  id: string;
  staffId: string;
  contractedHours: number;
  shifts: Shift[];
  leave: LeaveRecord[];
  periodStart: string;
  periodEnd: string;
  totalScheduledHours: number;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  shiftId: string | null;
}

interface StaffRole {
  id: string;
  role: string;
  count: number;
}

interface DayRequirement {
  theatre: number;
  auxiliary: number;
  night: number;
  total: number;
  roleBreakdown: Map<string, number>;
  shiftTypeBreakdown: Map<string, { day: number; longDay: number; night: number }>;
}

export default function RosterBuilderPage() {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date('2025-10-27'), { weekStartsOn: 1 }));
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [rosters, setRosters] = useState<Map<string, Roster>>(new Map());
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, shiftId: null });
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof SHIFT_PATTERNS>('Day');
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<Map<string, DayRequirement>>(new Map());
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // TOM AI State
  const [showTomPanel, setShowTomPanel] = useState(false);
  const [tomSuggestions, setTomSuggestions] = useState<ScoredCandidate[]>([]);
  const [tomRequirement, setTomRequirement] = useState<ShiftRequirement | null>(null);
  const [tomLoading, setTomLoading] = useState(false);
  const [showTomMenu, setShowTomMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu'>('ops');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu') => {
    if (page === 'home') {
      router.push('/admin');
    } else if (page === 'ai') {
      router.push('/admin'); // Navigate to main admin and show AI
    } else {
      setCurrentPage(page);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, shiftId: null });
      }
      // Close TOM menu if clicking outside
      const target = event.target as HTMLElement;
      if (showTomMenu && !target.closest('.tom-menu-container')) {
        setShowTomMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTomMenu]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Load staff from Royal London Hospital
      const staffQuery = query(collection(db, 'staff'), where('location.currentHospital', '==', 'Royal London Hospital'));
      const staffSnapshot = await getDocs(staffQuery);
      const loadedStaff = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffMember[];

      // Sort staff by band (descending) and then by specialty
      // Matrons (Band 8a) first, then Band 7, 6, 5, 3
      const bandOrder = { 'Band 8a': -1, 'Band 7': 0, 'Band 6': 1, 'Band 5': 2, 'Band 3': 3, 'Band 2': 4 };
      const sortedStaff = loadedStaff.sort((a, b) => {
        const bandA = bandOrder[a.band as keyof typeof bandOrder] ?? 99;
        const bandB = bandOrder[b.band as keyof typeof bandOrder] ?? 99;

        if (bandA !== bandB) return bandA - bandB;

        // Within same band, sort by specialty
        const specialtyA = (a as any).specialtyTree?.[0]?.name || '';
        const specialtyB = (b as any).specialtyTree?.[0]?.name || '';
        return specialtyA.localeCompare(specialtyB);
      });

      setStaffMembers(sortedStaff);

      // Load rosters for all staff
      const rostersSnapshot = await getDocs(collection(db, 'rosters'));
      const loadedRosters = new Map<string, Roster>();
      rostersSnapshot.docs.forEach(doc => {
        const roster = doc.data() as Roster;
        loadedRosters.set(roster.staffId, roster);
      });
      setRosters(loadedRosters);
      console.log(`✅ Loaded ${loadedRosters.size} rosters from Firebase`);

      // Load staffing requirements for the week
      const weekStart = currentWeekStart;
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // Load calendar configurations to get session types
      const configsSnapshot = await getDocs(collection(db, 'calendarConfigurations'));
      const configsByDate = new Map<string, any[]>();
      configsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.configurations && Array.isArray(data.configurations)) {
          data.configurations.forEach((config: any) => {
            if (!configsByDate.has(config.date)) {
              configsByDate.set(config.date, []);
            }
            configsByDate.get(config.date)!.push(config);
          });
        }
      });

      // Load theatre session allocations
      const allocationsSnapshot = await getDocs(collection(db, 'staffAllocations'));

      // Load auxiliary staffing
      const auxiliarySnapshot = await getDocs(collection(db, 'auxiliaryStaffing'));

      // Load night staffing
      const nightSnapshot = await getDocs(collection(db, 'nightStaffing'));

      // Calculate requirements per day
      const dailyRequirements = new Map<string, DayRequirement>();

      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const roleBreakdown = new Map<string, number>();
        const shiftTypeBreakdown = new Map<string, { day: number; longDay: number; night: number }>();

        // Count theatre session requirements for this date WITH shift types
        let theatreTotal = 0;
        const dayConfigs = configsByDate.get(dateStr) || [];

        allocationsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.date === dateStr) {
            // Find matching config to get session type
            const config = dayConfigs.find(c => c.theatreId === data.theatreId);
            const sessionTypeId = config?.sessionTypeId || 'day';

            const roles = data.roles || [];
            roles.forEach((r: StaffRole) => {
              theatreTotal += r.count;
              roleBreakdown.set(r.role, (roleBreakdown.get(r.role) || 0) + r.count);

              // Track by shift type
              if (!shiftTypeBreakdown.has(r.role)) {
                shiftTypeBreakdown.set(r.role, { day: 0, longDay: 0, night: 0 });
              }
              const shifts = shiftTypeBreakdown.get(r.role)!;
              if (sessionTypeId === 'long-day') {
                shifts.longDay += r.count;
              } else if (sessionTypeId === 'night') {
                shifts.night += r.count;
              } else {
                shifts.day += r.count;
              }
            });
          }
        });

        // Count auxiliary requirements for this date (typically day shift)
        let auxiliaryTotal = 0;
        auxiliarySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.date === dateStr) {
            const roles = data.roles || [];
            roles.forEach((r: StaffRole) => {
              auxiliaryTotal += r.count;
              roleBreakdown.set(r.role, (roleBreakdown.get(r.role) || 0) + r.count);

              // Auxiliary is typically day shift
              if (!shiftTypeBreakdown.has(r.role)) {
                shiftTypeBreakdown.set(r.role, { day: 0, longDay: 0, night: 0 });
              }
              shiftTypeBreakdown.get(r.role)!.day += r.count;
            });
          }
        });

        // Count night staffing requirements for this date
        // Normalize role names by removing "Night " prefix
        let nightTotal = 0;
        nightSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.date === dateStr) {
            const roles = data.roles || [];
            roles.forEach((r: StaffRole) => {
              nightTotal += r.count;

              // Normalize role name: remove "Night " prefix
              // e.g., "Night Scrub N/P" → "Scrub N/P"
              const normalizedRole = r.role.replace(/^Night\s+/i, '');

              roleBreakdown.set(normalizedRole, (roleBreakdown.get(normalizedRole) || 0) + r.count);

              // Night staffing goes to night shift
              if (!shiftTypeBreakdown.has(normalizedRole)) {
                shiftTypeBreakdown.set(normalizedRole, { day: 0, longDay: 0, night: 0 });
              }
              shiftTypeBreakdown.get(normalizedRole)!.night += r.count;
            });
          }
        });

        dailyRequirements.set(dateStr, {
          theatre: theatreTotal,
          auxiliary: auxiliaryTotal,
          night: nightTotal,
          total: theatreTotal + auxiliaryTotal + nightTotal,
          roleBreakdown,
          shiftTypeBreakdown
        });
      });

      setRequirements(dailyRequirements);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };


  // Get shifts for a specific staff member and date from roster
  const getShiftsForCell = (staffId: string, date: string): Shift[] => {
    const roster = rosters.get(staffId);
    if (!roster) return [];
    return roster.shifts.filter(s => s.date === date);
  };

  // Get leave for a specific staff member and date from roster
  const getLeaveForCell = (staffId: string, date: string): LeaveRecord | null => {
    const roster = rosters.get(staffId);
    if (!roster) return null;

    return roster.leave.find(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const current = new Date(date);
      return current >= start && current <= end;
    }) || null;
  };

  // Get total hours for the week for a staff member
  const getTotalHours = (staffId: string): number => {
    const roster = rosters.get(staffId);
    if (!roster) return 0;

    // Filter shifts for current week
    const weekStart = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEnd = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    return roster.shifts
      .filter(s => s.date >= weekStart && s.date <= weekEnd)
      .reduce((sum, shift) => sum + shift.hours, 0);
  };

  // Get count of rostered staff for a specific date
  const getRosteredCount = (date: string): number => {
    let count = 0;
    for (const roster of rosters.values()) {
      const hasShift = roster.shifts.some(s => s.date === date);
      const hasLeave = roster.leave.some(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const current = new Date(date);
        return current >= start && current <= end && l.type !== 'Annual Leave';
      });
      if (hasShift && !hasLeave) count++;
    }
    return count;
  };

  // Get count of shifts by type for a specific date
  const getShiftCountsByType = (date: string): { day: number; longDay: number; night: number; total: number } => {
    let dayCount = 0;
    let longDayCount = 0;
    let nightCount = 0;

    for (const roster of rosters.values()) {
      const shiftsForDate = roster.shifts.filter(s => s.date === date);

      shiftsForDate.forEach(shift => {
        const shiftType = shift.shiftType.toLowerCase();

        // Normalize shift types
        if (shiftType === 'day' || shiftType === 'd') {
          dayCount++;
        } else if (shiftType === 'long-day' || shiftType === 'long day' || shiftType === 'ld') {
          longDayCount++;
        } else if (shiftType === 'night' || shiftType === 'n') {
          nightCount++;
        }
      });
    }

    return {
      day: dayCount,
      longDay: longDayCount,
      night: nightCount,
      total: dayCount + longDayCount + nightCount
    };
  };

  // TOM AI Handlers
  const handleAskTom = async (date: string, staffId?: string) => {
    try {
      setTomLoading(true);
      setShowTomPanel(true);

      // Get staff context if staffId provided
      let specialty = 'ORTHO';
      let role = 'Scrub N/P';
      let band = 'Band 6';

      if (staffId) {
        const targetStaff = staffMembers.find(s => s.id === staffId);
        if (targetStaff) {
          // Extract specialty from specialtyTree
          specialty = (targetStaff as any).specialtyTree?.[0]?.name || 'General';
          band = targetStaff.band;

          // Infer role from band
          if (band === 'Band 7' || band === 'Band 8a') {
            role = 'Scrub N/P';
          } else if (band === 'Band 6') {
            role = 'Scrub N/P';
          } else if (band === 'Band 5') {
            role = 'Scrub N/P';
          } else if (band === 'Band 3') {
            role = 'HCA';
          } else {
            role = 'Scrub N/P';
          }
        }
      }

      // Build shift requirement with context
      const requirement: ShiftRequirement = {
        date,
        theatreId: 'THR-RLH-001',
        specialty,
        role,
        band,
        sessionType: 'day',
        startTime: '08:00',
        endTime: '18:00',
        hours: 10
      };

      setTomRequirement(requirement);

      // Score all staff using TOM's AI
      const scoredCandidates = await scoreStaffForShift(requirement, staffMembers as any);

      // Get top 10 for display
      const topCandidates = scoredCandidates
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10)
        .map((c, i) => ({ ...c, rank: i + 1 }));

      setTomSuggestions(topCandidates);
    } catch (error) {
      console.error('TOM AI error:', error);
      alert('Failed to get TOM suggestions. Please try again.');
    } finally {
      setTomLoading(false);
    }
  };

  const handleTomAssign = async (candidate: ScoredCandidate) => {
    if (!tomRequirement) return;

    console.log('Assigning:', candidate.staff.firstName, candidate.staff.lastName, 'to shift on', tomRequirement.date);
    alert(`✅ ${candidate.staff.firstName} ${candidate.staff.lastName} assigned to ${tomRequirement.role} on ${tomRequirement.date}!\n\nScore: ${candidate.totalScore.toFixed(1)}/110\n\nThis is a demo - full assignment logic coming soon!`);
    setShowTomPanel(false);
  };

  const handleAutoFill = async (startDate: string, endDate: string) => {
    console.log('Auto-filling rosters from', startDate, 'to', endDate);

    // Simulate auto-fill for demo
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          assignmentsMade: 315,
          gapsRemaining: 35,
          totalShiftsNeeded: 350,
          totalShiftsFilled: 315,
          fillRate: 90
        });
      }, 3000);
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{backgroundColor: '#F0F9FF'}}>
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4" style={{color: '#3B82F6'}} />
          <p className="text-gray-600">Loading roster builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{backgroundColor: '#F0F9FF'}}>
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
      <div className="hidden md:block text-white shadow-lg flex-shrink-0" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
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
              onClick={() => router.push('/admin/sessions')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Sessions
            </button>
            <button
              onClick={() => router.push('/admin/schedule')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Schedule
            </button>
            <button
              onClick={() => router.push('/admin/staff-allocation')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Requirements
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
      <div className="hidden md:block px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Roster Builder</h1>
        <p className="text-sm text-gray-600 mt-1">
          Build and manage theatre rosters
        </p>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-50 shadow-xl flex-shrink-0" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => router.push('/admin/theatre-management?tab=allocation')}
                className="flex items-center gap-1 md:gap-2 hover:bg-white/20 px-2 py-1 md:px-2 md:py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-sm md:text-xl font-bold flex items-center gap-1.5 md:gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  Roster Builder
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold">Admin</span>
                </h1>
                <p className="text-[10px] md:text-xs text-white/90 hidden sm:block">
                  View staff rosters with shifts and leave
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
            {/* Week Navigation */}
            <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
              <button
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium px-1.5 min-w-[110px] text-center text-xs">
                {format(currentWeekStart, 'MMM d, yyyy')}
              </span>
              <button
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                className="p-0.5 hover:bg-white/20 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* TOM AI Button with Dropdown */}
            <div className="relative tom-menu-container">
              <button
                onClick={() => setShowTomMenu(prev => !prev)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              >
                <TomLogo size={16} variant="inline" />
                TOM AI
              </button>

              {showTomMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border-2 border-blue-500 py-1 min-w-[180px] z-50">
                  <button
                    onClick={() => {
                      setShowTomMenu(false);
                      handleAskTom(format(currentWeekStart, 'yyyy-MM-dd'));
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <TomLogo size={14} variant="inline" />
                    <span>Ask for Suggestion</span>
                  </button>
                  <AutoFillButton
                    currentWeekStart={currentWeekStart}
                    onAutoFill={(result) => {
                      setShowTomMenu(false);
                      handleAutoFill(result);
                    }}
                    onComplete={() => loadData()}
                    asMenuItem={true}
                  />
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="border border-gray-300 px-2 py-1.5 text-left bg-gray-100 sticky left-0 z-20 min-w-[140px]">
                <div className="font-semibold text-xs">Staff Member</div>
                <div className="text-[10px] text-gray-600 font-normal">{staffMembers.length} staff</div>
              </th>
              {weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const shiftCounts = getShiftCountsByType(dateStr);

                return (
                  <th key={day.toISOString()} className="border border-gray-300 px-1 py-1.5 text-center bg-gray-100 min-w-[140px]">
                    <div className="font-semibold text-xs">{format(day, 'EEE')}</div>
                    <div className="text-[10px] text-gray-600">{format(day, 'd/M')}</div>
                    {shiftCounts.total > 0 && (
                      <div className="space-y-1 mt-1">
                        {/* Actual Shift Counts */}
                        <div className="space-y-0.5">
                          {shiftCounts.day > 0 && (
                            <div className="text-[9px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded" title="Day shift 08:00-18:00">
                              Day: {shiftCounts.day}
                            </div>
                          )}
                          {shiftCounts.longDay > 0 && (
                            <div className="text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded" title="Long day 08:00-20:00">
                              Long: {shiftCounts.longDay}
                            </div>
                          )}
                          {shiftCounts.night > 0 && (
                            <div className="text-[9px] text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded" title="Night 20:00-08:00">
                              Night: {shiftCounts.night}
                            </div>
                          )}
                          <div className="text-[9px] text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded font-bold mt-0.5">
                            Total: {shiftCounts.total}
                          </div>
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
              <th className="border border-gray-300 px-2 py-1.5 text-center bg-gray-100 min-w-[60px]">
                <div className="font-semibold text-xs">Hours</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows: JSX.Element[] = [];

              // SECTION 1: Matrons (Band 8a)
              const matrons = staffMembers.filter(staff => staff.band === 'Band 8a');
              if (matrons.length > 0) {
                rows.push(
                  <tr key="band-8a" className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-400">
                    <td className="border border-gray-300 px-2 py-1 font-bold text-indigo-900 sticky left-0 z-10 bg-indigo-100 text-xs" colSpan={9}>
                      Matrons
                    </td>
                  </tr>
                );

                matrons.forEach(staff => {
                  const qualification = (staff as any).professionalQualification || 'RN';
                  const shortQual = qualification.includes('RN') ? 'RN' :
                                   qualification.includes('ODP') ? 'ODP' :
                                   qualification.includes('HCA') ? 'HCA' : 'RN';
                  const rawSpecialty = (staff as any).specialtyTree?.[0]?.name || '';
                  const specialty = rawSpecialty.replace(/\s+Theatre$/i, '').trim();

                  rows.push(
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 bg-white sticky left-0 z-10">
                        <div className="font-medium text-gray-900 text-[11px]">
                          {staff.firstName} {staff.lastName} {specialty && <span className="text-gray-600">({specialty})</span>}
                        </div>
                        <div className="text-[9px] text-gray-600">
                          {shortQual} {staff.band}
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const cellShifts = getShiftsForCell(staff.id, dateStr);
                        const cellLeave = getLeaveForCell(staff.id, dateStr);

                        // Check if cell is empty (no leave, no shifts)
                        const isEmpty = !cellLeave && cellShifts.length === 0;

                        return (
                          <td
                            key={`${staff.id}-${dateStr}`}
                            className="border border-gray-300 px-0.5 py-0.5 bg-white align-top"
                          >
                            <div className="min-h-[40px] space-y-0.5">
                              {/* Show leave if present */}
                              {cellLeave && (
                                <div
                                  className={`${LEAVE_TYPES[cellLeave.type]?.color || LEAVE_TYPES['Other'].color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                >
                                  {LEAVE_TYPES[cellLeave.type]?.abbrev || cellLeave.type}
                                </div>
                              )}

                              {/* Show shifts if no leave */}
                              {!cellLeave && cellShifts.map(shift => {
                                const shiftInfo = SHIFT_PATTERNS[shift.shiftType] || SHIFT_PATTERNS['Day'];

                                return (
                                  <div
                                    key={shift.id}
                                    className={`${shiftInfo.color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                  >
                                    <div>{shiftInfo.abbrev}</div>
                                    <div className="text-[8px] font-normal opacity-75">{shift.hours}h</div>
                                  </div>
                                );
                              })}

                              {/* Show "Fill" button for empty cells */}
                              {isEmpty && (
                                <button
                                  onClick={() => handleAskTom(dateStr, staff.id)}
                                  className="w-full h-[38px] flex items-center justify-center gap-1 border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded text-gray-400 hover:text-orange-600 transition-all group"
                                  title="Click to fill this gap with TOM's AI suggestions"
                                >
                                  <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-semibold">Fill</span>
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 px-2 py-1 text-center bg-white font-bold text-[11px]">
                        {getTotalHours(staff.id)}h
                      </td>
                    </tr>
                  );
                });
              }

              // SECTION 2: Senior Team Leaders (Band 7)
              const seniorLeaders = staffMembers.filter(staff => staff.band === 'Band 7');
              if (seniorLeaders.length > 0) {
                rows.push(
                  <tr key="band-7" className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-400">
                    <td className="border border-gray-300 px-2 py-1 font-bold text-indigo-900 sticky left-0 z-10 bg-indigo-100 text-xs" colSpan={9}>
                      Senior Team Leaders
                    </td>
                  </tr>
                );

                seniorLeaders.forEach(staff => {
                  const qualification = (staff as any).professionalQualification || 'RN';
                  const shortQual = qualification.includes('RN') ? 'RN' :
                                   qualification.includes('ODP') ? 'ODP' :
                                   qualification.includes('HCA') ? 'HCA' : 'RN';
                  const rawSpecialty = (staff as any).specialtyTree?.[0]?.name || '';
                  const specialty = rawSpecialty.replace(/\s+Theatre$/i, '').trim();

                  rows.push(
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 bg-white sticky left-0 z-10">
                        <div className="font-medium text-gray-900 text-[11px]">
                          {staff.firstName} {staff.lastName} {specialty && <span className="text-gray-600">({specialty})</span>}
                        </div>
                        <div className="text-[9px] text-gray-600">
                          {shortQual} {staff.band}
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const cellShifts = getShiftsForCell(staff.id, dateStr);
                        const cellLeave = getLeaveForCell(staff.id, dateStr);

                        // Check if cell is empty (no leave, no shifts)
                        const isEmpty = !cellLeave && cellShifts.length === 0;

                        return (
                          <td
                            key={`${staff.id}-${dateStr}`}
                            className="border border-gray-300 px-0.5 py-0.5 bg-white align-top"
                          >
                            <div className="min-h-[40px] space-y-0.5">
                              {/* Show leave if present */}
                              {cellLeave && (
                                <div
                                  className={`${LEAVE_TYPES[cellLeave.type]?.color || LEAVE_TYPES['Other'].color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                >
                                  {LEAVE_TYPES[cellLeave.type]?.abbrev || cellLeave.type}
                                </div>
                              )}

                              {/* Show shifts if no leave */}
                              {!cellLeave && cellShifts.map(shift => {
                                const shiftInfo = SHIFT_PATTERNS[shift.shiftType] || SHIFT_PATTERNS['Day'];

                                return (
                                  <div
                                    key={shift.id}
                                    className={`${shiftInfo.color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                  >
                                    <div>{shiftInfo.abbrev}</div>
                                    <div className="text-[8px] font-normal opacity-75">{shift.hours}h</div>
                                  </div>
                                );
                              })}

                              {/* Show "Fill" button for empty cells */}
                              {isEmpty && (
                                <button
                                  onClick={() => handleAskTom(dateStr, staff.id)}
                                  className="w-full h-[38px] flex items-center justify-center gap-1 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-all group"
                                  title="Click to fill this gap with TOM's AI suggestions"
                                >
                                  <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-semibold">Fill</span>
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 px-2 py-1 text-center bg-white font-bold text-[11px]">
                        {getTotalHours(staff.id)}h
                      </td>
                    </tr>
                  );
                });
              }

              // SECTION 3: Specialties (Band 6, 5, 3, 2 grouped by specialty + special Anaesthetics section)
              // Get all staff for specialty grouping
              const specialtyStaff = staffMembers.filter(staff =>
                ['Band 6', 'Band 5', 'Band 3', 'Band 2', 'Band 7', 'Band 8a'].includes(staff.band)
              );

              // Group by specialty - with special handling for Anaesthetics
              const specialtyGroups = new Map<string, StaffMember[]>();
              specialtyStaff.forEach(staff => {
                // Check if this is an Anaes N/P staff member (by role or specialty)
                const role = (staff as any).roles?.[0] || '';
                const specialty = (staff as any).specialtyTree?.[0]?.name || '';
                const isAnaes = role.toLowerCase().includes('anaes') || specialty.toLowerCase().includes('anaes');

                if (isAnaes) {
                  // Group all Anaes staff together regardless of band
                  if (!specialtyGroups.has('Anaesthetics')) {
                    specialtyGroups.set('Anaesthetics', []);
                  }
                  specialtyGroups.get('Anaesthetics')!.push(staff);
                } else if (['Band 6', 'Band 5', 'Band 3', 'Band 2'].includes(staff.band)) {
                  // Only non-Anaes Band 2-6 staff get grouped by their specialty
                  const specialtyName = specialty || 'Other';
                  if (!specialtyGroups.has(specialtyName)) {
                    specialtyGroups.set(specialtyName, []);
                  }
                  specialtyGroups.get(specialtyName)!.push(staff);
                }
                // Band 7/8a non-Anaes staff are already shown in Senior Leaders/Matrons sections above
              });

              // Custom specialty order: Vascular, then Anaesthetics (with variations), then rest alphabetically
              const prioritySpecialties = [
                { keywords: ['vascular'], priority: 1 },
                { keywords: ['anaesth', 'anesth'], priority: 2 }, // Matches Anaesthetics, Anaesthesia, Anesthetics, etc.
              ];

              const sortedSpecialties = Array.from(specialtyGroups.keys()).sort((a, b) => {
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();

                // Find priority for a
                const aPriority = prioritySpecialties.find(p =>
                  p.keywords.some(kw => aLower.includes(kw))
                );

                // Find priority for b
                const bPriority = prioritySpecialties.find(p =>
                  p.keywords.some(kw => bLower.includes(kw))
                );

                // Both have priority
                if (aPriority && bPriority) {
                  return aPriority.priority - bPriority.priority;
                }

                // Only a has priority
                if (aPriority) return -1;

                // Only b has priority
                if (bPriority) return 1;

                // Neither have priority, sort alphabetically
                return a.localeCompare(b);
              });

              // Helper function to clean up specialty names
              const cleanSpecialtyName = (specialty: string): string => {
                // Remove "Theatre" and trim
                let cleaned = specialty.replace(/\s+Theatre$/i, '').trim();

                // Convert "Orthopaedic" to "Orthopaedics", "Plastic" to "Plastics", etc.
                if (cleaned.endsWith('ic') && !cleaned.endsWith('ics')) {
                  cleaned = cleaned + 's';
                }

                return cleaned;
              };

              // Render each specialty with all its bands
              sortedSpecialties.forEach(specialty => {
                const staffInSpecialty = specialtyGroups.get(specialty)!;

                // Sort staff within specialty by band (6 > 5 > 3 > 2)
                const bandOrder = { 'Band 6': 0, 'Band 5': 1, 'Band 3': 2, 'Band 2': 3 };
                staffInSpecialty.sort((a, b) => {
                  const bandA = bandOrder[a.band as keyof typeof bandOrder] ?? 99;
                  const bandB = bandOrder[b.band as keyof typeof bandOrder] ?? 99;
                  return bandA - bandB;
                });

                // Add specialty header with cleaned name
                const displayName = cleanSpecialtyName(specialty);
                rows.push(
                  <tr key={`specialty-${specialty}`} className="bg-gradient-to-r from-purple-100 to-pink-100 border-t-2 border-purple-400">
                    <td className="border border-gray-300 px-2 py-1 font-bold text-purple-900 sticky left-0 z-10 bg-purple-100 text-xs" colSpan={9}>
                      {displayName}
                    </td>
                  </tr>
                );

                // Add all staff in this specialty (all bands together)
                staffInSpecialty.forEach(staff => {
                  const qualification = (staff as any).professionalQualification || 'RN';
                  const shortQual = qualification.includes('RN') ? 'RN' :
                                   qualification.includes('ODP') ? 'ODP' :
                                   qualification.includes('HCA') ? 'HCA' : 'RN';

                  rows.push(
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-1 bg-white sticky left-0 z-10">
                        <div className="font-medium text-gray-900 text-[11px]">
                          {staff.firstName} {staff.lastName}
                        </div>
                        <div className="text-[9px] text-gray-600">
                          {shortQual} {staff.band}
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const cellShifts = getShiftsForCell(staff.id, dateStr);
                        const cellLeave = getLeaveForCell(staff.id, dateStr);

                        // Check if cell is empty (no leave, no shifts)
                        const isEmpty = !cellLeave && cellShifts.length === 0;

                        return (
                          <td
                            key={`${staff.id}-${dateStr}`}
                            className="border border-gray-300 px-0.5 py-0.5 bg-white align-top"
                          >
                            <div className="min-h-[40px] space-y-0.5">
                              {/* Show leave if present */}
                              {cellLeave && (
                                <div
                                  className={`${LEAVE_TYPES[cellLeave.type]?.color || LEAVE_TYPES['Other'].color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                >
                                  {LEAVE_TYPES[cellLeave.type]?.abbrev || cellLeave.type}
                                </div>
                              )}

                              {/* Show shifts if no leave */}
                              {!cellLeave && cellShifts.map(shift => {
                                const shiftInfo = SHIFT_PATTERNS[shift.shiftType] || SHIFT_PATTERNS['Day'];

                                return (
                                  <div
                                    key={shift.id}
                                    className={`${shiftInfo.color} border rounded px-1 py-0.5 text-[10px] font-bold`}
                                  >
                                    <div>{shiftInfo.abbrev}</div>
                                    <div className="text-[8px] font-normal opacity-75">{shift.hours}h</div>
                                  </div>
                                );
                              })}

                              {/* Show "Fill" button for empty cells */}
                              {isEmpty && (
                                <button
                                  onClick={() => handleAskTom(dateStr, staff.id)}
                                  className="w-full h-[38px] flex items-center justify-center gap-1 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-all group"
                                  title="Click to fill this gap with TOM's AI suggestions"
                                >
                                  <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-semibold">Fill</span>
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 px-2 py-1 text-center bg-white font-bold text-[11px]">
                        {getTotalHours(staff.id)}h
                      </td>
                    </tr>
                  );
                });
              });

              return rows;
            })()}
          </tbody>
        </table>
      </div>

      {/* TOM AI Suggestions Panel */}
      {showTomPanel && tomRequirement && (
        <TomSuggestionsPanel
          suggestions={tomSuggestions}
          requirement={tomRequirement}
          onAssign={handleTomAssign}
          onClose={() => setShowTomPanel(false)}
          loading={tomLoading}
        />
      )}

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <AdminBottomNav
          currentPage={currentPage}
          onNavigate={handleBottomNavClick}
        />
      </div>
    </div>
  );
}
