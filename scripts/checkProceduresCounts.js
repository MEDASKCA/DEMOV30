const { OPCS4_PROCEDURES } = require('../lib/opcs4Procedures');

const counts = {};
OPCS4_PROCEDURES.forEach(proc => {
  counts[proc.specialtyName] = (counts[proc.specialtyName] || 0) + 1;
});

console.log('\n📊 Procedures by Specialty:\n');
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([spec, count]) => {
  console.log(`   ${spec}: ${count}`);
});

console.log(`\n✅ Total: ${OPCS4_PROCEDURES.length} procedures`);
