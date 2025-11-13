/**
 * Delete OPHTHALMOLOGY mapping (no consultants)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteMapping() {
  console.log('🗑️  Deleting OPHTHALMOLOGY mappings...\n');

  try {
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital'),
      where('specialtyName', '==', 'OPHTHALMOLOGY')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`Found ${mappingsSnap.size} OPHTHALMOLOGY mappings\n`);

    for (const docSnap of mappingsSnap.docs) {
      await deleteDoc(doc(db, 'specialtyTheatreMappings', docSnap.id));
      console.log(`   ❌ Deleted: ${docSnap.id}`);
    }

    console.log(`\n✅ Done! Deleted ${mappingsSnap.size} mappings`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

deleteMapping();
