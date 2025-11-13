'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, ChevronLeft, ChevronRight, Filter, FileText } from 'lucide-react';
import { getTheatreListsByDate } from '@/lib/services/theatreListService';
import { TheatreList, SurgicalCase } from '@/lib/theatreListTypes';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lists, setLists] = useState<TheatreList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheatre, setSelectedTheatre] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  useEffect(() => {
    loadDateData();
  }, [selectedDate]);

  const loadDateData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await getTheatreListsByDate(dateStr);
      setLists(data.sort((a, b) => {
        // Sort by theatre name, then session type
        if (a.theatreName !== b.theatreName) {
          return a.theatreName.localeCompare(b.theatreName);
        }
        const sessionOrder = { AM: 1, PM: 2, EVE: 3, FULL: 0, EXTENDED: 4 };
        return sessionOrder[a.sessionType] - sessionOrder[b.sessionType];
      }));
    } catch (error) {
      console.error('Error loading date data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getFilteredLists = (): TheatreList[] => {
    return lists.filter(list => {
      if (selectedUnit !== 'all' && list.unitName.replace(/\s+Suite$/i, '') !== selectedUnit) return false;
      if (selectedTheatre !== 'all' && list.theatreId !== selectedTheatre) return false;
      if (selectedSpecialty !== 'all' && list.specialty !== selectedSpecialty) return false;
      return true;
    });
  };

  const getUniqueUnits = (): string[] => {
    const units = new Set(lists.map(l => l.unitName.replace(/\s+Suite$/i, '')));
    return Array.from(units).sort();
  };

  const getUniqueTheatres = (): string[] => {
    const theatres = new Set(lists.map(l => l.theatreId));
    return Array.from(theatres).sort();
  };

  const getUniqueSpecialties = (): string[] => {
    const specialties = new Set(lists.map(l => l.specialty));
    return Array.from(specialties).sort();
  };

  const filteredLists = getFilteredLists();
  const units = getUniqueUnits();
  const theatres = getUniqueTheatres();
  const specialties = getUniqueSpecialties();
  const dateDisplay = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-white sticky top-0 z-50 shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base md:text-xl font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                Theatre Schedule
              </h1>
              <p className="text-[10px] md:text-xs text-white/90">
                View daily surgical lists by theatre
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto p-4 md:p-6">
        {/* Date Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center min-w-[250px]">
                <div className="text-lg font-bold text-gray-900">{dateDisplay}</div>
              </div>
              <button
                onClick={nextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="ml-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Units</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Theatre</label>
                <select
                  value={selectedTheatre}
                  onChange={(e) => setSelectedTheatre(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Theatres</option>
                  {theatres.map(theatreId => {
                    const theatre = lists.find(l => l.theatreId === theatreId);
                    const theatreName = theatre?.theatreName || theatreId;
                    const theatreNumber = theatreName.match(/\d+/)?.[0] || '';
                    const unitName = theatre?.unitName.replace(/\s+Suite$/i, '') || '';
                    const displayName = theatreNumber ? `${unitName} ${theatreNumber}` : theatreName;
                    return (
                      <option key={theatreId} value={theatreId}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Theatre Lists */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading theatre lists...</p>
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Theatre Lists Found
            </h3>
            <p className="text-gray-600">
              There are no scheduled theatre lists for this date.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLists.map((list) => {
              // Format theatre name: "Main Theatre 5" instead of "Theatre 5 / Main Theatre Suite"
              const theatreNumber = list.theatreName.match(/\d+/)?.[0] || '';
              const unitName = list.unitName.replace(/\s+Suite$/i, '');
              const displayTheatreName = theatreNumber ? `${unitName} ${theatreNumber}` : list.theatreName;

              return (
                <div key={list.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* List Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {displayTheatreName}
                          <span className="text-sm font-normal text-gray-600">
                            ({list.sessionType} Session: {list.sessionTimes.start} - {list.sessionTimes.end})
                          </span>
                        </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-700">
                        <span className="font-semibold text-blue-700">{list.specialty}</span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Surgeon: <span className="font-medium">{list.primarySurgeonName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Anaesthetist: <span className="font-medium">{list.primaryAnaesthetistName}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{list.totalCases}</div>
                      <div className="text-xs text-gray-600">Cases</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          list.utilizationPercentage > 90 ? 'bg-red-100 text-red-800' :
                          list.utilizationPercentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {list.utilizationPercentage}% Utilized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cases List */}
                <div className="divide-y divide-gray-200">
                  {list.cases.map((surgicalCase, idx) => (
                    <div key={surgicalCase.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              {surgicalCase.caseOrder}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {surgicalCase.procedureName}
                            </h4>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                              {surgicalCase.opcs4Codes.join(', ')}
                            </span>
                          </div>

                          <div className="ml-9 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Surgical Time:</span>
                              <div className="text-gray-900">{surgicalCase.estimatedSurgicalTime} min</div>
                            </div>
                            <div>
                              <span className="font-medium">Anaesthetic:</span>
                              <div className="text-gray-900">{surgicalCase.anaestheticType} ({surgicalCase.anaestheticTime} min)</div>
                            </div>
                            <div>
                              <span className="font-medium">Total Time:</span>
                              <div className="text-gray-900 font-semibold">{surgicalCase.totalCaseTime} min</div>
                            </div>
                            <div>
                              <span className="font-medium">PCS Score:</span>
                              <div className="text-gray-900">{surgicalCase.pcsScore.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="ml-9 mt-2 flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              Complexity: {surgicalCase.complexityScore}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              Duration: {surgicalCase.durationScore}
                            </span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              Variability: {surgicalCase.variabilityScore}
                            </span>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              Surgeon Level: {surgicalCase.surgeonLevelScore}
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-600">
                          <div className="font-medium">{surgicalCase.surgeonFullName}</div>
                          <div className="text-gray-500">{surgicalCase.anaesthetistFullName}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* List Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>
                      Total Estimated Time: <span className="font-semibold text-gray-900">{list.totalEstimatedTime} minutes ({(list.totalEstimatedTime / 60).toFixed(1)} hours)</span>
                    </div>
                    <div>
                      Session Duration: <span className="font-semibold text-gray-900">{list.sessionDurationMinutes} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Summary Card */}
        {!loading && filteredLists.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Daily Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Lists</div>
                <div className="text-2xl font-bold text-blue-600">{filteredLists.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Cases</div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredLists.reduce((sum, l) => sum + l.totalCases, 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Avg Cases/List</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(filteredLists.reduce((sum, l) => sum + l.totalCases, 0) / filteredLists.length).toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Avg Utilization</div>
                <div className="text-2xl font-bold text-orange-600">
                  {(filteredLists.reduce((sum, l) => sum + l.utilizationPercentage, 0) / filteredLists.length).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
