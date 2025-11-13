import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBImusic2AEJl1BQS4T_WZlxy-0DqBU64U",
  authDomain: "theatre-operations-manager.firebaseapp.com",
  projectId: "theatre-operations-manager",
  storageBucket: "theatre-operations-manager.firebasestorage.app",
  messagingSenderId: "1045472025597",
  appId: "1:1045472025597:web:0a50dc55dc07a7833ebd98",
  measurementId: "G-4W66VK8ZZR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_TRUST_ID = 'barts-health-nhs-trust';
const DEFAULT_HOSPITAL_ID = 'royal-london-hospital';

async function migrateToMultiHospital() {
  try {
    console.log('='.repeat(60));
    console.log('MULTI-HOSPITAL MIGRATION');
    console.log('='.repeat(60));
    console.log();

    // Step 1: Create default trust
    console.log('Step 1: Creating default NHS Trust...');
    const trustRef = doc(db, 'trusts', DEFAULT_TRUST_ID);
    await setDoc(trustRef, {
      name: 'Barts Health NHS Trust',
      createdAt: new Date()
    });
    console.log('✓ Created trust: Barts Health NHS Trust');
    console.log();

    // Step 2: Create default hospital
    console.log('Step 2: Creating default hospital...');
    const hospitalRef = doc(db, 'hospitals', DEFAULT_HOSPITAL_ID);
    await setDoc(hospitalRef, {
      name: 'Royal London Hospital',
      trustId: DEFAULT_TRUST_ID,
      trustName: 'Barts Health NHS Trust',
      createdAt: new Date()
    });
    console.log('✓ Created hospital: Royal London Hospital, Barts Health NHS Trust');
    console.log();

    // Step 3: Add hospitalId to specialties
    console.log('Step 3: Migrating specialties...');
    const specialtiesSnapshot = await getDocs(collection(db, 'specialties'));
    let specialtiesCount = 0;
    for (const docSnapshot of specialtiesSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.hospitalId) {
        await updateDoc(doc(db, 'specialties', docSnapshot.id), {
          hospitalId: DEFAULT_HOSPITAL_ID
        });
        specialtiesCount++;
      }
    }
    console.log(`✓ Updated ${specialtiesCount} specialties with hospitalId`);
    console.log();

    // Step 4: Add hospitalId to theatre units
    console.log('Step 4: Migrating theatre units...');
    const unitsSnapshot = await getDocs(collection(db, 'theatreUnits'));
    let unitsCount = 0;
    for (const docSnapshot of unitsSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.hospitalId) {
        await updateDoc(doc(db, 'theatreUnits', docSnapshot.id), {
          hospitalId: DEFAULT_HOSPITAL_ID
        });
        unitsCount++;
      }
    }
    console.log(`✓ Updated ${unitsCount} theatre units with hospitalId`);
    console.log();

    // Step 5: Add hospitalId to specialty-theatre mappings
    console.log('Step 5: Migrating specialty-theatre mappings...');
    const mappingsSnapshot = await getDocs(collection(db, 'specialtyTheatreMappings'));
    let mappingsCount = 0;
    for (const docSnapshot of mappingsSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.hospitalId) {
        await updateDoc(doc(db, 'specialtyTheatreMappings', docSnapshot.id), {
          hospitalId: DEFAULT_HOSPITAL_ID
        });
        mappingsCount++;
      }
    }
    console.log(`✓ Updated ${mappingsCount} specialty-theatre mappings with hospitalId`);
    console.log();

    // Step 6: Add hospitalId to surgeons
    console.log('Step 6: Migrating surgeons...');
    const surgeonsSnapshot = await getDocs(collection(db, 'surgeons'));
    let surgeonsCount = 0;
    for (const docSnapshot of surgeonsSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.hospitalId) {
        await updateDoc(doc(db, 'surgeons', docSnapshot.id), {
          hospitalId: DEFAULT_HOSPITAL_ID
        });
        surgeonsCount++;
      }
    }
    console.log(`✓ Updated ${surgeonsCount} surgeons with hospitalId`);
    console.log();

    // Step 7: Procedures remain GLOBAL (no hospitalId needed)
    console.log('Step 7: Checking procedures...');
    const proceduresSnapshot = await getDocs(collection(db, 'procedures'));
    console.log(`✓ ${proceduresSnapshot.size} procedures remain in GLOBAL library (shared across hospitals)`);
    console.log();

    console.log('='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Trusts created:              1`);
    console.log(`Hospitals created:           1`);
    console.log(`Specialties migrated:        ${specialtiesCount}`);
    console.log(`Theatre units migrated:      ${unitsCount}`);
    console.log(`Mappings migrated:           ${mappingsCount}`);
    console.log(`Surgeons migrated:           ${surgeonsCount}`);
    console.log(`Procedures (global):         ${proceduresSnapshot.size}`);
    console.log('='.repeat(60));
    console.log();
    console.log('✅ Migration completed successfully!');
    console.log();
    console.log('Next steps:');
    console.log('1. Restart your dev server');
    console.log('2. You can now add more hospitals via the admin panel');
    console.log('3. All existing data is preserved and tagged with "Royal London Hospital"');
    console.log();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateToMultiHospital()
  .then(() => {
    console.log('Migration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
