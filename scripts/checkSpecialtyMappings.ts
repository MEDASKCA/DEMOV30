/**
 * Check specialty-theatre mappings
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function checkMappings() {
  console.log('🔍 Checking specialty-theatre mappings...\n');

  try {
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`Found ${mappingsSnap.size} mappings\n`);

    // Group by unit
    const byUnit: any = {};

    mappingsSnap.forEach(doc => {
      const data = doc.data();
      const unitId = data.unitId || 'unknown';
      if (!byUnit[unitId]) {
        byUnit[unitId] = [];
      }
      byUnit[unitId].push({
        id: doc.id,
        specialty: data.specialtyName,
        subspecialty: data.subspecialtyName,
        unitName: data.unitName,
        priority: data.priority,
        daysOfWeek: data.daysOfWeek,
        sessions: data.sessions
      });
    });

    // Display by unit
    for (const [unitId, mappings] of Object.entries(byUnit)) {
      console.log(`\n📍 Unit: ${unitId}`);
      console.log(`   Unit Name: ${(mappings as any)[0].unitName}`);
      console.log(`   Number of mappings: ${(mappings as any).length}\n`);

      (mappings as any).forEach((m: any, idx: number) => {
        console.log(`   ${idx + 1}. ${m.specialty}${m.subspecialty ? ' - ' + m.subspecialty : ''}`);
        console.log(`      Priority: ${m.priority}`);
        console.log(`      Days: ${m.daysOfWeek?.join(', ') || 'all'}`);
        console.log(`      Sessions: ${m.sessions?.join(', ') || 'all'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMappings();
