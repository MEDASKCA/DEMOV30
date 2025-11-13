/**
 * Consultant Preferences Generator
 * Generates realistic theatre availability, preferences, and scheduling constraints for surgeons
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, deleteDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Surgeon {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  specialtyName: string;
  primarySubspecialty?: string;
  isConsultant: boolean;
}

interface ConsultantPreference {
  surgeonId: string;
  surgeonName: string;
  specialty: string;
  subspecialty?: string;

  // Availability
  preferredTheatreDays: string[]; // Days they prefer to operate
  unavailableDays: string[]; // Days they're unavailable (leave, other commitments)
  clinicDays: string[]; // Days they have outpatient clinics

  // Session preferences
  preferredSessionTypes: string[]; // AM, PM, FULL, EXTENDED
  minSessionsPerWeek: number; // Minimum theatre sessions needed
  maxSessionsPerWeek: number; // Maximum they can handle

  // Patient data
  waitingListCount: number; // Number of patients on waiting list
  avgProceduresPerSession: number; // Average procedures they do per session

  // Schedule constraints
  consecutiveDaysPreference: boolean; // Prefer consecutive theatre days
  weekendAvailability: boolean; // Available for weekend/emergency lists

  // Leave/unavailability
  annualLeaveWeeks: number; // Weeks of leave per year
  studyLeaveWeeks: number; // Conference/training weeks

  // Additional notes
  notes: string;

  createdAt: string;
  updatedAt: string;
}

// Realistic patterns by specialty
const SPECIALTY_PATTERNS: Record<string, {
  minSessions: number;
  maxSessions: number;
  avgProcedures: number;
  weekendAvailable: boolean;
  preferredDays: string[];
}> = {
  'GENERAL SURGERY': {
    minSessions: 2,
    maxSessions: 4,
    avgProcedures: 4,
    weekendAvailable: true,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  'ORTHOPAEDICS': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 3,
    weekendAvailable: true,
    preferredDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
  },
  'GYNAECOLOGY': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 5,
    weekendAvailable: false,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  'UROLOGY': {
    minSessions: 2,
    maxSessions: 4,
    avgProcedures: 6,
    weekendAvailable: false,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday']
  },
  'ENT': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 5,
    weekendAvailable: false,
    preferredDays: ['Monday', 'Wednesday', 'Thursday', 'Friday']
  },
  'OPHTHALMOLOGY': {
    minSessions: 3,
    maxSessions: 4,
    avgProcedures: 8,
    weekendAvailable: false,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  'VASCULAR': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 3,
    weekendAvailable: true,
    preferredDays: ['Tuesday', 'Wednesday', 'Thursday']
  },
  'CARDIOTHORACIC': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 2,
    weekendAvailable: true,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  'NEUROSURGERY': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 2,
    weekendAvailable: true,
    preferredDays: ['Monday', 'Wednesday', 'Friday']
  },
  'PLASTICS': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 4,
    weekendAvailable: false,
    preferredDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  'OMFS': {
    minSessions: 2,
    maxSessions: 3,
    avgProcedures: 4,
    weekendAvailable: false,
    preferredDays: ['Monday', 'Wednesday', 'Friday']
  }
};

const DEFAULT_PATTERN = {
  minSessions: 2,
  maxSessions: 3,
  avgProcedures: 4,
  weekendAvailable: false,
  preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
};

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

function generatePreferences(surgeon: Surgeon): ConsultantPreference {
  const pattern = SPECIALTY_PATTERNS[surgeon.specialtyName] || DEFAULT_PATTERN;

  // Select 2-3 preferred theatre days based on specialty pattern
  const shuffledDays = [...pattern.preferredDays].sort(() => Math.random() - 0.5);
  const numDays = Math.floor(Math.random() * 2) + 2; // 2-3 days
  const preferredTheatreDays = shuffledDays.slice(0, numDays);

  // Select 1-2 clinic days from remaining weekdays
  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const remainingDays = allWeekdays.filter(d => !preferredTheatreDays.includes(d));
  const numClinicDays = Math.floor(Math.random() * 2) + 1; // 1-2 clinic days
  const clinicDays = remainingDays.slice(0, numClinicDays);

  // Session type preferences
  const sessionTypes = ['AM', 'PM', 'FULL', 'EXTENDED'];
  const preferredSessionTypes = sessionTypes
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 preferred types

  // Waiting list count varies by specialty demand
  const baseWaitingList = pattern.avgProcedures * pattern.minSessions * 4; // 4 weeks worth
  const waitingListCount = Math.floor(baseWaitingList * (0.7 + Math.random() * 0.6)); // ±30% variation

  // Leave allocation
  const annualLeaveWeeks = 5 + Math.floor(Math.random() * 2); // 5-6 weeks
  const studyLeaveWeeks = Math.floor(Math.random() * 2) + 1; // 1-2 weeks

  return {
    surgeonId: surgeon.id,
    surgeonName: `${surgeon.title} ${surgeon.firstName} ${surgeon.lastName}`,
    specialty: surgeon.specialtyName,
    subspecialty: surgeon.primarySubspecialty,

    preferredTheatreDays,
    unavailableDays: [], // This would be populated from leave requests
    clinicDays,

    preferredSessionTypes,
    minSessionsPerWeek: pattern.minSessions,
    maxSessionsPerWeek: pattern.maxSessions,

    waitingListCount,
    avgProceduresPerSession: pattern.avgProcedures,

    consecutiveDaysPreference: randomBool(0.4), // 40% prefer consecutive days
    weekendAvailability: pattern.weekendAvailable && randomBool(0.6), // Not all surgeons in emergency specialties want weekends

    annualLeaveWeeks,
    studyLeaveWeeks,

    notes: '',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function clearExistingPreferences() {
  console.log('🗑️  Clearing existing consultant preferences...');
  const preferencesSnap = await getDocs(collection(db, 'consultantPreferences'));

  let deleteCount = 0;
  for (const doc of preferencesSnap.docs) {
    await deleteDoc(doc.ref);
    deleteCount++;
  }

  console.log(`✅ Cleared ${deleteCount} existing preferences`);
}

async function generateConsultantPreferences() {
  console.log('🏥 Generating Consultant Preferences...\n');

  try {
    // Fetch all consultants from surgeons collection
    const surgeonsSnap = await getDocs(collection(db, 'surgeons'));
    const consultants: Surgeon[] = [];

    surgeonsSnap.forEach(doc => {
      const data = doc.data();
      // Only include consultants (not registrars or juniors)
      if (data.isConsultant) {
        consultants.push({
          id: doc.id,
          ...data
        } as Surgeon);
      }
    });

    if (consultants.length === 0) {
      console.error('❌ No consultants found in database.');
      return;
    }

    console.log(`✅ Found ${consultants.length} consultants\n`);

    // Clear existing preferences
    await clearExistingPreferences();

    // Generate and save preferences
    console.log('📝 Generating realistic preferences...\n');
    let successCount = 0;

    for (const consultant of consultants) {
      try {
        const preferences = generatePreferences(consultant);
        await addDoc(collection(db, 'consultantPreferences'), preferences);

        successCount++;
        console.log(`✅ ${successCount}/${consultants.length}: ${preferences.surgeonName}`);
        console.log(`   Specialty: ${preferences.specialty}`);
        console.log(`   Theatre Days: ${preferences.preferredTheatreDays.join(', ')}`);
        console.log(`   Sessions/Week: ${preferences.minSessionsPerWeek}-${preferences.maxSessionsPerWeek}`);
        console.log(`   Waiting List: ${preferences.waitingListCount} patients`);
        console.log(`   Weekend Available: ${preferences.weekendAvailability ? 'Yes' : 'No'}\n`);
      } catch (error) {
        console.error(`❌ Error generating preferences for ${consultant.firstName} ${consultant.lastName}:`, error);
      }
    }

    console.log(`\n🎉 Successfully generated ${successCount}/${consultants.length} consultant preferences!`);

    // Summary statistics
    console.log('\n📊 Summary:');
    const totalWaiting = consultants.reduce((sum, c) => {
      const prefs = generatePreferences(c);
      return sum + prefs.waitingListCount;
    }, 0);

    console.log(`   Total consultants: ${consultants.length}`);
    console.log(`   Total waiting list patients: ~${totalWaiting}`);
    console.log(`   Average waiting list per consultant: ~${Math.floor(totalWaiting / consultants.length)}`);

  } catch (error) {
    console.error('❌ Error generating consultant preferences:', error);
  }
}

// Run the generator
generateConsultantPreferences()
  .then(() => {
    console.log('\n✅ Consultant preferences generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
