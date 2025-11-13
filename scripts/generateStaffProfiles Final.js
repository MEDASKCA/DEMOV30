/**
 * FINAL Staff Profile Generator for Royal London Hospital
 * Generates 172 headcount (160 FTE) across 14 specialties
 * Includes home addresses and FTE variations
 */

const fs = require('fs');
const path = require('path');

// London street names
const STREET_NAMES = [
  'High Street', 'Station Road', 'Church Road', 'London Road', 'Park Avenue',
  'Green Lane', 'Manor Road', 'Victoria Road', 'Albert Road', 'King Street',
  'Queen Street', 'Commercial Road', 'Roman Road', 'Mile End Road', 'Bow Road',
  'Cambridge Heath Road', 'Bethnal Green Road', 'Whitechapel Road', 'Old Street',
  'City Road', 'Essex Road', 'Balls Pond Road', 'Kingsland Road', 'Dalston Lane',
  'Morning Lane', 'Mare Street', 'Well Street', 'Homerton High Street', 'Wick Road',
  'Riverside Road', 'Waterside', 'The Highway', 'Cable Street', 'Cannon Street Road',
  'Cavell Street', 'Sidney Street', 'Stepney Green', 'Ben Jonson Road', 'Jubilee Street'
];

// London areas with postcodes
const LONDON_AREAS = [
  { area: 'Whitechapel', postcode: 'E1', distance: 0.5 },
  { area: 'Bethnal Green', postcode: 'E2', distance: 2 },
  { area: 'Bow', postcode: 'E3', distance: 3 },
  { area: 'Poplar', postcode: 'E14', distance: 2.5 },
  { area: 'Stratford', postcode: 'E15', distance: 4 },
  { area: 'Shoreditch', postcode: 'E1', distance: 1.5 },
  { area: 'Stepney', postcode: 'E1', distance: 1 },
  { area: 'Mile End', postcode: 'E1', distance: 1.5 },
  { area: 'Hackney', postcode: 'E8', distance: 3 },
  { area: 'Homerton', postcode: 'E9', distance: 4 },
  { area: 'Islington', postcode: 'N1', distance: 3 },
  { area: 'Hoxton', postcode: 'N1', distance: 2 },
  { area: 'Highbury', postcode: 'N5', distance: 4 },
  { area: 'Dalston', postcode: 'E8', distance: 3 },
  { area: 'Stoke Newington', postcode: 'N16', distance: 4.5 },
  { area: 'Limehouse', postcode: 'E14', distance: 2 },
  { area: 'Shadwell', postcode: 'E1W', distance: 1 },
  { area: 'Wapping', postcode: 'E1W', distance: 1.5 },
  { area: 'Canary Wharf', postcode: 'E14', distance: 3 },
  { area: 'Isle of Dogs', postcode: 'E14', distance: 3.5 }
];

// Generate random address
function generateAddress() {
  const num = Math.floor(Math.random() * 200) + 1;
  const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  const location = LONDON_AREAS[Math.floor(Math.random() * LONDON_AREAS.length)];
  const postcodeNum = Math.floor(Math.random() * 9) + 1;
  const postcodeLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return {
    street: `${num} ${street}`,
    area: location.area,
    city: 'London',
    postcode: `${location.postcode} ${postcodeNum}${postcodeLetter}`,
    distanceToRLH: location.distance
  };
}

// 14 Specialties
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

// Names arrays (keeping the diverse lists from before)
const FIRST_NAMES = [
  'Amelia', 'Olivia', 'Emily', 'Isla', 'Ava', 'Sophie', 'Grace', 'Ella', 'Lily', 'Freya',
  'Charlotte', 'Jessica', 'Mia', 'Lucy', 'Evie', 'Ruby', 'Sienna', 'Poppy', 'Isabella', 'Daisy',
  'Chloe', 'Alice', 'Rosie', 'Hannah', 'Layla', 'Maya', 'Bethany', 'Zara', 'Imogen', 'Jasmine',
  'Leah', 'Amber', 'Ellie', 'Holly', 'Scarlett', 'Sophia', 'Abigail', 'Molly', 'Evelyn', 'Maisie',
  'Phoebe', 'Violet', 'Iris', 'Ivy', 'Penelope', 'Aria', 'Luna', 'Aurora', 'Nova', 'Willow',
  'Aisha', 'Zainab', 'Fatima', 'Maryam', 'Nour', 'Aaliyah', 'Amara', 'Ayesha', 'Nia', 'Simran',
  'Priya', 'Anaya', 'Riya', 'Sara', 'Zahra', 'Lila', 'Nadia', 'Yara', 'Laila', 'Amina',
  'Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar',
  'James', 'William', 'Joshua', 'Alfie', 'Henry', 'Leo', 'Archie', 'Ethan', 'Joseph', 'Freddie',
  'Samuel', 'Alexander', 'Logan', 'Daniel', 'Isaac', 'Max', 'Mohammed', 'Benjamin', 'Lucas', 'Mason',
  'Harrison', 'Theodore', 'Sebastian', 'Reuben', 'Jenson', 'Zachary', 'Elijah', 'Adam', 'Rory', 'Louie',
  'Ahmed', 'Ali', 'Omar', 'Yusuf', 'Ibrahim', 'Hamza', 'Hassan', 'Abdullah', 'Bilal', 'Tariq',
  'Arjun', 'Dev', 'Aarav', 'Rohan', 'Kian', 'Zain', 'Rahim', 'Amir', 'Idris', 'Karim',
  'Connor', 'Liam', 'Ryan', 'Callum', 'Nathan', 'Dylan', 'Jake', 'Luke', 'Lewis', 'Tyler',
  'Ethan', 'Matthew', 'Michael', 'David', 'Robert', 'Paul', 'Mark', 'Andrew', 'Richard', 'Simon',
  'Stephen', 'Peter', 'Christopher', 'Anthony', 'Kevin', 'Jason', 'Gary', 'Brian', 'Derek', 'Colin'
];

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
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Bennett', 'Gray', 'Price', 'Russell', 'Griffin', 'Mills', 'Gardner', 'Butler', 'Barnes', 'Wells'
];

function generateTomId(index) {
  return `TOM-NHS-2025-${String(index).padStart(4, '0')}`;
}

function getYearsExperience(band) {
  const bandNum = band.includes('8') ? 8 : parseInt(band.replace('Band ', ''));
  if (bandNum === 2) return Math.floor(Math.random() * 3) + 1;
  if (bandNum === 3) return Math.floor(Math.random() * 4) + 2;
  if (bandNum === 4) return Math.floor(Math.random() * 5) + 3;
  if (bandNum === 5) return Math.floor(Math.random() * 6) + 3;
  if (bandNum === 6) return Math.floor(Math.random() * 8) + 5;
  if (bandNum === 7) return Math.floor(Math.random() * 10) + 8;
  if (bandNum === 8) return Math.floor(Math.random() * 15) + 10;
  return 5;
}

function generateProfile(index, firstName, lastName, role, band, specialties, fte = 1.0) {
  const yearsExp = getYearsExperience(band);
  const shiftsCompleted = Math.floor(Math.random() * 500) + 100;
  const totalShifts = shiftsCompleted + Math.floor(Math.random() * 20);
  const isNurse = role.includes('N/P') || role.includes('Recovery');
  const address = generateAddress();

  const postNominals = [];
  if (isNurse && Math.random() > 0.3) {
    postNominals.push('RN');
    if (Math.random() > 0.6) postNominals.push(['BSc', 'MSc', 'PGDip'][Math.floor(Math.random() * 3)]);
  }

  return {
    id: generateTomId(index),
    firstName,
    lastName,
    postNominals,
    professionalQualification: isNurse ? 'RN (Adult)' : (role.includes('HCA') ? 'Healthcare Assistant' : 'Theatre Admin'),
    roles: [role],
    band,
    fte, // Full-time equivalent
    contractedHours: fte * 37.5, // Weekly hours
    rating: +(4.5 + (Math.random() * 0.5)).toFixed(1),
    totalShifts,
    completedShifts: shiftsCompleted,

    contactDetails: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/'/g, '')}@nhs.net`,
      phone: `07${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
      preferredContact: Math.random() > 0.5 ? 'email' : 'phone'
    },

    homeAddress: {
      street: address.street,
      area: address.area,
      city: address.city,
      postcode: address.postcode,
      distanceToHospital: address.distanceToRLH
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
        field: isNurse ? 'Nursing (Adult)' : 'Theatre Practice',
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

    languages: [{ language: 'English', proficiency: 'Native' }],
    interests: [{ category: 'Clinical Practice', items: ['Surgical techniques', 'Patient safety'] }],

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
      travel: { max: 20, unit: 'miles' },
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

function generateAllStaffProfiles() {
  const profiles = [];
  const usedNames = new Set();

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

  console.log('\n=== GENERATING 172 HEADCOUNT (160 FTE) ===\n');

  // FTE distribution: 73% full-time (1.0), 18% 0.8 FTE, 9% 0.6 FTE
  // This averages to 0.928 FTE per person, giving 160 FTE from 172 headcount
  function getFTE() {
    const rand = Math.random();
    if (rand < 0.73) return 1.0;  // 73% full-time
    if (rand < 0.91) return 0.8;  // 18% at 0.8 FTE (30h/week)
    return 0.6;                    // 9% at 0.6 FTE (22.5h/week)
  }

  // 1. Scrub N/P: Target ~82 headcount to get 76 FTE
  console.log('Generating Scrub N/P...');
  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];
    // Band 7 lead (full-time)
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 7', [specialty], 1.0));

    // 3-4 staff per specialty
    for (let j = 0; j < 4; j++) {
      const { firstName, lastName } = getUniqueName();
      const band = j < 2 ? 'Band 6' : 'Band 5';
      const fte = getFTE();
      profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', band, [specialty], fte));
    }
  }

  // Add more to reach target FTE (increase target slightly to account for part-time)
  while (profiles.filter(p => p.roles[0] === 'Scrub N/P').reduce((sum, p) => sum + p.fte, 0) < 78.5) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.6 ? 'Band 6' : 'Band 5';
    const fte = getFTE();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', band, [specialty], fte));
  }

  // 2. Anaesthetic N/P: Target ~39 headcount to get 36 FTE
  console.log('Generating Anaesthetic N/P...');
  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', 'Band 7', [specialty], 1.0));
  }

  while (profiles.filter(p => p.roles[0] === 'Anaesthetic N/P').reduce((sum, p) => sum + p.fte, 0) < 37.7) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 6' : 'Band 5';
    const fte = getFTE();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', band, [specialty], fte));
  }

  // 3. Recovery N/P: Target ~17 headcount to get 16 FTE
  console.log('Generating Recovery N/P...');
  // 2 Band 7 (full-time)
  for (let i = 0; i < 2; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 7', ['Recovery'], 1.0));
  }

  while (profiles.filter(p => p.roles[0] === 'Recovery N/P').reduce((sum, p) => sum + p.fte, 0) < 17.3) {
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 6' : 'Band 5';
    const fte = getFTE();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', band, ['Recovery'], fte));
  }

  // 4. Theatre Managers: 3 (full-time)
  console.log('Generating Theatre Managers...');
  for (let i = 0; i < 3; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Manager', 'Band 8a', ['All Specialties'], 1.0));
  }

  // 5. HCA: Target ~20 headcount to get 19.5 FTE
  console.log('Generating Healthcare Assistants...');
  while (profiles.filter(p => p.roles[0] === 'Healthcare Assistant (HCA)').reduce((sum, p) => sum + p.fte, 0) < 19.5) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.3 ? 'Band 3' : 'Band 2';
    const fte = getFTE();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Healthcare Assistant (HCA)', band, [specialty], fte));
  }

  // 6. Admin: 4 headcount to get 3.5 FTE
  console.log('Generating Administrative staff...');
  while (profiles.filter(p => p.roles[0] === 'Theatre Admin').reduce((sum, p) => sum + p.fte, 0) < 3.5) {
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 4' : 'Band 3';
    const fte = getFTE();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Admin', band, ['Administration'], fte));
  }

  // Calculate totals
  const scrubFTE = profiles.filter(p => p.roles[0] === 'Scrub N/P').reduce((sum, p) => sum + p.fte, 0);
  const anaesFTE = profiles.filter(p => p.roles[0] === 'Anaesthetic N/P').reduce((sum, p) => sum + p.fte, 0);
  const recoveryFTE = profiles.filter(p => p.roles[0] === 'Recovery N/P').reduce((sum, p) => sum + p.fte, 0);
  const managerFTE = profiles.filter(p => p.roles[0] === 'Theatre Manager').reduce((sum, p) => sum + p.fte, 0);
  const hcaFTE = profiles.filter(p => p.roles[0] === 'Healthcare Assistant (HCA)').reduce((sum, p) => sum + p.fte, 0);
  const adminFTE = profiles.filter(p => p.roles[0] === 'Theatre Admin').reduce((sum, p) => sum + p.fte, 0);
  const totalFTE = scrubFTE + anaesFTE + recoveryFTE + managerFTE + hcaFTE + adminFTE;

  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`Total HEADCOUNT: ${profiles.length}`);
  console.log(`Total FTE: ${totalFTE.toFixed(1)}\n`);
  console.log(`Scrub N/P: ${profiles.filter(p => p.roles[0] === 'Scrub N/P').length} headcount (${scrubFTE.toFixed(1)} FTE)`);
  console.log(`Anaesthetic N/P: ${profiles.filter(p => p.roles[0] === 'Anaesthetic N/P').length} headcount (${anaesFTE.toFixed(1)} FTE)`);
  console.log(`Recovery N/P: ${profiles.filter(p => p.roles[0] === 'Recovery N/P').length} headcount (${recoveryFTE.toFixed(1)} FTE)`);
  console.log(`Theatre Manager: ${profiles.filter(p => p.roles[0] === 'Theatre Manager').length} headcount (${managerFTE.toFixed(1)} FTE)`);
  console.log(`HCA: ${profiles.filter(p => p.roles[0] === 'Healthcare Assistant (HCA)').length} headcount (${hcaFTE.toFixed(1)} FTE)`);
  console.log(`Admin: ${profiles.filter(p => p.roles[0] === 'Theatre Admin').length} headcount (${adminFTE.toFixed(1)} FTE)`);

  return profiles;
}

// Run and save
const profiles = generateAllStaffProfiles();

const outputPath = path.join(__dirname, '..', 'data', 'staffProfiles172.json');
fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));
console.log(`\n✅ ${profiles.length} staff profiles saved to: ${outputPath}`);

console.log('\n📝 Sample profile (first one):');
console.log(JSON.stringify(profiles[0], null, 2).substring(0, 1500) + '...');
