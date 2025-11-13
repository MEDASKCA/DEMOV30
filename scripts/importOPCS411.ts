/**
 * Import OPCS-4.11 Data into Firebase
 * Maps OPCS codes to NHS specialties
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Procedures Firebase Configuration (opsc-4)
const proceduresFirebaseConfig = {
  apiKey: "AIzaSyBeXJz3IWRHAjzVxu7VaKpt8PdYbIr5er8",
  authDomain: "opsc-4.firebaseapp.com",
  projectId: "opsc-4",
  storageBucket: "opsc-4.firebasestorage.app",
  messagingSenderId: "791916086773",
  appId: "1:791916086773:web:154d42e305a436b4404cbc",
  measurementId: "G-ZZL6CTP85S"
};

const app = initializeApp(proceduresFirebaseConfig, 'procedures-import');
const db = getFirestore(app);

// Map OPCS chapters to NHS specialties (matched to your surgeon database)
const CHAPTER_TO_SPECIALTY: Record<string, string> = {
  'A': 'NEUROLOGY',              // Nervous System
  'B': 'PLASTICS',                // Endocrine System and Breast
  'C': 'GENERAL SURGERY',         // Eye (no ophthalmology specialty)
  'D': 'ENT',                     // Ear
  'E': 'GENERAL SURGERY',         // Respiratory Tract
  'F': 'ORAL AND MAXILLOFACIAL',  // Mouth
  'G': 'GENERAL SURGERY',         // Upper Digestive System
  'H': 'GENERAL SURGERY',         // Lower Digestive System
  'J': 'GENERAL SURGERY',         // Other Abdominal Organs
  'K': 'GENERAL SURGERY',         // Heart (no cardiac surgery specialty)
  'L': 'GENERAL SURGERY',         // Arteries and Veins (no vascular specialty)
  'M': 'RENAL',                   // Urinary
  'N': 'UROLOGY',                 // Male Genital Organs
  'P': 'GYNAECOLOGY',             // Lower Female Genital Tract
  'Q': 'GYNAECOLOGY',             // Upper Female Genital Tract
  'R': 'GYNAECOLOGY',             // Female Genital Tract Associated with Pregnancy
  'S': 'PLASTICS',                // Skin
  'T': 'ORTHOPAEDICS',            // Soft Tissue
  'U': 'PLASTICS',                // Breast
  'V': 'NEUROLOGY',               // Bones and Joints of Skull and Spine
  'W': 'ORTHOPAEDICS',            // Other Bones and Joints
  'X': 'GENERAL SURGERY'          // Miscellaneous Operations
};

const CHAPTER_NAMES: Record<string, string> = {
  'A': 'Nervous System',
  'B': 'Endocrine System and Breast',
  'C': 'Eye',
  'D': 'Ear',
  'E': 'Respiratory Tract',
  'F': 'Mouth',
  'G': 'Upper Digestive System',
  'H': 'Lower Digestive System',
  'J': 'Other Abdominal Organs',
  'K': 'Heart',
  'L': 'Arteries and Veins',
  'M': 'Urinary',
  'N': 'Male Genital Organs',
  'P': 'Lower Female Genital Tract',
  'Q': 'Upper Female Genital Tract',
  'R': 'Female Genital Tract Associated with Pregnancy',
  'S': 'Skin',
  'T': 'Soft Tissue',
  'U': 'Breast',
  'V': 'Bones and Joints of Skull and Spine',
  'W': 'Other Bones and Joints',
  'X': 'Miscellaneous Operations'
};

async function clearExistingProcedures() {
  console.log('\n🗑️  Clearing existing procedures...');
  const proceduresSnap = await getDocs(collection(db, 'procedures'));

  let deleteCount = 0;
  let batch = writeBatch(db);

  for (const docSnap of proceduresSnap.docs) {
    batch.delete(docSnap.ref);
    deleteCount++;

    if (deleteCount % 500 === 0) {
      await batch.commit();
      console.log(`   Deleted ${deleteCount} procedures...`);
      batch = writeBatch(db); // Create new batch after commit
    }
  }

  if (deleteCount % 500 !== 0) {
    await batch.commit();
  }

  console.log(`✅ Cleared ${deleteCount} procedures\n`);
}

async function importOPCS411() {
  console.log('\n🏥 Importing OPCS-4.11 Data\n');
  console.log('═'.repeat(50));

  const filePath = 'C:/Users/forda/OneDrive/Desktop/OPCS-4.11 Data files txt/OPCS-4.11 Data files txt/OPCS411 Metadata Nov 2025 V1.0.txt.txt';

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  // Clear existing procedures
  await clearExistingProcedures();

  // Read the file
  console.log('📖 Reading OPCS-4.11 Metadata file...');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());

  console.log(`✅ Found ${lines.length} lines\n`);

  const procedures: any[] = [];
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try tab-separated first
    let parts = line.split('\t');
    let code = '';
    let name = '';

    if (parts.length === 2) {
      // Tab-separated format: "A01	Major excision of tissue of brain"
      code = parts[0].trim();
      name = parts[1].trim();
    } else {
      // Fixed-width format: "1           A011        MAJOR EXCISION OF TISSUE OF BRAIN                           HEMISPHERECTOMY                                                                                              01"
      // Columns: [classification, code, category, specific_name, classification2]
      const spaceParts = line.split(/\s{2,}/).filter(p => p.trim());

      if (spaceParts.length >= 4) {
        // Column 2: Code (e.g., "A011")
        code = spaceParts[1]?.trim() || '';

        // Column 4: Specific procedure name (e.g., "HEMISPHERECTOMY")
        // This is the detailed name we want, not the category
        name = spaceParts[3]?.trim() || '';

        // Validate code format (should start with letter + digit)
        if (!/^[A-Z]\d/.test(code)) {
          code = '';
        }
      }
    }

    if (!code || !name || code.length < 2) {
      skipped++;
      if (i < 5) {
        console.log(`⚠️ Skipping line ${i}:`, line.substring(0, 100));
      }
      continue;
    }

    // Get chapter (first letter of code)
    const chapter = code.charAt(0).toUpperCase();
    const specialty = CHAPTER_TO_SPECIALTY[chapter] || 'GENERAL SURGERY';
    const chapterName = CHAPTER_NAMES[chapter] || 'Other';

    procedures.push({
      code,
      name,
      description: name,
      specialtyName: specialty,
      chapter,
      chapterName,
      version: 'OPCS-4.11',
      source: 'TRUD',
      importedAt: new Date().toISOString()
    });

    if (procedures.length <= 5) {
      console.log(`✅ Parsed #${procedures.length}: ${code} - ${name} (${specialty})`);
    }
  }

  console.log(`\n📊 Parsed ${procedures.length} procedures, skipped ${skipped} lines`);

  if (procedures.length === 0) {
    console.error('❌ No procedures parsed! Check file format.');
    return;
  }

  // Save to Firebase in batches
  console.log('💾 Saving to Firebase...\n');

  let batch = writeBatch(db);
  let batchCount = 0;
  let totalSaved = 0;

  for (const procedure of procedures) {
    const docRef = doc(collection(db, 'procedures'));
    batch.set(docRef, procedure);
    batchCount++;
    totalSaved++;

    if (batchCount === 500) {
      await batch.commit();
      console.log(`   ✅ Saved ${totalSaved}/${procedures.length} procedures...`);
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Successfully imported ${totalSaved} procedures!`);

  // Show breakdown by specialty
  console.log('\n📊 Breakdown by Specialty:');
  const specialtyCount: Record<string, number> = {};

  for (const proc of procedures) {
    specialtyCount[proc.specialtyName] = (specialtyCount[proc.specialtyName] || 0) + 1;
  }

  Object.entries(specialtyCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([specialty, count]) => {
      console.log(`   ${specialty}: ${count}`);
    });

  console.log('\n═'.repeat(50));
  console.log('🎉 Import complete!\n');
}

importOPCS411()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
