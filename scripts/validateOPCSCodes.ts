// ============================================================================
// OPCS-4 CODE VALIDATION SCRIPT
// Validates existing procedure codes against official NHS OPCS-4.10 data
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OfficialOPCSCode {
  code: string;
  description: string;
}

interface Procedure {
  name: string;
  specialtyName: string;
  subspecialtyName?: string;
  opcs4: string[];
  commonVariations?: string[];
}

interface ProceduresData {
  procedures: Procedure[];
}

interface ValidationResult {
  totalProcedures: number;
  totalCodes: number;
  validCodes: number;
  invalidCodes: number;
  issues: Array<{
    procedureName: string;
    specialty: string;
    code: string;
    issue: string;
    suggestion?: string;
  }>;
}

// Parse official OPCS-4 CodesAndTitles file
function parseOfficialOPCSData(filePath: string): Map<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const codeMap = new Map<string, string>();

  for (const line of lines) {
    if (!line.trim()) continue;

    // Format: "A011\tHemispherectomy" or "A01\tMajor excision of tissue of brain"
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const code = parts[0].trim();
      const description = parts[1].trim();

      // Store both with and without dots (some systems use dots)
      codeMap.set(code, description);

      // Also store version with dot if it's a 4-character code
      if (code.length === 4 && !code.includes('.')) {
        const codeWithDot = code.substring(0, 3) + '.' + code.substring(3);
        codeMap.set(codeWithDot, description);
      }
    }
  }

  return codeMap;
}

// Normalize OPCS code (remove dots, uppercase)
function normalizeCode(code: string): string {
  return code.replace(/\./g, '').toUpperCase().trim();
}

// Find similar codes (for suggestions)
function findSimilarCodes(code: string, codeMap: Map<string, string>, maxResults: number = 3): string[] {
  const normalized = normalizeCode(code);
  const similar: string[] = [];

  // Look for codes that start with the same letter and first digit
  const prefix = normalized.substring(0, 2);

  for (const [validCode] of codeMap) {
    const normalizedValid = normalizeCode(validCode);
    if (normalizedValid.startsWith(prefix) && normalizedValid !== normalized) {
      similar.push(validCode);
      if (similar.length >= maxResults) break;
    }
  }

  return similar;
}

// Validate procedures
function validateProcedures(
  proceduresPath: string,
  officialCodesPath: string
): ValidationResult {
  console.log('🔍 Loading official OPCS-4.10 data...');
  const officialCodes = parseOfficialOPCSData(officialCodesPath);
  console.log(`✅ Loaded ${officialCodes.size} official OPCS-4 codes\n`);

  console.log('📋 Loading your procedures data...');
  const proceduresData: ProceduresData = JSON.parse(
    fs.readFileSync(proceduresPath, 'utf-8')
  );
  console.log(`✅ Loaded ${proceduresData.procedures.length} procedures\n`);

  const result: ValidationResult = {
    totalProcedures: proceduresData.procedures.length,
    totalCodes: 0,
    validCodes: 0,
    invalidCodes: 0,
    issues: []
  };

  console.log('🔎 Validating OPCS codes...\n');

  for (const procedure of proceduresData.procedures) {
    for (const code of procedure.opcs4) {
      result.totalCodes++;
      const normalized = normalizeCode(code);

      // Check if code exists in official data
      let found = false;
      for (const [officialCode, description] of officialCodes) {
        if (normalizeCode(officialCode) === normalized) {
          found = true;
          result.validCodes++;

          // Check if description roughly matches
          const procedureNameLower = procedure.name.toLowerCase();
          const descriptionLower = description.toLowerCase();

          // Simple mismatch check (not perfect, but helps identify issues)
          const hasCommonWords = procedureNameLower.split(' ').some(word =>
            word.length > 3 && descriptionLower.includes(word)
          ) || descriptionLower.split(' ').some(word =>
            word.length > 3 && procedureNameLower.includes(word)
          );

          if (!hasCommonWords && !procedure.commonVariations?.some(v =>
            v.toLowerCase().split(' ').some(word =>
              word.length > 3 && descriptionLower.includes(word)
            )
          )) {
            result.issues.push({
              procedureName: procedure.name,
              specialty: procedure.specialtyName,
              code: code,
              issue: `Code exists but description may not match`,
              suggestion: `Official: "${description}"`
            });
          }
          break;
        }
      }

      if (!found) {
        result.invalidCodes++;
        const similar = findSimilarCodes(code, officialCodes);
        result.issues.push({
          procedureName: procedure.name,
          specialty: procedure.specialtyName,
          code: code,
          issue: 'Code NOT found in OPCS-4.10',
          suggestion: similar.length > 0
            ? `Similar codes: ${similar.join(', ')}`
            : 'No similar codes found'
        });
      }
    }
  }

  return result;
}

// Main execution
function main() {
  const officialCodesPath = path.join(
    'C:',
    'Users',
    'forda',
    'OneDrive',
    'Desktop',
    'OPCS410 Data files txt',
    'OPCS410 CodesAndTitles Nov 2022 V1.0.txt'
  );

  const proceduresPath = path.join(
    __dirname,
    '..',
    'data',
    'royal-london-procedures.json'
  );

  if (!fs.existsSync(officialCodesPath)) {
    console.error('❌ Official OPCS-4 data file not found at:', officialCodesPath);
    process.exit(1);
  }

  if (!fs.existsSync(proceduresPath)) {
    console.error('❌ Procedures file not found at:', proceduresPath);
    process.exit(1);
  }

  const result = validateProcedures(proceduresPath, officialCodesPath);

  // Print summary
  console.log('=' .repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Procedures: ${result.totalProcedures}`);
  console.log(`Total OPCS Codes: ${result.totalCodes}`);
  console.log(`Valid Codes: ${result.validCodes} (${((result.validCodes / result.totalCodes) * 100).toFixed(1)}%)`);
  console.log(`Invalid Codes: ${result.invalidCodes} (${((result.invalidCodes / result.totalCodes) * 100).toFixed(1)}%)`);
  console.log(`Issues Found: ${result.issues.length}`);
  console.log('='.repeat(80));

  if (result.issues.length > 0) {
    console.log('\n📝 DETAILED ISSUES:\n');

    // Group by issue type
    const invalidCodes = result.issues.filter(i => i.issue.includes('NOT found'));
    const mismatches = result.issues.filter(i => i.issue.includes('may not match'));

    if (invalidCodes.length > 0) {
      console.log(`\n❌ INVALID CODES (${invalidCodes.length}):`);
      console.log('-'.repeat(80));
      invalidCodes.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.procedureName} (${issue.specialty})`);
        console.log(`   Code: ${issue.code}`);
        console.log(`   Issue: ${issue.issue}`);
        if (issue.suggestion) {
          console.log(`   ${issue.suggestion}`);
        }
      });
    }

    if (mismatches.length > 0) {
      console.log(`\n\n⚠️  POSSIBLE MISMATCHES (${mismatches.length}):`);
      console.log('-'.repeat(80));
      mismatches.slice(0, 10).forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.procedureName} (${issue.specialty})`);
        console.log(`   Code: ${issue.code}`);
        console.log(`   ${issue.suggestion}`);
      });

      if (mismatches.length > 10) {
        console.log(`\n   ... and ${mismatches.length - 10} more mismatches`);
      }
    }
  } else {
    console.log('\n✅ All codes are valid!\n');
  }

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'opcs-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
}

main();
