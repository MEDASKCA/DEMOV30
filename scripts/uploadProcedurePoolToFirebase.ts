// =============================================================================
// UPLOAD PROCEDURE POOL TO PROCEDURES FIREBASE
// Uploads the procedure pool to Procedures Firebase for waiting list management
// =============================================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';

// Initialize Procedures Firebase for Node.js
const proceduresFirebaseConfig = {
  apiKey: "AIzaSyC_glyIkwey_tYzflcgxIOGi3QI58EyAsI",
  authDomain: "procedures-55ef9.firebaseapp.com",
  projectId: "procedures-55ef9",
  storageBucket: "procedures-55ef9.firebasestorage.app",
  messagingSenderId: "12862405731",
  appId: "1:12862405731:web:aab14aabe2d46af967cc56",
  measurementId: "G-7Y4VEYEPP7"
};

const proceduresApp = initializeApp(proceduresFirebaseConfig, 'procedures-firebase-node');
const proceduresDb = getFirestore(proceduresApp);

console.log('✅ Procedures Firebase initialized for Node.js\n');

interface ProcedurePoolItem {
  id: string;
  name: string;
  opcs4: string[];
  specialty: string;
  subspecialty?: string;
  pcsScore: number;
  priority: string;
  surgeon: string;
  surgeonInitials: string;
  createdAt: string;
}

async function uploadPoolToFirebase() {
  console.log('🚀 Uploading procedure pool to Procedures Firebase...\n');

  // Read the generated pool
  const poolPath = './output/procedure_pool_2025.json';

  if (!fs.existsSync(poolPath)) {
    console.error('❌ Pool file not found! Run generateProcedurePool.ts first.');
    process.exit(1);
  }

  const poolData: ProcedurePoolItem[] = JSON.parse(fs.readFileSync(poolPath, 'utf-8'));
  console.log(`📊 Found ${poolData.length.toLocaleString()} procedures to upload`);

  // Firestore has a limit of 500 operations per batch
  const BATCH_SIZE = 500;
  const batches: ProcedurePoolItem[][] = [];

  for (let i = 0; i < poolData.length; i += BATCH_SIZE) {
    batches.push(poolData.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Uploading in ${batches.length} batches...\n`);

  let uploadedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = writeBatch(proceduresDb);
    const currentBatch = batches[batchIndex];

    for (const procedure of currentBatch) {
      const docRef = doc(proceduresDb, 'schedulePool2025', procedure.id);
      batch.set(docRef, {
        ...procedure,
        year: 2025,
        isActive: true,
        uploadedAt: new Date().toISOString()
      });
      uploadedCount++;
    }

    try {
      await batch.commit();
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} uploaded (${uploadedCount}/${poolData.length} procedures)`);
    } catch (error) {
      console.error(`❌ Error uploading batch ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  // Calculate statistics
  const specialtyCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};

  poolData.forEach(proc => {
    specialtyCounts[proc.specialty] = (specialtyCounts[proc.specialty] || 0) + 1;
    priorityCounts[proc.priority] = (priorityCounts[proc.priority] || 0) + 1;
  });

  console.log(`\n🎉 Successfully uploaded ${uploadedCount.toLocaleString()} procedures to Procedures Firebase!`);
  console.log(`📁 Collection: schedulePool2025`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total procedures: ${uploadedCount.toLocaleString()}`);
  console.log(`   Specialties: ${Object.keys(specialtyCounts).length}`);
  console.log(`\n📂 Top 5 Specialties:`);

  Object.entries(specialtyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([specialty, count]) => {
      console.log(`   ${specialty}: ${count.toLocaleString()}`);
    });

  console.log(`\n🚦 Priority Distribution:`);
  ['P1', 'P2', 'P3', 'P4', 'P5'].forEach(priority => {
    const count = priorityCounts[priority] || 0;
    const percentage = ((count / uploadedCount) * 100).toFixed(1);
    console.log(`   ${priority}: ${count.toLocaleString()} (${percentage}%)`);
  });

  console.log(`\n✅ Procedure pool is now available in Procedures Firebase!`);
  console.log(`📌 Access at: /admin → Pool tab`);
}

// Run the upload
uploadPoolToFirebase().catch((error) => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});
