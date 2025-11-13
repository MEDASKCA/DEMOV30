/**
 * Delete all theatre lists from Firebase
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteAllLists() {
  console.log('🗑️  Deleting all theatre lists...\n');

  try {
    const listsSnap = await getDocs(collection(db, 'theatreLists'));

    console.log(`Found ${listsSnap.size} theatre lists\n`);

    if (listsSnap.size === 0) {
      console.log('✅ No lists to delete');
      process.exit(0);
    }

    let deleted = 0;
    for (const docSnap of listsSnap.docs) {
      await deleteDoc(doc(db, 'theatreLists', docSnap.id));
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`   Deleted ${deleted}/${listsSnap.size}...`);
      }
    }

    console.log(`\n✅ Done! Deleted ${deleted} theatre lists`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

deleteAllLists();
