/**
 * Simple script to add sample waiting list patients
 * Creates patients with hardcoded surgeon references
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

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

async function getSampleSurgeon() {
  // Try to get any surgeon from the database
  const surgeonsSnap = await getDocs(query(collection(db, 'surgeons'), limit(1)));

  if (!surgeonsSnap.empty) {
    const doc = surgeonsSnap.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      name: `${data.title} ${data.firstName} ${data.lastName}`,
      specialtyId: data.specialtyId || data.specialties?.[0] || 'GEN001',
      specialtyName: data.specialtyName || 'GENERAL SURGERY',
      subspecialtyName: data.subspecialtyName,
      initials: data.initials || 'XX'
    };
  }

  return null;
}

async function addSamplePatients() {
  console.log('\n🏥 Adding sample waiting list patients...\n');

  try {
    // Try to get a surgeon
    const surgeon = await getSampleSurgeon();

    if (!surgeon) {
      console.error('❌ No surgeons found in database.');
      console.log('\n💡 Please add surgeons first through the app UI:');
      console.log('   1. Go to /admin/workforce');
      console.log('   2. Add some surgeons');
      console.log('   3. Run this script again\n');
      return;
    }

    console.log(`✅ Found surgeon: ${surgeon.name}`);
    console.log(`   Specialty: ${surgeon.specialtyName}\n`);

    const patients = [
      {
        firstName: 'John',
        lastName: 'Smith',
        age: 65,
        hospitalNumber: '123 456 7890',
        procedureName: 'Total Hip Replacement',
        procedureCode: 'W371',
        priority: 'Routine',
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName || '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        waitingDays: 45,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'waiting',
        isScheduled: false,
        notes: 'Sample patient for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Sarah',
        lastName: 'Jones',
        age: 58,
        hospitalNumber: '234 567 8901',
        procedureName: 'Total Knee Replacement',
        procedureCode: 'W401',
        priority: 'Expedited',
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName || '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        waitingDays: 60,
        targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'waiting',
        isScheduled: false,
        notes: 'Sample patient for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'David',
        lastName: 'Williams',
        age: 72,
        hospitalNumber: '345 678 9012',
        procedureName: 'Hip Fracture Fixation',
        procedureCode: 'W191',
        priority: 'Urgent',
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName || '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        waitingDays: 5,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'waiting',
        isScheduled: false,
        notes: 'Sample patient for testing - URGENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Emma',
        lastName: 'Brown',
        age: 45,
        hospitalNumber: '456 789 0123',
        procedureName: 'Arthroscopy Knee',
        procedureCode: 'W821',
        priority: 'Planned',
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName || '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        waitingDays: 30,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'waiting',
        isScheduled: false,
        notes: 'Sample patient for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Michael',
        lastName: 'Taylor',
        age: 68,
        hospitalNumber: '567 890 1234',
        procedureName: 'ACL Reconstruction',
        procedureCode: 'W853',
        priority: 'Routine',
        specialtyId: surgeon.specialtyId,
        specialtyName: surgeon.specialtyName,
        subspecialtyName: surgeon.subspecialtyName || '',
        consultantId: surgeon.id,
        consultantName: surgeon.name,
        referralDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        waitingDays: 50,
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'waiting',
        isScheduled: false,
        notes: 'Sample patient for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    console.log(`Adding ${patients.length} sample patients...\n`);

    for (const patient of patients) {
      await addDoc(collection(db, 'waitingList'), patient);
      console.log(`✅ Added: ${patient.firstName} ${patient.lastName} - ${patient.priority} - ${patient.procedureName}`);
    }

    console.log(`\n🎉 Successfully added ${patients.length} sample patients to waiting list!`);
    console.log('\n💡 Now you can:');
    console.log('   1. Go to /admin/schedule → Lists → Waiting List');
    console.log('   2. Click "Generate Procedures"');
    console.log('   3. View generated procedures in Procedures Pool tab\n');

  } catch (error) {
    console.error('❌ Error adding sample patients:', error);
  }
}

addSamplePatients()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
