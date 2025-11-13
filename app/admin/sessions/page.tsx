'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Settings, HelpCircle, LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { getTheatreListsByDateRange } from '@/lib/services/theatreListService';
import { TheatreList } from '@/lib/theatreListTypes';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';
import ConsultantPreferencesContent from '@/components/scheduling/ConsultantPreferencesContent';
import SurgeonProfilesManager from '@/components/configuration/SurgeonProfilesManager';

// Hospital ID constant
const ROYAL_LONDON_HOSPITAL_ID = 'royal-london-hospital';

// Specialty abbreviation mapping
const SPECIALTY_ABBR_MAP: { [key: string]: string } = {
  'Orthopaedics': 'ORTHO',
  'Trauma': 'TRAUMA',
  'Emergency': 'EMER',
  'General Surgery': 'GS',
  'Gynaecology': 'GYNAE',
  'Urology': 'URO',
  'ENT': 'ENT',
  'Ophthalmology': 'OPHTH',
  'Plastic Surgery': 'PLAST',
  'Vascular': 'VASC',
  'Cardiac': 'CARD',
  'Neurosurgery': 'NEURO',
  'Hepatobiliary': 'HPB',
  'Colorectal': 'COLO',
  'Upper GI': 'UGI',
  'Maxillofacial': 'MAX'
};

export default function AdminSchedulePage() {
  const router = useRouter();
  const [lists, setLists] = useState<TheatreList[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>('all');
  const [specialtyAbbreviations, setSpecialtyAbbreviations] = useState<{ [key: string]: string }>({});
  const [subspecialtyAbbreviations, setSubspecialtyAbbreviations] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu'>('ops');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedTheatres, setExpandedTheatres] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'schedule' | 'consultants' | 'profiles'>('schedule');

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
    } else if (viewId === 'readiness') {
      router.push('/admin/readiness');
    } else if (viewId === 'analytics') {
      router.push('/admin/operations');
    } else if (viewId === 'acute-services') {
      router.push('/admin/acute-services');
    }
  };

  const toggleUnit = (unitName: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitName)) {
      newExpanded.delete(unitName);
    } else {
      newExpanded.add(unitName);
    }
    setExpandedUnits(newExpanded);
  };

  const toggleTheatre = (theatreId: string) => {
    const newExpanded = new Set(expandedTheatres);
    if (newExpanded.has(theatreId)) {
      newExpanded.delete(theatreId);
    } else {
      newExpanded.add(theatreId);
    }
    setExpandedTheatres(newExpanded);
  };

  // Configuration data from Firebase
  const [configUnits, setConfigUnits] = useState<Array<{ id: string; name: string; abbreviation: string; theatreCount: number }>>([]);
  const [configSpecialties, setConfigSpecialties] = useState<string[]>([]);
  const [configTheatres, setConfigTheatres] = useState<Array<{ id: string; name: string; unitId: string; unitName: string; unitAbbreviation: string }>>([]);

  // Allocation modal state
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    theatreId: string;
    theatreName: string;
    date: Date;
    existingLists: TheatreList[];
  } | null>(null);

  // Allocation form fields
  const [allocationSpecialty, setAllocationSpecialty] = useState('');
  const [allocationConsultant, setAllocationConsultant] = useState('');
  const [allocationSessionType, setAllocationSessionType] = useState<'AM' | 'PM' | 'EVE' | 'FULL' | 'EXTENDED'>('AM');
  const [allocationStatus, setAllocationStatus] = useState<'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled'>('draft');
  const [savingAllocation, setSavingAllocation] = useState(false);

  useEffect(() => {
    loadAbbreviations();
    loadConfigurations();
  }, []);

  useEffect(() => {
    loadWeekData();
  }, [currentWeekStart, viewMode]);

  async function loadAbbreviations() {
    try {
      const specialtiesSnap = await getDocs(collection(db, 'specialties'));
      const specAbbrMap: { [key: string]: string } = {};
      const subspecAbbrMap: { [key: string]: string } = {};

      specialtiesSnap.forEach(doc => {
        const data = doc.data();
        if (data.name && data.abbreviation) {
          specAbbrMap[data.name] = data.abbreviation;
        }
        if (data.subspecialties && Array.isArray(data.subspecialties)) {
          data.subspecialties.forEach((sub: any) => {
            if (sub.name && sub.abbreviation) {
              subspecAbbrMap[sub.name] = sub.abbreviation;
            }
          });
        }
      });

      setSpecialtyAbbreviations(specAbbrMap);
      setSubspecialtyAbbreviations(subspecAbbrMap);
    } catch (error) {
      console.error('Error loading abbreviations:', error);
      // Fallback to hardcoded map
      setSpecialtyAbbreviations(SPECIALTY_ABBR_MAP);
    }
  }

  async function loadConfigurations() {
    console.log('🔄 Loading configurations from Firebase...');
    try {
      // Load theatre units with counts and abbreviations
      console.log('📂 Reading from collection: theatreUnits');
      const unitsSnap = await getDocs(collection(db, 'theatreUnits'));
      console.log(`   Found ${unitsSnap.size} unit documents`);

      const units: Array<{ id: string; name: string; abbreviation: string; theatreCount: number }> = [];
      const unitAbbrevMap: { [unitId: string]: string } = {};

      unitsSnap.forEach(doc => {
        const data = doc.data();
        // Generate smart abbreviation from unit name
        let abbrev = data.abbreviation;
        if (!abbrev) {
          // Extract abbreviation from name
          if (data.name.includes('Main')) abbrev = 'Main';
          else if (data.name.includes('ACAD')) abbrev = 'ACAD';
          else if (data.name.includes('Emergency')) abbrev = 'Emerg';
          else abbrev = data.name.split(' ')[0]; // First word as fallback
        }
        units.push({
          id: doc.id,
          name: data.name,
          abbreviation: abbrev,
          theatreCount: data.numberOfTheatres || 0
        });
        unitAbbrevMap[doc.id] = abbrev;
        console.log(`   📍 Unit: "${data.name}" → Abbreviation: "${abbrev}" (${data.numberOfTheatres || 0} theatres)`);
      });
      setConfigUnits(units);

      // Load theatres with unit abbreviations
      console.log('📂 Reading from collection: theatres');
      const theatresSnap = await getDocs(collection(db, 'theatres'));
      console.log(`   Found ${theatresSnap.size} theatre documents`);

      const theatres: Array<{ id: string; name: string; unitId: string; unitName: string; unitAbbreviation: string }> = [];
      theatresSnap.forEach(doc => {
        const data = doc.data();
        // Look up the unit from our loaded units to get the correct name and abbreviation
        const unit = units.find(u => u.id === data.unitId);

        theatres.push({
          id: doc.id,
          name: data.name,
          unitId: data.unitId,
          unitName: unit?.name || data.unitName || '',
          unitAbbreviation: unit?.abbreviation || unitAbbrevMap[data.unitId] || ''
        });
      });
      setConfigTheatres(theatres);

      console.log('✅ Loaded theatres from Firebase:', theatres.map(t => ({
        name: t.name,
        unit: t.unitName,
        abbrev: t.unitAbbreviation
      })));

      // Load specialties
      const specialtiesSnap = await getDocs(collection(db, 'specialties'));
      const specialties: string[] = [];
      specialtiesSnap.forEach(doc => {
        const data = doc.data();
        if (data.name) {
          specialties.push(data.name);
        }
      });
      setConfigSpecialties(specialties.sort());

      console.log('✅ Loaded configurations:', { units: units.length, theatres: theatres.length, specialties: specialties.length });
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  }

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function getMonthEnd(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  const loadWeekData = async () => {
    try {
      setLoading(true);

      let startDate: string;
      let endDate: string;

      if (viewMode === 'month') {
        const monthStart = getMonthStart(currentWeekStart);
        const monthEnd = getMonthEnd(currentWeekStart);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
      } else {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        startDate = currentWeekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
      }

      const data = await getTheatreListsByDateRange(startDate, endDate);
      setLists(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeekStart(newDate);
  };

  const goToThisWeek = () => {
    if (viewMode === 'month') {
      setCurrentWeekStart(new Date());
    } else {
      setCurrentWeekStart(getMonday(new Date()));
    }
  };

  const handleCellClick = (theatreId: string, theatreName: string, date: Date, isClosed: boolean) => {
    if (isClosed) return; // Cannot allocate on closed days

    const dayLists = getListsForTheatreAndDate(theatreId, date);
    setSelectedCell({
      theatreId,
      theatreName,
      date,
      existingLists: dayLists
    });
    // Reset form fields
    setAllocationSpecialty('');
    setAllocationConsultant('');
    setAllocationSessionType('AM');
    setAllocationStatus('draft');
    setShowAllocationModal(true);
  };

  const handleCloseAllocationModal = () => {
    setShowAllocationModal(false);
    setSelectedCell(null);
    // Reset form fields
    setAllocationSpecialty('');
    setAllocationConsultant('');
    setAllocationSessionType('AM');
    setAllocationStatus('draft');
  };

  const handleSaveAllocation = async () => {
    if (!selectedCell) return;

    // Validation
    if (!allocationSpecialty || !allocationConsultant || !allocationSessionType) {
      alert('Please fill in all required fields: Specialty, Consultant, and Session Type');
      return;
    }

    setSavingAllocation(true);
    try {
      // Find the theatre details
      const theatre = configTheatres.find(t => t.id === selectedCell.theatreId);
      if (!theatre) {
        throw new Error('Theatre not found');
      }

      // Create a basic theatre list (without procedures for now)
      const newList: Partial<TheatreList> = {
        date: selectedCell.date.toISOString().split('T')[0],
        dayOfWeek: selectedCell.date.toLocaleDateString('en-GB', { weekday: 'long' }),
        theatreId: selectedCell.theatreId,
        theatreName: selectedCell.theatreName,
        unitId: theatre.unitId,
        unitName: theatre.unitName,
        hospitalId: ROYAL_LONDON_HOSPITAL_ID,
        hospitalName: 'Royal London Hospital',
        specialty: allocationSpecialty,
        sessionType: allocationSessionType,
        sessionTimes: {
          start: allocationSessionType === 'AM' ? '08:00' : allocationSessionType === 'PM' ? '13:00' : allocationSessionType === 'EVE' ? '17:00' : '08:00',
          end: allocationSessionType === 'AM' ? '13:00' : allocationSessionType === 'PM' ? '17:00' : allocationSessionType === 'EVE' ? '21:00' : '20:00'
        },
        sessionDurationMinutes: allocationSessionType === 'FULL' || allocationSessionType === 'EXTENDED' ? 720 : 240,
        primarySurgeonName: allocationConsultant,
        primarySurgeonInitials: allocationConsultant.split(' ').map(n => n[0]).join(''),
        primaryAnaesthetistName: 'TBD',
        primaryAnaesthetistInitials: 'TBD',
        cases: [],
        totalCases: 0,
        totalEstimatedTime: 0,
        utilizationPercentage: 0,
        status: allocationStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: `Manual allocation - ${allocationSpecialty}`
      };

      // Save to Firebase using the theatre list service
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await addDoc(collection(db, 'theatreLists'), newList);

      // Refresh the data
      await loadWeekData();

      // Close modal and reset
      handleCloseAllocationModal();

      alert('Allocation saved successfully!');
    } catch (error) {
      console.error('Error saving allocation:', error);
      alert('Failed to save allocation. Please try again.');
    } finally {
      setSavingAllocation(false);
    }
  };

  const generateSchedule = async () => {
    if (!confirm('Generate schedules for the next 4 weeks based on your theatre configurations?\n\nThis will read your specialty mappings and priorities from Firebase.')) {
      return;
    }

    setGenerating(true);
    try {
      const startDate = new Date(currentWeekStart);
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 28); // 4 weeks

      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: 'royal-london-hospital', // TODO: Get from hospital context
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Success!\n\nGenerated ${result.listsGenerated} theatre lists from your configurations.`);
        await loadWeekData(); // Reload to show new data
      } else {
        alert(`❌ Error: ${result.error}\n\n${result.details || ''}`);
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('❌ Failed to generate schedule. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  const getTheatres = (): { id: string; name: string; unitName: string; unitAbbreviation: string }[] => {
    // Use configuration data if available, otherwise fall back to lists
    if (configTheatres.length > 0) {
      return configTheatres
        .map(t => ({
          id: t.id,
          name: t.name,
          unitName: t.unitName.replace(/\s+Suite$/i, ''),
          unitAbbreviation: t.unitAbbreviation
        }))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '999');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '999');
          return numA - numB;
        });
    }

    // Fallback to lists
    const theatreMap = new Map<string, { id: string; name: string; unitName: string; unitAbbreviation: string }>();
    lists.forEach(list => {
      if (!theatreMap.has(list.theatreId)) {
        const unitName = list.unitName.replace(/\s+Suite$/i, '');
        theatreMap.set(list.theatreId, {
          id: list.theatreId,
          name: list.theatreName,
          unitName: unitName,
          unitAbbreviation: unitName.split(' ')[0] // Use first word as abbreviation
        });
      }
    });

    return Array.from(theatreMap.values()).sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '999');
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '999');
      return numA - numB;
    });
  };

  const getUnits = (): Array<{ name: string; theatreCount: number }> => {
    // Use configuration data if available
    if (configUnits.length > 0) {
      return configUnits
        .map(u => ({ name: u.name, theatreCount: u.theatreCount }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    // Fallback to lists (without theatre counts)
    const units = new Set<string>();
    lists.forEach(list => {
      const unitName = list.unitName.replace(/\s+Suite$/i, '');
      units.add(unitName);
    });
    return Array.from(units).sort().map(name => ({ name, theatreCount: 0 }));
  };

  const getSurgeons = (): string[] => {
    const surgeons = new Set<string>();
    lists.forEach(list => surgeons.add(list.primarySurgeonName));
    return Array.from(surgeons).sort();
  };

  const getWeekDays = (): Date[] => {
    const days: Date[] = [];

    if (viewMode === 'month') {
      // Get all days in the month
      const monthStart = getMonthStart(currentWeekStart);
      const monthEnd = getMonthEnd(currentWeekStart);
      const daysInMonth = monthEnd.getDate();

      for (let i = 0; i < daysInMonth; i++) {
        const day = new Date(monthStart);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    } else {
      // Get 7 days of the week
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    }

    return days;
  };

  const getListsForTheatreAndDate = (theatreId: string, date: Date): TheatreList[] => {
    const dateStr = date.toISOString().split('T')[0];
    return lists.filter(list =>
      list.theatreId === theatreId && list.date === dateStr
    ).sort((a, b) => {
      const order = { FULL: 0, AM: 1, PM: 2, EVE: 3, EXTENDED: 4 };
      return order[a.sessionType] - order[b.sessionType];
    });
  };

  const getSpecialties = (): string[] => {
    // Use configuration data if available
    if (configSpecialties.length > 0) {
      return configSpecialties;
    }

    // Fallback to lists
    const specialties = new Set<string>();
    lists.forEach(list => specialties.add(list.specialty));
    return Array.from(specialties).sort();
  };

  const getAbbreviation = (specialty: string, subspecialty?: string): string => {
    // First try subspecialty abbreviation
    if (subspecialty && subspecialtyAbbreviations[subspecialty]) {
      return subspecialtyAbbreviations[subspecialty];
    }

    // Then try specialty abbreviation from Firebase
    if (specialtyAbbreviations[specialty]) {
      return specialtyAbbreviations[specialty];
    }

    // Fallback to hardcoded map
    if (SPECIALTY_ABBR_MAP[specialty]) {
      return SPECIALTY_ABBR_MAP[specialty];
    }

    // Last resort: take first letters
    return specialty.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 6);
  };

  const isEmergencyOrTrauma = (theatreName: string): boolean => {
    const nameLower = theatreName.toLowerCase();
    return nameLower.includes('emergency') || nameLower.includes('trauma');
  };

  // Split FULL sessions into separate visual tiles for display
  const splitSessionForDisplay = (list: TheatreList): Array<{
    list: TheatreList;
    displaySessionType: string;
    displayTimes: { start: string; end: string };
  }> => {
    const startTime = list.sessionTimes.start;
    const endTime = list.sessionTimes.end;

    // Check if this is a FULL session (08:00-20:00) or extended session (goes beyond 18:00)
    if (list.sessionType === 'FULL' && endTime >= '18:00') {
      // Split into AM (08:00-13:00), PM (13:00-18:00), and Extended (18:00-20:00)
      return [
        {
          list,
          displaySessionType: 'AM',
          displayTimes: { start: '08:00', end: '13:00' }
        },
        {
          list,
          displaySessionType: 'PM',
          displayTimes: { start: '13:00', end: '18:00' }
        },
        {
          list,
          displaySessionType: 'EXTENDED',
          displayTimes: { start: '18:00', end: endTime }
        }
      ];
    }

    // For EVE or other sessions that end after 18:00, show as EXTENDED
    if (endTime > '18:00' && list.sessionType !== 'AM' && list.sessionType !== 'PM') {
      return [{
        list,
        displaySessionType: 'EXTENDED',
        displayTimes: { start: startTime, end: endTime }
      }];
    }

    // Regular session, show as-is
    return [{
      list,
      displaySessionType: list.sessionType,
      displayTimes: { start: startTime, end: endTime }
    }];
  };

  const allTheatres = getTheatres();
  const theatres = selectedUnit === 'all'
    ? allTheatres
    : allTheatres.filter(t => t.unitName === selectedUnit);

  // Group theatres by unit
  const theatresByUnit = theatres.reduce((acc, theatre) => {
    const unitName = theatre.unitName;

    // Filter out invalid unit names (purely numeric or empty)
    if (!unitName || /^\d+$/.test(unitName.trim())) {
      return acc;
    }

    if (!acc[unitName]) {
      acc[unitName] = [];
    }
    acc[unitName].push(theatre);
    return acc;
  }, {} as Record<string, typeof theatres>);

  const weekDays = getWeekDays();
  const specialties = getSpecialties();
  const units = getUnits();
  const surgeons = getSurgeons();
  const sessionTypes = ['AM', 'PM', 'EVE', 'FULL', 'EXTENDED'];
  const statuses = ['draft', 'published', 'in-progress', 'completed', 'cancelled'];

  const weekDisplay = viewMode === 'month'
    ? currentWeekStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : `${currentWeekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

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
              onClick={() => router.push('/admin/schedule?tab=sessions')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
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

      {/* Page Title & Description - Desktop Only */}
      <div className="hidden md:block px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Theatre Sessions</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage theatre sessions and bookings
        </p>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-sm md:text-xl font-bold flex items-center gap-1.5 md:gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                Theatre Schedule Management
              </h1>
              <p className="text-[10px] md:text-xs text-white/90 hidden sm:block">
                Weekly theatre schedule showing specialties and staff assignments
              </p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto p-1 md:p-6 pb-20 md:pb-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 md:p-3 mb-2 md:mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-cyan-500 text-teal-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Theatre Sessions
            </button>
            <button
              onClick={() => setActiveTab('consultants')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'consultants'
                  ? 'bg-cyan-500 text-teal-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Consultant Preferences
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'profiles'
                  ? 'bg-cyan-500 text-teal-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Surgeon Profiles
            </button>
          </div>
        </div>

        {activeTab === 'schedule' && (
          <>
        {/* Week Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 md:p-4 mb-2 md:mb-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-4 gap-2">
            <div className="flex items-center gap-0.5 md:gap-2 w-full md:w-auto">
              <button
                onClick={prevWeek}
                className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 hover:bg-gray-100 rounded-lg transition-colors text-xs md:text-sm flex-shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 md:w-5 md:h-5" />
                <span className="font-medium hidden md:inline">Previous {viewMode === 'week' ? 'Week' : 'Month'}</span>
              </button>

              <div className="text-center flex-1 px-1">
                <h2 className="text-xs md:text-xl font-bold text-gray-900 leading-tight">{weekDisplay}</h2>
              </div>

              <button
                onClick={nextWeek}
                className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-4 md:py-2 hover:bg-gray-100 rounded-lg transition-colors text-xs md:text-sm flex-shrink-0"
              >
                <span className="font-medium hidden md:inline">Next {viewMode === 'week' ? 'Week' : 'Month'}</span>
                <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 md:gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-semibold ${
                  viewMode === 'week' ? 'bg-cyan-500 text-teal-900' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm rounded-md transition-colors font-semibold ${
                  viewMode === 'month' ? 'bg-cyan-500 text-teal-900' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Month
              </button>
            </div>

            <button
              onClick={goToThisWeek}
              className="px-2 py-1 md:px-4 md:py-2 bg-cyan-500 text-teal-900 text-xs md:text-sm rounded-lg hover:bg-cyan-600 transition-colors font-semibold flex-shrink-0"
            >
              Today
            </button>

            <button
              onClick={generateSchedule}
              disabled={generating}
              className="px-2 py-1 md:px-4 md:py-2 bg-cyan-600 text-white text-xs md:text-sm rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 font-semibold flex-shrink-0"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                  <span className="hidden md:inline">Generating...</span>
                  <span className="md:hidden">Gen...</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">Auto-Generate</span>
                  <span className="md:hidden">Auto</span>
                </>
              )}
            </button>

            <div className="w-full md:w-auto">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm bg-white font-medium"
              >
                <option value="all">All Units</option>
                {units.map(unit => (
                  <option key={unit.name} value={unit.name}>
                    {unit.name}{unit.theatreCount > 0 ? ` (${unit.theatreCount})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm bg-white font-medium"
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm bg-white font-medium"
              >
                <option value="all">All Sessions</option>
                {sessionTypes.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedSurgeon}
                onChange={(e) => setSelectedSurgeon(e.target.value)}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm bg-white font-medium"
              >
                <option value="all">All Surgeons</option>
                {surgeons.map(surgeon => (
                  <option key={surgeon} value={surgeon}>{surgeon}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Theatre Schedule Grid - Desktop Only */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        ) : (
          <div className="hidden md:block bg-white rounded-lg border-2 border-gray-300 shadow-sm overflow-x-auto touch-pan-x">
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  <th className={`${viewMode === 'month' ? 'px-0.5 py-2 min-w-[50px] max-w-[50px] w-[50px]' : 'px-2 py-2 md:px-4 md:py-3 min-w-[80px] md:min-w-[120px]'} text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 border-r-2 border-gray-300`}>
                  </th>
                  {weekDays.map((day, idx) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <th
                        key={idx}
                        className={`${viewMode === 'month' ? 'px-0.5 py-2 w-[40px] min-w-[40px] max-w-[40px]' : 'px-1 py-2 md:px-3 md:py-3 min-w-[100px] md:min-w-[150px]'} text-center text-xs font-semibold border-r-2 border-gray-300 ${
                          isToday ? 'bg-blue-100' : isWeekend ? 'bg-gray-100' : 'bg-gray-50'
                        }`}
                      >
                        {viewMode === 'month' ? (
                          // Compact monthly view - just day number
                          <div className={`text-sm font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                            {day.getDate()}
                          </div>
                        ) : (
                          // Weekly view - full date info
                          <>
                            <div className={`text-[10px] md:text-xs ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                              {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                            </div>
                            <div className={`text-sm md:text-lg font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                              {day.getDate()}
                            </div>
                            <div className={`text-[10px] md:text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                              {day.toLocaleDateString('en-GB', { month: 'short' })}
                            </div>
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {Object.entries(theatresByUnit).map(([unitName, unitTheatres], unitIdx) => {
                  const unitData = units.find(u => u.name === unitName);
                  const theatreCount = unitData?.theatreCount || unitTheatres.length;

                  // Format unit name: remove " Suite" and ensure "Theatre" is plural
                  let displayUnitName = unitName.replace(/\s+Suite$/i, '');
                  if (!displayUnitName.includes('Theatres')) {
                    displayUnitName = displayUnitName.replace(/Theatre$/i, 'Theatres');
                  }

                  return (
                    <React.Fragment key={unitName}>
                      {/* Unit Header Row */}
                      <tr className="bg-cyan-500 text-teal-900 border-b-2 border-gray-300">
                        <td
                          colSpan={weekDays.length + 1}
                          className={`${viewMode === 'month' ? 'px-2 py-1.5 text-base' : 'px-2 py-2 md:px-4 md:py-3 text-sm md:text-xl'} font-bold sticky left-0 z-10 text-center`}
                        >
                          {viewMode === 'month' ? `${unitData?.abbreviation || displayUnitName.split(' ')[0]} (${theatreCount})` : `${displayUnitName} (${theatreCount})`}
                        </td>
                      </tr>

                      {/* Theatre Rows */}
                      {unitTheatres.map((theatre, theatreIdx) => {
                  const isEmergencyTrauma = isEmergencyOrTrauma(theatre.name);

                  // Format theatre name as "Unit Abbreviation + Theatre Number"
                  const theatreNumber = theatre.name.match(/\d+/)?.[0] || '';
                  const displayName = theatreNumber
                    ? `${theatre.unitAbbreviation} ${theatreNumber}`
                    : theatre.name;

                  return (
                    <tr
                      key={theatre.id}
                      className={`border-b-2 border-gray-300 hover:bg-gray-50 transition-colors ${
                        theatreIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className={`${viewMode === 'month' ? 'px-0.5 py-2 w-[50px] min-w-[50px] max-w-[50px]' : 'px-2 py-2 md:px-4 md:py-3'} sticky left-0 z-10 border-r-2 border-gray-300 ${
                        theatreIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}>
                        <div className={`font-bold ${viewMode === 'month' ? 'text-sm leading-tight' : 'text-sm md:text-lg'} text-gray-900 text-center`}>{displayName}</div>
                      </td>

                      {weekDays.map((day, dayIdx) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayLists = getListsForTheatreAndDate(theatre.id, day);

                        // Apply all filters
                        const filteredLists = dayLists.filter(list => {
                          if (selectedSpecialty !== 'all' && list.specialty !== selectedSpecialty) return false;
                          if (selectedSession !== 'all' && list.sessionType !== selectedSession) return false;
                          if (selectedStatus !== 'all' && list.status !== selectedStatus) return false;
                          if (selectedSurgeon !== 'all' && list.primarySurgeonName !== selectedSurgeon) return false;
                          return true;
                        });

                        // If weekend and NOT Emergency/Trauma, show CLOSED
                        const shouldShowClosed = isWeekend && !isEmergencyTrauma && filteredLists.length === 0;

                        return (
                          <td
                            key={dayIdx}
                            onClick={() => handleCellClick(theatre.id, theatre.name, day, shouldShowClosed)}
                            className={`border-r-2 border-gray-300 ${
                              shouldShowClosed ? 'bg-red-500 p-0 cursor-not-allowed' :
                              isToday ? 'bg-blue-50 cursor-pointer hover:bg-blue-100' :
                              isWeekend ? 'bg-gray-50 cursor-pointer hover:bg-gray-100' :
                              theatreIdx % 2 === 0 ? 'bg-white cursor-pointer hover:bg-gray-50' : 'bg-gray-50/30 cursor-pointer hover:bg-gray-100'
                            } ${!shouldShowClosed && (viewMode === 'month' ? 'px-0.5 py-2 w-[40px] min-w-[40px] max-w-[40px] h-[40px] align-middle' : 'px-1 py-1 md:px-2 md:py-2 align-top')} transition-colors`}
                          >
                            {shouldShowClosed ? (
                              viewMode === 'month' ? (
                                // Compact monthly closed indicator - full cell coverage
                                <div
                                  className="bg-red-500 text-white w-full h-full flex items-center justify-center min-h-[40px]"
                                  title={`Theatre closed on weekends\n${theatre.unitName} ${theatreNumber || theatre.name} does not operate on ${day.toLocaleDateString('en-GB', { weekday: 'long' })}`}
                                >
                                  <div className="text-[8px] font-bold">CLOSED</div>
                                </div>
                              ) : (
                                // Weekly closed indicator - full cell coverage
                                <div
                                  className="bg-red-500 text-white text-center font-bold text-xs md:text-sm h-full min-h-[100px] flex items-center justify-center"
                                  title={`Theatre closed on weekends\n${theatre.unitName} ${theatreNumber || theatre.name} does not operate on ${day.toLocaleDateString('en-GB', { weekday: 'long' })}`}
                                >
                                  CLOSED
                                </div>
                              )
                            ) : filteredLists.length > 0 ? (
                              viewMode === 'month' ? (
                                // Compact month view - just show colored dots
                                <div className="flex flex-wrap gap-0.5 justify-center">
                                  {filteredLists.flatMap((list) => {
                                    const displaySessions = splitSessionForDisplay(list);
                                    return displaySessions.map((session, idx) => {
                                      const bgColor =
                                        session.displaySessionType === 'FULL' || session.displaySessionType === 'EXTENDED' ? 'bg-red-500' :
                                        session.displaySessionType === 'AM' ? 'bg-blue-500' :
                                        session.displaySessionType === 'PM' ? 'bg-purple-500' :
                                        session.displaySessionType === 'EVE' ? 'bg-orange-500' :
                                        'bg-gray-500';

                                      return (
                                        <div
                                          key={`${list.id}-${idx}`}
                                          className={`${bgColor} w-2.5 h-2.5 rounded-full cursor-pointer hover:opacity-70 transition-opacity`}
                                          title={`${list.specialty}${list.subspecialty ? ' - ' + list.subspecialty : ''}\n${session.displaySessionType} Session (${session.displayTimes.start}-${session.displayTimes.end})\nSurgeon: ${list.primarySurgeonName}\n${list.totalCases} cases`}
                                        />
                                      );
                                    });
                                  })}
                                </div>
                              ) : (
                                // Weekly view - full card display
                                <div className="space-y-1">
                                  {filteredLists.flatMap((list) => {
                                    const displaySessions = splitSessionForDisplay(list);

                                    return displaySessions.map((session, idx) => {
                                      const bgColor =
                                        session.displaySessionType === 'FULL' || session.displaySessionType === 'EXTENDED' ? 'bg-red-100 text-red-800 border-red-300' :
                                        session.displaySessionType === 'AM' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                        session.displaySessionType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                        session.displaySessionType === 'EVE' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                        'bg-gray-100 text-gray-800 border-gray-300';

                                      const abbr = getAbbreviation(list.specialty, list.subspecialty);

                                      return (
                                        <div
                                          key={`${list.id}-${idx}`}
                                          className={`${bgColor} px-1.5 py-1.5 md:px-2 md:py-2 rounded border cursor-pointer hover:opacity-80 transition-opacity`}
                                          title={`${list.specialty}${list.subspecialty ? ' - ' + list.subspecialty : ''}\n${session.displaySessionType} Session (${session.displayTimes.start}-${session.displayTimes.end})\nSurgeon: ${list.primarySurgeonName}\nAnaesthetist: ${list.primaryAnaesthetistName}\n${list.totalCases} cases • ${list.utilizationPercentage}% utilized`}
                                        >
                                          <div className="text-xs md:text-sm font-bold mb-0.5 md:mb-1">{abbr}</div>
                                          <div className="text-[9px] md:text-[10px] leading-tight">
                                            <div>{session.displayTimes.start}-{session.displayTimes.end}</div>
                                            <div>{list.totalCases} cases • {list.primarySurgeonInitials}/{list.primaryAnaesthetistInitials}</div>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })}
                                </div>
                              )
                            ) : (
                              <div className="text-center text-[10px] md:text-xs text-gray-400 py-1 md:py-2">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Theatre List View - Mobile Only */}
        {!loading && (
          <div className="md:hidden space-y-2">
            {Object.entries(theatresByUnit).map(([unitName, unitTheatres]) => {
              const unitData = units.find(u => u.name === unitName);
              const theatreCount = unitData?.theatreCount || unitTheatres.length;
              const isUnitExpanded = expandedUnits.has(unitName);

              // Format unit name
              let displayUnitName = unitName.replace(/\s+Suite$/i, '');
              if (!displayUnitName.includes('Theatres')) {
                displayUnitName = displayUnitName.replace(/Theatre$/i, 'Theatres');
              }

              return (
                <div key={unitName} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Unit Header */}
                  <button
                    onClick={() => toggleUnit(unitName)}
                    className="w-full px-3 py-2.5 flex items-center justify-between bg-cyan-500 text-teal-900 transition-colors active:scale-[0.99] hover:bg-cyan-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{displayUnitName}</span>
                      <span className="text-xs bg-teal-900/20 px-2 py-0.5 rounded-full font-semibold">{theatreCount}</span>
                    </div>
                    {isUnitExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Theatres List */}
                  {isUnitExpanded && (
                    <div className="divide-y divide-gray-200">
                      {unitTheatres.map((theatre) => {
                        const isTheatreExpanded = expandedTheatres.has(theatre.id);
                        const isEmergencyTrauma = isEmergencyOrTrauma(theatre.name);
                        const theatreNumber = theatre.name.match(/\d+/)?.[0] || '';
                        const displayName = theatreNumber
                          ? `${theatre.unitAbbreviation} ${theatreNumber}`
                          : theatre.name;

                        return (
                          <div key={theatre.id} className="bg-gray-50">
                            {/* Theatre Header */}
                            <button
                              onClick={() => toggleTheatre(theatre.id)}
                              className="w-full px-3 py-2 flex items-center justify-between bg-cyan-100 hover:bg-cyan-200 transition-colors active:scale-[0.99]"
                            >
                              <span className="text-sm font-semibold text-teal-900">{displayName}</span>
                              {isTheatreExpanded ? (
                                <ChevronUp className="w-4 h-4 text-teal-700" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-teal-700" />
                              )}
                            </button>

                            {/* Theatre Schedule - Day Cards */}
                            {isTheatreExpanded && (
                              <div className="px-3 pb-3 pt-1 space-y-2">
                                {weekDays.map((day, dayIdx) => {
                                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                  const isToday = day.toDateString() === new Date().toDateString();
                                  const dayLists = getListsForTheatreAndDate(theatre.id, day);

                                  // Apply filters
                                  const filteredLists = dayLists.filter(list => {
                                    if (selectedSpecialty !== 'all' && list.specialty !== selectedSpecialty) return false;
                                    if (selectedSession !== 'all' && list.sessionType !== selectedSession) return false;
                                    if (selectedStatus !== 'all' && list.status !== selectedStatus) return false;
                                    if (selectedSurgeon !== 'all' && list.primarySurgeonName !== selectedSurgeon) return false;
                                    return true;
                                  });

                                  const shouldShowClosed = isWeekend && !isEmergencyTrauma && filteredLists.length === 0;

                                  return (
                                    <div
                                      key={dayIdx}
                                      className={`rounded-lg border ${
                                        isToday ? 'border-purple-400 bg-purple-50' : 'border-purple-200 bg-purple-50'
                                      } overflow-hidden`}
                                    >
                                      {/* Day Header */}
                                      <div className={`px-2 py-1.5 flex items-center justify-between ${
                                        isToday ? 'bg-purple-200' : 'bg-purple-100'
                                      }`}>
                                        <div>
                                          <div className={`text-xs font-bold ${isToday ? 'text-purple-900' : 'text-purple-800'}`}>
                                            {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                          </div>
                                        </div>
                                        {isToday && (
                                          <span className="text-[9px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                            Today
                                          </span>
                                        )}
                                      </div>

                                      {/* Day Content */}
                                      <div
                                        onClick={() => handleCellClick(theatre.id, theatre.name, day, shouldShowClosed)}
                                        className={shouldShowClosed ? '' : 'cursor-pointer'}
                                      >
                                        {shouldShowClosed ? (
                                          <div className="bg-red-500 text-white text-center py-4 text-xs font-bold">
                                            CLOSED
                                          </div>
                                        ) : filteredLists.length > 0 ? (
                                          <div className="p-2 space-y-1.5">
                                            {filteredLists.flatMap((list) => {
                                              const displaySessions = splitSessionForDisplay(list);

                                              return displaySessions.map((session, idx) => {
                                                const bgColor =
                                                  session.displaySessionType === 'FULL' || session.displaySessionType === 'EXTENDED' ? 'bg-red-100 text-red-800 border-red-300' :
                                                  session.displaySessionType === 'AM' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                  session.displaySessionType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                  session.displaySessionType === 'EVE' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                  'bg-gray-100 text-gray-800 border-gray-300';

                                                const abbr = getAbbreviation(list.specialty, list.subspecialty);

                                                return (
                                                  <div
                                                    key={`${list.id}-${idx}`}
                                                    className={`${bgColor} px-2 py-1.5 rounded border hover:opacity-80 transition-opacity`}
                                                  >
                                                    <div className="text-xs font-bold mb-0.5">{abbr}</div>
                                                    <div className="text-[10px] leading-tight">
                                                      <div>{session.displayTimes.start}-{session.displayTimes.end}</div>
                                                      <div>{list.totalCases} cases • {list.primarySurgeonInitials}/{list.primaryAnaesthetistInitials}</div>
                                                    </div>
                                                  </div>
                                                );
                                              });
                                            })}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-xs text-gray-400">—</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Auto-Scheduler Info */}
      <div className="mt-2 md:mt-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border-2 border-cyan-200 p-2 md:p-4">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-teal-900 mb-1 md:mb-2">Smart Theatre Allocation System</h3>
            <p className="text-[10px] md:text-xs text-teal-800 mb-1 md:mb-2 leading-tight">
              Automatically generates theatre session templates based on your specialty-theatre mappings and consultant preferences.
              Theatre blocks are pre-allocated by specialty, with consultant assignments optimized based on patient waiting lists,
              availability preferences, and clinic schedules.
            </p>
            <div className="text-[9px] md:text-xs text-teal-700 space-y-0.5 md:space-y-1 leading-tight">
              <div>✅ Generates specialty-based theatre templates</div>
              <div>✅ Applies theatre-specialty priority mappings</div>
              <div>✅ Matches consultants with patient backlogs to theatre slots</div>
              <div>✅ Respects consultant availability and clinic schedules</div>
              <div>✅ Considers consultant preferences for theatre days/times</div>
              <div>✅ Balances workload across the surgical team</div>
            </div>
          </div>
        </div>

      {/* Legend */}
      <div className="mt-2 md:mt-4 bg-cyan-50 rounded-lg border-2 border-cyan-200 p-2 md:p-4">
          <h3 className="text-xs md:text-sm font-semibold text-teal-900 mb-2 md:mb-3">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 text-[10px] md:text-xs text-teal-800">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-100 border border-blue-300 rounded flex-shrink-0"></div>
              <span>AM (08:00-13:00)</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-100 border border-purple-300 rounded flex-shrink-0"></div>
              <span>PM (13:00-18:00)</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border border-red-300 rounded flex-shrink-0"></div>
              <span>Extended (18:00+)</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-100 border border-orange-300 rounded flex-shrink-0"></div>
              <span>EVE Session</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded flex-shrink-0"></div>
              <span>CLOSED</span>
            </div>
          </div>
          <div className="mt-2 md:mt-3 text-[9px] md:text-xs text-teal-700 leading-tight">
            <span className="font-semibold">Format:</span> SPECIALTY 08:00-20:00 • Cases • Surgeon/Anaes
          </div>
          <div className="mt-1 md:mt-2 text-[9px] md:text-xs text-teal-700 leading-tight">
            <span className="font-semibold">Note:</span> Emergency and Trauma theatres operate 7 days/week. FULL sessions (08:00-20:00) are split into AM, PM, and Extended tiles.
          </div>
        </div>

      {/* Allocation Modal */}
      {showAllocationModal && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-cyan-500 text-teal-900 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedCell.theatreName}</h2>
                  <p className="text-sm text-teal-800">{selectedCell.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button
                  onClick={handleCloseAllocationModal}
                  className="text-teal-900 hover:bg-teal-900/20 rounded-full p-2 transition-colors"
                  disabled={savingAllocation}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Existing Allocations */}
              {selectedCell.existingLists.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Allocations</h3>
                  <div className="space-y-2">
                    {selectedCell.existingLists.map((list) => (
                      <div
                        key={list.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-blue-900">{list.specialty}</div>
                            <div className="text-xs text-blue-700">
                              {list.sessionType} Session • {list.primarySurgeonName} • {list.totalCases} cases
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            list.status === 'published' ? 'bg-green-100 text-green-800' :
                            list.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            list.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            list.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {list.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Allocation Form */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {selectedCell.existingLists.length > 0 ? 'Add New Allocation' : 'Create Allocation'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={allocationSpecialty}
                      onChange={(e) => setAllocationSpecialty(e.target.value)}
                      disabled={savingAllocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Specialty</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultant/Surgeon <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={allocationConsultant}
                      onChange={(e) => setAllocationConsultant(e.target.value)}
                      disabled={savingAllocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Surgeon</option>
                      {surgeons.map(surgeon => (
                        <option key={surgeon} value={surgeon}>{surgeon}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={allocationSessionType}
                      onChange={(e) => setAllocationSessionType(e.target.value as any)}
                      disabled={savingAllocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {sessionTypes.map(session => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={allocationStatus}
                      onChange={(e) => setAllocationStatus(e.target.value as any)}
                      disabled={savingAllocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveAllocation}
                    disabled={savingAllocation}
                    className="flex-1 bg-cyan-500 text-teal-900 px-6 py-3 rounded-lg hover:bg-cyan-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingAllocation ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Allocation'
                    )}
                  </button>
                  <button
                    onClick={handleCloseAllocationModal}
                    disabled={savingAllocation}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </>
        )}

        {/* Consultant Preferences Tab */}
        {activeTab === 'consultants' && (
          <ConsultantPreferencesContent />
        )}

        {/* Surgeon Profiles Tab */}
        {activeTab === 'profiles' && (
          <SurgeonProfilesManager />
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
    </div>
  );
}
