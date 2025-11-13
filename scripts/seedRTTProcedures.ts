// Seed Script for RTT Procedures - Enterprise Trial Data
// Creates realistic RTT-tracked procedures with full pathway tracking
// Designed to showcase TOM's capabilities in presentations and trials

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { Procedure, RTTPriority, RTTPathway, PathwayStatus, ProcedureStatus } from '../lib/types/procedureTypes';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Realistic patient names
const firstNames = ['Sarah', 'John', 'Emma', 'Michael', 'Olivia', 'James', 'Sophia', 'William', 'Isabella', 'David', 'Charlotte', 'Robert', 'Amelia', 'Thomas', 'Ava', 'Daniel', 'Emily', 'Matthew', 'Mia', 'Andrew'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris'];

// Realistic NHS procedure scenarios
const procedureScenarios = [
  // Orthopaedics
  { name: 'Total Hip Replacement', opcs: 'W371', specialty: 'Orthopaedics', subspecialty: 'Hip & Knee', duration: 90, complexity: 'Major' },
  { name: 'Total Hip Arthroplasty', opcs: 'W371', specialty: 'Orthopaedics', subspecialty: 'Hip & Knee', duration: 90, complexity: 'Major' },
  { name: 'Total Knee Replacement', opcs: 'W402', specialty: 'Orthopaedics', subspecialty: 'Hip & Knee', duration: 90, complexity: 'Major' },
  { name: 'Revision Hip Replacement', opcs: 'W381', specialty: 'Orthopaedics', subspecialty: 'Hip & Knee', duration: 180, complexity: 'Complex Major' },
  { name: 'Knee Arthroscopy', opcs: 'O291', specialty: 'Orthopaedics', subspecialty: 'Knee', duration: 45, complexity: 'Intermediate' },
  { name: 'Shoulder Arthroscopy', opcs: 'O211', specialty: 'Orthopaedics', subspecialty: 'Shoulder', duration: 60, complexity: 'Intermediate' },
  { name: 'Carpal Tunnel Decompression', opcs: 'A651', specialty: 'Orthopaedics', subspecialty: 'Hand', duration: 30, complexity: 'Minor' },

  // General Surgery
  { name: 'Laparoscopic Cholecystectomy', opcs: 'J181', specialty: 'General Surgery', subspecialty: 'Upper GI', duration: 60, complexity: 'Intermediate' },
  { name: 'Inguinal Hernia Repair', opcs: 'T202', specialty: 'General Surgery', subspecialty: 'Hernia', duration: 45, complexity: 'Intermediate' },
  { name: 'Appendicectomy', opcs: 'H011', specialty: 'General Surgery', subspecialty: 'Colorectal', duration: 60, complexity: 'Intermediate' },
  { name: 'Right Hemicolectomy', opcs: 'H071', specialty: 'General Surgery', subspecialty: 'Colorectal', duration: 180, complexity: 'Major' },

  // Urology
  { name: 'Transurethral Resection of Prostate', opcs: 'M421', specialty: 'Urology', subspecialty: null, duration: 60, complexity: 'Intermediate' },
  { name: 'Cystoscopy', opcs: 'M451', specialty: 'Urology', subspecialty: null, duration: 20, complexity: 'Minor' },
  { name: 'Nephrectomy', opcs: 'M021', specialty: 'Urology', subspecialty: null, duration: 180, complexity: 'Major' },

  // Gynaecology
  { name: 'Total Abdominal Hysterectomy', opcs: 'Q071', specialty: 'Gynaecology', subspecialty: null, duration: 120, complexity: 'Major' },
  { name: 'Laparoscopic Hysterectomy', opcs: 'Q072', specialty: 'Gynaecology', subspecialty: null, duration: 90, complexity: 'Major' },
  { name: 'Diagnostic Laparoscopy', opcs: 'Y752', specialty: 'Gynaecology', subspecialty: null, duration: 30, complexity: 'Minor' },

  // ENT
  { name: 'Tonsillectomy', opcs: 'F341', specialty: 'ENT', subspecialty: null, duration: 45, complexity: 'Intermediate' },
  { name: 'Septoplasty', opcs: 'E021', specialty: 'ENT', subspecialty: null, duration: 60, complexity: 'Intermediate' },

  // Ophthalmology
  { name: 'Cataract Surgery', opcs: 'C711', specialty: 'Ophthalmology', subspecialty: null, duration: 30, complexity: 'Minor' }
];

// Generate random date in past
function getRandomPastDate(minDaysAgo: number, maxDaysAgo: number): Date {
  const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Calculate RTT target based on priority
function calculateRTTTarget(priority: RTTPriority, clockStart: Date): Date {
  const targets = {
    'P1': 3,
    'P2': 14,
    'P3': 84,
    'P4': 126,
    'Planned': 180
  };

  const targetDate = new Date(clockStart);
  targetDate.setDate(targetDate.getDate() + targets[priority]);
  return targetDate;
}

// Generate realistic RTT procedure
function generateRTTProcedure(index: number): Omit<Procedure, 'id'> {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const scenario = procedureScenarios[Math.floor(Math.random() * procedureScenarios.length)];

  // Priority distribution (realistic NHS mix)
  const rand = Math.random();
  let priority: RTTPriority;
  let pathway: RTTPathway;

  if (rand < 0.05) {
    priority = 'P1';
    pathway = 'Emergency';
  } else if (rand < 0.15) {
    priority = 'P2';
    pathway = Math.random() < 0.5 ? 'Cancer' : 'RTT';
  } else if (rand < 0.35) {
    priority = 'P3';
    pathway = 'RTT';
  } else if (rand < 0.85) {
    priority = 'P4';
    pathway = 'RTT';
  } else {
    priority = 'Planned';
    pathway = 'Planned';
  }

  // Generate dates based on priority
  let daysAgo: number;
  if (priority === 'P1') daysAgo = Math.floor(Math.random() * 5);
  else if (priority === 'P2') daysAgo = Math.floor(Math.random() * 20) + 5;
  else if (priority === 'P3') daysAgo = Math.floor(Math.random() * 100) + 10;
  else if (priority === 'P4') daysAgo = Math.floor(Math.random() * 150) + 20;
  else daysAgo = Math.floor(Math.random() * 100);

  const referralDate = getRandomPastDate(daysAgo + 5, daysAgo + 10);
  const clockStartDate = getRandomPastDate(daysAgo, daysAgo + 2);
  const targetDate = calculateRTTTarget(priority, clockStartDate);

  const now = new Date();
  const daysWaiting = Math.floor((now.getTime() - clockStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToTarget = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isBreached = daysToTarget < 0;

  // Some procedures are already scheduled (20%)
  const isScheduled = Math.random() < 0.2;

  const procedure: Omit<Procedure, 'id'> = {
    hospitalNumber: `NHS${String(1000000 + index).padStart(7, '0')}`,
    patientName: `${firstName} ${lastName}`,
    dateOfBirth: getRandomPastDate(365 * 30, 365 * 80).toISOString().split('T')[0],
    age: Math.floor(Math.random() * 60) + 20,
    gender: Math.random() < 0.5 ? 'Female' : 'Male',

    procedureName: scenario.name,
    standardProcedureName: scenario.name,
    opcsCode: scenario.opcs,
    specialty: scenario.specialty,
    subspecialty: scenario.subspecialty,
    surgeonId: `surgeon-${Math.floor(Math.random() * 10) + 1}`,
    surgeonName: `${Math.random() < 0.8 ? 'Mr' : 'Ms'} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,

    pathway,
    priority,

    referralDate,
    clockStartDate,
    targetDate,
    daysWaiting,
    daysToTarget,
    isBreached,

    pathwayStatus: 'Active' as PathwayStatus,
    schedulingStatus: isScheduled ? 'Scheduled' : 'Awaiting',

    laterality: ['Left', 'Right', 'Bilateral', 'N/A'][Math.floor(Math.random() * 4)] as any,

    estimatedDuration: scenario.duration,
    complexity: scenario.complexity as any,
    anaestheticType: scenario.complexity === 'Minor' ? 'LA' : 'GA',

    staffRequired: {
      anaesthetists: scenario.complexity === 'Complex Major' ? 2 : 1,
      anaesthetistGrade: 'Consultant',
      scrubNurses: scenario.complexity === 'Minor' ? 1 : 2,
      scrubNurseGrade: scenario.complexity === 'Major' || scenario.complexity === 'Complex Major' ? 'Band 6' : 'Band 5',
      odps: scenario.complexity === 'Major' || scenario.complexity === 'Complex Major' ? 1 : 0,
      odpGrade: 'Band 5',
      hcas: scenario.complexity === 'Minor' ? 1 : 0,
      hcaGrade: 'Band 3'
    },

    createdAt: referralDate,
    createdBy: 'System Admin',
    updatedAt: new Date(),
    updatedBy: 'System Admin'
  };

  return procedure;
}

// Main seed function
async function seedRTTProcedures(count: number = 100) {
  console.log(`🚀 Starting seed: Generating ${count} RTT procedures...`);

  try {
    const procedures = [];

    for (let i = 0; i < count; i++) {
      const procedure = generateRTTProcedure(i);
      procedures.push(procedure);

      if ((i + 1) % 10 === 0) {
        console.log(`✅ Generated ${i + 1}/${count} procedures...`);
      }
    }

    console.log(`💾 Saving ${count} procedures to Firebase...`);

    let saved = 0;
    for (const procedure of procedures) {
      await addDoc(collection(db, 'procedures'), procedure);
      saved++;

      if (saved % 10 === 0) {
        console.log(`💾 Saved ${saved}/${count} procedures...`);
      }
    }

    console.log(`\n✅ SUCCESS! Seeded ${count} RTT procedures`);
    console.log(`\n📊 Distribution:`);
    console.log(`   P1 (Urgent): ${procedures.filter(p => p.priority === 'P1').length}`);
    console.log(`   P2 (Cancer/Urgent): ${procedures.filter(p => p.priority === 'P2').length}`);
    console.log(`   P3 (Soon): ${procedures.filter(p => p.priority === 'P3').length}`);
    console.log(`   P4 (Routine): ${procedures.filter(p => p.priority === 'P4').length}`);
    console.log(`   Planned: ${procedures.filter(p => p.priority === 'Planned').length}`);
    console.log(`\n⚠️  Breached: ${procedures.filter(p => p.isBreached).length}`);
    console.log(`⚡ At Risk (< 7 days): ${procedures.filter(p => !p.isBreached && p.daysToTarget <= 7).length}`);
    console.log(`✅ Scheduled: ${procedures.filter(p => p.schedulingStatus === 'Scheduled').length}`);

  } catch (error) {
    console.error('❌ Error seeding procedures:', error);
    throw error;
  }
}

// Run seed
const procedureCount = parseInt(process.argv[2]) || 100;
seedRTTProcedures(procedureCount)
  .then(() => {
    console.log('\n🎉 Seed complete! TOM is ready for trial presentations!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
