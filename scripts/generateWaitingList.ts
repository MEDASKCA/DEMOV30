/**
 * Waiting List Generator for Demo Mode
 * Generates realistic waiting list patients with varying priorities and waiting times
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// UK-appropriate first names
const FIRST_NAMES = [
  // Female
  'Amelia', 'Olivia', 'Emily', 'Isla', 'Ava', 'Sophie', 'Grace', 'Ella', 'Lily', 'Freya',
  'Charlotte', 'Jessica', 'Mia', 'Lucy', 'Evie', 'Ruby', 'Sienna', 'Poppy', 'Isabella', 'Daisy',
  'Chloe', 'Alice', 'Rosie', 'Hannah', 'Layla', 'Maya', 'Bethany', 'Zara', 'Imogen', 'Jasmine',
  'Aisha', 'Zainab', 'Fatima', 'Maryam', 'Nour', 'Aaliyah', 'Priya', 'Anaya', 'Sara', 'Zahra',
  // Male
  'Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar',
  'James', 'William', 'Joshua', 'Alfie', 'Henry', 'Leo', 'Archie', 'Ethan', 'Joseph', 'Freddie',
  'Samuel', 'Alexander', 'Logan', 'Daniel', 'Isaac', 'Max', 'Mohammed', 'Benjamin', 'Lucas', 'Adam',
  'Ahmed', 'Ali', 'Omar', 'Yusuf', 'Ibrahim', 'Hamza', 'Hassan', 'Abdullah', 'Arjun', 'Dev'
];

// UK-appropriate last names
const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
  'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright',
  'Green', 'Hall', 'Clarke', 'Hughes', 'Edwards', 'Hill', 'Moore', 'Clark', 'Harrison', 'Scott',
  'Khan', 'Ahmed', 'Ali', 'Hussain', 'Shah', 'Malik', 'Iqbal', 'Rahman', 'Patel', 'Singh',
  'Kumar', 'Sharma', 'Kaur', 'Chen', 'Wong', 'Liu', 'Yang', 'Rodriguez', 'Garcia', 'Martinez'
];

// Generate NHS hospital number
function generateNHSNumber(): string {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
  return `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')} ${digits.slice(6).join('')}`;
}

// Common surgical procedures by specialty
const PROCEDURES_BY_SPECIALTY: { [key: string]: Array<{ name: string; code: string; priority: string[] }> } = {
  'General Surgery': [
    { name: 'Laparoscopic Cholecystectomy', code: 'J183', priority: ['Routine', 'Expedited'] },
    { name: 'Hernia Repair', code: 'T201', priority: ['Routine', 'Planned'] },
    { name: 'Appendicectomy', code: 'H011', priority: ['Urgent', 'Expedited'] },
    { name: 'Colorectal Resection', code: 'H062', priority: ['Expedited', 'Routine'] },
    { name: 'Gastrectomy', code: 'G272', priority: ['Expedited', 'Urgent'] }
  ],
  'Orthopaedics': [
    { name: 'Total Hip Replacement', code: 'W371', priority: ['Routine', 'Expedited'] },
    { name: 'Total Knee Replacement', code: 'W401', priority: ['Routine', 'Expedited'] },
    { name: 'Arthroscopy Knee', code: 'W821', priority: ['Routine', 'Planned'] },
    { name: 'ACL Reconstruction', code: 'W853', priority: ['Expedited', 'Routine'] },
    { name: 'Hip Fracture Fixation', code: 'W191', priority: ['Urgent', 'Expedited'] }
  ],
  'Gynaecology': [
    { name: 'Hysterectomy', code: 'Q072', priority: ['Expedited', 'Routine'] },
    { name: 'Laparoscopic Cystectomy', code: 'Q531', priority: ['Routine', 'Expedited'] },
    { name: 'Endometrial Ablation', code: 'Q161', priority: ['Routine', 'Planned'] },
    { name: 'Myomectomy', code: 'Q092', priority: ['Expedited', 'Routine'] }
  ],
  'Urology': [
    { name: 'TURP', code: 'M651', priority: ['Routine', 'Expedited'] },
    { name: 'Cystoscopy', code: 'M451', priority: ['Routine', 'Planned'] },
    { name: 'Nephrectomy', code: 'M021', priority: ['Urgent', 'Expedited'] },
    { name: 'Prostatectomy', code: 'M611', priority: ['Expedited', 'Routine'] }
  ],
  'ENT': [
    { name: 'Tonsillectomy', code: 'F341', priority: ['Routine', 'Expedited'] },
    { name: 'Septoplasty', code: 'E101', priority: ['Routine', 'Planned'] },
    { name: 'Thyroidectomy', code: 'B081', priority: ['Expedited', 'Urgent'] },
    { name: 'Mastoidectomy', code: 'D151', priority: ['Expedited', 'Routine'] }
  ],
  'Ophthalmology': [
    { name: 'Cataract Surgery', code: 'C711', priority: ['Routine', 'Planned'] },
    { name: 'Vitrectomy', code: 'C591', priority: ['Urgent', 'Expedited'] },
    { name: 'Glaucoma Surgery', code: 'C641', priority: ['Expedited', 'Routine'] },
    { name: 'Retinal Detachment Repair', code: 'C561', priority: ['Urgent', 'Expedited'] }
  ],
  'Vascular': [
    { name: 'Varicose Vein Surgery', code: 'L851', priority: ['Routine', 'Planned'] },
    { name: 'Carotid Endarterectomy', code: 'L291', priority: ['Urgent', 'Expedited'] },
    { name: 'AAA Repair', code: 'L271', priority: ['Urgent', 'Expedited'] },
    { name: 'AV Fistula Creation', code: 'L743', priority: ['Expedited', 'Routine'] }
  ],
  'OMFS': [
    { name: 'Wisdom Teeth Extraction', code: 'F091', priority: ['Routine', 'Planned'] },
    { name: 'Jaw Fracture Fixation', code: 'V481', priority: ['Urgent', 'Expedited'] },
    { name: 'TMJ Surgery', code: 'V521', priority: ['Expedited', 'Routine'] }
  ]
};

type Priority = 'Urgent' | 'Expedited' | 'Routine' | 'Planned';

// Generate random date in the past (waiting days)
function generateWaitingDate(minDays: number, maxDays: number): { date: string; days: number } {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return {
    date: date.toISOString().split('T')[0],
    days
  };
}

// Generate target date based on priority
function generateTargetDate(priority: Priority): string {
  const today = new Date();
  let daysAhead: number;

  switch (priority) {
    case 'Urgent':
      daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days
      break;
    case 'Expedited':
      daysAhead = Math.floor(Math.random() * 30) + 14; // 14-44 days
      break;
    case 'Routine':
      daysAhead = Math.floor(Math.random() * 60) + 30; // 30-90 days
      break;
    case 'Planned':
      daysAhead = Math.floor(Math.random() * 90) + 90; // 90-180 days
      break;
  }

  today.setDate(today.getDate() + daysAhead);
  return today.toISOString().split('T')[0];
}

// Get random item from array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function fetchSpecialties() {
  try {
    const specialtiesSnap = await getDocs(collection(db, 'specialties'));
    const specialties: Array<{ id: string; name: string }> = [];

    specialtiesSnap.forEach(doc => {
      specialties.push({ id: doc.id, name: doc.data().name });
    });

    return specialties;
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return [];
  }
}

async function fetchSurgeons() {
  try {
    const surgeonsSnap = await getDocs(collection(db, 'surgeons'));
    const surgeons: Array<{ id: string; name: string; specialtyId: string; initials: string }> = [];

    surgeonsSnap.forEach(doc => {
      const data = doc.data();
      surgeons.push({
        id: doc.id,
        name: `${data.title} ${data.firstName} ${data.lastName}`,
        specialtyId: data.specialties?.[0] || '',
        initials: data.initials || ''
      });
    });

    return surgeons;
  } catch (error) {
    console.error('Error fetching surgeons:', error);
    return [];
  }
}

async function generateWaitingListPatients(count: number = 50) {
  console.log(`🏥 Generating ${count} waiting list patients...`);

  try {
    // Fetch specialties and surgeons from Firebase
    const specialties = await fetchSpecialties();
    const surgeons = await fetchSurgeons();

    if (specialties.length === 0 || surgeons.length === 0) {
      console.error('❌ No specialties or surgeons found in database. Please seed them first.');
      return;
    }

    console.log(`✅ Found ${specialties.length} specialties and ${surgeons.length} surgeons`);

    const patients = [];
    const usedNHSNumbers = new Set<string>();

    for (let i = 0; i < count; i++) {
      // Generate unique NHS number
      let nhsNumber: string;
      do {
        nhsNumber = generateNHSNumber();
      } while (usedNHSNumbers.has(nhsNumber));
      usedNHSNumbers.add(nhsNumber);

      // Select random specialty
      const specialty = randomItem(specialties);
      const specialtyName = specialty.name;

      // Find surgeons for this specialty
      const specialtySurgeons = surgeons.filter(s => s.specialtyId === specialty.id);
      const surgeon = specialtySurgeons.length > 0
        ? randomItem(specialtySurgeons)
        : randomItem(surgeons);

      // Get procedures for this specialty
      const proceduresForSpecialty = PROCEDURES_BY_SPECIALTY[specialtyName] ||
        PROCEDURES_BY_SPECIALTY['General Surgery'];

      const procedure = randomItem(proceduresForSpecialty);
      const priority = randomItem(procedure.priority) as Priority;

      // Generate waiting time based on priority
      let waitingRange: [number, number];
      switch (priority) {
        case 'Urgent':
          waitingRange = [1, 30];
          break;
        case 'Expedited':
          waitingRange = [14, 90];
          break;
        case 'Routine':
          waitingRange = [30, 180];
          break;
        case 'Planned':
          waitingRange = [60, 365];
          break;
      }

      const waitingInfo = generateWaitingDate(waitingRange[0], waitingRange[1]);

      const patient = {
        // Demographics
        firstName: randomItem(FIRST_NAMES),
        lastName: randomItem(LAST_NAMES),
        hospitalNumber: nhsNumber,
        age: Math.floor(Math.random() * 70) + 18, // 18-88 years

        // Medical
        procedureName: procedure.name,
        procedureCode: procedure.code,
        priority: priority,

        // Specialty & Consultant
        specialtyId: specialty.id,
        specialtyName: specialtyName,
        subspecialtyName: '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,

        // Dates
        referralDate: waitingInfo.date,
        waitingDays: waitingInfo.days,
        targetDate: generateTargetDate(priority),

        // Status
        status: 'waiting',
        isScheduled: false,
        notes: '',

        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      patients.push(patient);
    }

    // Upload to Firebase
    console.log('📤 Uploading to Firebase...');
    let successCount = 0;

    for (const patient of patients) {
      try {
        await addDoc(collection(db, 'waitingList'), patient);
        successCount++;

        if (successCount % 10 === 0) {
          console.log(`✅ Uploaded ${successCount}/${count} patients...`);
        }
      } catch (error) {
        console.error(`❌ Error uploading patient ${patient.hospitalNumber}:`, error);
      }
    }

    console.log(`\n🎉 Successfully generated ${successCount} waiting list patients!`);
    console.log(`\nPriority breakdown:`);
    const priorityCounts = {
      Urgent: patients.filter(p => p.priority === 'Urgent').length,
      Expedited: patients.filter(p => p.priority === 'Expedited').length,
      Routine: patients.filter(p => p.priority === 'Routine').length,
      Planned: patients.filter(p => p.priority === 'Planned').length
    };
    console.log(`  - Urgent: ${priorityCounts.Urgent}`);
    console.log(`  - Expedited: ${priorityCounts.Expedited}`);
    console.log(`  - Routine: ${priorityCounts.Routine}`);
    console.log(`  - Planned: ${priorityCounts.Planned}`);

  } catch (error) {
    console.error('❌ Error generating waiting list:', error);
  }
}

// Run the generator
const patientCount = parseInt(process.argv[2]) || 50;
generateWaitingListPatients(patientCount)
  .then(() => {
    console.log('\n✅ Waiting list generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
