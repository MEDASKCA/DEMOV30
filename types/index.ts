// Core Staff Types
export interface Competency {
  procedureName: string;
  level: 'learning' | 'competent' | 'proficient' | 'expert';
  lastAssessed?: string;
  assessor?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  grade?: string;
  specialties?: string[];
  competencies: Competency[];
  isActive: boolean;
  contractedHours?: number;
  availableShifts?: string[];
}

// Theatre and Case Types
export interface Patient {
  mrn: string;
  name?: string;
  age?: number;
  allergies?: string[];
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface CaseTeam {
  surgeon: TeamMember;
  assistant: TeamMember;
  anaesthetist: TeamMember;
  scrubNurse: TeamMember;
  circulatingNurse?: TeamMember;
  oDP?: TeamMember;
}

export interface ScheduledCase {
  id: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  theatre: string;
  procedureName: string;
  specialty: string;
  patient: Patient;
  surgeon: string;
  assistant: string;
  team: CaseTeam;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  notes: string[];
  priority?: 'routine' | 'urgent' | 'emergency';
}

// Theatre Allocation Types
export interface TheatreAllocation {
  id: string;
  date: string; // YYYY-MM-DD
  theatre: string;
  specialty: string;
  surgeon?: string;
  team?: Partial<CaseTeam>;
  sessionType?: 'morning' | 'afternoon' | 'full-day' | 'emergency';
  status?: 'scheduled' | 'active' | 'completed';
}

// Analytics Types
export interface TheatreEfficiency {
  id: string;
  theatre: string;
  date: string;
  utilizationRate: number; // 0-100
  turnoverTime: number; // minutes
  firstCaseDelay: number; // minutes
  totalCases: number;
  completedCases: number;
  cancelledCases: number;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  location?: string;
  expiryDate?: string;
}

// Relief and Break Types
export interface ReliefRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  theatre: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'completed' | 'declined';
  reason?: string;
}

export interface BreakRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  theatre: string;
  breakType: 'coffee' | 'lunch' | 'rest';
  startTime: string;
  endTime?: string;
  duration: number; // minutes
}
