/**
 * Check Theatre-Unit Assignments
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

async function checkAssignments() {
  console.log('🔍 Checking Theatre-Unit Assignments...\n');

  try {
    // Get units
    const unitsQ = query(
      collection(db, 'theatreUnits'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const unitsSnap = await getDocs(unitsQ);
    const unitIds = new Set<string>();
    const unitNames: { [id: string]: string } = {};

    unitsSnap.forEach(doc => {
      unitIds.add(doc.id);
      unitNames[doc.id] = doc.data().name;
    });

    console.log(`📍 Found ${unitIds.size} theatre units:`);
    unitIds.forEach(id => console.log(`   - ${id}: ${unitNames[id]}`));

    // Get theatres
    const theatresQ = query(
      collection(db, 'theatres'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const theatresSnap = await getDocs(theatresQ);

    console.log(`\n🏛️  Found ${theatresSnap.size} theatres\n`);

    const theatresByUnit: { [unitId: string]: string[] } = {};
    const orphanedTheatres: string[] = [];

    theatresSnap.forEach(doc => {
      const data = doc.data();
      const unitId = data.unitId;

      if (!unitId || !unitIds.has(unitId)) {
        orphanedTheatres.push(`${doc.id} (${data.name}) - unitId: ${unitId || 'NONE'}`);
      } else {
        if (!theatresByUnit[unitId]) {
          theatresByUnit[unitId] = [];
        }
        theatresByUnit[unitId].push(`${doc.id} (${data.name})`);
      }
    });

    console.log('✅ Theatres by Unit:');
    Object.entries(theatresByUnit).forEach(([unitId, theatres]) => {
      console.log(`\n   ${unitId} - ${unitNames[unitId]}:`);
      theatres.forEach(t => console.log(`      - ${t}`));
    });

    if (orphanedTheatres.length > 0) {
      console.log(`\n⚠️  ORPHANED THEATRES (${orphanedTheatres.length}):`);
      console.log('   These theatres belong to units that do not exist:');
      orphanedTheatres.forEach(t => console.log(`      - ${t}`));
      console.log('\n   🧹 These should be deleted from Firebase!');
    } else {
      console.log('\n✅ All theatres are properly assigned to existing units!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkAssignments();
