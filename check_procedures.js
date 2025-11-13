const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProcedures() {
  console.log('\n📊 Checking Procedures Database...\n');

  // Get total count
  const allProcs = await getDocs(collection(db, 'procedures'));
  console.log(`Total procedures: ${allProcs.size}`);

  if (allProcs.size === 0) {
    console.log('\n❌ NO PROCEDURES IN DATABASE!');
    console.log('You are NOT using the OPCS-4.11 data yet.');
    console.log('\nPlease upload the file through the UI at /admin/procedures/opcs4-database\n');
    process.exit(0);
  }

  // Sample first 5 procedures
  const sampleQuery = query(collection(db, 'procedures'), limit(5));
  const sample = await getDocs(sampleQuery);

  console.log('\n📋 Sample procedures:');
  sample.forEach(doc => {
    const data = doc.data();
    console.log(`   ${data.code} - ${data.name}`);
    console.log(`      Specialty: ${data.specialtyName}`);
    console.log(`      Source: ${data.source || 'hardcoded'}`);
    console.log(`      Version: ${data.version || 'unknown'}`);
  });

  // Count by source
  const bySource = {};
  allProcs.forEach(doc => {
    const source = doc.data().source || 'hardcoded';
    bySource[source] = (bySource[source] || 0) + 1;
  });

  console.log('\n📊 Breakdown by source:');
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}`);
  });

  process.exit(0);
}

checkProcedures();
