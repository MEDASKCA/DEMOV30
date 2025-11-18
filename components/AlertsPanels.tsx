'use client';

import React from 'react';
import { AlertTriangle, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  location?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate: Date;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'overdue';
}

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'equipment' | 'staffing' | 'supply' | 'safety' | 'other';
  reportedDate: Date;
  status: 'open' | 'investigating' | 'resolved';
  reportedBy?: string;
}

// Sample data
const sampleAlerts: Alert[] = [
  {
    id: '1',
    title: 'Theatre 4 - Equipment Malfunction',
    description: 'Anesthesia machine showing error code E-503',
    severity: 'critical',
    timestamp: new Date(Date.now() - 30 * 60000),
    location: 'Theatre 4'
  },
  {
    id: '2',
    title: 'Low Stock - Surgical Gloves (Size 7.5)',
    description: 'Only 12 boxes remaining, below minimum threshold',
    severity: 'high',
    timestamp: new Date(Date.now() - 2 * 3600000),
    location: 'Central Supply'
  },
  {
    id: '3',
    title: 'Staff Shortage - Evening Shift',
    description: '2 nurses called in sick, need coverage',
    severity: 'high',
    timestamp: new Date(Date.now() - 4 * 3600000),
    location: 'Staffing'
  }
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Monthly Equipment Maintenance',
    description: 'Theatre 1-6 scheduled maintenance checks',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 24 * 3600000),
    assignee: 'Maintenance Team',
    status: 'overdue'
  },
  {
    id: '2',
    title: 'Update Staff Training Certifications',
    description: '5 staff members due for recertification',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 3600000),
    assignee: 'HR Department',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Order Replacement Surgical Instruments',
    description: 'Reorder instruments flagged during inspection',
    priority: 'normal',
    dueDate: new Date(Date.now() + 7 * 24 * 3600000),
    assignee: 'Procurement',
    status: 'in_progress'
  }
];

const sampleIncidents: Incident[] = [
  {
    id: '1',
    title: 'Near-miss: Incorrect Patient Identification',
    description: 'Staff caught error before procedure commenced',
    type: 'safety',
    reportedDate: new Date(Date.now() - 2 * 24 * 3600000),
    status: 'investigating',
    reportedBy: 'J. Smith, RN'
  },
  {
    id: '2',
    title: 'Equipment Failure - Suction Unit',
    description: 'Theatre 3 suction unit failed mid-procedure',
    type: 'equipment',
    reportedDate: new Date(Date.now() - 5 * 24 * 3600000),
    status: 'resolved',
    reportedBy: 'Surgical Team'
  },
  {
    id: '3',
    title: 'Supply Chain Delay',
    description: 'Delayed delivery of specialized implants',
    type: 'supply',
    reportedDate: new Date(Date.now() - 1 * 24 * 3600000),
    status: 'open',
    reportedBy: 'Supply Chain Manager'
  }
];

export function CriticalAlertsPanel() {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
      case 'high': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
      case 'medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
      case 'low': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Critical Alerts</h2>
        </div>
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
          {sampleAlerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {sampleAlerts.map((alert) => {
          const colors = getSeverityColor(alert.severity);
          return (
            <div
              key={alert.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm ${colors.text}`}>{alert.title}</h3>
                    <span className={`${colors.badge} px-2 py-0.5 text-xs font-bold rounded uppercase`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span>{alert.location}</span>
                <span>•</span>
                <span>{formatTimeAgo(alert.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {sampleAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p className="text-sm">No critical alerts</p>
        </div>
      )}
    </div>
  );
}

export function PendingTasksPanel() {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
      case 'high': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
      case 'normal': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
      case 'low': return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
    }
  };

  const formatDueDate = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (24 * 3600000));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days}d`;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Pending Tasks</h2>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
          {sampleTasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {sampleTasks.map((task) => {
          const colors = getPriorityColor(task.priority);
          return (
            <div
              key={task.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)} mt-1 flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold text-sm ${colors.text}`}>{task.title}</h3>
                    <span className={`${colors.badge} px-2 py-0.5 text-xs font-bold rounded uppercase`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.assignee && <span>{task.assignee}</span>}
                    {task.assignee && <span>•</span>}
                    <span className={task.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sampleTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p className="text-sm">No pending tasks</p>
        </div>
      )}
    </div>
  );
}

export function IncidentsPanel() {
  const getTypeColor = (type: Incident['type']) => {
    switch (type) {
      case 'equipment': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' };
      case 'staffing': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' };
      case 'supply': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
      case 'safety': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
      case 'other': return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'investigating': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (24 * 3600000));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Incidents</h2>
        </div>
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
          {sampleIncidents.length}
        </span>
      </div>

      <div className="space-y-3">
        {sampleIncidents.map((incident) => {
          const colors = getTypeColor(incident.type);
          return (
            <div
              key={incident.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {getStatusIcon(incident.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold text-sm ${colors.text}`}>{incident.title}</h3>
                    <span className={`${colors.badge} px-2 py-0.5 text-xs font-bold rounded uppercase`}>
                      {incident.type}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      incident.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {incident.reportedBy && <span>Reported by: {incident.reportedBy}</span>}
                    {incident.reportedBy && <span>•</span>}
                    <span>{formatDate(incident.reportedDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sampleIncidents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p className="text-sm">No incidents reported</p>
        </div>
      )}
    </div>
  );
}
