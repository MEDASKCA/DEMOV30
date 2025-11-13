/**
 * Check Hospital IDs in Mappings
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
  console.log('🗺️  Checking Mapping Hospital IDs...\n');

  try {
    const mappingsSnap = await getDocs(collection(db, 'specialtyTheatreMappings'));
    console.log(`Total mappings: ${mappingsSnap.size}\n`);

    const withHospitalId: any[] = [];
    const withoutHospitalId: any[] = [];

    mappingsSnap.forEach(doc => {
      const data = doc.data();
      if (data.hospitalId) {
        withHospitalId.push({ id: doc.id, hospitalId: data.hospitalId, specialty: data.specialtyName });
      } else {
        withoutHospitalId.push({ id: doc.id, specialty: data.specialtyName });
      }
    });

    console.log(`✅ WITH hospitalId field: ${withHospitalId.length}`);
    withHospitalId.forEach(m => {
      console.log(`   - ${m.id}: ${m.specialty} (hospitalId: ${m.hospitalId})`);
    });

    console.log(`\n❌ WITHOUT hospitalId field: ${withoutHospitalId.length}`);
    withoutHospitalId.forEach(m => {
      console.log(`   - ${m.id}: ${m.specialty}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMappings();
