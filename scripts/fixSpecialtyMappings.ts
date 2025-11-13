/**
 * Fix specialty mappings
 * 1. Delete mappings for specialties with no consultants (EMERGENCY, ENDOSCOPY, VASCULAR)
 * 2. Fix OPTHALMOLOGY typo → OPHTHALMOLOGY
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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

async function fixMappings() {
  console.log('🔧 Fixing specialty mappings...\n');

  try {
    const mappingsQ = query(
      collection(db, 'specialtyTheatreMappings'),
      where('hospitalId', '==', 'royal-london-hospital')
    );
    const mappingsSnap = await getDocs(mappingsQ);

    console.log(`Total mappings: ${mappingsSnap.size}\n`);

    const toDelete: string[] = [];
    const toFix: Array<{id: string, specialty: string}> = [];

    mappingsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const specialty = data.specialtyName;

      // Specialties with no consultants
      if (['EMERGENCY', 'ENDOSCOPY', 'VASCULAR'].includes(specialty)) {
        toDelete.push(docSnap.id);
      }

      // Typo to fix
      if (specialty === 'OPTHALMOLOGY') {
        toFix.push({ id: docSnap.id, specialty });
      }
    });

    // Delete mappings with no consultants
    console.log(`\n🗑️  Deleting ${toDelete.length} mappings (no consultants):`);
    for (const id of toDelete) {
      await deleteDoc(doc(db, 'specialtyTheatreMappings', id));
      console.log(`   ❌ Deleted: ${id}`);
    }

    // Fix typo
    console.log(`\n✏️  Fixing ${toFix.length} typos:`);
    for (const item of toFix) {
      await updateDoc(doc(db, 'specialtyTheatreMappings', item.id), {
        specialtyName: 'OPHTHALMOLOGY'
      });
      console.log(`   ✅ Fixed: ${item.specialty} → OPHTHALMOLOGY`);
    }

    console.log(`\n✅ Mapping fixes complete!`);
    console.log(`   Deleted: ${toDelete.length}`);
    console.log(`   Fixed: ${toFix.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

fixMappings();
