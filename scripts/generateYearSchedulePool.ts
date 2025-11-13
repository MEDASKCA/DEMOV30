// =============================================================================
// YEAR-LONG THEATRE SCHEDULE POOL GENERATOR FOR PROCEDURES FIREBASE
// Creates a balanced pool of theatre lists for January 2025 - December 2025
// Targets 85%+ theatre utilisation with multiple sessions per day
// =============================================================================

import { SURGICAL_PROCEDURES_BY_SPECIALTY, Procedure } from '../lib/surgicalCompetencyData';
import { scoreProcedure } from '../lib/services/procedureScoringService';
import { SessionType } from '../lib/theatreListTypes';

// RTT Priority levels
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

interface ProcedureWithPriority extends Procedure {
  priority: Priority;
  pcsScore: number;
  replaceable: boolean; // Can be replaced if list overruns
}

interface TheatreListTemplate {
  id: string;
  specialty: string;
  subspecialty?: string;
  sessionType: SessionType;
  procedures: ProcedureWithPriority[];
  totalPCS: number;
  maxPCS: number;
  surgeon: string;
  anaesthetist: string;
  weekNumber: number;
  dayOfWeek: string;
  date: string;
  sessionStart: string;
  sessionEnd: string;
}

// Consultant pool with annual leave
interface Consultant {
  name: string;
  initials: string;
  specialty: string;
  subspecialty?: string;
  annualLeaveDays: number; // Days off per year
  maxListsPerWeek: number; // Maximum lists per week
}

// ============================================================================
// HARDCODED SURGEONS AND ANAESTHETISTS REMOVED - TO BE REPLACED IN PHASE 1
// ============================================================================
//
// CONSULTANT DATA STRUCTURE (for reference):
// interface Consultant {
//   name: string;             // Full name with title (e.g., "Mr Christopher Lee")
//   initials: string;         // Consultant initials (e.g., "CL")
//   specialty: string;        // Specialty ID/name
//   subspecialty?: string;    // Optional subspecialty
//   annualLeaveDays: number;  // Annual leave entitlement (typically 25-30 days)
//   maxListsPerWeek: number;  // Maximum theatre lists per week (typically 2-5)
// }
//
// KEY RELATIONSHIPS:
// 1. Surgeon → Specialty + Subspecialty
// 2. Surgeon → Annual Leave Schedule (for realistic scheduling)
// 3. Surgeon → Maximum workload constraints (maxListsPerWeek)
// 4. Anaesthetist → Shared across all specialties
// 5. Both used to generate year-long theatre schedule with realistic rotations
//
// PREVIOUS COVERAGE (for Phase 1 reference):
//
// SURGEONS BY SPECIALTY:
// - EMERGENCY: 6 surgeons (maxListsPerWeek: 5, annualLeave: 25-30)
// - ENT: 4 surgeons (maxListsPerWeek: 3, across 2 subspecialties)
// - GENERAL SURGERY: 8 surgeons (maxListsPerWeek: 2-3, across 4 subspecialties)
// - GYNAECOLOGY: 3 surgeons (maxListsPerWeek: 3, across 2 subspecialties)
// - NEUROLOGY: 3 surgeons (maxListsPerWeek: 2, NEURO-ONCOLOGY)
// - OPTHALMOLOGY: 3 surgeons (maxListsPerWeek: 4)
// - ORAL AND MAXILLOFACIAL: 4 surgeons (maxListsPerWeek: 3, across 4 subspecialties)
// - ORTHOPAEDICS: 6 surgeons (maxListsPerWeek: 2-3, across 3 subspecialties)
// - PLASTICS: 3 surgeons (maxListsPerWeek: 2-3, across 2 subspecialties)
// - RENAL: 3 surgeons (maxListsPerWeek: 2-3, RENAL TRANSPLANT)
// - UROLOGY: 4 surgeons (maxListsPerWeek: 3, across 2 subspecialties)
// - VASCULAR: 3 surgeons (maxListsPerWeek: 3)
// TOTAL: 50 surgeons across 12 specialties
//
// ANAESTHETISTS:
// - 10 anaesthetists (shared pool across all specialties)
// - maxListsPerWeek: 5
// - annualLeaveDays: 25-30
//
// NOTE: This file generates a year-long theatre schedule pool.
// When Phase 1 is complete, these should be loaded from Firebase 'surgeons'
// and 'anaesthetists' collections with leave schedules and workload constraints.
// ============================================================================

// TEMPORARILY EMPTY: Will be populated from Firebase in Phase 1
const EMERGENCY_SURGEONS: Consultant[] = [];
const ENT_SURGEONS: Consultant[] = [];
const GENERAL_SURGEONS: Consultant[] = [];
const GYNAE_SURGEONS: Consultant[] = [];
const NEUROLOGY_SURGEONS: Consultant[] = [];
const OPTHALMOLOGY_SURGEONS: Consultant[] = [];
const OMFS_SURGEONS: Consultant[] = [];
const ORTHO_SURGEONS: Consultant[] = [];
const PLASTICS_SURGEONS: Consultant[] = [];
const RENAL_SURGEONS: Consultant[] = [];
const UROLOGY_SURGEONS: Consultant[] = [];
const VASCULAR_SURGEONS: Consultant[] = [];

const ALL_SURGEONS: Consultant[] = [];
const ANAESTHETISTS: Consultant[] = [];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function assignPriority(procedureName: string, complexity: number): Priority {
  const nameLower = procedureName.toLowerCase();

  // P1 - Emergency (life-threatening)
  if (nameLower.includes('rupture') || nameLower.includes('perforat') ||
      nameLower.includes('haemorrhage') || nameLower.includes('embolectomy')) {
    return 'P1';
  }

  // P2 - Urgent (within 72 hours)
  if (nameLower.includes('fracture') || nameLower.includes('trauma') ||
      nameLower.includes('acute') || nameLower.includes('emergency')) {
    return 'P2';
  }

  // P3 - Expedited (within 2 weeks - typically cancer)
  if (nameLower.includes('cancer') || nameLower.includes('malignant') ||
      nameLower.includes('oncology') || nameLower.includes('tumour')) {
    return 'P3';
  }

  // P4 - Routine (within 18 weeks)
  if (complexity >= 3 || nameLower.includes('arthroplasty') || nameLower.includes('joint')) {
    return 'P4';
  }

  // P5 - Scheduled (planned procedures)
  return 'P5';
}

function getSessionDetails(sessionType: SessionType, isEmergency: boolean): { start: string; end: string; maxPCS: number } {
  if (isEmergency) {
    // EMERGENCY is 24 hours continuous - extended sessions until 20:00
    if (sessionType === 'FULL' || sessionType === 'EXTENDED') {
      return { start: '08:00', end: '20:00', maxPCS: 40 };
    }
  }

  // Standard sessions
  if (sessionType === 'AM') {
    return { start: '08:00', end: '13:00', maxPCS: 15 };
  } else if (sessionType === 'PM') {
    return { start: '13:00', end: '18:00', maxPCS: 15 };
  } else if (sessionType === 'EVE') {
    return { start: '18:00', end: '22:00', maxPCS: 12 };
  } else if (sessionType === 'EXTENDED') {
    return { start: '08:00', end: '20:00', maxPCS: 40 };
  } else {
    // FULL
    return { start: '08:00', end: '18:00', maxPCS: 30 };
  }
}

function getWeekDate(year: number, week: number, dayIndex: number): Date {
  const firstDay = new Date(year, 0, 1);
  const daysToAdd = (week - 1) * 7 + dayIndex;
  const resultDate = new Date(firstDay);
  resultDate.setDate(firstDay.getDate() + daysToAdd);
  return resultDate;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isConsultantOnLeave(consultant: Consultant, weekNumber: number): boolean {
  // Distribute annual leave across the year
  const leaveWeeks = Math.ceil(consultant.annualLeaveDays / 5);
  const leaveInterval = Math.floor(52 / leaveWeeks);

  for (let i = 0; i < leaveWeeks; i++) {
    const leaveWeek = (i * leaveInterval) + 1;
    if (weekNumber === leaveWeek) {
      return true;
    }
  }

  return false;
}

function selectAvailableSurgeon(specialty: string, subspecialty: string | undefined, weekNumber: number, weekLists: Map<string, number>): Consultant | null {
  const availableSurgeons = ALL_SURGEONS.filter(s => {
    if (s.specialty !== specialty) return false;
    if (subspecialty && s.subspecialty !== subspecialty) return false;
    if (isConsultantOnLeave(s, weekNumber)) return false;

    const currentLists = weekLists.get(s.name) || 0;
    return currentLists < s.maxListsPerWeek;
  });

  if (availableSurgeons.length === 0) return null;

  // Select surgeon with fewest lists this week
  return availableSurgeons.reduce((prev, curr) => {
    const prevLists = weekLists.get(prev.name) || 0;
    const currLists = weekLists.get(curr.name) || 0;
    return currLists < prevLists ? curr : prev;
  });
}

function selectAvailableAnaesthetist(weekNumber: number, weekLists: Map<string, number>): Consultant {
  const available = ANAESTHETISTS.filter(a => {
    if (isConsultantOnLeave(a, weekNumber)) return false;
    const currentLists = weekLists.get(a.name) || 0;
    return currentLists < a.maxListsPerWeek;
  });

  if (available.length === 0) {
    // All busy, pick least busy
    return ANAESTHETISTS.reduce((prev, curr) => {
      const prevLists = weekLists.get(prev.name) || 0;
      const currLists = weekLists.get(curr.name) || 0;
      return currLists < prevLists ? curr : prev;
    });
  }

  // Select anaesthetist with fewest lists this week
  return available.reduce((prev, curr) => {
    const prevLists = weekLists.get(prev.name) || 0;
    const currLists = weekLists.get(curr.name) || 0;
    return currLists < prevLists ? curr : prev;
  });
}

function generateProcedureList(specialty: string, subspecialty: string | undefined, targetPCS: number): ProcedureWithPriority[] {
  const procedures: ProcedureWithPriority[] = [];
  let totalPCS = 0;

  // Get procedures for this specialty/subspecialty
  const specialtyProcs = SURGICAL_PROCEDURES_BY_SPECIALTY[specialty] || [];
  let availableProcs = specialtyProcs.filter(p => {
    if (!subspecialty) return true;
    return p.subspecialty === subspecialty;
  });

  if (availableProcs.length === 0) {
    availableProcs = specialtyProcs; // Fallback to all specialty procedures
  }

  if (availableProcs.length === 0) {
    console.warn(`No procedures found for ${specialty} - ${subspecialty}`);
    return procedures;
  }

  // Build list until we reach target PCS (aim for 85-95% utilisation)
  const minPCS = targetPCS * 0.85;
  const maxPCS = targetPCS * 0.95;

  while (totalPCS < minPCS && procedures.length < 20) {
    const randomProc = availableProcs[Math.floor(Math.random() * availableProcs.length)];
    const pcsScore = scoreProcedure(randomProc.name, randomProc.opcs4);

    if (totalPCS + pcsScore <= maxPCS) {
      const priority = assignPriority(randomProc.name, pcsScore);

      procedures.push({
        ...randomProc,
        priority,
        pcsScore,
        replaceable: priority === 'P5' || priority === 'P4', // P4 and P5 can be replaced
      });

      totalPCS += pcsScore;
    } else {
      // Try to find a smaller procedure to fill remaining capacity
      const remainingPCS = maxPCS - totalPCS;
      const smallerProc = availableProcs.find(p => {
        const score = scoreProcedure(p.name, p.opcs4);
        return score <= remainingPCS;
      });

      if (smallerProc) {
        const pcsScore = scoreProcedure(smallerProc.name, smallerProc.opcs4);
        const priority = assignPriority(smallerProc.name, pcsScore);

        procedures.push({
          ...smallerProc,
          priority,
          pcsScore,
          replaceable: priority === 'P5' || priority === 'P4',
        });

        totalPCS += pcsScore;
      } else {
        break;
      }
    }
  }

  return procedures;
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

function generateYearSchedulePool(): TheatreListTemplate[] {
  const pool: TheatreListTemplate[] = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Session type distribution (more FULL sessions, rare single sessions per day)
  const sessionTypeWeights: { [key: string]: SessionType[][] } = {
    // 4 out of 52 weeks have single session days (8%)
    'single': [
      ['FULL'], // Monday only
      ['FULL'], // Tuesday only
      ['FULL'], // Wednesday only
      ['FULL'], // Thursday only
    ],
    // Most weeks have multiple sessions per day
    'multi': [
      ['FULL', 'FULL', 'EXTENDED'], // 3 sessions
      ['FULL', 'FULL'], // 2 sessions
      ['AM', 'PM', 'EVE'], // 3 sessions across day
      ['FULL', 'EVE'], // 2 sessions
      ['EXTENDED', 'EVE'], // 2 sessions
      ['FULL', 'FULL', 'EVE'], // 3 sessions
    ]
  };

  console.log('🚀 Generating year-long schedule pool for 2025...\n');

  // Generate for 52 weeks
  for (let week = 1; week <= 52; week++) {
    const weekSurgeonLists = new Map<string, number>();
    const weekAnaesthetistLists = new Map<string, number>();

    // Decide if this is a single-session week (rare)
    const isSingleSessionWeek = week % 13 === 0; // 4 weeks out of 52

    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      const dayOfWeek = daysOfWeek[dayIndex];
      const date = getWeekDate(2025, week, dayIndex);

      // Select session pattern
      let sessionPattern: SessionType[];
      if (isSingleSessionWeek) {
        sessionPattern = sessionTypeWeights.single[Math.floor(Math.random() * sessionTypeWeights.single.length)];
      } else {
        sessionPattern = sessionTypeWeights.multi[Math.floor(Math.random() * sessionTypeWeights.multi.length)];
      }

      // Generate lists for each session
      for (const sessionType of sessionPattern) {
        // Randomly select specialty (weighted towards higher volume specialties)
        const specialtyWeights = [
          ...Array(3).fill('EMERGENCY'),
          ...Array(2).fill('ORTHOPAEDICS'),
          ...Array(2).fill('GENERAL SURGERY'),
          'ENT',
          'GYNAECOLOGY',
          'NEUROLOGY',
          'OPTHALMOLOGY',
          'ORAL AND MAXILLOFACIAL',
          'PLASTICS',
          'RENAL',
          'UROLOGY',
          'VASCULAR',
        ];

        const specialty = specialtyWeights[Math.floor(Math.random() * specialtyWeights.length)];

        // Get subspecialty based on specialty
        let subspecialty: string | undefined;
        const subspecialtyMap: { [key: string]: string[] } = {
          'ENT': ['ENT ROBOTIC', 'ENT LASER'],
          'GENERAL SURGERY': ['UPPER GASTROINTESTINAL', 'HEPATOBILIARY', 'HYPERTHERMIC INTRAPERITONEAL CHEMOTHERAPY', 'COLORECTAL'],
          'GYNAECOLOGY': ['GYNAE ROBOTIC', 'GYNAE FERTILITY'],
          'NEUROLOGY': ['NEURO-ONCOLOGY'],
          'ORAL AND MAXILLOFACIAL': ['OMFS TRAUMA', 'OMFS MANDIBLE', 'ORTHOGNATIC', 'DENTAL'],
          'ORTHOPAEDICS': ['ELECTIVE ORTHOPAEDIC JOINTS', 'ORTHOPAEDIC SPINE', 'ORTHOPAEDIC TRAUMA'],
          'PLASTICS': ['BURNS & BREAST', 'DEEP INFERIOR EPIGASTRIC PERFORATOR'],
          'RENAL': ['RENAL TRANSPLANT'],
          'UROLOGY': ['UROLOGY ROBOTIC', 'UROLOGY LASER'],
        };

        if (subspecialtyMap[specialty]) {
          const subs = subspecialtyMap[specialty];
          subspecialty = subs[Math.floor(Math.random() * subs.length)];
        }

        // Select surgeon and anaesthetist
        const surgeon = selectAvailableSurgeon(specialty, subspecialty, week, weekSurgeonLists);
        if (!surgeon) {
          console.warn(`⚠️  No available surgeons for ${specialty} - ${subspecialty || 'N/A'} (Week ${week}, ${dayOfWeek})`);
          continue;
        }

        const anaesthetist = selectAvailableAnaesthetist(week, weekAnaesthetistLists);

        // Update lists count
        weekSurgeonLists.set(surgeon.name, (weekSurgeonLists.get(surgeon.name) || 0) + 1);
        weekAnaesthetistLists.set(anaesthetist.name, (weekAnaesthetistLists.get(anaesthetist.name) || 0) + 1);

        // Get session details
        const isEmergency = specialty === 'EMERGENCY';
        const sessionDetails = getSessionDetails(sessionType, isEmergency);

        // Generate procedure list
        const procedures = generateProcedureList(specialty, subspecialty, sessionDetails.maxPCS);
        const totalPCS = procedures.reduce((sum, p) => sum + p.pcsScore, 0);

        // Create list
        const list: TheatreListTemplate = {
          id: `POOL-2025-W${String(week).padStart(2, '0')}-${dayOfWeek.substring(0, 3).toUpperCase()}-${sessionType}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          specialty,
          subspecialty,
          sessionType,
          procedures,
          totalPCS,
          maxPCS: sessionDetails.maxPCS,
          surgeon: surgeon.name,
          anaesthetist: anaesthetist.name,
          weekNumber: week,
          dayOfWeek,
          date: formatDate(date),
          sessionStart: sessionDetails.start,
          sessionEnd: sessionDetails.end,
        };

        pool.push(list);
      }
    }

    if (week % 10 === 0) {
      console.log(`✓ Generated week ${week}/52`);
    }
  }

  // Calculate statistics
  const totalLists = pool.length;
  const totalUtilisation = pool.reduce((sum, list) => sum + (list.totalPCS / list.maxPCS), 0);
  const avgUtilisation = (totalUtilisation / totalLists) * 100;
  const totalProcedures = pool.reduce((sum, list) => sum + list.procedures.length, 0);

  console.log(`\n✅ Pool generation complete!`);
  console.log(`📊 Statistics:`);
  console.log(`   Total lists: ${totalLists}`);
  console.log(`   Average utilisation: ${avgUtilisation.toFixed(1)}%`);
  console.log(`   Total procedures: ${totalProcedures}`);
  console.log(`   Specialties: ${new Set(pool.map(l => l.specialty)).size}`);

  return pool;
}

// =============================================================================
// EXECUTE AND SAVE
// =============================================================================

const pool = generateYearSchedulePool();

// Save to JSON file
import * as fs from 'fs';
const outputPath = './output/year_schedule_pool_2025.json';

// Ensure output directory exists
if (!fs.existsSync('./output')) {
  fs.mkdirSync('./output');
}

fs.writeFileSync(outputPath, JSON.stringify(pool, null, 2));
console.log(`\n💾 Pool saved to: ${outputPath}`);
console.log(`\n🔥 Ready to upload to Procedures Firebase!`);
