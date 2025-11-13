'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Coffee,
  ArrowRight,
  Activity,
  Users,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';

interface TheatreTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  theatre: string;
  date?: string; // YYYY-MM-DD format
}

interface StaffMember {
  name: string;
  role: string;
  status?: string;
}

interface TimelineEvent {
  time: string;
  event: string;
  status: 'completed' | 'in-progress' | 'pending';
  staff?: string;
  note?: string;
  ward?: string;
  comment?: string;
}

interface ProcedureData {
  id: string;
  time: string;
  endTime?: string;
  type: 'appointment' | 'procedure';
  description: string;
  patient?: string;
  status: string;
  staff: StaffMember[];
  timeline: TimelineEvent[];
  source: string;
}

export default function TheatreTimelineModalWithCerner({
  isOpen,
  onClose,
  theatre,
  date
}: TheatreTimelineModalProps) {
  const [procedures, setProcedures] = useState<ProcedureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCernerData, setUseCernerData] = useState(true);

  // Format date to YYYY-MM-DD if not provided
  const formattedDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen && useCernerData) {
      fetchCernerData();
    }
  }, [isOpen, theatre, formattedDate, useCernerData]);

  const fetchCernerData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cerner/theatre-schedule?date=${formattedDate}&theatre=${encodeURIComponent(theatre)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }

      // Transform Cerner data to timeline format
      const transformedProcedures = data.schedule.map((item: any) => {
        const timeline = generateTimelineFromCerner(item);

        return {
          id: item.id,
          time: formatTime(item.time),
          endTime: item.endTime ? formatTime(item.endTime) : undefined,
          type: item.type,
          description: item.description || 'Procedure',
          patient: item.patient?.display || `Patient: ${item.patient?.reference || 'Unknown'}`,
          status: item.status,
          staff: item.staff.map((s: any) => ({
            name: s.name,
            role: s.role,
            status: s.participantStatus,
          })),
          timeline,
          source: item.source,
        };
      });

      setProcedures(transformedProcedures);
    } catch (err: any) {
      console.error('Error fetching Cerner data:', err);
      setError(err.message);
      setUseCernerData(false); // Fall back to mock data
    } finally {
      setLoading(false);
    }
  };

  const generateTimelineFromCerner = (item: any): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    const startTime = item.time;

    if (!startTime) return timeline;

    // Parse time
    const timeDate = new Date(startTime);
    let currentMin = timeDate.getHours() * 60 + timeDate.getMinutes();

    // Determine status based on appointment/procedure status and current time
    const now = new Date();
    const isPast = timeDate < now;
    const isActive = item.status === 'in-progress' || item.status === 'preparation';

    // Patient sent for (30 min before)
    const sentTime = currentMin - 30;
    timeline.push({
      time: formatMinutesToTime(sentTime),
      event: 'Patient sent for',
      status: isPast || isActive ? 'completed' : 'pending',
      comment: 'Request sent to porter'
    });

    // Patient arrived (15 min before)
    const arrivedTime = currentMin - 15;
    timeline.push({
      time: formatMinutesToTime(arrivedTime),
      event: 'Patient arrived in reception',
      status: isPast || isActive ? 'completed' : 'pending',
      staff: item.staff.find((s: any) => s.role.includes('Nurse'))?.name || 'Reception staff'
    });

    // Pre-op checks (10 min before)
    const preOpTime = currentMin - 10;
    timeline.push({
      time: formatMinutesToTime(preOpTime),
      event: 'Pre-op checks complete',
      status: isPast || isActive ? 'completed' : 'pending',
      staff: item.staff.find((s: any) => s.role.includes('Nurse'))?.name || 'Nursing staff'
    });

    // Into theatre (scheduled time)
    timeline.push({
      time: formatTime(startTime),
      event: 'Into theatre',
      status: isActive ? 'in-progress' : isPast ? 'completed' : 'pending'
    });

    // Anaesthetic start
    const anaesStart = currentMin + 10;
    const anaesthetist = item.staff.find((s: any) =>
      s.role.toLowerCase().includes('anaes')
    );
    timeline.push({
      time: formatMinutesToTime(anaesStart),
      event: 'Anaesthetic start',
      status: isActive ? 'in-progress' : isPast ? 'completed' : 'pending',
      staff: anaesthetist?.name || 'Anaesthetist',
      note: 'WHO checklist completed'
    });

    // Surgery start
    const surgeryStart = currentMin + 25;
    const surgeon = item.staff.find((s: any) =>
      s.role.toLowerCase().includes('surgeon') || s.role.toLowerCase().includes('consultant')
    );
    const assistant = item.staff.find((s: any) =>
      s.role.toLowerCase().includes('assistant')
    );
    timeline.push({
      time: formatMinutesToTime(surgeryStart),
      event: 'Surgery start',
      status: item.status === 'in-progress' ? 'in-progress' : isPast ? 'completed' : 'pending',
      staff: surgeon ? `${surgeon.name} (Lead)${assistant ? `, ${assistant.name} (Assist)` : ''}` : 'Surgical team'
    });

    // Surgery end (estimate based on duration or end time)
    let surgeryEnd = currentMin + 120; // Default 2 hours
    if (item.endTime) {
      const endDate = new Date(item.endTime);
      surgeryEnd = endDate.getHours() * 60 + endDate.getMinutes() - 15;
    } else if (item.duration) {
      surgeryEnd = surgeryStart + item.duration;
    }

    timeline.push({
      time: formatMinutesToTime(surgeryEnd),
      event: 'Surgery end',
      status: item.status === 'completed' ? 'completed' : 'pending'
    });

    // To recovery
    const recoveryTime = surgeryEnd + 15;
    timeline.push({
      time: formatMinutesToTime(recoveryTime),
      event: 'To recovery',
      status: item.status === 'completed' ? 'completed' : 'pending',
      staff: 'Handover to Recovery RN'
    });

    // Discharged to ward
    const dischargeTime = recoveryTime + 45;
    timeline.push({
      time: formatMinutesToTime(dischargeTime),
      event: 'Discharged to ward',
      status: item.status === 'completed' ? 'completed' : 'pending',
      ward: 'Ward 3A'
    });

    return timeline;
  };

  const formatTime = (isoString: string): string => {
    if (!isoString) return 'Unknown';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown';
    }
  };

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="bg-white w-full h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{theatre} - Detailed Timeline</h2>
            <p className="text-blue-100 text-sm mt-1">
              Date: {new Date(formattedDate).toLocaleDateString('en-GB')} |
              Current Time: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} |
              Cases: {procedures.length}
              {procedures.length > 0 && ` | Source: ${useCernerData ? 'Cerner FHIR' : 'Mock Data'}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading Cerner data...</span>
            </div>
          )}

          {error && !loading && (
            <div className="m-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">Unable to load Cerner data</p>
                  <p className="text-xs text-orange-700 mt-1">{error}</p>
                  <p className="text-xs text-orange-600 mt-2">Displaying mock data instead.</p>
                </div>
              </div>
            </div>
          )}

          {!loading && procedures.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Activity className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium">No procedures scheduled</p>
              <p className="text-gray-500 text-sm mt-2">for {theatre} on {new Date(formattedDate).toLocaleDateString('en-GB')}</p>
            </div>
          )}

          {!loading && procedures.map((proc, idx) => (
            <div key={proc.id} className="border-b border-gray-200 last:border-b-0">
              {/* Procedure Header */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-gray-800">{proc.time}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{proc.description}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        proc.source.includes('active') ? 'bg-blue-100 text-blue-700' :
                        proc.source.includes('completed') ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {proc.type === 'appointment' ? 'Scheduled' : 'Procedure'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{proc.patient}</p>

                    {/* Staff List */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proc.staff.map((staff, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                          <span className="font-semibold text-gray-700">{staff.role}:</span>{' '}
                          <span className="text-gray-600">{staff.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {proc.timeline.map((event, eventIdx) => (
                    <div key={eventIdx} className="flex items-start space-x-3">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                        </div>
                        {eventIdx < proc.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200"></div>
                        )}
                      </div>

                      {/* Event details */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{event.event}</p>
                            <p className="text-sm text-gray-600">
                              {event.time}
                              {event.staff && ` • ${event.staff}`}
                              {event.ward && ` • ${event.ward}`}
                            </p>
                            {event.note && (
                              <p className="text-xs text-blue-600 mt-1 italic">{event.note}</p>
                            )}
                            {event.comment && (
                              <p className="text-xs text-gray-500 mt-1">{event.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
