/**
 * Add hospitalId to all consultant documents
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

async function addHospitalId() {
  console.log('🔧 Adding hospitalId to all consultants...\n');

  try {
    const consultantsSnap = await getDocs(collection(db, 'surgeons'));

    console.log(`Total consultants: ${consultantsSnap.size}\n`);

    let updated = 0;
    let skipped = 0;

    for (const consultantDoc of consultantsSnap.docs) {
      const data = consultantDoc.data();

      if (data.hospitalId) {
        console.log(`⏭️  Skipped ${consultantDoc.id}: already has hospitalId`);
        skipped++;
        continue;
      }

      await updateDoc(doc(db, 'surgeons', consultantDoc.id), {
        hospitalId: 'royal-london-hospital'
      });

      updated++;
      if (updated % 50 === 0) {
        console.log(`   Updated ${updated}...`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

addHospitalId();
