/**
 * Show Theatre Units and Mappings for royal-london-hospital
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

async function showData() {
  console.log('📊 Theatre Units and Mappings for royal-london-hospital...\n');

  try {
    // Get theatre units
    const unitsQ = query(
      collection(db, 'theatreUnits'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const unitsSnap = await getDocs(unitsQ);

    console.log(`📍 Theatre Units: ${unitsSnap.size}`);
    unitsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`   ${doc.id}: ${data.name} (${data.numberOfTheatres} theatres)`);
    });

    // Get theatres
    const theatresQ = query(
      collection(db, 'theatres'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const theatresSnap = await getDocs(theatresQ);
    console.log(`\n🏛️  Theatres: ${theatresSnap.size}`);

    // Get specialty mappings
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);
    console.log(`\n🗺️  Specialty Mappings: ${mappingsSnap.size}`);
    mappingsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.specialtyName} → ${data.unitName || data.unitId}`);
    });

    // Get consultants
    const consultantsQ = query(
      collection(db, 'surgeons'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const consultantsSnap = await getDocs(consultantsQ);
    console.log(`\n👨‍⚕️  Consultants: ${consultantsSnap.size}`);

    // Group by specialty
    const bySpecialty: { [key: string]: number } = {};
    consultantsSnap.forEach(doc => {
      const data = doc.data();
      const spec = data.specialty || 'UNKNOWN';
      bySpecialty[spec] = (bySpecialty[spec] || 0) + 1;
    });

    Object.entries(bySpecialty).sort().forEach(([spec, count]) => {
      console.log(`   ${spec}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

showData();
