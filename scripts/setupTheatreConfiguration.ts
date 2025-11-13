/**
 * Setup Theatre Configuration
 * Initializes Firestore with theatre units, theatres, and specialty-theatre mappings
 * for the Royal London Hospital
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWzAZiMVlGU1h7CLZRR1Qc-0BxKkIDNW4",
  authDomain: "medaskca-93d48.firebaseapp.com",
  projectId: "medaskca-93d48",
  storageBucket: "medaskca-93d48.firebasestorage.app",
  messagingSenderId: "830746933399",
  appId: "1:830746933399:web:b94a042718d64989f7d1d2",
  measurementId: "G-ETHE315F6E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HOSPITAL_ID = 'royal-london';

// Theatre Units Configuration
const THEATRE_UNITS = [
  {
    id: 'main-suite',
    name: 'Main Theatre Suite',
    location: 'Floor 2, West Wing',
    hospitalId: HOSPITAL_ID,
    numberOfTheatres: 6,
    order: 1
  },
  {
    id: 'emergency-suite',
    name: 'Emergency Theatre Suite',
    location: 'Floor 1, Emergency Department',
    hospitalId: HOSPITAL_ID,
    numberOfTheatres: 2,
    order: 2
  },
  {
    id: 'specialized-suite',
    name: 'Specialized Procedures Suite',
    location: 'Floor 3, East Wing',
    hospitalId: HOSPITAL_ID,
    numberOfTheatres: 2,
    order: 3
  }
];

// Theatres Configuration
const THEATRES = [
  // Main Suite Theatres (6 theatres)
  { id: 'THR-001', name: 'Theatre 1', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },
  { id: 'THR-002', name: 'Theatre 2', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },
  { id: 'THR-003', name: 'Theatre 3', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },
  { id: 'THR-004', name: 'Theatre 4', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },
  { id: 'THR-005', name: 'Theatre 5', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },
  { id: 'THR-006', name: 'Theatre 6', unitId: 'main-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '18:00' }, sessionDuration: 600 },

  // Emergency Suite Theatres (2 theatres - 24/7)
  { id: 'THR-007', name: 'Emergency Theatre 1', unitId: 'emergency-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '00:00', end: '23:59' }, sessionDuration: 720 },
  { id: 'THR-008', name: 'Emergency Theatre 2', unitId: 'emergency-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '00:00', end: '23:59' }, sessionDuration: 720 },

  // Specialized Suite Theatres (2 theatres)
  { id: 'THR-009', name: 'Specialized Theatre 1', unitId: 'specialized-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '20:00' }, sessionDuration: 720 },
  { id: 'THR-010', name: 'Specialized Theatre 2', unitId: 'specialized-suite', hospitalId: HOSPITAL_ID, status: 'available', openingHours: { start: '08:00', end: '20:00' }, sessionDuration: 720 }
];

// Specialty-Theatre Mappings
// These define which specialties use which theatres and their priorities
const SPECIALTY_MAPPINGS = [
  // Orthopaedics - Main Suite Theatres 1, 2
  {
    id: 'mapping-ortho',
    specialtyId: 'orthopaedics',
    specialtyName: 'Orthopaedics',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-001', theatreName: 'Theatre 1', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 1 },
      { theatreId: 'THR-002', theatreName: 'Theatre 2', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 2 }
    ]
  },
  // General Surgery - Main Suite Theatres 3, 4
  {
    id: 'mapping-general-surgery',
    specialtyId: 'general-surgery',
    specialtyName: 'General Surgery',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-003', theatreName: 'Theatre 3', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 1 },
      { theatreId: 'THR-004', theatreName: 'Theatre 4', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 2 }
    ]
  },
  // Trauma - Emergency Theatres
  {
    id: 'mapping-trauma',
    specialtyId: 'trauma',
    specialtyName: 'Trauma',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-007', theatreName: 'Emergency Theatre 1', unitId: 'emergency-suite', unitName: 'Emergency Theatre Suite', priority: 1 },
      { theatreId: 'THR-008', theatreName: 'Emergency Theatre 2', unitId: 'emergency-suite', unitName: 'Emergency Theatre Suite', priority: 2 }
    ]
  },
  // Emergency - Emergency Theatres
  {
    id: 'mapping-emergency',
    specialtyId: 'emergency',
    specialtyName: 'Emergency',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-007', theatreName: 'Emergency Theatre 1', unitId: 'emergency-suite', unitName: 'Emergency Theatre Suite', priority: 1 },
      { theatreId: 'THR-008', theatreName: 'Emergency Theatre 2', unitId: 'emergency-suite', unitName: 'Emergency Theatre Suite', priority: 2 }
    ]
  },
  // Gynaecology - Main Suite Theatre 5
  {
    id: 'mapping-gynae',
    specialtyId: 'gynaecology',
    specialtyName: 'Gynaecology',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-005', theatreName: 'Theatre 5', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 1 }
    ]
  },
  // Urology - Main Suite Theatre 6
  {
    id: 'mapping-urology',
    specialtyId: 'urology',
    specialtyName: 'Urology',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-006', theatreName: 'Theatre 6', unitId: 'main-suite', unitName: 'Main Theatre Suite', priority: 1 }
    ]
  },
  // Vascular - Specialized Suite Theatre 1
  {
    id: 'mapping-vascular',
    specialtyId: 'vascular',
    specialtyName: 'Vascular',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-009', theatreName: 'Specialized Theatre 1', unitId: 'specialized-suite', unitName: 'Specialized Procedures Suite', priority: 1 }
    ]
  },
  // ENT - Specialized Suite Theatre 2
  {
    id: 'mapping-ent',
    specialtyId: 'ent',
    specialtyName: 'ENT',
    hospitalId: HOSPITAL_ID,
    theatrePriorities: [
      { theatreId: 'THR-010', theatreName: 'Specialized Theatre 2', unitId: 'specialized-suite', unitName: 'Specialized Procedures Suite', priority: 1 }
    ]
  }
];

async function setupTheatreConfiguration() {
  console.log('🏥 Setting up Theatre Configuration for Royal London Hospital...\n');

  try {
    // 1. Setup Theatre Units
    console.log('📍 Creating Theatre Units...');
    for (const unit of THEATRE_UNITS) {
      await setDoc(doc(db, 'theatreUnits', unit.id), unit);
      console.log(`   ✅ Created: ${unit.name}`);
    }
    console.log(`✅ Created ${THEATRE_UNITS.length} theatre units\n`);

    // 2. Setup Theatres
    console.log('🏛️  Creating Theatres...');
    for (const theatre of THEATRES) {
      await setDoc(doc(db, 'theatres', theatre.id), theatre);
      console.log(`   ✅ Created: ${theatre.name} (${theatre.unitId})`);
    }
    console.log(`✅ Created ${THEATRES.length} theatres\n`);

    // 3. Setup Specialty-Theatre Mappings
    console.log('🗺️  Creating Specialty-Theatre Mappings...');
    for (const mapping of SPECIALTY_MAPPINGS) {
      await setDoc(doc(db, 'specialtyTheatreMappings', mapping.id), mapping);
      console.log(`   ✅ Mapped: ${mapping.specialtyName} → ${mapping.theatrePriorities.length} theatre(s)`);
    }
    console.log(`✅ Created ${SPECIALTY_MAPPINGS.length} specialty mappings\n`);

    // Verify
    console.log('🔍 Verifying configuration...');
    const unitsSnap = await getDocs(collection(db, 'theatreUnits'));
    const theatresSnap = await getDocs(collection(db, 'theatres'));
    const mappingsSnap = await getDocs(collection(db, 'specialtyTheatreMappings'));

    console.log(`   📊 Theatre Units: ${unitsSnap.size}`);
    console.log(`   📊 Theatres: ${theatresSnap.size}`);
    console.log(`   📊 Specialty Mappings: ${mappingsSnap.size}`);

    console.log('\n🎉 Theatre Configuration Setup Complete!');
    console.log('\n📝 Summary:');
    console.log(`   - ${THEATRE_UNITS.length} theatre units created`);
    console.log(`   - ${THEATRES.length} theatres configured`);
    console.log(`   - ${SPECIALTY_MAPPINGS.length} specialty-theatre mappings established`);
    console.log('\n✅ You can now run the Auto-Generate schedule feature!');

  } catch (error) {
    console.error('❌ Error setting up configuration:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupTheatreConfiguration();
