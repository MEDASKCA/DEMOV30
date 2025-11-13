const fs = require('fs');

const filePath = 'C:/Users/forda/OneDrive/Desktop/OPCS-4.11 Data files txt/OPCS-4.11 Data files txt/OPCS411 Metadata Nov 2025 V1.0.txt.txt';
const fileContent = fs.readFileSync(filePath, 'utf-8');
const lines = fileContent.split('\n').filter(line => line.trim());

const CHAPTER_TO_SPECIALTY = {
  'A': 'NEUROLOGY',
  'B': 'PLASTICS',
  'C': 'OPHTHALMOLOGY',           // Eye
  'D': 'ENT',
  'E': 'GENERAL SURGERY',
  'F': 'ORAL AND MAXILLOFACIAL',
  'G': 'GENERAL SURGERY',
  'H': 'GENERAL SURGERY',
  'J': 'GENERAL SURGERY',
  'K': 'GENERAL SURGERY',         // Heart - no cardiac surgery specialty
  'L': 'VASCULAR',                // Arteries and Veins
  'M': 'RENAL',
  'N': 'UROLOGY',
  'P': 'GYNAECOLOGY',
  'Q': 'GYNAECOLOGY',
  'R': 'GYNAECOLOGY',
  'S': 'PLASTICS',
  'T': 'ORTHOPAEDICS',
  'U': 'PLASTICS',
  'V': 'NEUROLOGY',
  'W': 'ORTHOPAEDICS',
  'X': 'GENERAL SURGERY'
};

const procedures = [];
let skipped = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  let parts = line.split('\t');
  let code = '';
  let name = '';

  if (parts.length === 2) {
    code = parts[0].trim();
    name = parts[1].trim();
  } else {
    const spaceParts = line.split(/\s{2,}/).filter(p => p.trim());

    if (spaceParts.length >= 4) {
      code = spaceParts[1]?.trim() || '';
      name = spaceParts[3]?.trim() || '';

      if (!/^[A-Z]\d/.test(code)) {
        code = '';
      }
    }
  }

  if (!code || !name || code.length < 2) {
    skipped++;
    continue;
  }

  const chapter = code.charAt(0).toUpperCase();
  const specialty = CHAPTER_TO_SPECIALTY[chapter] || 'GENERAL SURGERY';

  procedures.push({
    code,
    name,
    specialtyName: specialty
  });
}

console.log('Total procedures parsed:', procedures.length);
console.log('Skipped:', skipped);

// Generate TypeScript file with JSON.stringify for proper escaping
let output = '/**\n';
output += ' * OPCS-4.11 Procedures Database (Hardcoded)\n';
output += ' * Generated from NHS TRUD OPCS-4.11 Metadata\n';
output += ' * Total Procedures: ' + procedures.length + '\n';
output += ' * Source: OPCS-4.11 CodesAndTitles Nov 2025 V1.0\n';
output += ' */\n\n';
output += 'export interface OPCS4Procedure {\n';
output += '  code: string;\n';
output += '  name: string;\n';
output += '  specialtyName: string;\n';
output += '}\n\n';
output += 'export const OPCS4_PROCEDURES: OPCS4Procedure[] = [\n';

procedures.forEach((proc, index) => {
  // Use JSON.stringify for proper escaping
  output += `  { code: ${JSON.stringify(proc.code)}, name: ${JSON.stringify(proc.name)}, specialtyName: ${JSON.stringify(proc.specialtyName)} }`;
  if (index < procedures.length - 1) output += ',';
  output += '\n';
});

output += '];\n';

fs.writeFileSync('lib/opcs4Procedures.ts', output);
console.log('✅ Generated lib/opcs4Procedures.ts with proper escaping');
