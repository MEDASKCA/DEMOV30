/**
 * Show all consultants grouped by hospitalId
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

async function showConsultants() {
  console.log('👨‍⚕️  All Consultants...\n');

  try {
    const consultantsSnap = await getDocs(collection(db, 'surgeons'));

    console.log(`Total consultants: ${consultantsSnap.size}\n`);

    const byHospital: { [key: string]: any[] } = {};

    consultantsSnap.forEach(doc => {
      const data = doc.data();
      const hospitalId = data.hospitalId || 'NO_HOSPITAL_ID';

      if (!byHospital[hospitalId]) {
        byHospital[hospitalId] = [];
      }

      byHospital[hospitalId].push({
        id: doc.id,
        name: data.fullName || data.name,
        specialty: data.specialty
      });
    });

    Object.entries(byHospital).forEach(([hospitalId, consultants]) => {
      console.log(`\n🏥 ${hospitalId}: ${consultants.length} consultants`);
      consultants.slice(0, 5).forEach(c => {
        console.log(`   - ${c.name} (${c.specialty})`);
      });
      if (consultants.length > 5) {
        console.log(`   ... and ${consultants.length - 5} more`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

showConsultants();
