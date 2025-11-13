/**
 * Check Firestore Data - Verify what collections and data exist
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkData() {
  console.log('🔍 Checking Firestore Data...\n');

  try {
    // Check surgeons
    console.log('👨‍⚕️ SURGEONS Collection:');
    const surgeonsSnap = await getDocs(collection(db, 'surgeons'));
    console.log(`   Total: ${surgeonsSnap.size} surgeons`);

    const specialtyCounts: Record<string, number> = {};
    surgeonsSnap.forEach(doc => {
      const data = doc.data();
      const specialty = data.specialtyName || data.specialty || 'Unknown';
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
    });

    console.log('   By Specialty:');
    Object.entries(specialtyCounts).forEach(([specialty, count]) => {
      console.log(`      - ${specialty}: ${count} surgeons`);
    });

    // Show first 3 surgeons as examples
    console.log('   Example surgeons:');
    surgeonsSnap.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log(`      - ${data.title} ${data.firstName} ${data.lastName} (${data.specialtyName || data.specialty})`);
    });

    // Check waiting list
    console.log('\n📋 WAITING LIST Collection:');
    const waitingListSnap = await getDocs(collection(db, 'waitingList'));
    console.log(`   Total: ${waitingListSnap.size} patients`);

    const scheduledCount = waitingListSnap.docs.filter(doc => doc.data().isScheduled).length;
    console.log(`   Scheduled: ${scheduledCount}`);
    console.log(`   Unscheduled: ${waitingListSnap.size - scheduledCount}`);

    // Check theatres
    console.log('\n🏛️  THEATRES Collection:');
    const theatresSnap = await getDocs(collection(db, 'theatres'));
    console.log(`   Total: ${theatresSnap.size} theatres`);

    // Check theatre units
    console.log('\n📍 THEATRE UNITS Collection:');
    const unitsSnap = await getDocs(collection(db, 'theatreUnits'));
    console.log(`   Total: ${unitsSnap.size} units`);

    // Check specialty mappings
    console.log('\n🗺️  SPECIALTY THEATRE MAPPINGS Collection:');
    const mappingsSnap = await getDocs(collection(db, 'specialtyTheatreMappings'));
    console.log(`   Total: ${mappingsSnap.size} mappings`);

    console.log('   Specialties mapped:');
    mappingsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`      - ${data.specialtyName}: ${data.theatrePriorities?.length || 0} theatre(s)`);
    });

    // Check anaesthetists
    console.log('\n💉 ANAESTHETISTS Collection:');
    const anaesthetistsSnap = await getDocs(collection(db, 'anaesthetists'));
    console.log(`   Total: ${anaesthetistsSnap.size} anaesthetists`);
    if (anaesthetistsSnap.size === 0) {
      console.log('   ⚠️  WARNING: No anaesthetists found! Need to create this collection.');
    }

    console.log('\n✅ Data check complete!');

  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkData();
