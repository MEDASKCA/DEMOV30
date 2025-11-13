// ============================================================================
// TEST PROCEDURE SCORING
// Tests the 4-factor scoring system on sample procedures
// ============================================================================

import { scoreProcedure } from '../lib/services/procedureScoringService.js';

// Sample procedures to test
const testProcedures = [
  {
    name: 'Laparotomy - Exploratory',
    opcs4: ['T421'],
    specialtyName: 'Emergency',
  },
  {
    name: 'Appendicectomy - Emergency',
    opcs4: ['H011', 'H012'],
    specialtyName: 'Emergency',
  },
  {
    name: 'Total Hip Replacement (THR) Uncemented',
    opcs4: ['W371', 'W381'],
    specialtyName: 'Orthopaedics',
  },
  {
    name: 'Shoulder Arthroscopy - Subacromial Decompression',
    opcs4: ['O291', 'Y767'],
    specialtyName: 'Orthopaedics',
  },
  {
    name: 'Craniotomy',
    opcs4: ['A051'],
    specialtyName: 'Neurosurgery',
  },
  {
    name: 'Coronary Artery Bypass Graft',
    opcs4: ['K401', 'K402'],
    specialtyName: 'Cardiac',
  },
  {
    name: 'Hernia Repair - Inguinal',
    opcs4: ['T201'],
    specialtyName: 'General Surgery',
  },
  {
    name: 'Cataract Surgery - Phacoemulsification',
    opcs4: ['C711'],
    specialtyName: 'Ophthalmology',
  },
  {
    name: 'Colonoscopy - Diagnostic',
    opcs4: ['H222'],
    specialtyName: 'Endoscopy',
    subspecialtyName: 'Gastroscopy and Colonoscopy',
  },
  {
    name: 'Whipple Procedure (Pancreaticoduodenectomy)',
    opcs4: ['J273'],
    specialtyName: 'Hepatobiliary',
  },
];

console.log('🎯 TESTING PROCEDURE SCORING SYSTEM\n');
console.log('='.repeat(100));
console.log('Scoring Factors:');
console.log('  1. Complexity (1-5): Minor to Major');
console.log('  2. Duration (1-5): Based on estimated hours');
console.log('  3. Variability (1-5): Consistent to Highly Variable');
console.log('  4. Surgeon Level (1-5): Basic to Expert');
console.log('  Total Score: Sum of all 4 factors (typically 4-10 points)');
console.log('  Custom Code: SPECIALTY-SCORE (e.g., EMER-1, ORTHO-3)');
console.log('='.repeat(100));

for (const proc of testProcedures) {
  console.log(`\n📋 ${proc.name}`);
  console.log(`   Specialty: ${proc.specialtyName}`);
  console.log(`   OPCS Codes: ${proc.opcs4.join(', ')}`);

  const score = scoreProcedure(
    proc.name,
    proc.opcs4,
    proc.specialtyName,
    proc.subspecialtyName
  );

  console.log(`\n   📊 SCORE BREAKDOWN:`);
  console.log(`   ├─ Custom Code: ${score.customCode}`);
  console.log(`   ├─ Complexity: ${score.complexityScore}/5 (${score.complexity})`);
  console.log(`   ├─ Duration: ${score.durationScore}/5 (${score.estimatedDuration} min)`);
  console.log(`   ├─ Variability: ${score.variabilityScore}/5`);
  console.log(`   ├─ Surgeon Level: ${score.surgeonLevelScore}/5`);
  console.log(`   └─ AVERAGE SCORE: ${score.averageScore}/5`);
  console.log(`\n   💡 Reasoning: ${score.reasoning}`);
  console.log(`   ⚡ Confidence: ${score.confidence.toUpperCase()}`);
  console.log('   ' + '-'.repeat(96));
}

console.log('\n' + '='.repeat(100));
console.log('✅ Testing complete!\n');

// Summary statistics
console.log('📈 SUMMARY STATISTICS:\n');
const scores = testProcedures.map(p =>
  scoreProcedure(p.name, p.opcs4, p.specialtyName, p.subspecialtyName)
);

const avgComplexity = scores.reduce((sum, s) => sum + s.complexityScore, 0) / scores.length;
const avgDuration = scores.reduce((sum, s) => sum + s.durationScore, 0) / scores.length;
const avgVariability = scores.reduce((sum, s) => sum + s.variabilityScore, 0) / scores.length;
const avgSurgeonLevel = scores.reduce((sum, s) => sum + s.surgeonLevelScore, 0) / scores.length;
const avgOverall = scores.reduce((sum, s) => sum + s.averageScore, 0) / scores.length;

console.log(`Average Complexity Score: ${avgComplexity.toFixed(1)}/5`);
console.log(`Average Duration Score: ${avgDuration.toFixed(1)}/5`);
console.log(`Average Variability Score: ${avgVariability.toFixed(1)}/5`);
console.log(`Average Surgeon Level Score: ${avgSurgeonLevel.toFixed(1)}/5`);
console.log(`Average Overall Score: ${avgOverall.toFixed(1)}/5\n`);

console.log('Custom Codes Generated:');
scores.forEach((s, i) => {
  console.log(`  ${s.customCode} - ${testProcedures[i].name}`);
});
console.log('');
