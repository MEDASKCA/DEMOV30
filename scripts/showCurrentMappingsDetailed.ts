/**
 * Show Current Specialty-Theatre Mappings Detailed
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

async function showMappings() {
  console.log('🗺️  Current Specialty-Theatre Mappings for royal-london-hospital...\n');

  try {
    const q = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );

    const snapshot = await getDocs(q);
    console.log(`Total mappings: ${snapshot.size}\n`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📋 ${data.specialtyName || doc.id}`);
      console.log(`   unitId: ${data.unitId || 'NOT SET'}`);
      console.log(`   unitName: ${data.unitName || 'NOT SET'}`);

      if (data.theatres && Array.isArray(data.theatres)) {
        console.log(`   theatres field: ${data.theatres.length} theatre(s)`);
        data.theatres.forEach((t: any, idx: number) => {
          console.log(`      ${idx + 1}. ${t.theatreName} (priority: ${t.priority})`);
        });
      } else if (data.theatrePriorities && Array.isArray(data.theatrePriorities)) {
        console.log(`   theatrePriorities field: ${data.theatrePriorities.length} theatre(s)`);
        data.theatrePriorities.forEach((t: any, idx: number) => {
          console.log(`      ${idx + 1}. ${t.theatreName} (priority: ${t.priority})`);
        });
      } else {
        console.log('   ⚠️  No theatres configured!');
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

showMappings();
