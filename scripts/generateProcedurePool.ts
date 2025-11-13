// =============================================================================
// PROCEDURE POOL GENERATOR FOR PROCEDURES FIREBASE
// Creates a pool of ~20,000 procedures with RTT priorities for waiting list
// Organized by specialty/subspecialty with proper OPCS codes and PCS scores
// =============================================================================

import { SURGICAL_PROCEDURES_BY_SPECIALTY, Procedure } from '../lib/surgicalCompetencyData';
import { scoreProcedure } from '../lib/services/procedureScoringService';
import * as fs from 'fs';
import * as path from 'path';

// RTT Priority levels
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

interface ProcedurePoolItem {
  id: string;
  name: string;
  opcs4: string[];
  specialty: string;
  subspecialty?: string;
  pcsScore: number;
  priority: Priority;
  surgeon: string;
  surgeonInitials: string;
  createdAt: string;
}

// =============================================================================
// SPECIALTY MAPPING (User names → Database keys)
// =============================================================================

const SPECIALTY_MAPPING: Record<string, { dbKey: string; subcategories?: Record<string, string[]> }> = {
  'ENT': {
    dbKey: 'ENT (Ear, Nose & Throat)',
    subcategories: {
      'ENT ROBOTIC': ['Otology', 'Head & Neck'],
      'ENT LASER': ['Laryngology', 'Rhinology']
    }
  },
  'GENERAL SURGERY': {
    dbKey: 'General Surgery',
    subcategories: {
      'UPPER GASTROINTESTINAL': ['Upper GI'],
      'HEPATOBILIARY': ['Upper GI', 'Colorectal'], // Use Upper GI as closest match
      'HYPERTHERMIC INTRAPERITONEAL CHEMOTHERAPY': ['Colorectal'], // Complex colorectal surgery
      'COLORECTAL': ['Colorectal']
    }
  },
  'GYNAECOLOGY': {
    dbKey: 'Gynaecology',
    subcategories: {
      'GYNAE ROBOTIC': ['General', 'Urogynaecology'],
      'GYNAE FERTILITY': ['General', 'Obstetrics']
    }
  },
  'NEUROLOGY': {
    dbKey: 'Neurosurgery',
    subcategories: {
      'NEURO-ONCOLOGY': ['Cranial', 'Spinal']
    }
  },
  'OPTHALMOLOGY': {
    dbKey: 'Ophthalmology'
  },
  'ORAL AND MAXILLOFACIAL': {
    dbKey: 'Maxillofacial Surgery',
    subcategories: {
      'OMFS TRAUMA': ['Trauma'],
      'OMFS MANDIBLE': ['Trauma', 'Oral'],
      'ORTHOGNATIC': ['Orthognathic'],
      'DENTAL': ['Oral']
    }
  },
  'ORTHOPAEDICS': {
    dbKey: 'Trauma Orthopaedics',
    subcategories: {
      'ELECTIVE ORTHOPAEDIC JOINTS': ['Elective Hip', 'Elective Knee'],
      'ORTHOPAEDIC SPINE': ['Spinal'],
      'ORTHOPAEDIC TRAUMA': ['Hip Trauma', 'Knee Trauma', 'Shoulder', 'Hand & Wrist', 'Foot & Ankle']
    }
  },
  'PLASTICS': {
    dbKey: 'Plastic & Reconstructive Surgery',
    subcategories: {
      'BURNS & BREAST': ['Reconstructive', 'Cosmetic'],
      'DEEP INFERIOR EPIGASTRIC PERFORATOR': ['Reconstructive']
    }
  },
  'UROLOGY': {
    dbKey: 'Urology',
    subcategories: {
      'UROLOGY ROBOTIC': ['Open/Laparoscopic', 'Reconstruction'],
      'UROLOGY LASER': ['Endourology']
    }
  },
  'VASCULAR': {
    dbKey: 'Vascular Surgery'
  }
};

// ============================================================================
// HARDCODED SURGEONS REMOVED - TO BE REPLACED IN PHASE 1
// ============================================================================
//
// SURGEON DATA STRUCTURE (for reference):
// interface Surgeon {
//   name: string;         // Full name with title (e.g., "Mr Christopher Lee")
//   initials: string;     // Surgeon initials (e.g., "CL")
//   specialty: string;    // Specialty ID/name (e.g., "EMERGENCY", "ENT")
//   subspecialty?: string; // Optional subspecialty (e.g., "ENT ROBOTIC")
// }
//
// KEY RELATIONSHIPS:
// 1. Surgeon → Specialty (via specialty field)
// 2. Surgeon → Subspecialty (via subspecialty field)
// 3. Surgeon → Procedures in waiting list pool (assigned when generating procedures)
// 4. Each specialty/subspecialty should have 2-6 surgeons for realistic distribution
//
// PREVIOUS COVERAGE (for Phase 1 reference):
// - EMERGENCY: 6 surgeons
// - ENT: 4 surgeons (2 ENT ROBOTIC, 2 ENT LASER)
// - GENERAL SURGERY: 8 surgeons (across 4 subspecialties)
// - GYNAECOLOGY: 4 surgeons (2 GYNAE ROBOTIC, 2 GYNAE FERTILITY)
// - NEUROLOGY: 3 surgeons (NEURO-ONCOLOGY)
// - OPTHALMOLOGY: 3 surgeons
// - ORAL AND MAXILLOFACIAL: 6 surgeons (across 4 subspecialties)
// - ORTHOPAEDICS: 6 surgeons (across 3 subspecialties)
// - PLASTICS: 4 surgeons (across 2 subspecialties)
// - RENAL: 3 surgeons (RENAL TRANSPLANT)
// - UROLOGY: 4 surgeons (2 UROLOGY ROBOTIC, 2 UROLOGY LASER)
// - VASCULAR: 3 surgeons
// TOTAL: 56 surgeons across 12 specialties
//
// NOTE: This file is used to generate a procedure pool for the waiting list.
// When Phase 1 is complete, this should load surgeons from Firebase instead.
// ============================================================================

// TEMPORARILY EMPTY: Will be populated from Firebase in Phase 1
const SURGEONS: Array<{name: string; initials: string; specialty: string; subspecialty?: string}> = [];

// =============================================================================
// TARGET VOLUMES PER SPECIALTY/SUBSPECIALTY
// =============================================================================

const TARGET_VOLUMES: Record<string, number> = {
  'EMERGENCY': 2200,
  'ENT-ENT ROBOTIC': 700,
  'ENT-ENT LASER': 700,
  'GENERAL SURGERY-UPPER GASTROINTESTINAL': 900,
  'GENERAL SURGERY-HEPATOBILIARY': 600,
  'GENERAL SURGERY-HYPERTHERMIC INTRAPERITONEAL CHEMOTHERAPY': 175,
  'GENERAL SURGERY-COLORECTAL': 1050,
  'GYNAECOLOGY-GYNAE ROBOTIC': 800,
  'GYNAECOLOGY-GYNAE FERTILITY': 600,
  'NEUROLOGY-NEURO-ONCOLOGY': 700,
  'OPTHALMOLOGY': 2750,
  'ORAL AND MAXILLOFACIAL-OMFS TRAUMA': 500,
  'ORAL AND MAXILLOFACIAL-OMFS MANDIBLE': 400,
  'ORAL AND MAXILLOFACIAL-ORTHOGNATIC': 250,
  'ORAL AND MAXILLOFACIAL-DENTAL': 900,
  'ORTHOPAEDICS-ELECTIVE ORTHOPAEDIC JOINTS': 1350,
  'ORTHOPAEDICS-ORTHOPAEDIC SPINE': 700,
  'ORTHOPAEDICS-ORTHOPAEDIC TRAUMA': 1150,
  'PLASTICS-BURNS & BREAST': 700,
  'PLASTICS-DEEP INFERIOR EPIGASTRIC PERFORATOR': 200,
  'RENAL-RENAL TRANSPLANT': 400,
  'UROLOGY-UROLOGY ROBOTIC': 800,
  'UROLOGY-UROLOGY LASER': 700,
  'VASCULAR': 1050,
};

// =============================================================================
// PRIORITY DISTRIBUTION
// =============================================================================

function assignPriority(): Priority {
  const rand = Math.random();
  if (rand < 0.05) return 'P1'; // 5% urgent
  if (rand < 0.15) return 'P2'; // 10% high priority
  if (rand < 0.50) return 'P3'; // 35% standard
  if (rand < 0.85) return 'P4'; // 35% routine
  return 'P5'; // 15% low priority
}

// =============================================================================
// GENERATE PROCEDURE POOL
// =============================================================================

function generateProcedurePool(): ProcedurePoolItem[] {
  const pool: ProcedurePoolItem[] = [];
  let idCounter = 1;

  console.log('🏥 Generating procedure pool...\n');

  // Iterate through each user specialty
  for (const [userSpecialty, mapping] of Object.entries(SPECIALTY_MAPPING)) {
    const dbKey = mapping.dbKey;
    const specialtyData = SURGICAL_PROCEDURES_BY_SPECIALTY[dbKey];

    if (!specialtyData) {
      console.warn(`⚠️  No procedures found for ${userSpecialty} (DB key: ${dbKey})`);
      continue;
    }

    // Get surgeons for this specialty
    const specialtySurgeons = SURGEONS.filter(s => s.specialty === userSpecialty);

    if (specialtySurgeons.length === 0) {
      console.warn(`⚠️  No surgeons found for ${userSpecialty}`);
      continue;
    }

    // Handle specialties with subspecialties
    if (mapping.subcategories) {
      for (const [userSubspecialty, dbSubcategories] of Object.entries(mapping.subcategories)) {
        const targetKey = `${userSpecialty}-${userSubspecialty}`;
        const targetVolume = TARGET_VOLUMES[targetKey] || 100;

        // Collect procedures from all mapped subcategories
        const allProcedures: Procedure[] = [];

        for (const dbSubcategory of dbSubcategories) {
          const subcategoryData = specialtyData.subcategories?.[dbSubcategory];

          if (subcategoryData && subcategoryData.procedures) {
            allProcedures.push(...subcategoryData.procedures);
          }
        }

        if (allProcedures.length === 0) {
          console.warn(`⚠️  No procedures found for ${userSpecialty} - ${userSubspecialty} (DB: ${dbSubcategories.join(', ')})`);
          continue;
        }

        // Get surgeons for this subspecialty
        const subspecialtySurgeons = specialtySurgeons.filter(s => s.subspecialty === userSubspecialty);
        const surgeonsToUse = subspecialtySurgeons.length > 0 ? subspecialtySurgeons : specialtySurgeons;

        console.log(`📋 Generating ${targetVolume} procedures for ${userSpecialty} - ${userSubspecialty}...`);

        // Generate procedures
        for (let i = 0; i < targetVolume; i++) {
          const procedure = allProcedures[Math.floor(Math.random() * allProcedures.length)];
          const surgeon = surgeonsToUse[Math.floor(Math.random() * surgeonsToUse.length)];
          const scoreResult = scoreProcedure(procedure.name, procedure.opcs4, userSpecialty, userSubspecialty);

          pool.push({
            id: `PROC-${String(idCounter).padStart(6, '0')}`,
            name: procedure.name,
            opcs4: procedure.opcs4,
            specialty: userSpecialty,
            subspecialty: userSubspecialty,
            pcsScore: scoreResult.totalScore,
            priority: assignPriority(),
            surgeon: surgeon.name,
            surgeonInitials: surgeon.initials,
            createdAt: new Date().toISOString()
          });

          idCounter++;
        }
      }
    } else {
      // Specialty without subspecialties
      const targetVolume = TARGET_VOLUMES[userSpecialty] || 100;

      // Collect all procedures from all subcategories
      const allProcedures: Procedure[] = [];
      if (specialtyData.subcategories) {
        for (const subcategory of Object.values(specialtyData.subcategories)) {
          if (subcategory.procedures) {
            allProcedures.push(...subcategory.procedures);
          }
        }
      }

      if (allProcedures.length === 0) {
        console.warn(`⚠️  No procedures found for ${userSpecialty}`);
        continue;
      }

      console.log(`📋 Generating ${targetVolume} procedures for ${userSpecialty}...`);

      // Generate procedures
      for (let i = 0; i < targetVolume; i++) {
        const procedure = allProcedures[Math.floor(Math.random() * allProcedures.length)];
        const surgeon = specialtySurgeons[Math.floor(Math.random() * specialtySurgeons.length)];
        const scoreResult = scoreProcedure(procedure.name, procedure.opcs4, userSpecialty);

        pool.push({
          id: `PROC-${String(idCounter).padStart(6, '0')}`,
          name: procedure.name,
          opcs4: procedure.opcs4,
          specialty: userSpecialty,
          subspecialty: undefined,
          pcsScore: scoreResult.totalScore,
          priority: assignPriority(),
          surgeon: surgeon.name,
          surgeonInitials: surgeon.initials,
          createdAt: new Date().toISOString()
        });

        idCounter++;
      }
    }
  }

  return pool;
}

// =============================================================================
// STATISTICS
// =============================================================================

function generateStatistics(pool: ProcedurePoolItem[]) {
  console.log('\n📊 PROCEDURE POOL STATISTICS\n');
  console.log('=' .repeat(60));

  // Total procedures
  console.log(`\n✅ Total Procedures: ${pool.length.toLocaleString()}`);

  // By specialty
  const bySpecialty: Record<string, number> = {};
  const bySubspecialty: Record<string, number> = {};
  const byPriority: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 };

  pool.forEach(proc => {
    bySpecialty[proc.specialty] = (bySpecialty[proc.specialty] || 0) + 1;

    if (proc.subspecialty) {
      const key = `${proc.specialty} - ${proc.subspecialty}`;
      bySubspecialty[key] = (bySubspecialty[key] || 0) + 1;
    }

    byPriority[proc.priority]++;
  });

  console.log('\n📂 By Specialty:');
  Object.entries(bySpecialty)
    .sort(([, a], [, b]) => b - a)
    .forEach(([specialty, count]) => {
      console.log(`   ${specialty}: ${count}`);
    });

  console.log('\n📂 By Subspecialty (top 10):');
  Object.entries(bySubspecialty)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([subspecialty, count]) => {
      console.log(`   ${subspecialty}: ${count}`);
    });

  console.log('\n🚦 By Priority:');
  Object.entries(byPriority).forEach(([priority, count]) => {
    const percentage = ((count / pool.length) * 100).toFixed(1);
    console.log(`   ${priority}: ${count} (${percentage}%)`);
  });

  console.log('\n' + '='.repeat(60));
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🚀 Starting procedure pool generation...\n');

  const startTime = Date.now();

  // Generate pool
  const pool = generateProcedurePool();

  // Sort by specialty, then subspecialty, then priority
  pool.sort((a, b) => {
    if (a.specialty !== b.specialty) return a.specialty.localeCompare(b.specialty);
    if (a.subspecialty && b.subspecialty && a.subspecialty !== b.subspecialty) {
      return a.subspecialty.localeCompare(b.subspecialty);
    }
    return a.priority.localeCompare(b.priority);
  });

  // Generate statistics
  generateStatistics(pool);

  // Save to file
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'procedure_pool_2025.json');
  fs.writeFileSync(outputPath, JSON.stringify(pool, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Pool generation complete!`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`⏱️  Time taken: ${elapsed}s`);
  console.log(`\n🎉 Ready to upload to Procedures Firebase!`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
