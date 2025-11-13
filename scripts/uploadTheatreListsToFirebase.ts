// Upload Generated Theatre Lists to Firebase
import { readFileSync } from 'fs';
import { join } from 'path';
import { TheatreList } from '../lib/theatreListTypes';
import { batchSaveTheatreLists } from '../lib/services/theatreListService';

async function uploadData() {
  console.log('🚀 UPLOADING THEATRE LISTS TO FIREBASE');
  console.log('='.repeat(80));

  try {
    // Read the generated data
    const dataPath = join(process.cwd(), 'generated_theatre_lists.json');
    console.log(`📖 Reading data from: ${dataPath}`);

    const rawData = readFileSync(dataPath, 'utf-8');
    const lists: TheatreList[] = JSON.parse(rawData);

    console.log(`✅ Loaded ${lists.length} theatre lists from file`);
    console.log(`\n📊 Data Summary:`);
    console.log(`   • Total lists: ${lists.length}`);
    console.log(`   • Total cases: ${lists.reduce((sum, l) => sum + l.totalCases, 0)}`);
    console.log(`   • Date range: ${lists[0]?.date} to ${lists[lists.length - 1]?.date}`);

    // Upload to Firebase
    console.log(`\n🔥 Uploading to Firebase...`);
    await batchSaveTheatreLists(lists);

    console.log(`\n✅ Upload complete!`);
    console.log(`\n🎉 All ${lists.length} theatre lists are now in Firebase!\n`);
  } catch (error) {
    console.error('\n❌ Error uploading data:', error);
    process.exit(1);
  }
}

uploadData();
