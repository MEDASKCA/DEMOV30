// ============================================================================
// FIND CORRECT OPCS CODES
// Searches OPCS-4.10 database for correct codes for invalid procedures
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

// Manual corrections based on NHS clinical coding knowledge
const MANUAL_CORRECTIONS: Record<string, { oldCode: string; newCode: string; reason: string }[]> = {
  'Shoulder Arthroscopy - Subacromial Decompression': [
    { oldCode: 'W854', newCode: 'W85.4', reason: 'W85.4 = Endoscopic subacromial decompression' }
  ],
  'Shoulder Arthroscopy - Rotator Cuff Repair (Single Tendon)': [
    { oldCode: 'W805', newCode: 'W80.5', reason: 'W80.5 = Endoscopic repair of rotator cuff' }
  ],
  'Shoulder Arthroscopy - Rotator Cuff Repair (Massive Tear)': [
    { oldCode: 'W805', newCode: 'W80.5', reason: 'W80.5 = Endoscopic repair of rotator cuff' }
  ],
  'Shoulder Arthroscopy - Bankart Repair (Anterior Instability)': [
    { oldCode: 'W805', newCode: 'W80.5', reason: 'W80.5 = Endoscopic stabilisation of shoulder' }
  ],
  'Shoulder Arthroscopy - SLAP Repair': [
    { oldCode: 'W805', newCode: 'W80.5', reason: 'W80.5 = Endoscopic repair of labrum' }
  ],
  'Shoulder Arthroscopy - AC Joint Excision': [
    { oldCode: 'W854', newCode: 'W85.4', reason: 'W85.4 = Endoscopic excision of AC joint' }
  ],
  'Open Rotator Cuff Repair': [
    { oldCode: 'W805', newCode: 'T79.1', reason: 'T79.1 = Plastic repair of rotator cuff' }
  ],
  'Elbow Arthroscopy': [
    { oldCode: 'W826', newCode: 'W82.8', reason: 'W82.8 = Therapeutic endoscopic operations on elbow (use Y76.2 approach)' }
  ],
  'Tennis Elbow Release (Arthroscopic)': [
    { oldCode: 'W826', newCode: 'T66.8', reason: 'T66.8 = Release of common extensor origin' }
  ],
  'Trapeziectomy with Ligament Reconstruction': [
    { oldCode: 'W805', newCode: 'W48.1', reason: 'W48.1 = Excision of carpal bone' }
  ],
  'Wrist Arthroscopy': [
    { oldCode: 'W827', newCode: 'W82.8', reason: 'W82.8 = Therapeutic endoscopic operations on wrist (use Y76.2 approach)' }
  ],
  'Wrist Arthrodesis (Fusion)': [
    { oldCode: 'W584', newCode: 'W58.4', reason: 'W58.4 = Arthrodesis of wrist joint' },
    { oldCode: 'W585', newCode: 'W58.5', reason: 'W58.5 = Arthrodesis of radiocarpal joint' }
  ],
  'Distal Radius Fracture ORIF (K-wires)': [
    { oldCode: 'W294', newCode: 'W29.4', reason: 'W29.4 = Open reduction of fracture of radius and internal fixation using intramedullary device' }
  ],
  'Triple Arthrodesis': [
    { oldCode: 'W643', newCode: 'W04.2', reason: 'W04.2 = Triple fusion of joints of hindfoot' }
  ],
  'Lumbar Fusion ALIF (Anterior Lumbar Interbody Fusion)': [
    { oldCode: 'V364', newCode: 'V36.4', reason: 'V36.4 = Prosthetic replacement of lumbar intervertebral disc (or V38.4 for fusion)' }
  ],
  'Thoracolumbar Fusion': [
    { oldCode: 'V353', newCode: 'V35.3', reason: 'V35.3 = Arthrodesis of thoracic spine' }
  ],
  'Spinal Cord Decompression': [
    { oldCode: 'V354', newCode: 'V35.4', reason: 'V35.4 = Decompression of spinal cord' }
  ],
  'Laparoscopic Fundoplication (Nissen)': [
    { oldCode: 'G223', newCode: 'G22.3', reason: 'G22.3 = Laparoscopic fundoplication' }
  ],
  'Laparoscopic Fundoplication (Toupet)': [
    { oldCode: 'G223', newCode: 'G22.3', reason: 'G22.3 = Laparoscopic fundoplication' }
  ]
};

// Load validation report
function loadValidationReport() {
  const reportPath = path.join(__dirname, '..', 'opcs-validation-detailed-report.json');
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

// Load OPCS lookup
function loadOPCSLookup(): OPCSLookup {
  const lookupPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
  return JSON.parse(fs.readFileSync(lookupPath, 'utf-8'));
}

// Normalize code
function normalizeCode(code: string): string {
  return code.replace(/\./g, '').toUpperCase().trim();
}

// Check if code exists
function codeExists(code: string, lookup: OPCSLookup): boolean {
  const normalized = normalizeCode(code);
  return !!lookup.codeIndex[normalized];
}

// Generate correction script
function generateCorrections() {
  console.log('🔍 Loading validation report and OPCS lookup...\n');

  const report = loadValidationReport();
  const lookup = loadOPCSLookup();

  const invalidIssues = report.issues.filter((i: any) => i.issue === 'CODE NOT FOUND IN OPCS-4.10');

  console.log(`Found ${invalidIssues.length} invalid codes to correct\n`);
  console.log('='.repeat(80));
  console.log('PROPOSED CORRECTIONS');
  console.log('='.repeat(80));

  const corrections: Array<{
    procedure: string;
    oldCode: string;
    newCode: string;
    verified: boolean;
    description?: string;
  }> = [];

  for (const issue of invalidIssues) {
    const procName = issue.procedureName;
    const oldCode = issue.code;

    // Check if we have a manual correction
    const manualCorrection = MANUAL_CORRECTIONS[procName];

    if (manualCorrection) {
      for (const correction of manualCorrection) {
        if (correction.oldCode === oldCode) {
          const newCodeExists = codeExists(correction.newCode, lookup);

          console.log(`\n✓ ${procName}`);
          console.log(`  Old: ${oldCode} (invalid)`);
          console.log(`  New: ${correction.newCode} ${newCodeExists ? '✓' : '✗ INVALID'}`);
          console.log(`  Reason: ${correction.reason}`);

          if (newCodeExists) {
            const opcsCode = lookup.codeIndex[normalizeCode(correction.newCode)];
            console.log(`  Official: ${opcsCode.description}`);

            corrections.push({
              procedure: procName,
              oldCode,
              newCode: correction.newCode,
              verified: true,
              description: opcsCode.description
            });
          }
          break;
        }
      }
    } else {
      console.log(`\n⚠ ${procName}`);
      console.log(`  Old: ${oldCode} (invalid)`);
      console.log(`  Status: NEEDS MANUAL REVIEW`);
      console.log(`  Suggestion: ${issue.suggestedCorrection || 'None'}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total Corrections Found: ${corrections.length}/${invalidIssues.length}`);
  console.log('='.repeat(80));

  // Save corrections to file
  const correctionsPath = path.join(__dirname, '..', 'opcs-corrections.json');
  fs.writeFileSync(correctionsPath, JSON.stringify({
    generatedDate: new Date().toISOString(),
    totalCorrections: corrections.length,
    corrections
  }, null, 2));

  console.log(`\n📄 Corrections saved to: ${correctionsPath}\n`);

  return corrections;
}

generateCorrections();
