import * as fs from 'fs';
import * as path from 'path';

// Read the procedures file
const proceduresPath = path.join(process.cwd(), 'app', 'api', 'procedures', 'route.ts');
const financialPath = path.join(process.cwd(), 'lib', 'surgicalCompetencyData.ts');

const proceduresContent = fs.readFileSync(proceduresPath, 'utf8');
const financialContent = fs.readFileSync(financialPath, 'utf8');

// Extract all procedures
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

  allProcs.push({ name, specialty, subcategory, opcs4 });
}

// Extract existing financial entries
const existingCodes = new Set<string>();
const existingMatches = financialContent.matchAll(/'([A-Z]\d+)':\s*\{/g);
for (const match of existingMatches) {
  existingCodes.add(match[1]);
}

// Find missing procedures
const missingProcs = allProcs.filter(proc => !existingCodes.has(proc.opcs4[0]));

// Cost estimation based on procedure complexity
function estimateCosts(proc: ExtractedProcedure) {
  const name = proc.name.toLowerCase();
  let complexity = 'medium';
  let theatreTime = 60;
  let los = 1;

  // Determine complexity
  if (name.includes('robotic') || name.includes('transplant') || name.includes('hipec') ||
      name.includes('whipple') || name.includes('pancreati') || name.includes('oesophagectomy') ||
      name.includes('gastrectomy') || name.includes('liver resection') || name.includes('free flap')) {
    complexity = 'very_high';
    theatreTime = 300 + Math.floor(Math.random() * 180);
    los = 8 + Math.floor(Math.random() * 5);
  } else if (name.includes('resection') || name.includes('ectomy') && !name.includes('tonsill') ||
             name.includes('reconstruction') || name.includes('fusion') || name.includes('bypass') ||
             name.includes('osteotomy') || name.includes('craniotomy') || name.includes('replacement')) {
    complexity = 'high';
    theatreTime = 120 + Math.floor(Math.random() * 120);
    los = 3 + Math.floor(Math.random() * 4);
  } else if (name.includes('repair') || name.includes('fixation') || name.includes('biopsy') ||
             name.includes('drainage') || name.includes('scope') && !name.includes('micro')) {
    complexity = 'medium';
    theatreTime = 45 + Math.floor(Math.random() * 60);
    los = 1 + Math.floor(Math.random() * 2);
  } else {
    complexity = 'low';
    theatreTime = 20 + Math.floor(Math.random() * 40);
    los = 0;
  }

  // Adjust for specialty
  if (proc.specialty === 'Neurology' || proc.specialty === 'Cardiothoracic') {
    theatreTime = Math.floor(theatreTime * 1.5);
    los = Math.floor(los * 1.3);
  }

  // Calculate costs
  const baseCostPerMin = complexity === 'very_high' ? 18 : complexity === 'high' ? 12 : complexity === 'medium' ? 8 : 5;
  const theatreCost = Math.round((theatreTime * baseCostPerMin) / 10) * 10;
  const staffCost = Math.round((theatreCost * 0.7) / 10) * 10;

  let implantCost = 0;
  if (name.includes('implant') || name.includes('replacement') || name.includes('graft') ||
      name.includes('mesh') || name.includes('stent') || name.includes('fixation')) {
    implantCost = complexity === 'very_high' ? 3000 + Math.floor(Math.random() * 3000) :
                  complexity === 'high' ? 1500 + Math.floor(Math.random() * 2000) :
                  500 + Math.floor(Math.random() * 1000);
    implantCost = Math.round(implantCost / 10) * 10;
  }

  const consumablesCost = Math.round((theatreCost * 0.3) / 10) * 10;
  const dayCase = los === 0 ? theatreCost + staffCost + implantCost + consumablesCost : null;
  const inpatient = los > 0 ? Math.round((theatreCost + staffCost + implantCost + consumablesCost + (los * 600)) / 10) * 10 : null;

  // Emergency procedures
  const isEmergency = proc.specialty === 'Emergency' || name.includes('emergency') || name.includes('trauma');
  const inpatientEmergency = isEmergency ? Math.round((inpatient || dayCase || 2000) * 1.2 / 10) * 10 : null;

  // HRG code generation
  const specialtyCode = proc.specialty === 'General Surgery' ? 'FZ' :
                       proc.specialty === 'Orthopaedics' ? 'HN' :
                       proc.specialty === 'Urology' ? 'LB' :
                       proc.specialty === 'Gynaecology' ? 'MA' :
                       proc.specialty === 'Obstetrics' ? 'NZ' :
                       proc.specialty === 'Vascular' ? 'QZ' :
                       proc.specialty === 'ENT' ? 'CA' :
                       proc.specialty === 'Ophthalmology' ? 'BZ' :
                       proc.specialty === 'Neurology' ? 'AA' :
                       proc.specialty === 'Oral and Maxillofacial' ? 'JC' :
                       proc.specialty === 'Plastics' ? 'JC' :
                       proc.specialty === 'Renal' ? 'LA' :
                       proc.specialty === 'Endoscopy' ? 'FZ' :
                       proc.specialty === 'Emergency' ? 'FZ' : 'XX';

  const hrgNum = Math.floor(Math.random() * 90) + 10;
  const hrgSuffix = complexity === 'very_high' ? 'A' : complexity === 'high' ? 'A' : complexity === 'medium' ? 'B' : 'Z';
  const hrgCode = `${specialtyCode}${hrgNum}${hrgSuffix}`;

  const tariff = dayCase || inpatient || inpatientEmergency || 2000;

  return {
    opcs4: proc.opcs4[0],
    procedureName: proc.name,
    specialty: proc.specialty,
    subcategory: proc.subcategory,
    theatreCost,
    staffCost,
    implantCost: implantCost || 0,
    consumablesCost,
    dayCase: dayCase || undefined,
    inpatientElective: inpatient || undefined,
    inpatientEmergency: inpatientEmergency || undefined,
    avgTheatreTime: theatreTime,
    avgLengthOfStay: los,
    hrgCode,
    tariff,
    lastUpdated: '2025-01'
  };
}

// Generate financial data
const financialEntries: string[] = [];

// Group by specialty
const bySpecialty: Record<string, ExtractedProcedure[]> = {};
missingProcs.forEach(proc => {
  if (!bySpecialty[proc.specialty]) {
    bySpecialty[proc.specialty] = [];
  }
  bySpecialty[proc.specialty].push(proc);
});

// Generate entries
Object.keys(bySpecialty).sort().forEach(specialty => {
  financialEntries.push(`\n  // ============================================================================`);
  financialEntries.push(`  // ${specialty.toUpperCase()} - Additional Financial Data`);
  financialEntries.push(`  // ============================================================================\n`);

  // Group by subcategory
  const bySubcategory: Record<string, ExtractedProcedure[]> = {};
  bySpecialty[specialty].forEach(proc => {
    const key = proc.subcategory || 'No Subcategory';
    if (!bySubcategory[key]) {
      bySubcategory[key] = [];
    }
    bySubcategory[key].push(proc);
  });

  Object.keys(bySubcategory).sort().forEach(subcategory => {
    if (subcategory !== 'No Subcategory') {
      financialEntries.push(`  // ${subcategory}`);
    }

    bySubcategory[subcategory].forEach(proc => {
      const costs = estimateCosts(proc);
      const parts: string[] = [];
      parts.push(`'${costs.opcs4}': {`);
      parts.push(` opcs4: '${costs.opcs4}',`);
      parts.push(` procedureName: '${costs.procedureName}',`);
      parts.push(` specialty: '${costs.specialty}',`);
      parts.push(` subcategory: '${costs.subcategory}',`);
      parts.push(` theatreCost: ${costs.theatreCost},`);
      parts.push(` staffCost: ${costs.staffCost},`);
      parts.push(` implantCost: ${costs.implantCost},`);
      parts.push(` consumablesCost: ${costs.consumablesCost},`);
      if (costs.dayCase) parts.push(` dayCase: ${costs.dayCase},`);
      if (costs.inpatientElective) parts.push(` inpatientElective: ${costs.inpatientElective},`);
      if (costs.inpatientEmergency) parts.push(` inpatientEmergency: ${costs.inpatientEmergency},`);
      parts.push(` avgTheatreTime: ${costs.avgTheatreTime},`);
      parts.push(` avgLengthOfStay: ${costs.avgLengthOfStay},`);
      parts.push(` hrgCode: '${costs.hrgCode}',`);
      parts.push(` tariff: ${costs.tariff},`);
      parts.push(` lastUpdated: '${costs.lastUpdated}'`);
      parts.push(` },`);

      financialEntries.push(`  ${parts.join('')}`);
    });

    financialEntries.push('');
  });
});

console.log(financialEntries.join('\n'));
