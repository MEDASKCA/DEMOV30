/**
 * Show Theatre Units Structure
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

async function showUnits() {
  console.log('📍 Theatre Units for royal-london-hospital...\n');

  try {
    const q = query(
      collection(db, 'theatreUnits'),
      where('hospitalId', '==', 'royal-london-hospital')
    );

    const snapshot = await getDocs(q);
    console.log(`Total units: ${snapshot.size}\n`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📍 ${data.name || doc.id}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Location: ${data.location || 'N/A'}`);
      console.log(`   Number of Theatres: ${data.numberOfTheatres || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

showUnits();
