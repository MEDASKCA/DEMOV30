import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, deleteDoc } from 'firebase/firestore';
import { SURGICAL_PROCEDURES_BY_SPECIALTY } from '../lib/surgicalCompetencyData';

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

interface FirebaseSpecialty {
  id: string;
  name: string;
  abbreviation: string;
  subspecialties?: Array<{ name: string; abbreviation: string }>;
}

interface Procedure {
  name: string;
  opcs4: string[];
  commonVariations?: string[];
  specialtyId: string;
  specialtyName: string;
  subspecialtyName?: string;
}

interface Surgeon {
  firstName: string;
  lastName: string;
  title: string;
  specialtyId: string;
  specialtyName: string;
  subspecialtyName?: string;
}

// ============================================================================
// HARDCODED SURGEON NAMES REMOVED - TO BE REPLACED IN PHASE 1
// ============================================================================
//
// REQUIRED SURGEON DATA STRUCTURE:
// When creating surgeon profiles in Phase 1, ensure each surgeon has:
// - firstName: string
// - lastName: string
// - title: 'Mr' | 'Ms' | 'Dr' | 'Prof'
// - specialtyId: string (reference to specialties collection)
// - specialtyName: string
// - subspecialtyName?: string (optional, if they have a subspecialty)
//
// KEY RELATIONSHIPS TO MAINTAIN:
// 1. Surgeon → Specialty (via specialtyId, specialtyName)
// 2. Surgeon → Subspecialty (via subspecialtyName)
// 3. Each specialty/subspecialty combination should have 3+ surgeons
// 4. Surgeons are stored in Firebase 'surgeons' collection
// 5. Procedures are linked to specialties (not directly to surgeons)
//
// FUTURE ENHANCEMENTS (Post-Phase 1):
// - Surgeon → Procedures competency mapping (PCS scores)
// - Surgeon → Operating preferences (days, session types)
// - Surgeon → Performance metrics
// ============================================================================

// TEMPORARILY DISABLED: Surgeon generation
// This function will be replaced when we create the Surgeon Profiles UI in Phase 1
/*
const TITLES = ['Mr', 'Ms', 'Dr', 'Prof'];
const FIRST_NAMES = [...];
const LAST_NAMES = [...];
const usedSurgeonNames = new Set<string>();

function generateUniqueSurgeon(specialtyId: string, specialtyName: string, subspecialtyName?: string): Surgeon {
  // This function is disabled until Phase 1: Surgeon Profiles is complete
  throw new Error('Surgeon generation is disabled. Please create surgeon profiles via the Surgeon Profiles UI.');
}
*/

function findProceduresForSpecialty(specialtyName: string, subspecialtyName?: string, targetCount: number = 30): Procedure[] {
  const procedures: Procedure[] = [];

  // Map common specialty names to static data keys
  const specialtyMapping: Record<string, string> = {
    'Trauma Orthopaedics': 'Trauma Orthopaedics',
    'Orthopaedics': 'Trauma Orthopaedics',
    'General Surgery': 'General Surgery',
    'Vascular Surgery': 'Vascular Surgery',
    'Urology': 'Urology',
    'Cardiothoracic Surgery': 'Cardiothoracic Surgery',
    'Cardiothoracic': 'Cardiothoracic Surgery',
    'Neurosurgery': 'Neurosurgery',
    'ENT': 'ENT Surgery',
    'ENT Surgery': 'ENT Surgery',
    'Plastics': 'Plastic Surgery',
    'Plastic Surgery': 'Plastic Surgery',
    'Gynaecology': 'Gynaecology',
    'Ophthalmology': 'Ophthalmology'
  };

  const mappedSpecialtyName = specialtyMapping[specialtyName] || specialtyName;
  const specialtyData = SURGICAL_PROCEDURES_BY_SPECIALTY[mappedSpecialtyName as keyof typeof SURGICAL_PROCEDURES_BY_SPECIALTY];

  if (!specialtyData) {
    console.warn(`No static data found for specialty: ${specialtyName} (mapped: ${mappedSpecialtyName})`);
    return generateFallbackProcedures(specialtyName, subspecialtyName, targetCount);
  }

  if (subspecialtyName && specialtyData.subcategories) {
    // Look for matching subspecialty
    const subcategoryData = specialtyData.subcategories[subspecialtyName as keyof typeof specialtyData.subcategories];

    if (subcategoryData && subcategoryData.procedures) {
      // Use procedures from this specific subspecialty
      subcategoryData.procedures.forEach(proc => {
        procedures.push({
          ...proc,
          specialtyId: '', // Will be set when uploading
          specialtyName,
          subspecialtyName
        });
      });
    }

    // If we don't have enough, pull from other subcategories
    if (procedures.length < targetCount && specialtyData.subcategories) {
      Object.entries(specialtyData.subcategories).forEach(([subName, subData]: [string, any]) => {
        if (procedures.length >= targetCount) return;
        if (subName === subspecialtyName) return; // Already processed

        subData.procedures.forEach((proc: any) => {
          if (procedures.length >= targetCount) return;
          procedures.push({
            ...proc,
            specialtyId: '',
            specialtyName,
            subspecialtyName
          });
        });
      });
    }
  } else {
    // No subspecialty - gather procedures from all subcategories
    if (specialtyData.subcategories) {
      Object.values(specialtyData.subcategories).forEach((subData: any) => {
        if (procedures.length >= targetCount) return;
        subData.procedures.forEach((proc: any) => {
          if (procedures.length >= targetCount) return;
          procedures.push({
            ...proc,
            specialtyId: '',
            specialtyName,
            subspecialtyName: undefined
          });
        });
      });
    }
  }

  // Ensure we have at least targetCount procedures
  if (procedures.length < targetCount) {
    const additionalNeeded = targetCount - procedures.length;
    const fallbackProcedures = generateFallbackProcedures(specialtyName, subspecialtyName, additionalNeeded);
    procedures.push(...fallbackProcedures);
  }

  return procedures.slice(0, targetCount);
}

function generateFallbackProcedures(specialtyName: string, subspecialtyName: string | undefined, count: number): Procedure[] {
  const fallbackProcedures: Procedure[] = [];
  const subspecialtyLabel = subspecialtyName || specialtyName;

  const commonProcedureTypes = [
    'Diagnostic Procedure', 'Minor Procedure', 'Intermediate Procedure', 'Major Procedure',
    'Emergency Procedure', 'Elective Procedure', 'Revision Procedure', 'Complex Procedure'
  ];

  for (let i = 0; i < count; i++) {
    const procedureType = commonProcedureTypes[i % commonProcedureTypes.length];
    fallbackProcedures.push({
      name: `${subspecialtyLabel} ${procedureType} ${Math.floor(i / commonProcedureTypes.length) + 1}`,
      opcs4: [`Z${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`],
      specialtyId: '',
      specialtyName,
      subspecialtyName
    });
  }

  return fallbackProcedures;
}

async function seedDatabase() {
  try {
    console.log('Starting database seed...\n');

    // Step 1: Load specialties from Firebase
    console.log('Loading specialties from Firebase...');
    const specialtiesQuery = query(collection(db, 'specialties'));
    const specialtiesSnapshot = await getDocs(specialtiesQuery);

    const specialties: FirebaseSpecialty[] = [];
    specialtiesSnapshot.forEach(doc => {
      const data = doc.data();
      specialties.push({
        id: doc.id,
        name: data.name,
        abbreviation: data.abbreviation || data.name.substring(0, 6).toUpperCase(),
        subspecialties: data.subspecialties || []
      });
    });

    if (specialties.length === 0) {
      console.log('No specialties found in Firebase. Please configure specialties first.');
      return;
    }

    console.log(`Found ${specialties.length} specialties\n`);

    // Step 2: Clear existing procedures and surgeons
    console.log('Clearing existing procedures and surgeons...');

    const proceduresSnapshot = await getDocs(collection(db, 'procedures'));
    for (const doc of proceduresSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    const surgeonsSnapshot = await getDocs(collection(db, 'surgeons'));
    for (const doc of surgeonsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Cleared existing data\n');

    // Step 3: Generate and upload procedures and surgeons
    let totalProcedures = 0;
    let totalSurgeons = 0;

    for (const specialty of specialties) {
      console.log(`Processing: ${specialty.name}`);

      if (specialty.subspecialties && specialty.subspecialties.length > 0) {
        // Specialty has subspecialties
        for (const subspecialty of specialty.subspecialties) {
          console.log(`  - ${subspecialty.name}`);

          // Find 30 procedures for this subspecialty
          const procedures = findProceduresForSpecialty(specialty.name, subspecialty.name, 30);

          // Upload procedures
          for (const proc of procedures) {
            await addDoc(collection(db, 'procedures'), {
              ...proc,
              specialtyId: specialty.id,
              createdAt: new Date()
            });
            totalProcedures++;
          }

          // DISABLED: Generate 3 surgeons for this subspecialty
          // Will be re-enabled in Phase 1 when Surgeon Profiles UI is complete
          /*
          for (let i = 0; i < 3; i++) {
            const surgeon = generateUniqueSurgeon(specialty.id, specialty.name, subspecialty.name);
            await addDoc(collection(db, 'surgeons'), {
              ...surgeon,
              createdAt: new Date()
            });
            totalSurgeons++;
          }
          */

          console.log(`    Added ${procedures.length} procedures (surgeons disabled until Phase 1)`);
        }
      } else {
        // Specialty without subspecialties
        const procedures = findProceduresForSpecialty(specialty.name, undefined, 30);

        // Upload procedures
        for (const proc of procedures) {
          await addDoc(collection(db, 'procedures'), {
            ...proc,
            specialtyId: specialty.id,
            createdAt: new Date()
          });
          totalProcedures++;
        }

        // DISABLED: Generate 3 surgeons for this specialty
        // Will be re-enabled in Phase 1 when Surgeon Profiles UI is complete
        /*
        for (let i = 0; i < 3; i++) {
          const surgeon = generateUniqueSurgeon(specialty.id, specialty.name);
          await addDoc(collection(db, 'surgeons'), {
            ...surgeon,
            createdAt: new Date()
          });
          totalSurgeons++;
        }
        */

        console.log(`  Added ${procedures.length} procedures (surgeons disabled until Phase 1)`);
      }
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log(`Total Procedures Added: ${totalProcedures}`);
    console.log(`Total Surgeons Added: ${totalSurgeons}`);
    console.log(`Unique Surgeon Names: ${usedSurgeonNames.size}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed to seed database:', error);
    process.exit(1);
  });
