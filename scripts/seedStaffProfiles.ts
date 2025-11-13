/**
 * Firebase Seeding Script for Staff Profiles
 *
 * Seeds 172 permanent staff profiles to Firestore
 * Royal London Hospital, Barts Health NHS Trust
 *
 * USAGE:
 * - Dry run (preview only): npx ts-node scripts/seedStaffProfiles.ts
 * - Live seed: npx ts-node scripts/seedStaffProfiles.ts --live
 *
 * IMPORTANT: Always run dry-run first to verify data!
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for server-side batch operations)
const firebaseConfig = {
  apiKey: "AIzaSyAWzAZiMVlGU1h7CLZRR1Qc-0BxKkIDNW4",
  authDomain: "medaskca-93d48.firebaseapp.com",
  projectId: "medaskca-93d48",
  storageBucket: "medaskca-93d48.firebasestorage.app",
  messagingSenderId: "830746933399",
  appId: "1:830746933399:web:b94a042718d64989f7d1d2",
  measurementId: "G-ETHE315F6E"
};

// Check if running in live mode
const isLiveMode = process.argv.includes('--live');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   STAFF PROFILES FIREBASE SEEDING SCRIPT                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (!isLiveMode) {
  console.log('🔍 Running in DRY-RUN mode (preview only, no data will be written)');
  console.log('   To execute live seeding, run: npx ts-node scripts/seedStaffProfiles.ts --live\n');
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

// Collection name for staff profiles
const STAFF_PROFILES_COLLECTION = 'staffProfiles';

interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  band: string;
  fte: number;
  roles: string[];
  location: {
    currentTrust: string;
    currentHospital: string;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Convert ISO date strings to Firestore Timestamps
 */
function convertDatesToTimestamps(profile: StaffProfile): any {
  const converted: any = { ...profile };

  // Convert root-level date fields
  if (converted.createdAt && typeof converted.createdAt === 'string') {
    converted.createdAt = Timestamp.fromDate(new Date(converted.createdAt));
  } else {
    converted.createdAt = Timestamp.now();
  }

  if (converted.updatedAt && typeof converted.updatedAt === 'string') {
    converted.updatedAt = Timestamp.fromDate(new Date(converted.updatedAt));
  } else {
    converted.updatedAt = Timestamp.now();
  }

  // Convert employment history dates
  if (converted.employmentHistory && Array.isArray(converted.employmentHistory)) {
    converted.employmentHistory = converted.employmentHistory.map((emp: any) => ({
      ...emp,
      startDate: emp.startDate ? Timestamp.fromDate(new Date(emp.startDate)) : null,
      endDate: emp.endDate ? Timestamp.fromDate(new Date(emp.endDate)) : null,
    }));
  }

  // Convert education dates
  if (converted.education && Array.isArray(converted.education)) {
    converted.education = converted.education.map((edu: any) => ({
      ...edu,
      startDate: edu.startDate ? Timestamp.fromDate(new Date(edu.startDate)) : null,
      endDate: edu.endDate ? Timestamp.fromDate(new Date(edu.endDate)) : null,
    }));
  }

  // Convert certification dates
  if (converted.certifications && Array.isArray(converted.certifications)) {
    converted.certifications = converted.certifications.map((cert: any) => ({
      ...cert,
      issueDate: cert.issueDate ? Timestamp.fromDate(new Date(cert.issueDate)) : null,
      expiryDate: cert.expiryDate ? Timestamp.fromDate(new Date(cert.expiryDate)) : null,
    }));
  }

  // Convert compliance dates
  if (converted.compliance) {
    if (converted.compliance.dbs?.expiryDate) {
      converted.compliance.dbs.expiryDate = Timestamp.fromDate(new Date(converted.compliance.dbs.expiryDate));
    }
    if (converted.compliance.hcpc?.expiryDate) {
      converted.compliance.hcpc.expiryDate = Timestamp.fromDate(new Date(converted.compliance.hcpc.expiryDate));
    }
    if (converted.compliance.hcpc?.revalidationDue) {
      converted.compliance.hcpc.revalidationDue = Timestamp.fromDate(new Date(converted.compliance.hcpc.revalidationDue));
    }
    if (converted.compliance.occupationalHealth) {
      if (converted.compliance.occupationalHealth.lastAssessment) {
        converted.compliance.occupationalHealth.lastAssessment = Timestamp.fromDate(
          new Date(converted.compliance.occupationalHealth.lastAssessment)
        );
      }
      if (converted.compliance.occupationalHealth.nextDue) {
        converted.compliance.occupationalHealth.nextDue = Timestamp.fromDate(
          new Date(converted.compliance.occupationalHealth.nextDue)
        );
      }
    }
  }

  return converted;
}

/**
 * Seed staff profiles to Firestore
 */
async function seedStaffProfiles() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, '..', 'data', 'staffProfiles172.json');

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Error: File not found at ${jsonPath}`);
      console.error('   Please run the profile generation script first.');
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const profiles: StaffProfile[] = JSON.parse(rawData);

    console.log(`📁 Loaded ${profiles.length} staff profiles from ${jsonPath}\n`);

    // Validate data
    if (profiles.length !== 172) {
      console.warn(`⚠️  Warning: Expected 172 profiles, but found ${profiles.length}`);
    }

    // Calculate FTE totals
    const totalFTE = profiles.reduce((sum, p) => sum + (p.fte || 0), 0);
    console.log(`📊 Total FTE: ${totalFTE.toFixed(1)}`);
    console.log(`👥 Total Headcount: ${profiles.length}\n`);

    // Show role breakdown
    const roleBreakdown = profiles.reduce((acc: any, p) => {
      const role = p.roles[0] || 'Unknown';
      if (!acc[role]) {
        acc[role] = { count: 0, fte: 0 };
      }
      acc[role].count++;
      acc[role].fte += p.fte || 0;
      return acc;
    }, {});

    console.log('📋 Role Breakdown:');
    Object.entries(roleBreakdown).forEach(([role, data]: [string, any]) => {
      console.log(`   ${role}: ${data.count} headcount (${data.fte.toFixed(1)} FTE)`);
    });
    console.log('');

    if (!isLiveMode) {
      console.log('✅ Dry-run complete! Data validated successfully.');
      console.log('\n📝 Sample profile preview:');
      console.log(JSON.stringify(profiles[0], null, 2).substring(0, 800) + '...\n');
      console.log('🚀 To seed this data to Firebase, run:');
      console.log('   npx ts-node scripts/seedStaffProfiles.ts --live\n');
      return;
    }

    // === LIVE MODE: Seed to Firestore ===
    console.log('🔥 LIVE MODE: Seeding to Firestore...\n');
    console.log(`   Project: ${firebaseConfig.projectId}`);
    console.log(`   Collection: ${STAFF_PROFILES_COLLECTION}\n`);

    // Use batched writes (Firestore limit: 500 operations per batch)
    const BATCH_SIZE = 500;
    let totalWritten = 0;

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchProfiles = profiles.slice(i, i + BATCH_SIZE);

      console.log(`📝 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchProfiles.length} profiles)...`);

      batchProfiles.forEach((profile) => {
        const docRef = db.collection(STAFF_PROFILES_COLLECTION).doc(profile.id);
        const convertedProfile = convertDatesToTimestamps(profile);
        batch.set(docRef, convertedProfile);
      });

      await batch.commit();
      totalWritten += batchProfiles.length;
      console.log(`   ✅ Batch committed successfully (${totalWritten}/${profiles.length})`);
    }

    console.log(`\n✨ SUCCESS! Seeded ${totalWritten} staff profiles to Firestore`);
    console.log(`   Collection: ${STAFF_PROFILES_COLLECTION}`);
    console.log(`   Project: ${firebaseConfig.projectId}\n`);

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total Headcount: ${profiles.length}`);
    console.log(`   Total FTE: ${totalFTE.toFixed(1)}`);
    console.log(`   Hospital: Royal London Hospital`);
    console.log(`   Trust: Barts Health NHS Trust\n`);

  } catch (error: any) {
    console.error('\n❌ ERROR during seeding:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the seeding function
seedStaffProfiles()
  .then(() => {
    if (isLiveMode) {
      console.log('✅ Seeding completed successfully!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
