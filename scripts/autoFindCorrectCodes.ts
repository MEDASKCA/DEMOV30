// ============================================================================
// AUTO-FIND CORRECT OPCS CODES
// Uses the OPCS lookup to automatically find correct codes
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OPCSCode {
  code: string;
  description: string;
  chapter: string;
  category: string;
  isMainCode: boolean;
}

interface OPCSLookup {
  codeIndex: Record<string, OPCSCode>;
}

// Load OPCS lookup
const lookupPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
const lookup: OPCSLookup = JSON.parse(fs.readFileSync(lookupPath, 'utf-8'));

// Search function
function search(term: string, limit: number = 5): OPCSCode[] {
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

// Procedure-to-search mapping
const procedureSearches: Record<string, string> = {
  'Shoulder Arthroscopy - Subacromial Decompression': 'subacromial decompression',
  'Shoulder Arthroscopy - Rotator Cuff Repair': 'rotator cuff',
  'Shoulder Arthroscopy - Bankart Repair': 'shoulder',
  'Shoulder Arthroscopy - SLAP Repair': 'labrum',
  'Shoulder Arthroscopy - AC Joint Excision': 'acromioclavicular',
  'Open Rotator Cuff Repair': 'rotator cuff',
  'Elbow Arthroscopy': 'elbow',
  'Tennis Elbow Release': 'extensor',
  'Trapeziectomy': 'trapezium',
  'Wrist Arthroscopy': 'wrist',
  'Wrist Arthrodesis': 'wrist fusion',
  'Distal Radius Fracture ORIF': 'radius',
  'Triple Arthrodesis': 'triple fusion',
  'Lumbar Fusion ALIF': 'lumbar',
  'Thoracolumbar Fusion': 'thoracic',
  'Spinal Cord Decompression': 'decompression',
  'Laparoscopic Fundoplication': 'fundoplication',
};

console.log('🔍 Searching OPCS database for correct codes...\n');
console.log('='.repeat(80));

for (const [procedure, searchTerm] of Object.entries(procedureSearches)) {
  console.log(`\n${procedure}:`);
  const results = search(searchTerm, 3);

  if (results.length > 0) {
    results.forEach(r => {
      console.log(`  ${r.code}: ${r.description}`);
    });
  } else {
    console.log(`  No results found for "${searchTerm}"`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ Search complete\n');
