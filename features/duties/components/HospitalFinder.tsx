'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Search,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  Navigation,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Briefcase,
} from 'lucide-react';
import { MOCK_NHS_HOSPITALS, calculateDistance, type NHSHospital } from '@/lib/mockHospitalData';
import TomLogo from '@/components/TomLogo';

// Dynamically import map component with loading state
const HospitalMapView = dynamic(() => import('./HospitalMapView'), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface HospitalFinderProps {
  hideSearch?: boolean;
}

export default function HospitalFinder({ hideSearch = false }: HospitalFinderProps) {
  const [hospitals, setHospitals] = useState<NHSHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<NHSHospital | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'feed'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Filter states
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Mobile states
  const [mobileView, setMobileView] = useState<'map' | 'hospital'>('map');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load hospital data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      console.log('✅ Loaded', MOCK_NHS_HOSPITALS.length, 'NHS hospitals from mock data');
      setHospitals(MOCK_NHS_HOSPITALS);
      setLoading(false);
    }, 500);
  }, []);

  // Request location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default London location');
          setUserLocation({ lat: 51.5074, lng: -0.1278 });
        }
      );
    } else {
      setUserLocation({ lat: 51.5074, lng: -0.1278 });
    }
  }, []);

  // Calculate distances when user location is available
  const hospitalsWithDistance = React.useMemo(() => {
    if (!userLocation) return hospitals;

    return hospitals.map(hospital => ({
      ...hospital,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.location.lat,
        hospital.location.lng
      )
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [hospitals, userLocation]);

  // Filter hospitals
  const filteredHospitals = hospitalsWithDistance.filter(hospital => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        hospital.name.toLowerCase().includes(query) ||
        hospital.trust.toLowerCase().includes(query) ||
        hospital.specialties.some(s => s.toLowerCase().includes(query)) ||
        hospital.postcode.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      const hasSpecialty = selectedSpecialties.some(specialty =>
        hospital.specialties.includes(specialty)
      );
      if (!hasSpecialty) return false;
    }

    // Shift type filter
    if (selectedShiftTypes.length > 0) {
      const hasShiftType = hospital.shifts.some(shift =>
        selectedShiftTypes.includes(shift.type)
      );
      if (!hasShiftType) return false;
    }

    // Date filter - REMOVED: Show all hospitals, dates just filter shifts within hospitals
    // We want to show hospitals even if they don't have shifts on the selected dates

    // Urgent only filter
    if (urgentOnly && !hospital.urgentNeeds) return false;

    return true;
  });

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap(h => h.specialties))
  ).sort();

  const shiftTypes = [
    { id: 'early', name: 'Early', time: '07:00-15:00', color: 'from-blue-400 to-cyan-400' },
    { id: 'late', name: 'Late', time: '15:00-23:00', color: 'from-purple-400 to-blue-400' },
    { id: 'night', name: 'Night', time: '23:00-07:00', color: 'from-indigo-400 to-purple-400' },
    { id: 'long-day', name: 'Long Day', time: '07:00-19:00', color: 'from-teal-400 to-cyan-400' }
  ];

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleShiftType = (shiftType: string) => {
    setSelectedShiftTypes(prev =>
      prev.includes(shiftType)
        ? prev.filter(s => s !== shiftType)
        : [...prev, shiftType]
    );
  };

  const handleHospitalSelect = (hospital: NHSHospital) => {
    setSelectedHospital(hospital);
    if (isMobile) {
      setMobileView('hospital');
    }
  };

  // Handle date selection (supports range and multi-select)
  const handleDateClick = (date: Date) => {
    if (!dateRangeStart || (dateRangeStart && dateRangeEnd)) {
      // Start new range
      setDateRangeStart(date);
      setDateRangeEnd(null);
      setSelectedDates([date.toISOString().split('T')[0]]);
    } else {
      // Complete range
      setDateRangeEnd(date);
      const start = dateRangeStart < date ? dateRangeStart : date;
      const end = dateRangeStart < date ? date : dateRangeStart;
      const datesInRange: string[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        datesInRange.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(datesInRange);
    }
  };

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.includes(dateStr);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (selectedDates.length > 0 && selectedShiftTypes.length > 0 && selectedSpecialties.length > 0) {
      setShowMobileMap(true);
    }
  };

  // Touch event handlers for swipe down functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 50; // Minimum 50px swipe down
    const isUpSwipe = distance < -50; // Minimum 50px swipe up

    if (isDownSwipe) {
      setMobileFilterOpen(false); // Close the drawer
    } else if (isUpSwipe) {
      setMobileFilterOpen(true); // Open the drawer
    }
  };

  if (!isMobile) {
    // Desktop Layout
    return (
      <div className="flex h-full w-full bg-gray-50">
        {/* Navigation Sidebar */}
        <div className="hidden md:flex w-64 bg-gradient-to-br from-blue-600 via-cyan-600 to-purple-600 text-white flex-col flex-shrink-0">
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Calendar Date Picker */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/90 px-2">Select Dates</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <h4 className="text-sm font-bold text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-semibold text-white/60 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((date, idx) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = isDateSelected(date);

                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(date)}
                          disabled={!isCurrentMonth}
                          className={`aspect-square flex items-center justify-center text-[10px] rounded transition-all ${
                            !isCurrentMonth
                              ? 'text-white/20 cursor-not-allowed'
                              : isSelected
                              ? 'bg-white text-blue-600 font-bold shadow-md'
                              : isToday
                              ? 'bg-white/20 text-white font-semibold'
                              : 'hover:bg-white/10 text-white'
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected dates summary */}
                {selectedDates.length > 0 && (
                  <div className="mt-2 p-2 bg-white/20 rounded-lg">
                    <p className="text-xs font-semibold text-white">
                      {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shift Types */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/90 px-2">Shift Patterns</h3>
              <div className="grid grid-cols-2 gap-2">
                {shiftTypes.map(shift => (
                  <button
                    key={shift.id}
                    onClick={() => toggleShiftType(shift.id)}
                    className={`p-2 rounded-lg border transition-all text-xs ${
                      selectedShiftTypes.includes(shift.id)
                        ? 'border-white bg-white text-blue-600 font-bold shadow-md'
                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-bold">{shift.name}</p>
                      <p className={`text-[10px] mt-0.5 ${selectedShiftTypes.includes(shift.id) ? 'text-blue-500' : 'text-white/70'}`}>
                        {shift.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/90 px-2">Specialties</h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {allSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedSpecialties.includes(specialty)
                        ? 'border-white bg-white text-blue-600 font-bold shadow-md'
                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <p className="text-[10px] leading-tight">{specialty}</p>
                  </button>
                ))}
              </div>
            </div>

          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex bg-gray-50">
          {/* Hospital List Panel */}
          <div className="hidden md:flex w-96 bg-white border-r border-gray-200 flex-col overflow-hidden">
            {/* TOM AI Search Bar */}
            {!hideSearch && (
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <TomLogo size={24} />
                  </div>
                  <input
                    type="text"
                    placeholder="Ask TOM AI anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 placeholder-blue-600/60 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Hospital List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading hospitals...</p>
                  </div>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Hospitals Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                </div>
              ) : (
                filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    onClick={() => handleHospitalSelect(hospital)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                      selectedHospital?.id === hospital.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Hospital Card */}
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 truncate">{hospital.name}</h3>
                            <p className="text-xs text-gray-600 truncate">{hospital.trust}</p>
                          </div>
                          {hospital.urgentNeeds && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
                              Urgent
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                            <span>{hospital.rating.toFixed(1)}</span>
                          </div>
                          {hospital.distance !== undefined && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{hospital.distance.toFixed(1)} km</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{hospital.shifts.length} shifts</span>
                          </div>
                        </div>

                        {hospital.shifts.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {hospital.shifts.slice(0, 2).map((shift, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded text-xs font-medium"
                              >
                                Competitive • {shift.role}
                              </span>
                            ))}
                            {hospital.shifts.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                +{hospital.shifts.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map View */}
          <div className="flex-1 relative h-full">
            {filteredHospitals.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Hospitals Available</h3>
                  <p className="text-gray-600">Adjust your filters to see available hospitals</p>
                </div>
              </div>
            ) : (
              <div className="h-full w-full">
                <HospitalMapView
                  hospitals={filteredHospitals}
                  onSelectHospital={handleHospitalSelect}
                  userLocation={userLocation}
                  selectedHospital={selectedHospital}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - Hospital Details - DESKTOP ONLY */}
          {selectedHospital && (
            <div className="hidden md:block w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-gray-900 pr-8">Hospital Details</h2>
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <HospitalDetailsPanel hospital={selectedHospital} urgentOnly={urgentOnly} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile & Desktop Layout
  // Simplified mobile view for workforce finder
  if (isMobile && hideSearch) {
    return (
      <div className="h-full w-full flex flex-col bg-white overflow-hidden">
        <div className="w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <HospitalMapView
              hospitals={filteredHospitals}
              onSelectHospital={handleHospitalSelect}
              selectedHospital={selectedHospital}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {!showMobileMap ? (
        <>
          {/* Calendar and Filters */}
          <div className="flex-1 overflow-y-auto">
            {/* Calendar Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-lg p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((date, idx) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = isDateSelected(date);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(date)}
                        disabled={!isCurrentMonth}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                          !isCurrentMonth
                            ? 'text-gray-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold'
                            : isToday
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected dates summary */}
              {selectedDates.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900">
                    {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            {/* Shift Patterns */}
            <div className="p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Shift Patterns</h3>
              <div className="grid grid-cols-2 gap-2">
                {shiftTypes.map(shift => (
                  <button
                    key={shift.id}
                    onClick={() => toggleShiftType(shift.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedShiftTypes.includes(shift.id)
                        ? `border-black bg-gradient-to-r ${shift.color} text-white`
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-sm">{shift.name}</p>
                      <p className={`text-xs mt-1 ${selectedShiftTypes.includes(shift.id) ? 'text-white/80' : 'text-gray-600'}`}>
                        {shift.time}
                      </p>
                      {selectedShiftTypes.includes(shift.id) && (
                        <CheckCircle className="w-4 h-4 mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialties Filter */}
            <div className="p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">Specialties</h3>
              <div className="grid grid-cols-2 gap-2">
                {allSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedSpecialties.includes(specialty)
                        ? 'border-black bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-xs leading-tight">{specialty}</p>
                      {selectedSpecialties.includes(specialty) && (
                        <CheckCircle className="w-4 h-4 mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            {selectedDates.length > 0 && selectedShiftTypes.length > 0 && selectedSpecialties.length > 0 && (
              <div className="p-4 pb-20 bg-white border-t border-gray-200">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-base hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg"
                >
                  Find Hospitals ({selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}, {selectedShiftTypes.length} shift{selectedShiftTypes.length !== 1 ? 's' : ''}, {selectedSpecialties.length} specialt{selectedSpecialties.length !== 1 ? 'ies' : 'y'})
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Mobile Map View */
        <>
          <div className="flex-1 relative">
            {/* Map */}
            <div className="absolute inset-0">
              <HospitalMapView
                hospitals={filteredHospitals}
                onSelectHospital={handleHospitalSelect}
                userLocation={userLocation}
                selectedHospital={selectedHospital}
              />
            </div>

            {/* Floating Back Button */}
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute top-4 left-4 bg-white text-gray-900 p-3 rounded-full shadow-lg z-[500]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Bottom Hospital Drawer with swipeable functionality */}
            <div
              className={`absolute left-0 right-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-[1000] ${
                mobileFilterOpen ? 'bottom-0 h-[70vh]' : 'bottom-0 h-48'
              }`}
            >
              {/* Drag Handle */}
              <div
                className="w-full py-3 flex justify-center cursor-pointer"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              >
                <div className="w-12 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              </div>

              {/* Collapsed View - Hospital Cards Horizontal Scroll */}
              {!mobileFilterOpen && (
                <div className="px-4 pb-4 overflow-x-auto">
                  <div className="flex gap-3 pb-2">
                    {filteredHospitals.slice(0, 10).map((hospital) => (
                      <div
                        key={hospital.id}
                        onClick={() => {
                          handleHospitalSelect(hospital);
                          setMobileFilterOpen(true);
                        }}
                        className="flex-shrink-0 w-64 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-black transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{hospital.name}</p>
                            <p className="text-sm text-gray-600 truncate">{hospital.trust}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{hospital.rating.toFixed(1)}</span>
                          </div>
                          {hospital.distance !== undefined && (
                            <p className="text-xs text-gray-500">{hospital.distance.toFixed(1)} km away</p>
                          )}
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-gray-600" />
                            <span className="text-xs text-gray-600">{hospital.shifts.length} shifts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded View - Full Hospital List */}
              {mobileFilterOpen && (
                <div className="overflow-y-auto h-[calc(100%-3rem)] px-4 pb-20">
                  <div className="mb-3">
                    <h3 className="font-bold text-xl mb-3">{filteredHospitals.length} Hospitals Available</h3>

                    {/* TOM AI Input - Mobile */}
                    {!hideSearch && (
                      <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                            <TomLogo size={24} />
                          </div>
                          <input
                            type="text"
                            placeholder="Ask TOM AI anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 placeholder-blue-600/60 font-medium text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {filteredHospitals.map((hospital) => (
                      <div
                        key={hospital.id}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-blue-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{hospital.name}</p>
                            <p className="text-xs text-gray-600 truncate">{hospital.trust}</p>
                          </div>
                          {hospital.rating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-semibold">{hospital.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Hospital Info */}
                        {hospital.distance !== undefined && (
                          <div className="mb-2 px-2 py-1 bg-blue-50 rounded text-xs">
                            <p className="text-blue-900 font-medium">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {hospital.distance.toFixed(1)} km away • {hospital.shifts.length} shifts available
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHospitalSelect(hospital);
                              setMobileView('hospital');
                            }}
                            className="flex-1 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md text-xs font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mobileView === 'hospital' && selectedHospital && (
        <div className="absolute inset-0 overflow-y-auto bg-white z-50">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 flex items-center space-x-3 z-10">
            <button
              onClick={() => setMobileView('map')}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Hospital Details</h2>
          </div>

          <div className="p-4">
            <HospitalDetailsPanel hospital={selectedHospital} urgentOnly={urgentOnly} />
          </div>
        </div>
      )}
    </div>
  );
}

// Hospital Details Panel Component
function HospitalDetailsPanel({ hospital, urgentOnly }: { hospital: NHSHospital; urgentOnly: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
            <p className="text-sm text-gray-600">{hospital.trust}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Star className="w-5 h-5 text-amber-500 fill-current mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{hospital.rating.toFixed(1)}</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{hospital.theatres.total}</p>
            <p className="text-xs text-gray-600">Theatres</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Briefcase className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{hospital.shifts.length}</p>
            <p className="text-xs text-gray-600">Shifts</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="font-bold text-gray-900 mb-2">Location</h4>
        <div className="flex items-start space-x-2 text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p>{hospital.address}</p>
            <p>{hospital.postcode}</p>
            {hospital.distance !== undefined && (
              <p className="text-blue-600 font-medium mt-1">
                {hospital.distance.toFixed(1)} km away
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div>
        <h4 className="font-bold text-gray-900 mb-2">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {hospital.specialties.map((specialty, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Available Shifts */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Available Shifts</h4>
        <div className="space-y-3">
          {hospital.shifts.map((shift, idx) => (
            <div
              key={idx}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-bold text-gray-900">{shift.role}</h5>
                  <p className="text-sm text-gray-600">{shift.band}</p>
                </div>
                {shift.status === 'urgent' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(shift.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="capitalize">{shift.type}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xl font-bold text-blue-600">Competitive Rate</p>
              </div>
              <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium">
                Apply for Shift
              </button>
            </div>
          ))}
        </div>
      </div>

      {urgentOnly && hospital.urgentNeeds && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center space-x-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h4 className="font-bold">Urgent Needs</h4>
          </div>
          <p className="text-sm text-red-600">
            This hospital has urgent staffing requirements. Immediate response recommended.
          </p>
        </div>
      )}
    </div>
  );
}
