/**
 * Staff Profile Generator for Royal London Hospital
 * Generates 172 unique staff profiles across 14 specialties
 * Outputs to JSON file
 */

const fs = require('fs');
const path = require('path');

// 14 Specialties as specified
const SPECIALTIES = {
  EMERGENCY: { name: 'Emergency', subs: [] },
  ENDOSCOPY: { name: 'Endoscopy', subs: ['ERCP', 'Gastroscopy & Colonoscopy'] },
  ENT: { name: 'ENT', subs: ['ENT Robotic', 'ENT Laser'] },
  GENERAL_SURGERY: { name: 'General Surgery', subs: ['Upper Gastrointestinal', 'Hepatobiliary', 'HIPEC', 'Colorectal'] },
  GYNAECOLOGY: { name: 'Gynaecology', subs: ['Gynae Robotic', 'Gynae Fertility'] },
  NEUROLOGY: { name: 'Neurology', subs: ['Neuro-oncology'] },
  OBSTETRICS: { name: 'Obstetrics', subs: [] },
  OPHTHALMOLOGY: { name: 'Ophthalmology', subs: [] },
  OMFS: { name: 'Oral & Maxillofacial', subs: ['OMFS Trauma', 'OMFS Mandible', 'Orthognatic', 'Dental'] },
  ORTHOPAEDICS: { name: 'Orthopaedics', subs: ['Elective Orthopaedic Joints', 'Orthopaedic Spine', 'Orthopaedic Trauma'] },
  PLASTICS: { name: 'Plastics', subs: ['Burns & Breast', 'DIEP'] },
  RENAL: { name: 'Renal', subs: ['Renal Transplant'] },
  UROLOGY: { name: 'Urology', subs: ['Urology Robotic', 'Urology Laser'] },
  VASCULAR: { name: 'Vascular', subs: [] }
};

// Unique first names (diverse, UK-appropriate)
const FIRST_NAMES = [
  // Female names
  'Amelia', 'Olivia', 'Emily', 'Isla', 'Ava', 'Sophie', 'Grace', 'Ella', 'Lily', 'Freya',
  'Charlotte', 'Jessica', 'Mia', 'Lucy', 'Evie', 'Ruby', 'Sienna', 'Poppy', 'Isabella', 'Daisy',
  'Chloe', 'Alice', 'Rosie', 'Hannah', 'Layla', 'Maya', 'Bethany', 'Zara', 'Imogen', 'Jasmine',
  'Leah', 'Amber', 'Ellie', 'Holly', 'Scarlett', 'Sophia', 'Abigail', 'Molly', 'Evelyn', 'Maisie',
  'Phoebe', 'Violet', 'Iris', 'Ivy', 'Penelope', 'Aria', 'Luna', 'Aurora', 'Nova', 'Willow',
  'Aisha', 'Zainab', 'Fatima', 'Maryam', 'Nour', 'Aaliyah', 'Amara', 'Ayesha', 'Nia', 'Simran',
  'Priya', 'Anaya', 'Riya', 'Sara', 'Zahra', 'Lila', 'Nadia', 'Yara', 'Laila', 'Amina',
  // Male names
  'Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar',
  'James', 'William', 'Joshua', 'Alfie', 'Henry', 'Leo', 'Archie', 'Ethan', 'Joseph', 'Freddie',
  'Samuel', 'Alexander', 'Logan', 'Daniel', 'Isaac', 'Max', 'Mohammed', 'Benjamin', 'Lucas', 'Mason',
  'Harrison', 'Theodore', 'Sebastian', 'Reuben', 'Jenson', 'Zachary', 'Elijah', 'Adam', 'Rory', 'Louie',
  'Ahmed', 'Ali', 'Omar', 'Yusuf', 'Ibrahim', 'Hamza', 'Hassan', 'Abdullah', 'Bilal', 'Tariq',
  'Arjun', 'Dev', 'Aarav', 'Rohan', 'Kian', 'Zain', 'Rahim', 'Amir', 'Idris', 'Karim',
  'Connor', 'Liam', 'Ryan', 'Callum', 'Nathan', 'Dylan', 'Jake', 'Luke', 'Lewis', 'Tyler',
  'Ethan', 'Matthew', 'Michael', 'David', 'Robert', 'Paul', 'Mark', 'Andrew', 'Richard', 'Simon'
];

// Unique last names (diverse, UK-appropriate)
const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
  'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright',
  'Green', 'Hall', 'Clarke', 'Hughes', 'Edwards', 'Hill', 'Moore', 'Clark', 'Harrison', 'Scott',
  'Young', 'Morris', 'King', 'Allen', 'Cook', 'Bailey', 'Cooper', 'Richardson', 'Mitchell', 'Carter',
  'Phillips', 'Adams', 'Campbell', 'Anderson', 'Lee', 'Parker', 'Turner', 'Collins', 'Murphy', 'Bell',
  'Khan', 'Ahmed', 'Ali', 'Hussain', 'Shah', 'Malik', 'Iqbal', 'Rahman', 'Begum', 'Akhtar',
  'Patel', 'Singh', 'Kumar', 'Sharma', 'Kaur', 'Rao', 'Reddy', 'Choudhury', 'Mehta', 'Desai',
  'O\'Brien', 'O\'Connor', 'Kelly', 'Ryan', 'Walsh', 'McCarthy', 'O\'Sullivan', 'Doyle', 'Brennan', 'Flynn',
  'MacDonald', 'Campbell', 'Stewart', 'Robertson', 'Murray', 'Fraser', 'McKenzie', 'Reid', 'Ross', 'Morrison',
  'Kowalski', 'Nowak', 'Wojcik', 'Kowalczyk', 'Kaminski', 'Lewandowski', 'Zielinski', 'Szymanski', 'Wozniak', 'Kozlowski',
  'Chen', 'Wong', 'Liu', 'Yang', 'Zhang', 'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang',
  'Rodriguez', 'Garcia', 'Martinez', 'Fernandez', 'Lopez', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez', 'Ramirez',
  'Okafor', 'Adeyemi', 'Oluwole', 'Okoro', 'Nwosu', 'Eze', 'Okonkwo', 'Chinwe', 'Adebayo', 'Ojo',
  'Papadopoulos', 'Georgiou', 'Dimitriou', 'Costa', 'Silva', 'Santos', 'Oliveira', 'Pereira', 'Rodrigues', 'Ferreira',
  'Andersen', 'Nielsen', 'Hansen', 'Petersen', 'Jensen', 'Berg', 'Larsen', 'Karlsson', 'Svensson', 'Johansson',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'
];

// Generate unique TOM ID
function generateTomId(index) {
  const year = 2025;
  const num = String(index).padStart(4, '0');
  return `TOM-NHS-${year}-${num}`;
}

// Generate random years of experience based on band
function getYearsExperience(band) {
  const bandNum = band.includes('8') ? 8 : parseInt(band.replace('Band ', ''));

  if (bandNum === 2) return Math.floor(Math.random() * 3) + 1; // 1-3 years
  if (bandNum === 3) return Math.floor(Math.random() * 4) + 2; // 2-5 years
  if (bandNum === 4) return Math.floor(Math.random() * 5) + 3; // 3-7 years
  if (bandNum === 5) return Math.floor(Math.random() * 6) + 3; // 3-8 years
  if (bandNum === 6) return Math.floor(Math.random() * 8) + 5; // 5-12 years
  if (bandNum === 7) return Math.floor(Math.random() * 10) + 8; // 8-17 years
  if (bandNum === 8) return Math.floor(Math.random() * 15) + 10; // 10-24 years

  return 5;
}

// Generate staff profile
function generateProfile(index, firstName, lastName, role, band, specialties) {
  const yearsExp = getYearsExperience(band);
  const shiftsCompleted = Math.floor(Math.random() * 500) + 100;
  const totalShifts = shiftsCompleted + Math.floor(Math.random() * 20);
  const isNurse = role.includes('N/P') || role.includes('Recovery');

  const postNominals = [];
  if (isNurse && Math.random() > 0.3) {
    postNominals.push('RN');
    if (Math.random() > 0.6) postNominals.push(['BSc', 'MSc', 'PGDip'][Math.floor(Math.random() * 3)]);
  } else if (role.includes('ODP')) {
    postNominals.push('ODP');
    if (Math.random() > 0.7) postNominals.push('BSc');
  }

  return {
    id: generateTomId(index),
    firstName,
    lastName,
    postNominals,
    professionalQualification: isNurse ? 'RN (Adult)' : (role.includes('HCA') ? 'Healthcare Assistant' : 'ODP'),
    roles: [role],
    band,
    rating: +(4.5 + (Math.random() * 0.5)).toFixed(1),
    totalShifts,
    completedShifts: shiftsCompleted,

    contactDetails: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/'/g, '')}@nhs.net`,
      phone: `07${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
      preferredContact: Math.random() > 0.5 ? 'email' : 'phone'
    },

    location: {
      currentTrust: 'Barts Health NHS Trust',
      currentHospital: 'Royal London Hospital',
      postcode: 'E1 1BB',
      area: 'Whitechapel, East London',
      willingToTravel: [10, 15, 20, 30][Math.floor(Math.random() * 4)]
    },

    yearsExperience: yearsExp,
    connections: Math.floor(Math.random() * 200) + 50,

    competencyStats: {
      mandatory: Math.floor(Math.random() * 3) + 12,
      clinical: Math.floor(Math.random() * 10) + 15,
      technical: Math.floor(Math.random() * 8) + 10,
      professional: Math.floor(Math.random() * 5) + 8
    },

    specialtyTree: specialties.map(sp => ({
      name: sp,
      subcategories: [],
      procedures: []
    })),

    surgicalCompetencies: [],
    competencyTree: [],

    employmentHistory: [
      {
        employer: 'Barts Health NHS Trust',
        hospital: 'Royal London Hospital',
        department: 'Theatres',
        position: role,
        band,
        type: 'Permanent',
        startDate: new Date(2025 - yearsExp, Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
        endDate: null,
        specialties,
        responsibilities: [],
        verified: true
      }
    ],

    education: [
      {
        institution: ['King\'s College London', 'University of East London', 'Middlesex University', 'City University London'][Math.floor(Math.random() * 4)],
        degree: isNurse ? 'Bachelor of Science' : 'Diploma',
        field: isNurse ? 'Nursing (Adult)' : 'Operating Department Practice',
        grade: ['First Class Honours', '2:1', '2:2', 'Distinction', 'Merit'][Math.floor(Math.random() * 5)],
        startDate: '2010-09-01',
        endDate: '2013-06-30',
        description: '',
        verified: true
      }
    ],

    certifications: [
      {
        name: isNurse ? 'NMC Registration' : 'HCPC Registration',
        issuer: isNurse ? 'Nursing & Midwifery Council' : 'Health & Care Professions Council',
        number: String(Math.floor(Math.random() * 10000000)),
        issueDate: '2013-09-01',
        expiryDate: null,
        status: 'Active'
      }
    ],

    memberships: [
      {
        organization: 'Association for Perioperative Practice (AfPP)',
        role: 'Member',
        startDate: '2015-01-01',
        current: true,
        description: ''
      }
    ],

    recommendations: [],
    awards: [],
    volunteerWork: [],
    publications: [],

    languages: [
      {
        language: 'English',
        proficiency: 'Native'
      }
    ],

    interests: [
      {
        category: 'Clinical Practice',
        items: ['Surgical techniques', 'Patient safety']
      }
    ],

    compliance: {
      dbs: {
        status: 'valid',
        expiryDate: '2026-12-31',
        updateService: true,
        certificateNumber: `DBS${Math.floor(Math.random() * 10000000)}`
      },
      hcpc: {
        status: 'active',
        number: String(Math.floor(Math.random() * 1000000)),
        expiryDate: '2026-12-31',
        revalidationDue: '2025-12-31'
      },
      occupationalHealth: {
        status: 'fit',
        lastAssessment: '2024-06-01',
        nextDue: '2025-06-01',
        restrictions: []
      },
      mandatoryTraining: [
        { name: 'Basic Life Support', status: 'valid', expiry: '2025-12-31' },
        { name: 'Infection Prevention & Control', status: 'valid', expiry: '2025-11-30' },
        { name: 'Manual Handling', status: 'valid', expiry: '2025-10-31' },
        { name: 'Fire Safety', status: 'valid', expiry: '2025-09-30' },
        { name: 'Safeguarding Adults', status: 'valid', expiry: '2025-08-31' }
      ],
      immunisations: [
        { name: 'Hepatitis B', status: 'current', lastDose: '2023-01-15', boosterDue: null },
        { name: 'MMR', status: 'current', lastDose: '2022-03-20', boosterDue: null },
        { name: 'Varicella', status: 'current', lastDose: '2022-03-20', boosterDue: null },
        { name: 'COVID-19', status: 'current', lastDose: '2024-10-01', boosterDue: null }
      ],
      indemnityInsurance: {
        provider: 'RCN Indemnity',
        policyNumber: `RCN${Math.floor(Math.random() * 1000000)}`,
        coverage: '£10,000,000',
        expiryDate: '2025-12-31'
      }
    },

    preferences: {
      shifts: ['Day', 'Long Day', 'Night'],
      travel: {
        max: 20,
        unit: 'miles'
      },
      minRate: 0,
      maxHoursPerWeek: band.includes('8') ? 37.5 : 48
    },

    trackRecord: {
      reliability: 95 + Math.floor(Math.random() * 5),
      endorsements: Math.floor(Math.random() * 50) + 10,
      shiftsCancelled: Math.floor(Math.random() * 5),
      shiftsCompleted
    },

    willingToWorkAt: [
      'Royal London Hospital',
      'St Bartholomew\'s Hospital',
      'Whipps Cross University Hospital',
      'Newham University Hospital'
    ],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Main generation function
function generateAllStaffProfiles() {
  const profiles = [];
  const usedNames = new Set();

  // Helper to get unique name
  function getUniqueName() {
    let firstName, lastName, fullName;

    do {
      firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));

    usedNames.add(fullName);
    return { firstName, lastName };
  }

  const specialtyList = Object.values(SPECIALTIES).map(s => s.name);

  console.log('\n=== GENERATING 172 STAFF PROFILES ===\n');

  // 1. Scrub N/P: 76 total
  // Each of 14 specialties gets 1 Band 7 lead + additional staff
  console.log('Generating Scrub N/P...');
  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];

    // 1 Band 7 lead for this specialty
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 7', [specialty]));

    // 3 Band 6
    for (let j = 0; j < 3; j++) {
      const { firstName, lastName } = getUniqueName();
      profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 6', [specialty]));
    }

    // 1 Band 5
    const { firstName: fn, lastName: ln } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, fn, ln, 'Scrub N/P', 'Band 5', [specialty]));
  }

  // Add remaining scrub nurses to reach 76 (currently have 70, need 6 more)
  while (profiles.filter(p => p.roles[0] === 'Scrub N/P').length < 76) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.6 ? 'Band 6' : 'Band 5';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', band, [specialty]));
  }

  // 2. Anaesthetic N/P: 36 total
  // 14 Band 7 leads (one per specialty) + 22 Band 5/6
  console.log('Generating Anaesthetic N/P...');
  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', 'Band 7', [specialty]));
  }

  // Remaining 22 Anaesthetic nurses
  for (let i = 0; i < 22; i++) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 6' : 'Band 5';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', band, [specialty]));
  }

  // 3. Recovery N/P: 16 total (2 Band 7, 8 Band 6, 6 Band 5)
  console.log('Generating Recovery N/P...');
  for (let i = 0; i < 2; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 7', ['Recovery']));
  }

  for (let i = 0; i < 8; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 6', ['Recovery']));
  }

  for (let i = 0; i < 6; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 5', ['Recovery']));
  }

  // 4. Theatre Managers: 3 (Band 8a)
  console.log('Generating Theatre Managers...');
  for (let i = 0; i < 3; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Manager', 'Band 8a', ['All Specialties']));
  }

  // 5. Healthcare Assistants: 18 (Bands 2-3)
  console.log('Generating Healthcare Assistants...');
  for (let i = 0; i < 18; i++) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.3 ? 'Band 3' : 'Band 2';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Healthcare Assistant (HCA)', band, [specialty]));
  }

  // 6. Administrative: 3 (Band 3-4)
  console.log('Generating Administrative staff...');
  for (let i = 0; i < 3; i++) {
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 4' : 'Band 3';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Admin', band, ['Administration']));
  }

  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`Total profiles generated: ${profiles.length}`);
  console.log(`Scrub N/P: ${profiles.filter(p => p.roles[0] === 'Scrub N/P').length}`);
  console.log(`Anaesthetic N/P: ${profiles.filter(p => p.roles[0] === 'Anaesthetic N/P').length}`);
  console.log(`Recovery N/P: ${profiles.filter(p => p.roles[0] === 'Recovery N/P').length}`);
  console.log(`Theatre Manager: ${profiles.filter(p => p.roles[0] === 'Theatre Manager').length}`);
  console.log(`HCA: ${profiles.filter(p => p.roles[0] === 'Healthcare Assistant (HCA)').length}`);
  console.log(`Admin: ${profiles.filter(p => p.roles[0] === 'Theatre Admin').length}`);

  return profiles;
}

// Run and save to file
const profiles = generateAllStaffProfiles();

const outputPath = path.join(__dirname, '..', 'data', 'staffProfiles.json');
fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));
console.log(`\n✅ Staff profiles saved to: ${outputPath}`);

console.log('\n📝 Sample profile (first one):');
console.log(JSON.stringify(profiles[0], null, 2));
