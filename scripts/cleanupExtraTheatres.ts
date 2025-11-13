/**
 * Cleanup Extra Theatres
 * Deletes theatres that exceed the numberOfTheatres defined in theatre units
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

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
  console.log('🧹 Cleaning up extra theatres...\n');

  try {
    // Get units with their expected theatre counts
    const unitsQ = query(
      collection(db, 'theatreUnits'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const unitsSnap = await getDocs(unitsQ);
    const units: { [id: string]: { name: string, maxTheatres: number } } = {};

    unitsSnap.forEach(doc => {
      const data = doc.data();
      units[doc.id] = {
        name: data.name,
        maxTheatres: data.numberOfTheatres || 0
      };
    });

    console.log('📍 Theatre Units:');
    Object.entries(units).forEach(([id, unit]) => {
      console.log(`   ${id}: ${unit.name} - should have ${unit.maxTheatres} theatres`);
    });

    // Get all theatres
    const theatresQ = query(
      collection(db, 'theatres'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const theatresSnap = await getDocs(theatresQ);

    const theatresByUnit: { [unitId: string]: Array<{ id: string, name: string, docId: string }> } = {};
    const toDelete: Array<{ id: string, name: string, reason: string }> = [];

    theatresSnap.forEach(doc => {
      const data = doc.data();
      const unitId = data.unitId;

      if (!unitId || !units[unitId]) {
        // Orphaned theatre
        toDelete.push({
          id: doc.id,
          name: data.name,
          reason: `Orphaned (unit ${unitId || 'NONE'} does not exist)`
        });
      } else {
        if (!theatresByUnit[unitId]) {
          theatresByUnit[unitId] = [];
        }
        theatresByUnit[unitId].push({
          id: doc.id,
          name: data.name,
          docId: doc.id
        });
      }
    });

    // Check for excess theatres in each unit
    Object.entries(theatresByUnit).forEach(([unitId, theatres]) => {
      const maxTheatres = units[unitId].maxTheatres;
      if (theatres.length > maxTheatres) {
        const excess = theatres.slice(maxTheatres); // Keep first N, delete rest
        excess.forEach(theatre => {
          toDelete.push({
            id: theatre.id,
            name: theatre.name,
            reason: `Exceeds limit for ${units[unitId].name} (has ${theatres.length}, should have ${maxTheatres})`
          });
        });
      }
    });

    console.log(`\n🗑️  Theatres to delete: ${toDelete.length}\n`);

    if (toDelete.length === 0) {
      console.log('✅ No cleanup needed!');
      process.exit(0);
    }

    for (const theatre of toDelete) {
      await deleteDoc(doc(db, 'theatres', theatre.id));
      console.log(`   ❌ Deleted: ${theatre.name} (${theatre.id})`);
      console.log(`      Reason: ${theatre.reason}`);
    }

    console.log(`\n✅ Cleanup complete! Deleted ${toDelete.length} theatres`);

    // Verify
    const verifySnap = await getDocs(theatresQ);
    console.log(`\n📊 Remaining theatres: ${verifySnap.size}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

cleanup();
