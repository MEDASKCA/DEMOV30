const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBeXJz3IWRHAjzVxu7VaKpt8PdYbIr5er8",
  authDomain: "opsc-4.firebaseapp.com",
  projectId: "opsc-4",
  storageBucket: "opsc-4.firebasestorage.app",
  messagingSenderId: "791916086773",
  appId: "1:791916086773:web:154d42e305a436b4404cbc",
  measurementId: "G-ZZL6CTP85S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProcedures() {
  console.log('\n📊 Checking OPSC-4 Procedures Database...\n');

  // Get total count
  const allProcs = await getDocs(collection(db, 'procedures'));
  console.log(`Total procedures: ${allProcs.size}`);

  if (allProcs.size === 0) {
    console.log('\n❌ NO PROCEDURES IN DATABASE!');
    console.log('Upload failed or not attempted yet.\n');
    process.exit(0);
  }

  // Sample first 5 procedures
  const sampleQuery = query(collection(db, 'procedures'), limit(5));
  const sample = await getDocs(sampleQuery);

  console.log('\n📋 Sample procedures:');
  sample.forEach(doc => {
    const data = doc.data();
    console.log(`\n   ID: ${doc.id}`);
    console.log(`   Code: ${data.code}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Description: ${data.description}`);
    console.log(`   Specialty: ${data.specialtyName}`);
    console.log(`   Chapter: ${data.chapter}`);
    console.log(`   Source: ${data.source}`);
  });

  // Count by specialty
  const specialtyCount = {};
  allProcs.forEach(doc => {
    const specialty = doc.data().specialtyName || 'UNKNOWN';
    specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
  });

  console.log('\n📊 Breakdown by specialty:');
  Object.entries(specialtyCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([specialty, count]) => {
      console.log(`   ${specialty}: ${count}`);
    });

  process.exit(0);
}

checkProcedures().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
