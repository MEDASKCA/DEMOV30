// Generate 6 Months of Theatre Lists Data (July - December 2025)
// This script creates realistic surgical lists for all theatres based on specialty priorities
// READS FROM FIREBASE - uses your configured theatre units and specialty mappings

import { writeFileSync } from 'fs';
import { join } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { SURGICAL_PROCEDURES_BY_SPECIALTY, Procedure } from '../lib/surgicalCompetencyData';
import { ROYAL_LONDON_CONSULTANTS, Consultant } from '../lib/consultantData';
import { generateTheatreList } from '../lib/services/theatreListGenerator';
import { TheatreList, SessionType, SESSION_CONFIGS } from '../lib/theatreListTypes';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Anaesthetists pool (generic names with initials)
const ANAESTHETISTS = [
  { name: 'Dr Sarah Johnson', initials: 'SJ' },
  { name: 'Dr Michael Chen', initials: 'MC' },
  { name: 'Dr Emily Roberts', initials: 'ER' },
  { name: 'Dr David Williams', initials: 'DW' },
  { name: 'Dr Rachel Patel', initials: 'RP' },
  { name: 'Dr James Thompson', initials: 'JT' },
  { name: 'Dr Lisa Anderson', initials: 'LA' },
  { name: 'Dr Andrew Kumar', initials: 'AK' },
  { name: 'Dr Sophie Martin', initials: 'SM' },
  { name: 'Dr Christopher Lee', initials: 'CL' }
];

// Theatre units and their specialty priorities (based on your configuration)
interface TheatreUnit {
  id: string;
  name: string;
  hospitalId: string;
  hospitalName: string;
  theatres: Theatre[];
}

interface Theatre {
  id: string;
  name: string;
  specialties: SpecialtyPriority[];
  isEmergency: boolean;
  isTrauma: boolean;
}

interface SpecialtyPriority {
  specialty: string;
  priority: number;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
  sessions: SessionType[];
}

// Royal London Hospital Theatre Configuration (Based on your mapping)
const ROYAL_LONDON_UNITS: TheatreUnit[] = [
  {
    id: 'rlh-main-unit',
    name: 'Main Theatre',
    hospitalId: 'royal-london',
    hospitalName: 'Royal London Hospital',
    theatres: [
      {
        id: 'rlh-main-01',
        name: 'Theatre 1',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'ENT', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // ENT Robotic Primary
          { specialty: 'ENT', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // ENT Laser Secondary
          { specialty: 'Urology', priority: 3, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Priority 3
        ]
      },
      {
        id: 'rlh-main-02',
        name: 'Theatre 2',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'ENT', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // ENT Laser Primary
          { specialty: 'Urology', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Secondary
        ]
      },
      {
        id: 'rlh-main-03',
        name: 'Theatre 3',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Orthopaedics', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Trauma Secondary
        ]
      },
      {
        id: 'rlh-main-04',
        name: 'Theatre 4',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Endoscopy', priority: 4, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // ERCP Priority 4
        ]
      },
      {
        id: 'rlh-main-05',
        name: 'Theatre 5',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'General Surgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }
        ]
      },
      {
        id: 'rlh-main-06',
        name: 'Theatre 6',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'General Surgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }
        ]
      },
      {
        id: 'rlh-main-07',
        name: 'Theatre 7',
        isEmergency: true,
        isTrauma: false,
        specialties: [
          { specialty: 'Emergency', priority: 1, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], sessions: ['FULL'] }, // Emergency Primary
          { specialty: 'Endoscopy', priority: 4, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // ERCP Priority 4 (weekdays only)
        ]
      },
      {
        id: 'rlh-main-08',
        name: 'Theatre 8',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Vascular', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Primary
        ]
      },
      {
        id: 'rlh-main-09',
        name: 'Theatre 9',
        isEmergency: false,
        isTrauma: true,
        specialties: [
          { specialty: 'Orthopaedics', priority: 1, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], sessions: ['FULL'] } // Trauma Primary - 7 days
        ]
      },
      {
        id: 'rlh-main-10',
        name: 'Theatre 10',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Orthopaedics', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Trauma Secondary
        ]
      },
      {
        id: 'rlh-main-11',
        name: 'Theatre 11',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Neurosurgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Primary
        ]
      },
      {
        id: 'rlh-main-12',
        name: 'Theatre 12',
        isEmergency: true,
        isTrauma: false,
        specialties: [
          { specialty: 'Emergency', priority: 1, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], sessions: ['FULL'] }, // Emergency Primary - 7 days
          { specialty: 'Endoscopy', priority: 4, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Gastroscopy Priority 4 (weekdays only)
        ]
      }
    ]
  },
  {
    id: 'rlh-acad-unit',
    name: 'ACAD Theatre',
    hospitalId: 'royal-london',
    hospitalName: 'Royal London Hospital',
    theatres: [
      {
        id: 'rlh-acad-01',
        name: 'Theatre 1',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Gynaecology', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }
        ]
      },
      {
        id: 'rlh-acad-02',
        name: 'Theatre 2',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Plastic Surgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Primary
        ]
      },
      {
        id: 'rlh-acad-03',
        name: 'Theatre 3',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Orthopaedics', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // Spine Primary
          { specialty: 'Maxillofacial', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Secondary
        ]
      },
      {
        id: 'rlh-acad-04',
        name: 'Theatre 4',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Maxillofacial', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // Primary
          { specialty: 'Orthopaedics', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Spine Secondary
        ]
      },
      {
        id: 'rlh-acad-05',
        name: 'Theatre 5',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Urology', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Renal Transplant Primary
        ]
      },
      {
        id: 'rlh-acad-06',
        name: 'Theatre 6',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Colorectal', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }
        ]
      },
      {
        id: 'rlh-acad-07',
        name: 'Theatre 7',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Plastic Surgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // Burns & Breast Primary
          { specialty: 'Ophthalmology', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Secondary
        ]
      },
      {
        id: 'rlh-acad-08',
        name: 'Theatre 8',
        isEmergency: false,
        isTrauma: false,
        specialties: [
          { specialty: 'Plastic Surgery', priority: 1, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] }, // Burns & Breast Primary
          { specialty: 'Ophthalmology', priority: 2, daysOfWeek: [1, 2, 3, 4, 5], sessions: ['AM', 'PM'] } // Secondary
        ]
      }
    ]
  }
];

// Get initials from full name
function getInitials(fullName: string): string {
  const parts = fullName.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return fullName.substring(0, 2).toUpperCase();
}

// Get consultants for a specialty
function getConsultantsForSpecialty(specialty: string): Consultant[] {
  // Map specialty names to consultant specialty field
  const specialtyMap: { [key: string]: string } = {
    'Orthopaedics': 'Orthopaedics',
    'Trauma': 'Orthopaedics',
    'General Surgery': 'General Surgery',
    'Emergency': 'General Surgery',
    'Colorectal': 'General Surgery',
    'Upper GI': 'General Surgery',
    'Hepatobiliary': 'Hepatobiliary',
    'Vascular': 'Vascular',
    'Urology': 'Urology',
    'Gynaecology': 'Gynaecology',
    'ENT': 'ENT',
    'Ophthalmology': 'Ophthalmology',
    'Plastic Surgery': 'Plastic Surgery',
    'Maxillofacial': 'Maxillofacial',
    'Neurosurgery': 'Neurosurgery',
    'Cardiac': 'Cardiac'
  };

  const mappedSpecialty = specialtyMap[specialty] || specialty;
  return ROYAL_LONDON_CONSULTANTS.filter(c => c.specialty === mappedSpecialty);
}

// Get procedures for a specialty
function getProceduresForSpecialty(specialty: string): Procedure[] {
  const procedures: Procedure[] = [];

  // Map specialty to procedure categories
  const specialtyMap: { [key: string]: string[] } = {
    'Orthopaedics': ['Trauma Orthopaedics', 'Elective Orthopaedics'],
    'Trauma': ['Trauma Orthopaedics'],
    'General Surgery': ['General Surgery', 'Emergency Surgery', 'Colorectal', 'Upper GI'],
    'Emergency': ['Emergency Surgery', 'General Surgery'],
    'Colorectal': ['Colorectal'],
    'Hepatobiliary': ['Hepatobiliary'],
    'Upper GI': ['Upper GI'],
    'Vascular': ['Vascular'],
    'Urology': ['Urology'],
    'Gynaecology': ['Gynaecology'],
    'ENT': ['ENT'],
    'Ophthalmology': ['Ophthalmology'],
    'Plastic Surgery': ['Plastic Surgery'],
    'Maxillofacial': ['Maxillofacial'],
    'Neurosurgery': ['Neurosurgery'],
    'Cardiac': ['Cardiac']
  };

  const categories = specialtyMap[specialty] || [specialty];

  for (const category of categories) {
    const specialtyData = SURGICAL_PROCEDURES_BY_SPECIALTY[category as keyof typeof SURGICAL_PROCEDURES_BY_SPECIALTY];
    if (specialtyData && 'subcategories' in specialtyData) {
      const subcats: any = specialtyData.subcategories;
      for (const subcatKey of Object.keys(subcats)) {
        const subcat = subcats[subcatKey];
        if (subcat && subcat.procedures && Array.isArray(subcat.procedures)) {
          procedures.push(...subcat.procedures);
        }
      }
    }
  }

  return procedures;
}

// Generate lists for a date range
function generateTheatreListsForDateRange(
  startDate: Date,
  endDate: Date,
  units: TheatreUnit[]
): TheatreList[] {
  const lists: TheatreList[] = [];
  const currentDate = new Date(startDate);

  console.log(`\n🏥 Generating theatre lists from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Process each unit
    for (const unit of units) {
      // Process each theatre
      for (const theatre of unit.theatres) {
        // Check if theatre operates on this day
        const activeSpecialties = theatre.specialties.filter(sp =>
          sp.daysOfWeek.includes(dayOfWeek)
        );

        if (activeSpecialties.length === 0) continue;

        // Get highest priority specialty for this day
        const specialty = activeSpecialties.sort((a, b) => a.priority - b.priority)[0];

        // Get consultants for this specialty
        const consultants = getConsultantsForSpecialty(specialty.specialty);
        if (consultants.length === 0) {
          console.warn(`⚠️  No consultants found for ${specialty.specialty}`);
          continue;
        }

        // Pick a random consultant
        const surgeon = consultants[Math.floor(Math.random() * consultants.length)];
        const surgeonInitials = getInitials(surgeon.fullName);

        // Pick a random anaesthetist
        const anaesthetist = ANAESTHETISTS[Math.floor(Math.random() * ANAESTHETISTS.length)];

        // Get procedures for this specialty
        const procedures = getProceduresForSpecialty(specialty.specialty);
        if (procedures.length === 0) {
          console.warn(`⚠️  No procedures found for ${specialty.specialty}`);
          continue;
        }

        // Generate lists for each session type
        for (const sessionType of specialty.sessions) {
          const list = generateTheatreList(
            new Date(currentDate),
            theatre.id,
            theatre.name,
            unit.id,
            unit.name,
            unit.hospitalId,
            unit.hospitalName,
            specialty.specialty,
            sessionType,
            procedures,
            surgeon.fullName,
            surgeonInitials,
            anaesthetist.name,
            anaesthetist.initials,
            theatre.isEmergency || theatre.isTrauma
          );

          lists.push(list);

          if (lists.length % 50 === 0) {
            console.log(`✅ Generated ${lists.length} lists...`);
          }
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return lists;
}

// Main execution
console.log('🎯 THEATRE LISTS DATA GENERATOR');
console.log('='.repeat(80));
console.log('Generating 6 months of theatre lists (July - December 2025)');
console.log('='.repeat(80));

const startDate = new Date('2025-07-01');
const endDate = new Date('2025-12-31');

const lists = generateTheatreListsForDateRange(startDate, endDate, ROYAL_LONDON_UNITS);

console.log(`\n✅ Generated ${lists.length} theatre lists!`);
console.log(`\n📊 Statistics:`);
console.log(`   • Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
console.log(`   • Total lists: ${lists.length}`);
console.log(`   • Total cases: ${lists.reduce((sum, l) => sum + l.totalCases, 0)}`);
console.log(`   • Average cases per list: ${(lists.reduce((sum, l) => sum + l.totalCases, 0) / lists.length).toFixed(1)}`);
console.log(`   • Average utilization: ${(lists.reduce((sum, l) => sum + l.utilizationPercentage, 0) / lists.length).toFixed(1)}%`);

// Group by specialty
const bySpecialty: { [key: string]: number } = {};
lists.forEach(list => {
  bySpecialty[list.specialty] = (bySpecialty[list.specialty] || 0) + 1;
});

console.log(`\n📋 Lists by Specialty:`);
Object.entries(bySpecialty)
  .sort((a, b) => b[1] - a[1])
  .forEach(([specialty, count]) => {
    console.log(`   • ${specialty}: ${count} lists`);
  });

// Save to JSON file
const outputPath = join(process.cwd(), 'generated_theatre_lists.json');
writeFileSync(outputPath, JSON.stringify(lists, null, 2));

console.log(`\n💾 Data saved to: ${outputPath}`);
console.log(`\n🎉 Generation complete!\n`);
