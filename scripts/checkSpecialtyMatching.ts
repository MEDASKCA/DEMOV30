/**
 * Check specialty matching between mappings and consultants
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

async function checkMatching() {
  console.log('🔍 Checking Specialty Matching...\n');

  try {
    // Get mappings
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`📋 Mappings: ${mappingsSnap.size}\n`);

    const specialties = new Set<string>();
    mappingsSnap.forEach(doc => {
      const data = doc.data();
      specialties.add(data.specialtyName);
    });

    console.log('Unique specialties in mappings:');
    specialties.forEach(spec => console.log(`   - "${spec}"`));

    // Get consultants
    const consultantsQ = query(
      collection(db, 'surgeons'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const consultantsSnap = await getDocs(consultantsQ);

    console.log(`\n👨‍⚕️  Consultants: ${consultantsSnap.size}\n`);

    const consultantSpecialties = new Set<string>();
    consultantsSnap.forEach(doc => {
      const data = doc.data();
      if (data.specialtyName) {
        consultantSpecialties.add(data.specialtyName);
      }
    });

    console.log('Unique specialties in consultants:');
    consultantSpecialties.forEach(spec => console.log(`   - "${spec}"`));

    // Check matches
    console.log('\n🔍 Matching check:');
    specialties.forEach(mappingSpec => {
      const matchFound = Array.from(consultantSpecialties).some(
        consultantSpec => consultantSpec.toLowerCase() === mappingSpec.toLowerCase()
      );
      if (matchFound) {
        console.log(`   ✅ "${mappingSpec}" - HAS MATCH`);
      } else {
        console.log(`   ❌ "${mappingSpec}" - NO MATCH`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMatching();
