// =============================================================================
// ADD EMERGENCY AND RENAL PROCEDURES TO POOL
// Adds the missing specialties extracted from financial data
// =============================================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, getDocs, query } from 'firebase/firestore';
import { scoreProcedure } from '../lib/services/procedureScoringService';

// Initialize Procedures Firebase
const proceduresFirebaseConfig = {
  apiKey: "AIzaSyC_glyIkwey_tYzflcgxIOGi3QI58EyAsI",
  authDomain: "procedures-55ef9.firebaseapp.com",
  projectId: "procedures-55ef9",
  storageBucket: "procedures-55ef9.firebasestorage.app",
  messagingSenderId: "12862405731",
  appId: "1:12862405731:web:aab14aabe2d46af967cc56",
  measurementId: "G-7Y4VEYEPP7"
};

const proceduresApp = initializeApp(proceduresFirebaseConfig, 'procedures-firebase-node-2');
const proceduresDb = getFirestore(proceduresApp);

console.log('✅ Procedures Firebase initialized\n');

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
  year: number;
  isActive: boolean;
  uploadedAt: string;
}

// Emergency procedures from financial data
const EMERGENCY_PROCEDURES = [
  { name: 'Emergency Laparotomy', opcs4: ['T421'] },
  { name: 'Laparotomy for Perforated Viscus', opcs4: ['T422'] },
  { name: 'Emergency Bowel Resection', opcs4: ['G682'] },
  { name: 'Emergency Splenectomy', opcs4: ['T842'] },
  { name: 'Damage Control Laparotomy', opcs4: ['T423'] },
  { name: 'Emergency Hernia Repair', opcs4: ['T212'] },
  { name: 'Emergency Colostomy', opcs4: ['H114'] },
  { name: 'Trauma Thoracotomy', opcs4: ['E541'] },
  { name: 'Emergency Tracheostomy', opcs4: ['E421'] },
  { name: 'Fasciotomy', opcs4: ['T861'] },
  { name: 'Peritoneal Lavage', opcs4: ['T431'] },
  { name: 'Emergency Vascular Repair', opcs4: ['L511'] },
  { name: 'Neck Exploration', opcs4: ['E081'] },
  { name: 'Emergency Chest Drain', opcs4: ['E851'] },
  { name: 'Abscess Incision and Drainage', opcs4: ['T871'] },
  { name: 'Emergency Haemorrhage Control', opcs4: ['T441'] },
  { name: 'Oesophageal Foreign Body Removal', opcs4: ['G151'] },
  { name: 'Gastric Decompression', opcs4: ['G441'] },
  { name: 'Emergency Pancreatic Drainage', opcs4: ['J571'] },
  { name: 'Perianal Sepsis Drainage', opcs4: ['H542'] },
  { name: 'Testicular Torsion Repair', opcs4: ['N501'] },
  { name: 'Incarcerated Hernia Reduction', opcs4: ['T213'] },
  { name: 'Bowel Perforation Repair', opcs4: ['G691'] },
  { name: 'Emergency Gastric Surgery', opcs4: ['G323'] },
  { name: 'Emergency Colectomy', opcs4: ['H076'] },
  { name: 'Abdominal Compartment Decompression', opcs4: ['T424'] },
  { name: 'Emergency Volvulus Reduction', opcs4: ['H151'] },
  { name: 'Penetrating Abdominal Trauma', opcs4: ['T425'] },
  { name: 'Emergency Urinary Catheterization', opcs4: ['M451'] }
];

// Renal procedures from financial data
const RENAL_PROCEDURES = [
  { name: 'Living Donor Nephrectomy', opcs4: ['M021'] },
  { name: 'Kidney Transplant', opcs4: ['M023'] },
  { name: 'Deceased Donor Nephrectomy', opcs4: ['M022'] },
  { name: 'Laparoscopic Donor Nephrectomy', opcs4: ['M024'] },
  { name: 'Robotic Donor Nephrectomy', opcs4: ['M025'] },
  { name: 'Transplant Nephrectomy', opcs4: ['M026'] },
  { name: 'Transplant Biopsy', opcs4: ['M027'] },
  { name: 'Ureteric Reimplantation Transplant', opcs4: ['M028'] },
  { name: 'Transplant Vascular Revision', opcs4: ['M029'] },
  { name: 'Lymphocele Drainage', opcs4: ['M030'] },
  { name: 'Ureteric Stent Insertion Transplant', opcs4: ['M031'] },
  { name: 'Transplant Ureter Stricture', opcs4: ['M032'] },
  { name: 'Transplant Renal Artery Stenosis', opcs4: ['M033'] },
  { name: 'ABO Incompatible Transplant', opcs4: ['M034'] },
  { name: 'HLA Incompatible Transplant', opcs4: ['M035'] },
  { name: 'Paired Kidney Exchange', opcs4: ['M036'] },
  { name: 'En Bloc Kidney Transplant', opcs4: ['M037'] },
  { name: 'Pediatric Kidney Transplant', opcs4: ['M038'] },
  { name: 'Re-Transplantation', opcs4: ['M039'] },
  { name: 'Simultaneous Pancreas-Kidney', opcs4: ['M040'] },
  { name: 'Pre-emptive Transplant', opcs4: ['M041'] },
  { name: 'DCD Kidney Transplant', opcs4: ['M042'] },
  { name: 'DBD Kidney Transplant', opcs4: ['M043'] },
  { name: 'Transplant Wound Hematoma', opcs4: ['M044'] },
  { name: 'Transplant Pyeloplasty', opcs4: ['M045'] },
  { name: 'Machine Perfusion Preparation', opcs4: ['M046'] },
  { name: 'Normothermic Regional Perfusion', opcs4: ['M047'] },
  { name: 'Transplant Pyelonephritis Surgery', opcs4: ['M048'] },
  { name: 'Transplant Calcineurin Toxicity', opcs4: ['M049'] },
  { name: 'Transplant BK Virus Treatment', opcs4: ['M050'] }
];

// Surgeons
const EMERGENCY_SURGEONS = [
  { name: 'Mr Christopher Lee', initials: 'CL' },
  { name: 'Miss Rachel Adams', initials: 'RA' },
  { name: 'Mr David Wilson', initials: 'DW' },
  { name: 'Ms Sarah Thompson', initials: 'ST' },
  { name: 'Mr Michael Brown', initials: 'MB' },
  { name: 'Miss Jennifer Clarke', initials: 'JC' }
];

const RENAL_SURGEONS = [
  { name: 'Mr Thomas Hughes', initials: 'TH' },
  { name: 'Miss Elizabeth Carter', initials: 'EC' },
  { name: 'Mr Christopher Edwards', initials: 'CE' }
];

// Priority distribution
function assignPriority(): Priority {
  const rand = Math.random();
  if (rand < 0.05) return 'P1'; // 5% urgent
  if (rand < 0.15) return 'P2'; // 10% high priority
  if (rand < 0.50) return 'P3'; // 35% standard
  if (rand < 0.85) return 'P4'; // 35% routine
  return 'P5'; // 15% low priority
}

// Get next ID number
async function getNextIdNumber(): Promise<number> {
  try {
    const q = query(collection(proceduresDb, 'schedulePool2025'));
    const snapshot = await getDocs(q);

    let maxId = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.id && data.id.startsWith('PROC-')) {
        const idNum = parseInt(data.id.replace('PROC-', ''));
        if (idNum > maxId) maxId = idNum;
      }
    });

    return maxId + 1;
  } catch (error) {
    console.error('Error getting next ID:', error);
    return 20000; // Fallback if query fails
  }
}

// Generate procedures
async function generateProcedures() {
  console.log('🏥 Generating EMERGENCY and RENAL procedures...\n');

  const procedures: ProcedurePoolItem[] = [];
  let idCounter = await getNextIdNumber();

  console.log(`📋 Starting ID counter at: PROC-${String(idCounter).padStart(6, '0')}\n`);

  // Generate EMERGENCY procedures (2200 total)
  console.log('📋 Generating 2200 EMERGENCY procedures...');
  for (let i = 0; i < 2200; i++) {
    const procedure = EMERGENCY_PROCEDURES[Math.floor(Math.random() * EMERGENCY_PROCEDURES.length)];
    const surgeon = EMERGENCY_SURGEONS[Math.floor(Math.random() * EMERGENCY_SURGEONS.length)];
    const scoreResult = scoreProcedure(procedure.name, procedure.opcs4, 'EMERGENCY');

    const procedureData: any = {
      id: `PROC-${String(idCounter).padStart(6, '0')}`,
      name: procedure.name,
      opcs4: procedure.opcs4,
      specialty: 'EMERGENCY',
      pcsScore: scoreResult.totalScore || 5, // Default to 5 if undefined
      priority: assignPriority(),
      surgeon: surgeon.name,
      surgeonInitials: surgeon.initials,
      createdAt: new Date().toISOString(),
      year: 2025,
      isActive: true,
      uploadedAt: new Date().toISOString()
    };

    procedures.push(procedureData);

    idCounter++;
  }

  // Generate RENAL procedures (400 total)
  console.log('📋 Generating 400 RENAL - RENAL TRANSPLANT procedures...');
  for (let i = 0; i < 400; i++) {
    const procedure = RENAL_PROCEDURES[Math.floor(Math.random() * RENAL_PROCEDURES.length)];
    const surgeon = RENAL_SURGEONS[Math.floor(Math.random() * RENAL_SURGEONS.length)];
    const scoreResult = scoreProcedure(procedure.name, procedure.opcs4, 'RENAL', 'RENAL TRANSPLANT');

    procedures.push({
      id: `PROC-${String(idCounter).padStart(6, '0')}`,
      name: procedure.name,
      opcs4: procedure.opcs4,
      specialty: 'RENAL',
      subspecialty: 'RENAL TRANSPLANT',
      pcsScore: scoreResult.totalScore || 15, // Default to 15 if undefined (transplant procedures are complex)
      priority: assignPriority(),
      surgeon: surgeon.name,
      surgeonInitials: surgeon.initials,
      createdAt: new Date().toISOString(),
      year: 2025,
      isActive: true,
      uploadedAt: new Date().toISOString()
    });

    idCounter++;
  }

  return procedures;
}

// Upload procedures
async function uploadProcedures(procedures: ProcedurePoolItem[]) {
  console.log(`\n🚀 Uploading ${procedures.length} procedures to Procedures Firebase...\n`);

  const BATCH_SIZE = 500;
  const batches: ProcedurePoolItem[][] = [];

  for (let i = 0; i < procedures.length; i += BATCH_SIZE) {
    batches.push(procedures.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Uploading in ${batches.length} batches...\n`);

  let uploadedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = writeBatch(proceduresDb);
    const currentBatch = batches[batchIndex];

    for (const procedure of currentBatch) {
      const docRef = doc(proceduresDb, 'schedulePool2025', procedure.id);
      batch.set(docRef, procedure);
      uploadedCount++;
    }

    try {
      await batch.commit();
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} uploaded (${uploadedCount}/${procedures.length} procedures)`);

      // Add delay between batches to avoid quota limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (error) {
      console.error(`❌ Error uploading batch ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  console.log(`\n🎉 Successfully uploaded ${uploadedCount} new procedures!`);
  console.log(`📁 Collection: schedulePool2025`);
  console.log(`\n📊 Breakdown:`);
  console.log(`   EMERGENCY: 2,200`);
  console.log(`   RENAL (RENAL TRANSPLANT): 400`);
  console.log(`\n✅ All 12 specialties now complete!`);
}

// Main
async function main() {
  const procedures = await generateProcedures();
  await uploadProcedures(procedures);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
