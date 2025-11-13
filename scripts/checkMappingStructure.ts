/**
 * Check Specialty Theatre Mapping Structure
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.log('🗺️  Checking Specialty Theatre Mappings...\n');

  try {
    const mappingsSnap = await getDocs(collection(db, 'specialtyTheatreMappings'));
    console.log(`Total mappings: ${mappingsSnap.size}\n`);

    mappingsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`📋 Mapping: ${doc.id}`);
      console.log(`   Specialty: ${data.specialtyName}`);
      console.log(`   Unit: ${data.unitName || data.unitId}`);

      // Check which field is used for theatres
      if (data.theatres) {
        console.log(`   Theatres (theatres field): ${JSON.stringify(data.theatres)}`);
      }
      if (data.theatrePriorities) {
        console.log(`   Theatres (theatrePriorities field): ${JSON.stringify(data.theatrePriorities)}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMappings();
