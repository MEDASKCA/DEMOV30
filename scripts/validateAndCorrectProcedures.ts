// ============================================================================
// VALIDATE AND CORRECT ALL PROCEDURE OPCS CODES
// Comprehensive validation of surgicalCompetencyData.ts against OPCS-4.10
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OPCSCode {
  code: string;
  description: string;
  chapter: string;
  category: string;
  isMainCode: boolean;
}

interface OPCSLookup {
  version: string;
  totalCodes: number;
  codeIndex: Record<string, OPCSCode>;
}

interface ValidationIssue {
  procedureName: string;
  specialty: string;
  subspecialty?: string;
  code: string;
  issue: string;
  officialDescription?: string;
  suggestedCorrection?: string;
}

// Load OPCS lookup database
function loadOPCSLookup(): OPCSLookup {
  const lookupPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
  return JSON.parse(fs.readFileSync(lookupPath, 'utf-8'));
}

// Normalize OPCS code
function normalizeCode(code: string): string {
  return code.replace(/\./g, '').toUpperCase().trim();
}

// Look up OPCS code
function lookupCode(code: string, lookup: OPCSLookup): OPCSCode | null {
  const normalized = normalizeCode(code);
  return lookup.codeIndex[normalized] || null;
}

// Search for procedures by keyword
function searchProcedures(keyword: string, lookup: OPCSLookup, limit: number = 5): OPCSCode[] {
  const search = keyword.toLowerCase();
  const results: OPCSCode[] = [];

  for (const opcsCode of Object.values(lookup.codeIndex)) {
    if (results.length >= limit) break;
    if (opcsCode.description.toLowerCase().includes(search)) {
      results.push(opcsCode);
    }
  }

  return results;
}

// Extract procedure name keywords for searching
function extractKeywords(procedureName: string): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = ['of', 'the', 'and', 'or', 'for', 'with', 'by', 'to', 'in', 'on', 'at'];
  const words = procedureName
    .toLowerCase()
    .replace(/[()]/g, '')
    .split(/[\s-]+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));

  return words;
}

// Main validation
async function validateProcedures() {
  console.log('🔍 Loading OPCS-4.10 lookup database...');
  const lookup = loadOPCSLookup();
  console.log(`✅ Loaded ${lookup.totalCodes} OPCS codes\n`);

  console.log('📖 Reading surgicalCompetencyData.ts...');
  const competencyPath = path.join(__dirname, '..', 'lib', 'surgicalCompetencyData.ts');
  const content = fs.readFileSync(competencyPath, 'utf-8');

  // Extract all procedure definitions with regex
  // Matches: { name: '...', opcs4: ['...', '...'] }
  const procedureRegex = /\{\s*name:\s*['"]([^'"]+)['"]\s*,\s*opcs4:\s*\[([^\]]+)\]/g;

  let match;
  const procedures: Array<{ name: string; codes: string[]; line: number }> = [];

  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const lineMatch = line.match(/name:\s*['"]([^'"]+)['"]\s*,\s*opcs4:\s*\[([^\]]+)\]/);
    if (lineMatch) {
      const name = lineMatch[1];
      const codesStr = lineMatch[2];
      const codes = codesStr
        .split(',')
        .map(c => c.trim().replace(/['"]/g, ''))
        .filter(c => c.length > 0);

      procedures.push({ name, codes, line: idx + 1 });
    }
  });

  console.log(`✅ Found ${procedures.length} procedures\n`);

  // Validate each procedure
  const issues: ValidationIssue[] = [];
  let totalCodes = 0;
  let validCodes = 0;
  let invalidCodes = 0;
  let mismatchedCodes = 0;

  console.log('🔎 Validating OPCS codes...\n');

  for (const proc of procedures) {
    for (const code of proc.codes) {
      totalCodes++;
      const opcsCode = lookupCode(code, lookup);

      if (!opcsCode) {
        // Code doesn't exist
        invalidCodes++;

        // Try to find similar codes
        const keywords = extractKeywords(proc.name);
        const suggestions = keywords.length > 0 ? searchProcedures(keywords[0], lookup, 3) : [];

        issues.push({
          procedureName: proc.name,
          specialty: 'Unknown',
          code,
          issue: 'CODE NOT FOUND IN OPCS-4.10',
          suggestedCorrection: suggestions.length > 0
            ? `Try: ${suggestions.map(s => `${s.code} (${s.description})`).join(' | ')}`
            : undefined
        });
      } else {
        validCodes++;

        // Check if description reasonably matches
        const procNameLower = proc.name.toLowerCase();
        const opcsDescLower = opcsCode.description.toLowerCase();

        // Extract significant words from both
        const procWords = extractKeywords(proc.name);
        const opcsWords = extractKeywords(opcsCode.description);

        // Check for overlap
        const hasOverlap = procWords.some(w => opcsWords.includes(w)) ||
                          opcsWords.some(w => procWords.includes(w));

        if (!hasOverlap && procWords.length > 0) {
          mismatchedCodes++;
          issues.push({
            procedureName: proc.name,
            specialty: 'Unknown',
            code,
            issue: 'POSSIBLE MISMATCH',
            officialDescription: opcsCode.description
          });
        }
      }
    }
  }

  // Print summary
  console.log('='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Procedures: ${procedures.length}`);
  console.log(`Total OPCS Codes: ${totalCodes}`);
  console.log(`Valid Codes: ${validCodes} (${((validCodes / totalCodes) * 100).toFixed(1)}%)`);
  console.log(`Invalid Codes: ${invalidCodes} (${((invalidCodes / totalCodes) * 100).toFixed(1)}%)`);
  console.log(`Possible Mismatches: ${mismatchedCodes} (${((mismatchedCodes / totalCodes) * 100).toFixed(1)}%)`);
  console.log(`Total Issues: ${issues.length}`);
  console.log('='.repeat(80));

  // Group issues
  const notFound = issues.filter(i => i.issue === 'CODE NOT FOUND IN OPCS-4.10');
  const mismatches = issues.filter(i => i.issue === 'POSSIBLE MISMATCH');

  // Print critical issues (not found)
  if (notFound.length > 0) {
    console.log(`\n\n❌ INVALID CODES (${notFound.length}):`);
    console.log('-'.repeat(80));
    notFound.slice(0, 20).forEach((issue, idx) => {
      console.log(`\n${idx + 1}. ${issue.procedureName}`);
      console.log(`   Code: ${issue.code}`);
      console.log(`   Issue: ${issue.issue}`);
      if (issue.suggestedCorrection) {
        console.log(`   Suggestions: ${issue.suggestedCorrection}`);
      }
    });

    if (notFound.length > 20) {
      console.log(`\n   ... and ${notFound.length - 20} more invalid codes`);
    }
  }

  // Print warning issues (mismatches)
  if (mismatches.length > 0) {
    console.log(`\n\n⚠️  POSSIBLE MISMATCHES (${mismatches.length}):`);
    console.log('-'.repeat(80));
    console.log('(These codes exist but may not match the procedure name)\n');
    mismatches.slice(0, 10).forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.procedureName}`);
      console.log(`   Code: ${issue.code}`);
      console.log(`   Official: ${issue.officialDescription}`);
      console.log('');
    });

    if (mismatches.length > 10) {
      console.log(`   ... and ${mismatches.length - 10} more possible mismatches`);
    }
  }

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'opcs-validation-detailed-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalProcedures: procedures.length,
      totalCodes,
      validCodes,
      invalidCodes,
      mismatchedCodes
    },
    issues
  }, null, 2));

  console.log(`\n\n📄 Detailed report saved to: ${reportPath}\n`);

  // Return summary
  return {
    totalProcedures: procedures.length,
    totalCodes,
    validCodes,
    invalidCodes,
    issues: issues.length
  };
}

// Run validation
validateProcedures().catch(console.error);
