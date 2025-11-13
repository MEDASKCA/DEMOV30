// ============================================================================
// OPCS-4.10 PARSER
// Converts official NHS OPCS-4.10 data into searchable JSON format
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OPCSCode {
  code: string;
  description: string;
  chapter: string; // A, B, C, etc.
  category: string; // A01, B02, etc.
  isMainCode: boolean; // true for A01, false for A011
  searchTerms: string[]; // for autocomplete
}

interface OPCSDatabase {
  version: string;
  generatedDate: string;
  totalCodes: number;
  codes: OPCSCode[];
  codeIndex: Record<string, OPCSCode>; // for fast lookup
}

// Extract chapter from code (first letter)
function getChapter(code: string): string {
  return code.charAt(0).toUpperCase();
}

// Extract category (e.g., A01 from A011)
function getCategory(code: string): string {
  if (code.length >= 3) {
    return code.substring(0, 3).toUpperCase();
  }
  return code.toUpperCase();
}

// Check if it's a main code (3 chars) vs subcategory (4+ chars)
function isMainCode(code: string): boolean {
  // Remove dots
  const normalized = code.replace(/\./g, '');
  return normalized.length === 3;
}

// Generate search terms for autocomplete
function generateSearchTerms(code: string, description: string): string[] {
  const terms: string[] = [];

  // Add code itself
  terms.push(code.toLowerCase());
  terms.push(code.replace(/\./g, '').toLowerCase());

  // Add description words (longer than 3 characters)
  const words = description.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  terms.push(...words);

  // Add full description
  terms.push(description.toLowerCase());

  return [...new Set(terms)]; // Remove duplicates
}

// Parse the official OPCS-4 CodesAndTitles file
function parseOPCS410(filePath: string): OPCSDatabase {
  console.log('📖 Reading OPCS-4.10 data file...');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const codes: OPCSCode[] = [];
  const codeIndex: Record<string, OPCSCode> = {};

  console.log(`📊 Processing ${lines.length} lines...`);

  for (const line of lines) {
    if (!line.trim()) continue;

    // Format: "A011\tHemispherectomy"
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const code = parts[0].trim();
      const description = parts[1].trim();

      if (!code || !description) continue;

      const opcsCode: OPCSCode = {
        code,
        description,
        chapter: getChapter(code),
        category: getCategory(code),
        isMainCode: isMainCode(code),
        searchTerms: generateSearchTerms(code, description)
      };

      codes.push(opcsCode);

      // Index by normalized code (without dots)
      const normalized = code.replace(/\./g, '').toUpperCase();
      codeIndex[normalized] = opcsCode;

      // Also index with dots if applicable
      if (code.includes('.') || code.length === 4) {
        const withDot = code.length === 4 && !code.includes('.')
          ? code.substring(0, 3) + '.' + code.substring(3)
          : code;
        codeIndex[withDot.toUpperCase()] = opcsCode;
      }
    }
  }

  console.log(`✅ Parsed ${codes.length} OPCS codes`);

  return {
    version: 'OPCS-4.10',
    generatedDate: new Date().toISOString(),
    totalCodes: codes.length,
    codes,
    codeIndex
  };
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

  if (!fs.existsSync(officialCodesPath)) {
    console.error('❌ Official OPCS-4 data file not found at:', officialCodesPath);
    process.exit(1);
  }

  console.log('🚀 Starting OPCS-4.10 parser...\n');

  const database = parseOPCS410(officialCodesPath);

  // Save full database
  const fullPath = path.join(__dirname, '..', 'data', 'opcs410-full.json');
  console.log('\n💾 Saving full database...');
  fs.writeFileSync(fullPath, JSON.stringify(database, null, 2));
  console.log(`✅ Saved to: ${fullPath}`);
  console.log(`   Size: ${(fs.statSync(fullPath).size / 1024 / 1024).toFixed(2)} MB`);

  // Save compact version (without search terms, for lookup only)
  const compactDatabase = {
    version: database.version,
    generatedDate: database.generatedDate,
    totalCodes: database.totalCodes,
    codeIndex: database.codeIndex
  };

  const compactPath = path.join(__dirname, '..', 'data', 'opcs410-lookup.json');
  console.log('\n💾 Saving compact lookup database...');
  fs.writeFileSync(compactPath, JSON.stringify(compactDatabase, null, 2));
  console.log(`✅ Saved to: ${compactPath}`);
  console.log(`   Size: ${(fs.statSync(compactPath).size / 1024 / 1024).toFixed(2)} MB`);

  // Print summary statistics
  console.log('\n' + '='.repeat(80));
  console.log('OPCS-4.10 DATABASE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Codes: ${database.totalCodes}`);

  const mainCodes = database.codes.filter(c => c.isMainCode).length;
  const subCodes = database.totalCodes - mainCodes;
  console.log(`Main Categories: ${mainCodes}`);
  console.log(`Subcategories: ${subCodes}`);

  const chapters = new Set(database.codes.map(c => c.chapter));
  console.log(`Chapters: ${chapters.size} (${Array.from(chapters).sort().join(', ')})`);
  console.log('='.repeat(80));

  console.log('\n✅ OPCS-4.10 database created successfully!\n');
}

main();
