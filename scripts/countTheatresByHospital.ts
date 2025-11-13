/**
 * Count Theatres by Hospital
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

async function countTheatres() {
  console.log('🏛️  Counting Theatres by Hospital...\n');

  try {
    const theatresSnap = await getDocs(collection(db, 'theatres'));
    console.log(`📊 Total theatres in database: ${theatresSnap.size}\n`);

    const byHospital: Record<string, number> = {};

    theatresSnap.forEach(doc => {
      const data = doc.data();
      const hospitalId = data.hospitalId || 'unknown';
      byHospital[hospitalId] = (byHospital[hospitalId] || 0) + 1;
    });

    console.log('By Hospital ID:');
    Object.entries(byHospital).forEach(([hospitalId, count]) => {
      console.log(`   ${hospitalId}: ${count} theatres`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

countTheatres();
