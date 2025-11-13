/**
 * Staff Profile Generator for Royal London Hospital
 * Generates 172 unique staff profiles across 14 specialties
 */

import { StaffProfile } from '../types/staffProfile.js';

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
  'Connor', 'Liam', 'Ryan', 'Callum', 'Nathan', 'Dylan', 'Jake', 'Luke', 'Lewis', 'Tyler'
];

// Unique last names (diverse, UK-appropriate)
const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
  'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright',
  'Green', 'Hall', 'Clarke', 'Hughes', 'Edwards', 'Hill', 'Moore', 'Clark', 'Harrison', 'Scott',
  'Young', 'Morris', 'King', 'Allen', 'Cook', 'Bailey', 'Cooper', 'Richardson', 'Mitchell', 'Carter',
  'Phillips', 'Adams', 'Campbell', 'Anderson', 'Lee', 'Parker', 'Turner', 'Collins', 'Murphy', 'Bell',
  'Khan', 'Ahmed', 'Ali', 'Hussain', 'Shah', 'Malik', 'Iqbal', 'Rahman', 'Begum', 'Akhtar',
  'Patel', 'Shah', 'Singh', 'Kumar', 'Sharma', 'Kaur', 'Rao', 'Reddy', 'Choudhury', 'Mehta',
  'O\'Brien', 'O\'Connor', 'Murphy', 'Kelly', 'Ryan', 'Walsh', 'McCarthy', 'O\'Sullivan', 'Doyle', 'Brennan',
  'MacDonald', 'Campbell', 'Stewart', 'Robertson', 'Murray', 'Fraser', 'McKenzie', 'Reid', 'Ross', 'Morrison',
  'Kowalski', 'Nowak', 'Wojcik', 'Kowalczyk', 'Kaminski', 'Lewandowski', 'Zielinski', 'Szymanski', 'Wozniak', 'Kozlowski',
  'Chen', 'Wong', 'Liu', 'Yang', 'Zhang', 'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang',
  'Rodriguez', 'Garcia', 'Martinez', 'Fernandez', 'Lopez', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez', 'Ramirez',
  'Okafor', 'Adeyemi', 'Oluwole', 'Okoro', 'Nwosu', 'Eze', 'Okonkwo', 'Chinwe', 'Adebayo', 'Ojo',
  'Papadopoulos', 'Georgiou', 'Dimitriou', 'Costa', 'Silva', 'Santos', 'Oliveira', 'Pereira', 'Rodrigues', 'Ferreira',
  'Andersen', 'Nielsen', 'Hansen', 'Petersen', 'Jensen', 'Berg', 'Larsen', 'Karlsson', 'Svensson', 'Johansson'
];

// Professional qualifications
const QUALIFICATIONS = [
  'RN (Adult)',
  'RN (Adult) DipHE',
  'RN (Adult) BSc',
  'ODP DipHE',
  'ODP BSc',
  'RN (Adult) MSc',
  'RN (Adult) PGDip',
  'ODP MSc'
];

// Post-nominals
const POST_NOMINALS = [
  [], // No post-nominals
  [],
  ['RN'],
  ['RN'],
  ['ODP'],
  ['ODP'],
  ['RN', 'BSc'],
  ['RN', 'DipHE'],
  ['ODP', 'BSc'],
  ['RN', 'MSc'],
  ['RN', 'PGDip'],
  ['RN', 'BSc', 'PGCert'],
];

// Generate unique TOM ID
function generateTomId(index: number): string {
  const year = 2025;
  const num = String(index).padStart(4, '0');
  return `TOM-NHS-${year}-${num}`;
}

// Generate random years of experience based on band
function getYearsExperience(band: string): number {
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
function generateProfile(
  index: number,
  firstName: string,
  lastName: string,
  role: string,
  band: string,
  specialties: string[]
): Partial<StaffProfile> {

  const yearsExp = getYearsExperience(band);
  const shiftsCompleted = Math.floor(Math.random() * 500) + 100;
  const totalShifts = shiftsCompleted + Math.floor(Math.random() * 20);

  return {
    id: generateTomId(index),
    firstName,
    lastName,
    postNominals: POST_NOMINALS[Math.floor(Math.random() * POST_NOMINALS.length)],
    professionalQualification: QUALIFICATIONS[Math.floor(Math.random() * QUALIFICATIONS.length)],
    roles: [role],
    band,
    rating: 4.5 + (Math.random() * 0.5), // 4.5-5.0
    totalShifts,
    completedShifts: shiftsCompleted,

    contactDetails: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nhs.net`,
      phone: `07${Math.floor(Math.random() * 1000000000)}`,
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
      mandatory: Math.floor(Math.random() * 3) + 12, // 12-14
      clinical: Math.floor(Math.random() * 10) + 15, // 15-24
      technical: Math.floor(Math.random() * 8) + 10, // 10-17
      professional: Math.floor(Math.random() * 5) + 8 // 8-12
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
        type: 'Permanent' as const,
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
        degree: role.includes('N/P') ? 'Bachelor of Science' : 'Diploma',
        field: role.includes('N/P') ? 'Nursing (Adult)' : 'Operating Department Practice',
        grade: ['First Class Honours', '2:1', '2:2', 'Distinction', 'Merit'][Math.floor(Math.random() * 5)],
        startDate: '2010-09-01',
        endDate: '2013-06-30',
        description: '',
        verified: true
      }
    ],

    certifications: [
      {
        name: role.includes('N/P') ? 'NMC Registration' : 'HCPC Registration',
        issuer: role.includes('N/P') ? 'Nursing & Midwifery Council' : 'Health & Care Professions Council',
        number: `${Math.floor(Math.random() * 1000000)}`,
        issueDate: '2013-09-01',
        expiryDate: null,
        status: 'Active' as const
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
        proficiency: 'Native' as const
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
        status: 'valid' as const,
        expiryDate: '2026-12-31',
        updateService: true,
        certificateNumber: `DBS${Math.floor(Math.random() * 10000000)}`
      },
      hcpc: {
        status: 'active' as const,
        number: `${Math.floor(Math.random() * 1000000)}`,
        expiryDate: '2026-12-31',
        revalidationDue: '2025-12-31'
      },
      occupationalHealth: {
        status: 'fit' as const,
        lastAssessment: '2024-06-01',
        nextDue: '2025-06-01',
        restrictions: []
      },
      mandatoryTraining: [
        { name: 'Basic Life Support', status: 'valid' as const, expiry: '2025-12-31' },
        { name: 'Infection Prevention & Control', status: 'valid' as const, expiry: '2025-11-30' },
        { name: 'Manual Handling', status: 'valid' as const, expiry: '2025-10-31' },
        { name: 'Fire Safety', status: 'valid' as const, expiry: '2025-09-30' },
        { name: 'Safeguarding Adults', status: 'valid' as const, expiry: '2025-08-31' }
      ],
      immunisations: [
        { name: 'Hepatitis B', status: 'current' as const, lastDose: '2023-01-15', boosterDue: null },
        { name: 'MMR', status: 'current' as const, lastDose: '2022-03-20', boosterDue: null },
        { name: 'Varicella', status: 'current' as const, lastDose: '2022-03-20', boosterDue: null },
        { name: 'COVID-19', status: 'current' as const, lastDose: '2024-10-01', boosterDue: null }
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
        unit: 'miles' as const
      },
      minRate: 0,
      maxHoursPerWeek: band.includes('8') ? 37.5 : 48
    },

    trackRecord: {
      reliability: 95 + Math.floor(Math.random() * 5), // 95-99%
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
export function generateAllStaffProfiles(): Partial<StaffProfile>[] {
  const profiles: Partial<StaffProfile>[] = [];
  const usedNames = new Set<string>();
  let nameIndex = 0;

  // Helper to get unique name
  function getUniqueName(): { firstName: string; lastName: string } {
    let firstName: string;
    let lastName: string;
    let fullName: string;

    do {
      firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));

    usedNames.add(fullName);
    return { firstName, lastName };
  }

  const specialtyList = Object.values(SPECIALTIES).map(s => s.name);

  // 1. Scrub N/P: 76 total (distributed across 14 specialties)
  // Each specialty gets ~5-6 scrub nurses, with 1 Band 7 lead per specialty
  const scrubPerSpecialty = Math.floor(76 / 14); // 5 per specialty
  const scrubBand7PerSpecialty = 1; // 1 Band 7 lead per specialty

  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];

    // 1 Band 7 lead for this specialty
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 7', [specialty]));

    // 3-4 Band 6
    for (let j = 0; j < 3; j++) {
      const { firstName, lastName } = getUniqueName();
      profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 6', [specialty]));
    }

    // 1-2 Band 5
    for (let j = 0; j < 1; j++) {
      const { firstName, lastName } = getUniqueName();
      profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', 'Band 5', [specialty]));
    }
  }

  // Add remaining scrub nurses to reach 76
  while (profiles.filter(p => p.roles?.[0] === 'Scrub N/P').length < 76) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.6 ? 'Band 6' : 'Band 5';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Scrub N/P', band, [specialty]));
  }

  // 2. Anaesthetic N/P: 36 total (distributed across specialties)
  // 14 Band 7 leads (one per specialty) + remaining Band 5/6
  for (let i = 0; i < 14; i++) {
    const specialty = specialtyList[i];
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', 'Band 7', [specialty]));
  }

  // Remaining Anaesthetic nurses (36 - 14 = 22)
  for (let i = 0; i < 22; i++) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 6' : 'Band 5';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Anaesthetic N/P', band, [specialty]));
  }

  // 3. Recovery N/P: 16 total
  // 2 Band 7 leads (general recovery, not specialty-specific)
  for (let i = 0; i < 2; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 7', ['Recovery']));
  }

  // 8 Band 6
  for (let i = 0; i < 8; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 6', ['Recovery']));
  }

  // 6 Band 5
  for (let i = 0; i < 6; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Recovery N/P', 'Band 5', ['Recovery']));
  }

  // 4. Senior Sister/Charge Nurse: 8 (Band 7) - not needed as we have Band 7 leads already in each specialty

  // 5. Theatre Managers: 3 (Band 8a)
  for (let i = 0; i < 3; i++) {
    const { firstName, lastName } = getUniqueName();
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Manager', 'Band 8a', ['All Specialties']));
  }

  // 6. Healthcare Assistants: 18 (Bands 2-3)
  for (let i = 0; i < 18; i++) {
    const specialty = specialtyList[Math.floor(Math.random() * specialtyList.length)];
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.3 ? 'Band 3' : 'Band 2';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Healthcare Assistant (HCA)', band, [specialty]));
  }

  // 7. Administrative: 3 (Band 3-4)
  for (let i = 0; i < 3; i++) {
    const { firstName, lastName } = getUniqueName();
    const band = Math.random() > 0.5 ? 'Band 4' : 'Band 3';
    profiles.push(generateProfile(profiles.length + 1, firstName, lastName, 'Theatre Admin', band, ['Administration']));
  }

  console.log(`Generated ${profiles.length} staff profiles`);
  console.log(`Scrub N/P: ${profiles.filter(p => p.roles?.[0] === 'Scrub N/P').length}`);
  console.log(`Anaesthetic N/P: ${profiles.filter(p => p.roles?.[0] === 'Anaesthetic N/P').length}`);
  console.log(`Recovery N/P: ${profiles.filter(p => p.roles?.[0] === 'Recovery N/P').length}`);
  console.log(`Theatre Manager: ${profiles.filter(p => p.roles?.[0] === 'Theatre Manager').length}`);
  console.log(`HCA: ${profiles.filter(p => p.roles?.[0] === 'Healthcare Assistant (HCA)').length}`);
  console.log(`Admin: ${profiles.filter(p => p.roles?.[0] === 'Theatre Admin').length}`);

  return profiles;
}

// Run if executed directly
if (require.main === module) {
  const profiles = generateAllStaffProfiles();
  console.log('\nSample profile:');
  console.log(JSON.stringify(profiles[0], null, 2));
}
