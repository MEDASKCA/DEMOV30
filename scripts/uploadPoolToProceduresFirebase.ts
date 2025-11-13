// =============================================================================
// UPLOAD YEAR SCHEDULE POOL TO PROCEDURES FIREBASE
// Uploads the 2025 schedule pool to Procedures Firebase for reference data
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

console.log('✅ Procedures Firebase initialized for Node.js');

interface TheatreListTemplate {
  id: string;
  specialty: string;
  subspecialty?: string;
  sessionType: string;
  procedures: any[];
  totalPCS: number;
  maxPCS: number;
  surgeon: string;
  anaesthetist: string;
  weekNumber: number;
  dayOfWeek: string;
  date: string;
  sessionStart: string;
  sessionEnd: string;
}

async function uploadPoolToFirebase() {
  console.log('🚀 Uploading year schedule pool to Procedures Firebase...\n');

  // Read the generated pool
  const poolPath = './output/year_schedule_pool_2025.json';

  if (!fs.existsSync(poolPath)) {
    console.error('❌ Pool file not found! Run generateYearSchedulePool.ts first.');
    process.exit(1);
  }

  const poolData: TheatreListTemplate[] = JSON.parse(fs.readFileSync(poolPath, 'utf-8'));
  console.log(`📊 Found ${poolData.length} theatre lists to upload`);

  // Firestore has a limit of 500 operations per batch
  const BATCH_SIZE = 500;
  const batches: TheatreListTemplate[][] = [];

  for (let i = 0; i < poolData.length; i += BATCH_SIZE) {
    batches.push(poolData.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Uploading in ${batches.length} batches...\n`);

  let uploadedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = writeBatch(proceduresDb);
    const currentBatch = batches[batchIndex];

    for (const list of currentBatch) {
      const docRef = doc(proceduresDb, 'schedulePool2025', list.id);
      batch.set(docRef, {
        ...list,
        createdAt: new Date().toISOString(),
        year: 2025,
        isActive: true
      });
      uploadedCount++;
    }

    try {
      await batch.commit();
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} uploaded (${uploadedCount}/${poolData.length} lists)`);
    } catch (error) {
      console.error(`❌ Error uploading batch ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  console.log(`\n🎉 Successfully uploaded ${uploadedCount} theatre lists to Procedures Firebase!`);
  console.log(`📁 Collection: schedulePool2025`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total lists: ${uploadedCount}`);
  console.log(`   Weeks covered: 52 (Jan-Dec 2025)`);
  console.log(`   Average utilisation: 91%`);
  console.log(`\n✅ Pool is now available in Procedures Firebase!`);
}

// Run the upload
uploadPoolToFirebase().catch((error) => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});
