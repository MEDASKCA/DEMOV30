/**
 * Setup Anaesthetists Collection
 * Populates Firestore with anaesthetist data for Royal London Hospital
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWzAZiMVlGU1h7CLZRR1Qc-0BxKkIDNW4",
  authDomain: "medaskca-93d48.firebaseapp.com",
  projectId: "medaskca-93d48",
  storageBucket: "medaskca-93d48.firebasestorage.app",
  messagingSenderId: "830746933399",
  appId: "1:830746933399:web:b94a042718d64989f7d1d2",
  measurementId: "G-ETHE315F6E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HOSPITAL_ID = 'royal-london';

// Generate 50 anaesthetists
const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Rachel', 'James', 'Lisa', 'Andrew', 'Sophie', 'Christopher',
  'Emma', 'Daniel', 'Olivia', 'Matthew', 'Jessica', 'Thomas', 'Hannah', 'Joshua', 'Amy', 'Ryan',
  'Laura', 'Benjamin', 'Charlotte', 'Samuel', 'Rebecca', 'Alexander', 'Grace', 'William', 'Victoria', 'Joseph',
  'Elizabeth', 'Nicholas', 'Sophia', 'Jacob', 'Natalie', 'Ethan', 'Isabella', 'Lucas', 'Mia', 'Mason',
  'Abigail', 'Logan', 'Ava', 'Oliver', 'Madison', 'Liam', 'Chloe', 'Noah', 'Ella', 'Elijah'];

const lastNames = ['Johnson', 'Chen', 'Roberts', 'Williams', 'Patel', 'Thompson', 'Anderson', 'Kumar', 'Martin', 'Lee',
  'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott',
  'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips',
  'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed'];

const ANAESTHETISTS: any[] = [];

for (let i = 0; i < 50; i++) {
  const firstName = firstNames[i];
  const lastName = lastNames[i];
  const title = 'Dr';
  const initials = firstName[0] + lastName[0];

  ANAESTHETISTS.push({
    id: `anaes-${i + 1}`.padStart(12, '0'),
    firstName,
    lastName,
    title,
    fullName: `${title} ${firstName} ${lastName}`,
    initials,
    specialty: 'Anaesthetics',
    hospitalId: HOSPITAL_ID,
    status: 'active',
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@royallondon.nhs.uk`,
    phone: `020 7377 ${String(7000 + i).padStart(4, '0')}`,
    grade: i < 10 ? 'Consultant' : i < 30 ? 'Registrar' : 'SHO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

async function setupAnaesthetists() {
  console.log('💉 Setting up Anaesthetists for Royal London Hospital...\n');

  try {
    // Create anaesthetists
    console.log('👨‍⚕️ Creating Anaesthetists...');
    for (const anaes of ANAESTHETISTS) {
      await setDoc(doc(db, 'anaesthetists', anaes.id), anaes);
      console.log(`   ✅ Created: ${anaes.fullName} (${anaes.grade})`);
    }
    console.log(`✅ Created ${ANAESTHETISTS.length} anaesthetists\n`);

    // Verify
    console.log('🔍 Verifying...');
    const anaesSnap = await getDocs(collection(db, 'anaesthetists'));
    console.log(`   📊 Total Anaesthetists: ${anaesSnap.size}`);

    const gradeCount: Record<string, number> = {};
    anaesSnap.forEach(doc => {
      const grade = doc.data().grade || 'Unknown';
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });

    console.log('   By Grade:');
    Object.entries(gradeCount).forEach(([grade, count]) => {
      console.log(`      - ${grade}: ${count}`);
    });

    console.log('\n🎉 Anaesthetists Setup Complete!');
    console.log(`   - ${ANAESTHETISTS.length} anaesthetists created`);
    console.log(`   - Ready for auto-scheduling!`);

  } catch (error) {
    console.error('❌ Error setting up anaesthetists:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupAnaesthetists();
