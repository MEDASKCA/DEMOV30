// Script to migrate existing 429 procedures to separate procedures Firebase
// Run: npx ts-node scripts/migrateProceduresToSeparateDB.ts

import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { proceduresDb } from '../lib/firebase/proceduresFirebase';
import { SURGICAL_PROCEDURES_BY_SPECIALTY } from '../lib/surgicalCompetencyData';

interface ProcedureToUpload {
  name: string;
  opcs4: string[];
  commonVariations: string[];
  specialty: string;
  subspecialty?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

async function migrateProcedures() {
  console.log('🚀 Starting migration of procedures to separate Firebase database...\n');

  const proceduresToUpload: ProcedureToUpload[] = [];
  let totalCount = 0;

  // Extract all procedures from SURGICAL_PROCEDURES_BY_SPECIALTY
  for (const [specialtyKey, specialtyData] of Object.entries(SURGICAL_PROCEDURES_BY_SPECIALTY)) {
    console.log(`📋 Processing specialty: ${specialtyKey}`);

    if ('subcategories' in specialtyData) {
      const subcategories = specialtyData.subcategories as any;

      for (const [categoryKey, categoryData] of Object.entries(subcategories)) {
        const procedures = (categoryData as any).procedures || [];

        console.log(`   📁 Category: ${categoryKey} (${procedures.length} procedures)`);

        for (const proc of procedures) {
          proceduresToUpload.push({
            name: proc.name,
            opcs4: proc.opcs4 || [],
            commonVariations: proc.commonVariations || [],
            specialty: specialtyKey.toUpperCase(),
            subspecialty: categoryKey,
            category: categoryKey,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });

          totalCount++;
        }
      }
    }
  }

  console.log(`\n✅ Total procedures to upload: ${totalCount}\n`);

  // Upload in batches of 500 (Firestore batch limit)
  const BATCH_SIZE = 500;
  let uploadedCount = 0;
  let batchNumber = 1;

  for (let i = 0; i < proceduresToUpload.length; i += BATCH_SIZE) {
    const batch = writeBatch(proceduresDb);
    const batchProcedures = proceduresToUpload.slice(i, i + BATCH_SIZE);

    console.log(`📤 Uploading batch ${batchNumber} (${batchProcedures.length} procedures)...`);

    for (const procedure of batchProcedures) {
      const docRef = doc(collection(proceduresDb, 'procedures'));
      batch.set(docRef, procedure);
    }

    try {
      await batch.commit();
      uploadedCount += batchProcedures.length;
      console.log(`   ✅ Batch ${batchNumber} uploaded successfully (${uploadedCount}/${totalCount})`);
      batchNumber++;
    } catch (error) {
      console.error(`   ❌ Error uploading batch ${batchNumber}:`, error);
      throw error;
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   📊 Total procedures uploaded: ${uploadedCount}`);
  console.log(`   📍 Database: Procedures Firebase (separate instance)`);
  console.log(`\n⚠️  Next steps:`);
  console.log(`   1. Update your .env.local with procedures Firebase credentials`);
  console.log(`   2. Add Firestore indexes if needed`);
  console.log(`   3. Test procedures API endpoint`);
}

// Run migration
migrateProcedures()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
