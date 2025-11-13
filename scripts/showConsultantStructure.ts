/**
 * Show structure of consultant documents
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

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

async function showStructure() {
  console.log('🔍 Consultant Document Structure...\n');

  try {
    const q = query(collection(db, 'surgeons'), limit(3));
    const consultantsSnap = await getDocs(q);

    consultantsSnap.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1} (${doc.id}):`);
      const data = doc.data();
      console.log(JSON.stringify(data, null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

showStructure();
