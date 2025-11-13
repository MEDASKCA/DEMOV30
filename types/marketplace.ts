// TOM Marketplace Platform Types
// "LinkedIn + Uber for NHS Healthcare Staffing"

// ===== STAFF PROFILE TYPES =====

export interface StaffProfile {
  id: string;

  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nhsNumber?: string;

  // Professional Details
  role: 'Scrub Nurse' | 'Anaesthetic Nurse' | 'ODP' | 'HCA' | 'Recovery Nurse' | 'Theatre Nurse';
  band: 'Band 3' | 'Band 4' | 'Band 5' | 'Band 6' | 'Band 7' | 'Band 8a' | 'Band 8b';
  employmentType: 'permanent' | 'bank' | 'agency' | 'both';
  yearsExperience: number;

  // Current Employment
  currentTrust?: string;
  currentDepartment?: string;

  // Location
  location: {
    address: string;
    postcode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Availability Preferences
  availability: {
    preferredRadius: number; // miles
    preferredShifts: ('early' | 'late' | 'night' | 'long-day')[];
    preferredSpecialties: string[];
    unavailableDates: string[]; // YYYY-MM-DD
    minHourlyRate: number;
  };

  // Platform Performance
  performance: {
    totalShifts: number;
    completedShifts: number;
    cancelledShifts: number;
    rating: number; // 0-5
  };

  // Profile Status
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
