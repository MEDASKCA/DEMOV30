/**
 * Check detailed specialty mapping data
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
  console.log('🔍 Checking detailed mapping data...\n');

  try {
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`Found ${mappingsSnap.size} mappings\n`);

    mappingsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`\n=== Mapping: ${doc.id} ===`);
      console.log('Raw data:', JSON.stringify(data, null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMappings();
