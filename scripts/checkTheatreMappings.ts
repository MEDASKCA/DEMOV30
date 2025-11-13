/**
 * Check theatre-level specialty mappings
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
  console.log('🔍 Checking theatre-level specialty mappings...\n');

  try {
    // Check specialtyTheatreMappings collection
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`Found ${mappingsSnap.size} specialty mappings\n`);

    mappingsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`Mapping: ${doc.id}`);
      console.log(`  Specialty: ${data.specialtyName}${data.subspecialtyName ? ' - ' + data.subspecialtyName : ''}`);
      console.log(`  Unit: ${data.unitName} (${data.unitId})`);
      console.log(`  Theatre: ${data.theatreName || 'N/A'} (${data.theatreId || 'N/A'})`);
      console.log(`  Priority: ${data.priority}`);
      console.log(`  Days: ${data.daysOfWeek?.join(', ') || 'all'}`);
      console.log(`  Sessions: ${data.sessions?.join(', ') || 'all'}`);
      console.log('');
    });

    // Also check if there's a separate theatreSpecialtyMappings collection
    console.log('\n🔍 Checking for theatreSpecialtyMappings collection...\n');
    const theatreMappingsSnap = await getDocs(collection(db, 'theatreSpecialtyMappings'));
    console.log(`Found ${theatreMappingsSnap.size} theatre-specific mappings\n`);

    if (theatreMappingsSnap.size > 0) {
      theatreMappingsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Mapping: ${doc.id}`);
        console.log(`  Theatre: ${data.theatreName} (${data.theatreId})`);
        console.log(`  Specialty: ${data.specialtyName}`);
        console.log(`  Priority: ${data.priority}`);
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
