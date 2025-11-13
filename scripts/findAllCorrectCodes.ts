// ============================================================================
// COMPREHENSIVE OPCS CODE CORRECTIONS
// Based on NHS Clinical Coding Standards and OPCS-4.10
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive corrections based on NHS clinical coding knowledge
const COMPREHENSIVE_CORRECTIONS: Record<string, string[]> = {
  // Shoulder procedures
  'W854': ['O29.1'],  // Subacromial decompression
  'W805': ['T79.1', 'Y76.2'],  // Arthroscopic rotator cuff repair (T79.1 + Y76.2 for approach)

  // Elbow procedures
  'W826': ['W85.8', 'Y76.2'],  // Elbow arthroscopy (endoscopic ops + approach code)

  // Hand/Wrist procedures
  'W827': ['W85.8', 'Y76.2'],  // Wrist arthroscopy
  'W584': ['W58.4'],  // Wrist arthrodesis
  'W585': ['W58.5'],  // Radiocarpal arthrodesis
  'W294': ['W29.4'],  // ORIF radius

  // Foot/Ankle procedures
  'W643': ['W04.2'],  // Triple arthrodesis

  // Spine procedures
  'V364': ['V36.3'],  // Lumbar disc replacement
  'V353': ['V35.3'],  // Thoracic fusion
  'V354': ['V35.4'],  // Decompression

  // GI procedures
  'G223': ['G22.3'],  // Fundoplication
  'G272': ['G27.2'],  // Pyloromyotomy
  'G273': ['G27.3'],  // Pyloroplasty
  'G301': ['G30.1'],  // Gastrostomy
  'G302': ['G30.2'],  // PEG insertion
  'G343': ['G34.3'],  // Billroth I
  'G344': ['G34.4'],  // Billroth II
  'G345': ['G34.5'],  // Gastrectomy
  'G481': ['G48.1'],  // Right hemicolectomy
  'G482': ['G48.2'],  // Left hemicolectomy
  'G483': ['G48.3'],  // Sigmoid colectomy
  'G531': ['G53.1'],  // Anterior resection
  'G532': ['G53.2'],  // Abdominoperineal resection
  'G581': ['G58.1'],  // Ileostomy
  'G582': ['G58.2'],  // Colostomy

  // Hepatobiliary
  'J181': ['J18.1'],  // Open cholecystectomy
  'J182': ['J18.2'],  // Lap cholecystectomy
  'J273': ['J27.3'],  // Pancreaticoduodenectomy (Whipple)

  // Vascular
  'L271': ['L27.1'],  // Fem-pop bypass
  'L272': ['L27.2'],  // Fem-fem crossover
  'L283': ['L28.3'],  // Carotid endarterectomy
  'L362': ['L36.2'],  // AAA repair
  'L363': ['L36.3'],  // Endovascular AAA repair (EVAR)

  // Urology
  'M611': ['M61.1'],  // TURP
  'M612': ['M61.2'],  // Open prostatectomy
  'M651': ['M65.1'],  // Nephrectomy
  'M421': ['M42.1'],  // Pyeloplasty

  // Gynaecology
  'Q071': ['Q07.1'],  // Abdominal hysterectomy
  'Q072': ['Q07.2'],  // Vaginal hysterectomy
  'Q073': ['Q07.3'],  // Laparoscopic hysterectomy
  'Q101': ['Q10.1'],  // Myomectomy
  'Q182': ['Q18.2'],  // Salpingectomy
  'Q183': ['Q18.3'],  // Salpingo-oophorectomy

  // Urogynae
  'P221': ['P22.1'],  // Anterior repair
  'P222': ['P22.2'],  // Posterior repair
  'P223': ['P22.3'],  // Anterior and posterior repair
  'P241': ['P24.1'],  // TVT
  'P242': ['P24.2'],  // Colposuspension

  // Obstetrics
  'R171': ['R17.1'],  // LSCS elective
  'R172': ['R17.2'],  // LSCS emergency
  'R251': ['R25.1'],  // Episiotomy
  'R252': ['R25.2'],  // Repair of perineal tear

  // Breast
  'B271': ['B27.1'],  // Wide local excision
  'B272': ['B27.2'],  // Mastectomy
  'B281': ['B28.1'],  // Breast reconstruction
  'B291': ['B29.1'],  // Axillary node clearance
  'B292': ['B29.2'],  // Sentinel node biopsy

  // Plastics
  'S481': ['S48.1'],  // Split skin graft
  'S482': ['S48.2'],  // Full thickness skin graft
  'S491': ['S49.1'],  // Flap

  // ENT
  'E201': ['E20.1'],  // Tonsillectomy
  'E202': ['E20.2'],  // Adenoidectomy
  'E203': ['E20.3'],  // Adenotonsillectomy
  'E041': ['E04.1'],  // Septoplasty
  'E421': ['E42.1'],  // Myringoplasty
  'E422': ['E42.2'],  // Tympanoplasty
  'E501': ['E50.1'],  // Thyroidectomy
  'E502': ['E50.2'],  // Hemithyroidectomy

  // Ophthalmology
  'C711': ['C71.1'],  // Phacoemulsification + IOL
  'C722': ['C72.2'],  // Trabeculectomy
  'C751': ['C75.1'],  // Vitrectomy

  // Orthopaedics - Hip
  'W371': ['W38.1'],  // THR cemented
  'W381': ['W37.1'],  // THR uncemented
  'W391': ['W39.1'],  // THR hybrid
  'W931': ['W93.1'],  // Acetabular cup

  // Orthopaedics - Knee
  'W401': ['W40.1'],  // TKR cemented
  'W411': ['W41.1'],  // TKR uncemented
  'W421': ['W42.1'],  // TKR hybrid
  'W192': ['W19.2'],  // ORIF tibial plateau

  // Neurosurgery
  'A051': ['A05.1'],  // Craniotomy
  'V091': ['V09.1'],  // Lumbar discectomy
  'V092': ['V09.2'],  // Cervical discectomy
  'V381': ['V38.1'],  // Spinal fusion anterior
  'V382': ['V38.2'],  // Spinal fusion posterior
  'V383': ['V38.3'],  // Spinal fusion posterolateral
  'V384': ['V38.4'],  // Spinal fusion 360
};

// Function to verify codes exist
async function verifyAndApplyCorrections() {
  console.log('🔍 Loading OPCS lookup database...\n');
  const lookupPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
  const lookup = JSON.parse(fs.readFileSync(lookupPath, 'utf-8'));

  const normalizeCode = (code: string) => code.replace(/\./g, '').toUpperCase().trim();

  let validCorrections = 0;
  let invalidCorrections = 0;

  console.log('Verifying proposed corrections:\n');
  console.log('='.repeat(80));

  for (const [oldCode, newCodes] of Object.entries(COMPREHENSIVE_CORRECTIONS)) {
    const allValid = newCodes.every(newCode => {
      const normalized = normalizeCode(newCode);
      return !!lookup.codeIndex[normalized];
    });

    if (allValid) {
      validCorrections++;
      console.log(`✓ ${oldCode} → ${newCodes.join(', ')}`);
      newCodes.forEach(newCode => {
        const normalized = normalizeCode(newCode);
        const opcsCode = lookup.codeIndex[normalized];
        if (opcsCode) {
          console.log(`  ${newCode}: ${opcsCode.description}`);
        }
      });
    } else {
      invalidCorrections++;
      console.log(`✗ ${oldCode} → ${newCodes.join(', ')} (INVALID)`);
    }
  }

  console.log('='.repeat(80));
  console.log(`\nValid Corrections: ${validCorrections}`);
  console.log(`Invalid Corrections: ${invalidCorrections}\n`);

  // Save corrections map
  const correctionsPath = path.join(__dirname, '..', 'opcs-correction-map.json');
  fs.writeFileSync(correctionsPath, JSON.stringify(COMPREHENSIVE_CORRECTIONS, null, 2));
  console.log(`📄 Corrections map saved to: ${correctionsPath}\n`);
}

verifyAndApplyCorrections();
