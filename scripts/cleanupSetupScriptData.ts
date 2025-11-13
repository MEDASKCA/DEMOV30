/**
 * Cleanup Setup Script Data
 * Removes the theatres and mappings created by setup script that conflict with user's real data
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

async function cleanup() {
  console.log('🧹 Cleaning up setup script data...\n');

  try {
    // Delete theatres with hospitalId = "royal-london" (setup script data)
    console.log('🏛️  Checking theatres...');
    const theatresSnap = await getDocs(collection(db, 'theatres'));
    let theatresDeleted = 0;

    for (const docSnap of theatresSnap.docs) {
      const data = docSnap.data();
      if (data.hospitalId === 'royal-london') {
        await deleteDoc(doc(db, 'theatres', docSnap.id));
        console.log(`   ❌ Deleted: ${docSnap.id} (${data.name})`);
        theatresDeleted++;
      }
    }
    console.log(`✅ Deleted ${theatresDeleted} theatres\n`);

    // Delete mappings with hospitalId = "royal-london" (setup script data)
    console.log('🗺️  Checking specialty mappings...');
    const mappingsSnap = await getDocs(collection(db, 'specialtyTheatreMappings'));
    let mappingsDeleted = 0;

    for (const docSnap of mappingsSnap.docs) {
      const data = docSnap.data();
      if (data.hospitalId === 'royal-london') {
        await deleteDoc(doc(db, 'specialtyTheatreMappings', docSnap.id));
        console.log(`   ❌ Deleted: ${docSnap.id} (${data.specialtyName})`);
        mappingsDeleted++;
      }
    }
    console.log(`✅ Deleted ${mappingsDeleted} mappings\n`);

    // Delete theatre units with hospitalId = "royal-london" (setup script data)
    console.log('📍 Checking theatre units...');
    const unitsSnap = await getDocs(collection(db, 'theatreUnits'));
    let unitsDeleted = 0;

    for (const docSnap of unitsSnap.docs) {
      const data = docSnap.data();
      if (data.hospitalId === 'royal-london') {
        await deleteDoc(doc(db, 'theatreUnits', docSnap.id));
        console.log(`   ❌ Deleted: ${docSnap.id} (${data.name})`);
        unitsDeleted++;
      }
    }
    console.log(`✅ Deleted ${unitsDeleted} units\n`);

    console.log('🎉 Cleanup Complete!');
    console.log(`   - ${theatresDeleted} theatres removed`);
    console.log(`   - ${mappingsDeleted} mappings removed`);
    console.log(`   - ${unitsDeleted} units removed`);
    console.log('\n✅ Now only your real data (hospitalId: "royal-london-hospital") remains!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

cleanup();
