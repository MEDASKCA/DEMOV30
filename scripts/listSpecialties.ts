import { SURGICAL_PROCEDURES_BY_SPECIALTY } from '../lib/surgicalCompetencyData';

console.log('Available Specialties in Database:\n');

for (const [specialty, data] of Object.entries(SURGICAL_PROCEDURES_BY_SPECIALTY)) {
  console.log(`\n"${specialty}":`);

  if (data.subcategories) {
    console.log('  Subcategories:');
    for (const subcategory of Object.keys(data.subcategories)) {
      console.log(`    - "${subcategory}"`);
    }
  } else {
    console.log('  (no subcategories)');
  }
}
