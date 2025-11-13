/**
 * Comprehensive TypeScript interfaces for Staff Profiles
 * Based on the existing profile structure in MobileProfile.tsx
 */

export interface ContactDetails {
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone';
}

export interface Location {
  currentTrust: string;
  currentHospital: string;
  postcode: string;
  area: string;
  willingToTravel: number; // miles
}

export interface CompetencyStats {
  mandatory: number;
  clinical: number;
  technical: number;
  professional: number;
}

export interface ProcedureDetail {
  name: string;
  opcs4?: string[];
  level?: 'expert' | 'advanced' | 'competent' | 'learning';
  yearsExperience?: number;
  frequency?: 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'rarely';
  lastPerformed?: string;
}

export interface Subcategory {
  name: string;
  procedures?: ProcedureDetail[];
  items?: CompetencyItem[];
  subcategories?: Subcategory[];
}

export interface SpecialtyTreeNode {
  name: string;
  subcategories?: Subcategory[];
  procedures?: string[];
}

export interface SurgicalCompetency {
  specialty: string;
  subcategories: {
    name: string;
    procedures: ProcedureDetail[];
  }[];
}

export interface CompetencyItem {
  name: string;
  level: 'expert' | 'advanced' | 'competent' | 'learning' | 'certified';
  expiry?: string;
  provider?: string;
  description?: string;
}

export interface CompetencyTreeNode {
  name: string;
  icon?: string;
  items?: CompetencyItem[];
  subcategories?: CompetencyTreeNode[];
}

export interface EmploymentHistoryEntry {
  employer: string;
  hospital: string;
  department: string;
  position: string;
  band: string;
  type: 'Permanent' | 'Locum' | 'Bank' | 'Fixed Term';
  startDate: string;
  endDate: string | null;
  specialties: string[];
  responsibilities: string[];
  verifiedBy?: string;
  verifiedByRole?: string;
  verifiedDate?: string;
  verified?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  grade: string;
  startDate: string;
  endDate: string;
  description: string;
  verified: boolean;
  verificationLink?: string;
  certificateNumber?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  number: string;
  issueDate: string;
  expiryDate: string | null;
  status: 'Active' | 'Current' | 'Expired';
}

export interface ProfessionalMembership {
  organization: string;
  role: string;
  startDate: string;
  current: boolean;
  description: string;
}

export interface Recommendation {
  author: string;
  authorRole: string;
  authorOrganization: string;
  relationship: string;
  date: string;
  text: string;
}

export interface Award {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface VolunteerWork {
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  activities: string[];
}

export interface Publication {
  title: string;
  type: 'Journal Article' | 'Book Chapter' | 'Conference Paper' | 'White Paper';
  publisher: string;
  date: string;
  description: string;
  coAuthors: string[];
}

export interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

export interface Interest {
  category: string;
  items: string[];
}

export interface MandatoryTraining {
  name: string;
  status: 'valid' | 'expiring' | 'expired';
  expiry: string;
}

export interface Immunisation {
  name: string;
  status: 'current' | 'due' | 'overdue';
  lastDose: string;
  boosterDue: string | null;
}

export interface Compliance {
  dbs: {
    status: 'valid' | 'expired' | 'pending';
    expiryDate: string;
    updateService: boolean;
    certificateNumber: string;
  };
  hcpc: {
    status: 'active' | 'inactive' | 'suspended';
    number: string;
    expiryDate: string;
    revalidationDue: string;
  };
  occupationalHealth: {
    status: 'fit' | 'fit with restrictions' | 'unfit';
    lastAssessment: string;
    nextDue: string;
    restrictions: string[];
  };
  mandatoryTraining: MandatoryTraining[];
  immunisations: Immunisation[];
  indemnityInsurance: {
    provider: string;
    policyNumber: string;
    coverage: string;
    expiryDate: string;
  };
}

export interface Preferences {
  shifts: string[];
  travel: {
    max: number;
    unit: 'miles' | 'km';
  };
  minRate: number;
  maxHoursPerWeek: number;
}

export interface TrackRecord {
  reliability: number;
  endorsements: number;
  shiftsCancelled: number;
  shiftsCompleted: number;
}

export interface StaffProfile {
  id: string; // TOM-NHS-YYYY-NNNN format
  firstName: string;
  lastName: string;
  postNominals: string[];
  professionalQualification: string;
  roles: string[];
  band: string;
  rating: number;
  totalShifts: number;
  completedShifts: number;

  contactDetails: ContactDetails;
  location: Location;

  yearsExperience: number;
  connections: number;

  competencyStats: CompetencyStats;
  specialtyTree: SpecialtyTreeNode[];
  surgicalCompetencies: SurgicalCompetency[];
  competencyTree: CompetencyTreeNode[];

  employmentHistory: EmploymentHistoryEntry[];
  education: Education[];
  certifications: Certification[];
  memberships: ProfessionalMembership[];
  recommendations: Recommendation[];
  awards: Award[];
  volunteerWork: VolunteerWork[];
  publications: Publication[];

  languages: Language[];
  interests: Interest[];

  compliance: Compliance;
  preferences: Preferences;
  trackRecord: TrackRecord;

  willingToWorkAt: string[];

  createdAt: string;
  updatedAt: string;
}

// Roster interfaces
export interface ShiftAllocation {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  shiftType: 'Day' | 'Night' | 'Long Day' | 'Twilight' | 'On Call';
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  hours: number;
  theatreId?: string;
  role: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

export interface LeaveRecord {
  id: string;
  staffId: string;
  type: 'Annual Leave' | 'Study Leave' | 'Sickness' | 'Management Day' | 'Governance Meeting' | 'Training' | 'Other';
  startDate: string;
  endDate: string;
  hours: number;
  status: 'pending' | 'approved' | 'declined';
  notes?: string;
}

export interface StaffRoster {
  staffId: string;
  contractedHours: number; // Per week (e.g., 37.5)
  shifts: ShiftAllocation[];
  leave: LeaveRecord[];
  weekStarting: string; // YYYY-MM-DD (Monday)
  totalScheduledHours: number;
  availability: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
}

// Role definitions
export const STAFF_ROLES = [
  'Anaesthetic N/P',
  'Scrub N/P',
  'Healthcare Assistant (HCA)',
  'Recovery N/P',
  'Surgical Care Practitioner',
  'Theatre Nurse Assistant',
  'Senior Sister/Charge Nurse',
  'Matron',
  'Theatre Manager',
  'Clinical Services Manager'
] as const;

export type StaffRole = typeof STAFF_ROLES[number];

// Band definitions for each role
export const ROLE_BANDS: Record<StaffRole, string[]> = {
  'Anaesthetic N/P': ['Band 5', 'Band 6', 'Band 7'],
  'Scrub N/P': ['Band 5', 'Band 6', 'Band 7'],
  'Healthcare Assistant (HCA)': ['Band 2', 'Band 3', 'Band 4'],
  'Recovery N/P': ['Band 5', 'Band 6'],
  'Surgical Care Practitioner': ['Band 6', 'Band 7'],
  'Theatre Nurse Assistant': ['Band 3', 'Band 4'],
  'Senior Sister/Charge Nurse': ['Band 7'],
  'Matron': ['Band 8a', 'Band 8b'],
  'Theatre Manager': ['Band 7', 'Band 8a'],
  'Clinical Services Manager': ['Band 8a', 'Band 8b', 'Band 8c']
};

// Senior roles that get management days
export const SENIOR_ROLES: StaffRole[] = [
  'Senior Sister/Charge Nurse',
  'Matron',
  'Theatre Manager',
  'Clinical Services Manager'
];
