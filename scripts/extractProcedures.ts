import * as fs from 'fs';
import * as path from 'path';

// Read the procedures file
const proceduresPath = path.join(process.cwd(), 'app', 'api', 'procedures', 'route.ts');
const financialPath = path.join(process.cwd(), 'lib', 'surgicalCompetencyData.ts');

const proceduresContent = fs.readFileSync(proceduresPath, 'utf8');
const financialContent = fs.readFileSync(financialPath, 'utf8');

// Extract all procedures using regex
const procedureMatches = proceduresContent.matchAll(/\{\s*name:\s*'([^']+)',\s*specialtyName:\s*'([^']+)',\s*(?:subspecialtyName:\s*'([^']*)',\s*)?opcs4:\s*\[([^\]]+)\]/g);

interface ExtractedProcedure {
  name: string;
  specialty: string;
  subcategory: string;
  opcs4: string[];
}

const allProcs: ExtractedProcedure[] = [];
for (const match of procedureMatches) {
  const name = match[1];
  const specialty = match[2];
  const subcategory = match[3] || '';
  const opcs4Str = match[4];
  const opcs4 = opcs4Str.split(',').map(code => code.trim().replace(/'/g, ''));

  allProcs.push({
    name,
    specialty,
    subcategory,
    opcs4
  });
}

// Extract existing financial entries
const existingCodes = new Set<string>();
const existingMatches = financialContent.matchAll(/'([A-Z]\d+)':\s*\{/g);
for (const match of existingMatches) {
  existingCodes.add(match[1]);
}

console.log(`Total procedures: ${allProcs.length}`);
console.log(`Existing financial entries: ${existingCodes.size}`);

// Find missing procedures
const missingProcs = allProcs.filter(proc => !existingCodes.has(proc.opcs4[0]));
console.log(`Missing financial entries: ${missingProcs.length}`);

// Group by specialty
const bySpecialty: Record<string, ExtractedProcedure[]> = {};
missingProcs.forEach(proc => {
  if (!bySpecialty[proc.specialty]) {
    bySpecialty[proc.specialty] = [];
  }
  bySpecialty[proc.specialty].push(proc);
});

console.log('\nMissing by specialty:');
Object.keys(bySpecialty).sort().forEach(specialty => {
  console.log(`${specialty}: ${bySpecialty[specialty].length}`);
});

// Output all missing procedures for reference
console.log('\n\n=== MISSING PROCEDURES ===\n');
Object.keys(bySpecialty).sort().forEach(specialty => {
  console.log(`\n// ${specialty.toUpperCase()}`);
  bySpecialty[specialty].forEach(proc => {
    console.log(`// ${proc.name} (${proc.opcs4[0]}) - ${proc.subcategory || 'No subcategory'}`);
  });
});
