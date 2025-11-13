/**
 * Generate Waiting List from Existing Surgeon and Procedure Data
 * Creates procedures waiting to be scheduled from existing surgeons
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, limit as limitQuery } from 'firebase/firestore';

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

// UK first and last names
const FIRST_NAMES = ['John', 'Sarah', 'David', 'Emma', 'Michael', 'Lisa', 'James', 'Rebecca', 'William', 'Anna', 'Thomas', 'Sophie', 'George', 'Emily', 'Charles'];
const LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Johnson', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson'];

const PRIORITIES = ['Urgent', 'Expedited', 'Routine', 'Planned'];

function generateNHSNumber(): string {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
  return `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')} ${digits.slice(6).join('')}`;
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateWaitingList(count: number = 50) {
  console.log('\n🏥 Generating Waiting List from Existing Data\n');
  console.log('═'.repeat(50));

  try {
    // 1. Fetch all surgeons
    console.log('\n📋 Loading surgeons...');
    const surgeonsSnap = await getDocs(collection(db, 'surgeons'));

    if (surgeonsSnap.empty) {
      console.error('\n❌ No surgeons found!');
      console.log('\n💡 Please add surgeons first:');
      console.log('   1. Go to /admin/workforce or /admin/schedule → Surgeons');
      console.log('   2. Add some surgeons');
      console.log('   3. Run this script again\n');
      return;
    }

    const surgeons = surgeonsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: `${data.title || 'Mr'} ${data.firstName} ${data.lastName}`,
        initials: data.initials || 'XX',
        specialtyId: data.specialtyId || data.specialties?.[0] || '',
        specialtyName: data.specialtyName || 'GENERAL SURGERY',
        subspecialtyName: data.subspecialtyName || ''
      };
    });

    console.log(`✅ Found ${surgeons.length} surgeons`);

    // 2. Fetch procedures for each surgeon's specialty
    console.log('\n📋 Loading procedures...');
    const proceduresSnap = await getDocs(collection(db, 'procedures'));

    if (proceduresSnap.empty) {
      console.error('\n❌ No procedures found!');
      console.log('\n💡 The procedures database seems empty.');
      console.log('   Creating basic procedures for demonstration...\n');
    }

    const proceduresBySpecialty: Record<string, Array<{code: string, name: string}>> = {};

    proceduresSnap.forEach(doc => {
      const data = doc.data();
      const specialty = data.specialtyName || '';
      if (!proceduresBySpecialty[specialty]) {
        proceduresBySpecialty[specialty] = [];
      }
      proceduresBySpecialty[specialty].push({
        code: data.code || 'XXXX',
        name: data.name || data.description || 'Unknown Procedure'
      });
    });

    console.log(`✅ Found procedures for ${Object.keys(proceduresBySpecialty).length} specialties`);

    // 3. Generate waiting list patients
    console.log(`\n📋 Generating ${count} waiting list patients...\n`);

    let generated = 0;
    const patientsToCreate = [];

    for (let i = 0; i < count; i++) {
      // Pick a random surgeon
      const surgeon = randomItem(surgeons);

      // Get procedures for this surgeon's specialty
      const procedures = proceduresBySpecialty[surgeon.specialtyName] || [];

      let procedureCode = 'W371';
      let procedureName = 'Total Hip Replacement';

      if (procedures.length > 0) {
        const proc = randomItem(procedures);
        procedureCode = proc.code;
        procedureName = proc.name;
      }

      // Generate priority and waiting time
      const priority = randomItem(PRIORITIES);
      let waitingDays: number;
      let targetDays: number;

      switch (priority) {
        case 'Urgent':
          waitingDays = Math.floor(Math.random() * 14) + 1;
          targetDays = Math.floor(Math.random() * 7) + 1;
          break;
        case 'Expedited':
          waitingDays = Math.floor(Math.random() * 30) + 14;
          targetDays = Math.floor(Math.random() * 30) + 7;
          break;
        case 'Routine':
          waitingDays = Math.floor(Math.random() * 90) + 30;
          targetDays = Math.floor(Math.random() * 60) + 30;
          break;
        case 'Planned':
        default:
          waitingDays = Math.floor(Math.random() * 180) + 60;
          targetDays = Math.floor(Math.random() * 90) + 90;
          break;
      }

      const referralDate = new Date(Date.now() - waitingDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const targetDate = new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const patient = {
        firstName: randomItem(FIRST_NAMES),
        lastName: randomItem(LAST_NAMES),
        age: Math.floor(Math.random() * 60) + 20,
        hospitalNumber: generateNHSNumber(),
        procedureName,
        procedureCode,
        priority,
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName,
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate,
        waitingDays,
        targetDate,
        status: 'waiting',
        isScheduled: false,
        notes: `Generated waiting list patient - ${priority} priority`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      patientsToCreate.push(patient);
    }

    // 4. Save to Firebase
    console.log('💾 Saving to Firebase...\n');

    for (const patient of patientsToCreate) {
      await addDoc(collection(db, 'waitingList'), patient);
      generated++;

      if (generated % 10 === 0) {
        console.log(`   ✅ Saved ${generated}/${count} patients...`);
      }
    }

    console.log('\n═'.repeat(50));
    console.log(`🎉 Successfully generated ${generated} waiting list patients!`);
    console.log('═'.repeat(50));

    // Summary
    console.log('\n📊 Summary:');
    const byPriority = patientsToCreate.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byPriority).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });

    console.log('\n💡 Next Steps:');
    console.log('   1. Go to /admin/schedule → Lists → Waiting List');
    console.log('   2. You should see all the patients');
    console.log('   3. Click "Generate Procedures" to process them');
    console.log('   4. View in Procedures Pool tab\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

// Get count from command line or default to 50
const count = process.argv[2] ? parseInt(process.argv[2]) : 50;

generateWaitingList(count)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
