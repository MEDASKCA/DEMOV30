import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkWaitingList() {
  const snap = await getDocs(collection(db, 'waitingList'));

  console.log('\n📊 WAITING LIST STATUS\n');
  console.log('═'.repeat(50));
  console.log('Total patients:', snap.size);

  let unscheduled = 0;
  let scheduled = 0;
  let waiting = 0;
  let notWaiting = 0;
  const statuses: Record<string, number> = {};

  snap.forEach(doc => {
    const data = doc.data();
    const status = data.status || 'unknown';
    statuses[status] = (statuses[status] || 0) + 1;

    if (data.isScheduled) {
      scheduled++;
    } else {
      unscheduled++;
    }

    if (data.status === 'waiting') {
      waiting++;
    } else {
      notWaiting++;
    }
  });

  console.log('\nBy isScheduled field:');
  console.log('  - Unscheduled (isScheduled=false):', unscheduled);
  console.log('  - Scheduled (isScheduled=true):', scheduled);

  console.log('\nBy status field:');
  Object.entries(statuses).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`);
  });

  const eligibleForGeneration = snap.docs.filter(doc => {
    const data = doc.data();
    return !data.isScheduled && data.status === 'waiting';
  }).length;

  console.log('\n═'.repeat(50));
  console.log('✅ ELIGIBLE FOR GENERATION:', eligibleForGeneration);
  console.log('   (isScheduled=false AND status=waiting)');
  console.log('═'.repeat(50));

  if (eligibleForGeneration === 0) {
    console.log('\n⚠️  WARNING: No patients eligible for generation!');
    console.log('   The Generate button will be DISABLED.\n');
    console.log('   To fix this, you need patients with:');
    console.log('   - isScheduled: false (or undefined)');
    console.log('   - status: "waiting"\n');
  } else {
    console.log(`\n✅ ${eligibleForGeneration} patients ready to generate!\n`);
  }
}

checkWaitingList()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
