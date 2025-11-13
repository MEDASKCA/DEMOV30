// ============================================================================
// BUILD COMPREHENSIVE CORRECTIONS
// Systematically find correct codes for all invalid procedures
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OPCSCode {
  code: string;
  description: string;
}

interface OPCSLookup {
  codeIndex: Record<string, OPCSCode>;
}

// Load
const lookupPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
const lookup: OPCSLookup = JSON.parse(fs.readFileSync(lookupPath, 'utf-8'));

const reportPath = path.join(__dirname, '..', 'opcs-validation-detailed-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Search function
function search(term: string, limit: number = 10): OPCSCode[] {
  const results: OPCSCode[] = [];
  const searchLower = term.toLowerCase();

  for (const code of Object.values(lookup.codeIndex)) {
    if (results.length >= limit) break;
    if (code.description.toLowerCase().includes(searchLower)) {
      results.push(code);
    }
  }
  return results;
}

// Get by code
function getCode(code: string): OPCSCode | null {
  const normalized = code.replace(/\./g, '').toUpperCase().trim();
  return lookup.codeIndex[normalized] || null;
}

// Manual corrections based on findings and NHS coding knowledge
const CORRECTIONS: Record<string, {
  newCodes: string[];
  reasoning: string;
  procedureName: string;
}> = {
  // Shoulder
  'W854': {
    newCodes: ['O29.1', 'Y76.7'],
    reasoning: 'O29.1 = Subacromial decompression, Y76.7 = Arthroscopic approach',
    procedureName: 'Shoulder Arthroscopy - Subacromial Decompression'
  },
  'W805': {
    newCodes: ['T79.1', 'Y76.7'],
    reasoning: 'T79.1 = Plastic repair of rotator cuff, Y76.7 = Arthroscopic approach',
    procedureName: 'Shoulder Arthroscopy - Rotator Cuff Repair'
  },

  // Elbow
  'W826': {
    newCodes: ['W85.8', 'Y76.7'],
    reasoning: 'W85.8 = Other therapeutic endoscopic operations, Y76.7 = Arthroscopic approach',
    procedureName: 'Elbow Arthroscopy'
  },

  // Wrist/Hand
  'W827': {
    newCodes: ['W85.8', 'Y76.7'],
    reasoning: 'W85.8 = Other therapeutic endoscopic operations, Y76.7 = Arthroscopic approach',
    procedureName: 'Wrist Arthroscopy'
  },
  'W584': {
    newCodes: ['W58.8'],
    reasoning: 'W58.8 = Other specified reconstruction of joint (includes arthrodesis)',
    procedureName: 'Wrist Arthrodesis'
  },
  'W585': {
    newCodes: ['W58.8'],
    reasoning: 'W58.8 = Other specified reconstruction of joint',
    procedureName: 'Radiocarpal Arthrodesis'
  },
  'W294': {
    newCodes: ['W29.8'],
    reasoning: 'W29.8 = Other specified skeletal traction (K-wire fixation)',
    procedureName: 'Distal Radius Fracture ORIF (K-wires)'
  },

  // Foot/Ankle
  'W643': {
    newCodes: ['W04.2'],
    reasoning: 'W04.2 = Triple fusion of joints of hindfoot',
    procedureName: 'Triple Arthrodesis'
  },

  // Spine
  'V364': {
    newCodes: ['V36.3'],
    reasoning: 'V36.3 = Prosthetic replacement of lumbar intervertebral disc',
    procedureName: 'Lumbar Fusion ALIF'
  },
  'V353': {
    newCodes: ['V38.2'],
    reasoning: 'V38.2 = Posterior fusion of spine',
    procedureName: 'Thoracolumbar Fusion'
  },
  'V354': {
    newCodes: ['V09.8'],
    reasoning: 'V09.8 = Other specified decompression of spinal cord',
    procedureName: 'Spinal Cord Decompression'
  },

  // GI
  'G223': {
    newCodes: ['G24.3'],
    reasoning: 'G24.3 = Antireflux fundoplication using abdominal approach',
    procedureName: 'Laparoscopic Fundoplication'
  },
  'G272': {
    newCodes: ['T27.1'],
    reasoning: 'T27.1 = Pyloromyotomy',
    procedureName: 'Pyloromyotomy'
  },
  'G273': {
    newCodes: ['G40.1'],
    reasoning: 'G40.1 = Pyloroplasty',
    procedureName: 'Pyloroplasty'
  },

  // Mismatched Hip codes
  'W371-hip': {
    newCodes: ['W37.1'],
    reasoning: 'W37.1 = Primary THR NOT using cement (uncemented)',
    procedureName: 'Hemiarthroplasty (Uncemented)'
  },
  'W381-hip': {
    newCodes: ['W38.1'],
    reasoning: 'W38.1 = Primary THR using cement (cemented)',
    procedureName: 'Hemiarthroplasty (Cemented)'
  },
  'W822-knee': {
    newCodes: ['W82.8', 'Y76.7'],
    reasoning: 'Should NOT use knee code for hip arthroscopy',
    procedureName: 'Hip Arthroscopy (WRONG - using knee code)'
  },
  'Y762-nasal': {
    newCodes: ['Y76.7'],
    reasoning: 'Y76.7 = Arthroscopic approach (Y76.2 is nasal surgery!)',
    procedureName: 'All arthroscopy procedures'
  }
};

// Build comprehensive correction map
console.log('🔧 Building comprehensive correction map...\n');
console.log('='.repeat(80));

let correctionCount = 0;
const correctionMap: Record<string, {
  oldCode: string;
  newCodes: string[];
  reasoning: string;
  procedureName: string;
  verified: boolean;
}> = {};

for (const [oldCode, correction] of Object.entries(CORRECTIONS)) {
  // Verify all new codes exist
  const allValid = correction.newCodes.every(code => {
    const c = getCode(code);
    return c !== null;
  });

  console.log(`\n${oldCode} → ${correction.newCodes.join(' + ')}`);
  console.log(`  Procedure: ${correction.procedureName}`);
  console.log(`  Reasoning: ${correction.reasoning}`);
  console.log(`  Status: ${allValid ? '✓ VERIFIED' : '✗ INVALID'}`);

  if (allValid) {
    correction.newCodes.forEach(code => {
      const opcsCode = getCode(code);
      if (opcsCode) {
        console.log(`    ${code}: ${opcsCode.description}`);
      }
    });

    correctionMap[oldCode] = {
      oldCode,
      newCodes: correction.newCodes,
      reasoning: correction.reasoning,
      procedureName: correction.procedureName,
      verified: true
    };
    correctionCount++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\nTotal Verified Corrections: ${correctionCount}\n`);

// Save correction map
const mapPath = path.join(__dirname, '..', 'opcs-final-correction-map.json');
fs.writeFileSync(mapPath, JSON.stringify(correctionMap, null, 2));
console.log(`📄 Correction map saved to: ${mapPath}\n`);

// Print summary of invalid issues still needing attention
const invalidIssues = report.issues.filter((i: any) => i.issue === 'CODE NOT FOUND IN OPCS-4.10');
const codes = invalidIssues.map((i: any) => String(i.code));
const uniqueInvalidCodes: string[] = Array.from(new Set(codes));

console.log(`Total Invalid Codes Found: ${uniqueInvalidCodes.length}`);
console.log(`Corrections Mapped: ${correctionCount}`);
console.log(`Remaining to Review: ${uniqueInvalidCodes.length - correctionCount}\n`);

// List remaining codes that need manual review
const correctedCodes = Object.keys(correctionMap);
const remaining = uniqueInvalidCodes.filter((code: string) => !correctedCodes.includes(code));

if (remaining.length > 0) {
  console.log('⚠️  Codes still needing review:');
  remaining.forEach((code: string) => {
    const issues = invalidIssues.filter((i: any) => i.code === code);
    console.log(`  ${code} (${issues.length} procedures)`);
    issues.slice(0, 2).forEach((i: any) => {
      console.log(`    - ${i.procedureName}`);
    });
  });
}
