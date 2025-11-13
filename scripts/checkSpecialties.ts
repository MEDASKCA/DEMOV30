import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';

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

async function checkSpecialties() {
  try {
    console.log('Fetching specialties from Firebase...\n');

    const q = query(collection(db, 'specialties'));
    const snapshot = await getDocs(q);

    const specialties: FirebaseSpecialty[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      specialties.push({
        id: doc.id,
        name: data.name,
        abbreviation: data.abbreviation || data.name.substring(0, 6).toUpperCase(),
        subspecialties: data.subspecialties || []
      });
    });

    specialties.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${specialties.length} specialties:\n`);

    let totalCategories = 0;

    specialties.forEach((specialty, index) => {
      console.log(`${index + 1}. ${specialty.name} (${specialty.abbreviation})`);

      if (specialty.subspecialties && specialty.subspecialties.length > 0) {
        console.log(`   Subspecialties (${specialty.subspecialties.length}):`);
        specialty.subspecialties.forEach((sub, subIndex) => {
          console.log(`   ${subIndex + 1}. ${sub.name} (${sub.abbreviation})`);
          totalCategories++;
        });
      } else {
        totalCategories++;
      }
      console.log('');
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total Specialties: ${specialties.length}`);
    console.log(`Total Categories (including subspecialties): ${totalCategories}`);
    console.log(`\nData Requirements:`);
    console.log(`- Procedures needed: ${totalCategories * 30} (30 per category)`);
    console.log(`- Surgeons needed: ${totalCategories * 3} (3 per category)`);

  } catch (error) {
    console.error('Error fetching specialties:', error);
  }
}

checkSpecialties();
