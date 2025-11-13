/**
 * Monthly Theatre Schedule Generator
 * Generates realistic monthly theatre schedules matching:
 * - Consultant availability & preferences
 * - Patient waiting lists & priorities
 * - Theatre capacity & session types
 * - Specialty requirements
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

interface ConsultantPreference {
  id: string;
  surgeonId: string;
  surgeonName: string;
  specialty: string;
  subspecialty?: string;
  preferredTheatreDays: string[];
  preferredSessionTypes: string[];
  minSessionsPerWeek: number;
  maxSessionsPerWeek: number;
  avgProceduresPerSession: number;
  weekendAvailability: boolean;
  unavailableDays: string[];
  clinicDays: string[];
}

interface WaitingListPatient {
  id: string;
  firstName: string;
  lastName: string;
  hospitalNumber: string;
  procedureName: string;
  procedureCode: string;
  priority: 'Urgent' | 'Expedited' | 'Routine' | 'Planned';
  specialtyName: string;
  consultantId: string;
  consultantName: string;
  referralDate: string;
  waitingDays: number;
  targetDate: string;
}

interface TheatreSession {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  sessionType: 'AM' | 'PM' | 'FULL' | 'EXTENDED';
  consultantId: string;
  consultantName: string;
  specialty: string;
  subspecialty?: string;
  theatre: string; // Theatre number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

  // Planned patients
  patients: Array<{
    patientId: string;
    patientName: string;
    hospitalNumber: string;
    procedureName: string;
    procedureCode: string;
    priority: string;
    estimatedDuration: number; // minutes
  }>;

  // Session details
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  totalDuration: number; // minutes
  utilization: number; // percentage

  createdAt: string;
  updatedAt: string;
}

// Session time configurations
const SESSION_CONFIG = {
  AM: { start: '08:00', end: '13:00', duration: 300 },
  PM: { start: '13:30', end: '18:00', duration: 270 },
  FULL: { start: '08:00', end: '18:00', duration: 600 },
  EXTENDED: { start: '08:00', end: '20:00', duration: 720 }
};

// Priority ordering (highest to lowest)
const PRIORITY_ORDER = ['Urgent', 'Expedited', 'Routine', 'Planned'];

// Average procedure durations by complexity (minutes)
function estimateProcedureDuration(procedureName: string, priority: string): number {
  const baseDurations: Record<string, number> = {
    'Appendicectomy': 60,
    'Cholecystectomy': 90,
    'Laparoscopic Cholecystectomy': 75,
    'Hernia Repair': 60,
    'Colorectal Resection': 180,
    'Gastrectomy': 240,
    'Total Hip Replacement': 120,
    'Total Knee Replacement': 120,
    'Arthroscopy Knee': 45,
    'ACL Reconstruction': 90,
    'Hip Fracture Fixation': 120,
    'Hysterectomy': 120,
    'Laparoscopic Cystectomy': 90,
    'TURP': 60,
    'Cystoscopy': 30,
    'Nephrectomy': 180,
    'Prostatectomy': 150,
    'Tonsillectomy': 45,
    'Septoplasty': 60,
    'Thyroidectomy': 120,
    'Cataract Surgery': 30,
    'Vitrectomy': 60,
    'Carotid Endarterectomy': 180,
    'AAA Repair': 240,
    'Varicose Vein Surgery': 60
  };

  const baseDuration = baseDurations[procedureName] || 90;

  // Urgent cases may take longer due to complexity
  const urgencyMultiplier = priority === 'Urgent' ? 1.2 : 1.0;

  return Math.round(baseDuration * urgencyMultiplier);
}

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function clearExistingSchedule(year: number, month: number) {
  console.log(`🗑️  Clearing existing schedule for ${year}-${String(month).padStart(2, '0')}...`);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const scheduleQuery = query(
    collection(db, 'theatreSessions'),
    where('date', '>=', formatDate(startDate)),
    where('date', '<=', formatDate(endDate))
  );

  const sessionsSnap = await getDocs(scheduleQuery);
  let deleteCount = 0;

  for (const doc of sessionsSnap.docs) {
    await deleteDoc(doc.ref);
    deleteCount++;
  }

  console.log(`✅ Cleared ${deleteCount} existing sessions\n`);
}

async function generateMonthlySchedule(year: number, month: number) {
  console.log(`\n🏥 Generating Theatre Schedule for ${year}-${String(month).padStart(2, '0')}\n`);

  try {
    // 1. Load consultant preferences
    console.log('📋 Loading consultant preferences...');
    const preferencesSnap = await getDocs(collection(db, 'consultantPreferences'));
    const consultants: ConsultantPreference[] = [];

    preferencesSnap.forEach(doc => {
      const data = doc.data();
      consultants.push({
        id: doc.id,
        surgeonId: data.surgeonId,
        surgeonName: data.surgeonName,
        specialty: data.specialty,
        subspecialty: data.subspecialty,
        preferredTheatreDays: data.preferredTheatreDays || [],
        preferredSessionTypes: data.preferredSessionTypes || [],
        minSessionsPerWeek: data.minSessionsPerWeek || 2,
        maxSessionsPerWeek: data.maxSessionsPerWeek || 3,
        avgProceduresPerSession: data.avgProceduresPerSession || 4,
        weekendAvailability: data.weekendAvailability || false,
        unavailableDays: data.unavailableDays || [],
        clinicDays: data.clinicDays || []
      });
    });

    console.log(`✅ Loaded ${consultants.length} consultants\n`);

    // 2. Load waiting list patients
    console.log('🏥 Loading waiting list patients...');
    const waitingListSnap = await getDocs(collection(db, 'waitingList'));
    const waitingList: WaitingListPatient[] = [];

    waitingListSnap.forEach(doc => {
      const data = doc.data();
      waitingList.push({
        id: doc.id,
        ...data
      } as WaitingListPatient);
    });

    // Sort by priority then waiting days
    waitingList.sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return b.waitingDays - a.waitingDays; // Longest waiting first
    });

    console.log(`✅ Loaded ${waitingList.length} waiting patients`);
    console.log(`   Priority breakdown:`);
    PRIORITY_ORDER.forEach(priority => {
      const count = waitingList.filter(p => p.priority === priority).length;
      console.log(`   - ${priority}: ${count}`);
    });
    console.log('');

    // 3. Clear existing schedule
    await clearExistingSchedule(year, month);

    // 4. Generate sessions for each day of the month
    console.log('📅 Generating theatre sessions...\n');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const daysInMonth = endDate.getDate();

    const sessions: TheatreSession[] = [];
    const scheduledPatients = new Set<string>();
    let theatreCounter = 1;

    // Track sessions per consultant per week
    const weeklySessionCount: Record<string, number> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = getDayOfWeek(currentDate);
      const dateStr = formatDate(currentDate);

      // Reset weekly counters on Monday
      if (dayOfWeek === 'Monday') {
        Object.keys(weeklySessionCount).forEach(key => {
          weeklySessionCount[key] = 0;
        });
      }

      // Skip Sundays unless weekend availability
      if (dayOfWeek === 'Sunday') continue;

      // For each consultant, check if they should have a session today
      for (const consultant of consultants) {
        // Check if this is a preferred theatre day
        if (!consultant.preferredTheatreDays.includes(dayOfWeek)) continue;

        // Check if they've hit their weekly maximum
        const weeklyCount = weeklySessionCount[consultant.surgeonId] || 0;
        if (weeklyCount >= consultant.maxSessionsPerWeek) continue;

        // Check if it's a clinic day
        if (consultant.clinicDays.includes(dayOfWeek)) continue;

        // Select session type based on preferences
        const sessionType = consultant.preferredSessionTypes.length > 0
          ? consultant.preferredSessionTypes[Math.floor(Math.random() * consultant.preferredSessionTypes.length)] as 'AM' | 'PM' | 'FULL' | 'EXTENDED'
          : 'AM';

        const sessionConfig = SESSION_CONFIG[sessionType];

        // Find patients for this consultant who haven't been scheduled
        const eligiblePatients = waitingList.filter(patient =>
          patient.consultantId === consultant.surgeonId &&
          !scheduledPatients.has(patient.id)
        );

        if (eligiblePatients.length === 0) continue; // No patients for this consultant

        // Assign patients to session based on time available
        const sessionPatients: TheatreSession['patients'] = [];
        let totalDuration = 0;
        const maxDuration = sessionConfig.duration;

        for (const patient of eligiblePatients) {
          const procedureDuration = estimateProcedureDuration(patient.procedureName, patient.priority);

          // Check if we have time for this procedure (leave 30min buffer)
          if (totalDuration + procedureDuration + 30 > maxDuration) break;

          sessionPatients.push({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            hospitalNumber: patient.hospitalNumber,
            procedureName: patient.procedureName,
            procedureCode: patient.procedureCode,
            priority: patient.priority,
            estimatedDuration: procedureDuration
          });

          scheduledPatients.add(patient.id);
          totalDuration += procedureDuration;
        }

        // Only create session if we have at least one patient
        if (sessionPatients.length > 0) {
          const session: TheatreSession = {
            date: dateStr,
            dayOfWeek,
            sessionType,
            consultantId: consultant.surgeonId,
            consultantName: consultant.surgeonName,
            specialty: consultant.specialty,
            subspecialty: consultant.subspecialty,
            theatre: `Theatre ${theatreCounter}`,
            status: 'scheduled',
            patients: sessionPatients,
            startTime: sessionConfig.start,
            endTime: sessionConfig.end,
            totalDuration: sessionConfig.duration,
            utilization: Math.round((totalDuration / sessionConfig.duration) * 100),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          sessions.push(session);
          weeklySessionCount[consultant.surgeonId] = weeklyCount + 1;

          // Cycle through theatre numbers (1-12)
          theatreCounter = (theatreCounter % 12) + 1;
        }
      }
    }

    // 5. Save sessions to Firebase
    console.log('💾 Saving sessions to Firebase...\n');
    let savedCount = 0;

    for (const session of sessions) {
      try {
        await addDoc(collection(db, 'theatreSessions'), session);
        savedCount++;

        if (savedCount % 10 === 0) {
          console.log(`✅ Saved ${savedCount}/${sessions.length} sessions...`);
        }
      } catch (error) {
        console.error(`❌ Error saving session for ${session.date}:`, error);
      }
    }

    console.log(`\n🎉 Successfully generated ${savedCount} theatre sessions!`);

    // Statistics
    console.log(`\n📊 Summary:`);
    console.log(`   Month: ${year}-${String(month).padStart(2, '0')}`);
    console.log(`   Total sessions: ${sessions.length}`);
    console.log(`   Patients scheduled: ${scheduledPatients.size}/${waitingList.length}`);
    console.log(`   Unscheduled patients: ${waitingList.length - scheduledPatients.size}`);

    const avgUtilization = sessions.reduce((sum, s) => sum + s.utilization, 0) / sessions.length;
    console.log(`   Average theatre utilization: ${Math.round(avgUtilization)}%`);

    // Breakdown by session type
    console.log(`\n   Sessions by type:`);
    ['AM', 'PM', 'FULL', 'EXTENDED'].forEach(type => {
      const count = sessions.filter(s => s.sessionType === type).length;
      if (count > 0) console.log(`   - ${type}: ${count}`);
    });

    // Patients scheduled by priority
    console.log(`\n   Patients scheduled by priority:`);
    PRIORITY_ORDER.forEach(priority => {
      const count = Array.from(scheduledPatients).filter(patientId => {
        const patient = waitingList.find(p => p.id === patientId);
        return patient?.priority === priority;
      }).length;
      if (count > 0) console.log(`   - ${priority}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error generating monthly schedule:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const year = args[0] ? parseInt(args[0]) : new Date().getFullYear();
const month = args[1] ? parseInt(args[1]) : new Date().getMonth() + 1;

// Validate arguments
if (isNaN(year) || year < 2024 || year > 2030) {
  console.error('❌ Invalid year. Please provide a year between 2024 and 2030.');
  process.exit(1);
}

if (isNaN(month) || month < 1 || month > 12) {
  console.error('❌ Invalid month. Please provide a month between 1 and 12.');
  process.exit(1);
}

// Run the generator
generateMonthlySchedule(year, month)
  .then(() => {
    console.log('\n✅ Monthly schedule generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
