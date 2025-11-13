/**
 * List all collections in Firebase
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

async function listCollections() {
  console.log('📋 Listing collections in medaskca-93d48...\n');

  const collectionsToCheck = [
    'theatreLists',
    'theatres',
    'theatreUnits',
    'specialtyTheatreMappings',
    'surgeons',
    'anaesthetists',
    'specialties',
    'hospitals',
    'procedures'
  ];

  try {
    for (const collectionName of collectionsToCheck) {
      const snap = await getDocs(collection(db, collectionName));
      console.log(`${collectionName}: ${snap.size} documents`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

listCollections();
