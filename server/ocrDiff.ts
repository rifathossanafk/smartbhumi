/**
 * Scan-tolerant document verification and OCR diff engine.
 *
 * WHY canonical field hashing over byte hashing:
 * Raw file byte hashes (SHA-256 of PDF/JPEG bytes) break instantly upon:
 * - Rescanning at different DPI or scanner exposure
 * - PDF re-compression, rotation, or metadata modification
 * - Smartphone camera angle and lighting variations
 *
 * Instead, SmartBhumi extracts the canonical land claims from the document
 * and hashes the structured NFC-normalized fields.
 *
 * Includes:
 * 1. Deterministic fixture extractor over 3 synthetic deed fixtures:
 *    - 'genuine' (LP-2026-001 clean match)
 *    - 'area_tampered' (LP-2026-001 with altered 25.00 shotok)
 *    - 'khas' (LP-2026-003 claiming protected khas land)
 * 2. Optional real OCR hook behind ENABLE_REAL_OCR flag (default false)
 * 3. Per-field match/mismatch checking
 * 4. Token-level diff that pinpoints the altered Bangla field.
 */

import fs from 'node:fs';
import path from 'node:path';
import { getDb } from './db.js';
import { canonicalize } from '../src/shared/canonicalize.js';
import { hashString } from './crypto.js';
import { toMicroShotok, fromMicroShotok } from '../src/shared/units.js';

export const ENABLE_REAL_OCR = process.env.ENABLE_REAL_OCR === 'true'; // default false

const FIXTURES_FILE = path.join(process.cwd(), 'fixtures', 'synthetic_deeds.json');

export interface FieldDiff {
  field: string;
  fieldBn: string;
  officialValue: string;
  scannedValue: string;
  match: boolean;
  notes?: string;
}

export interface TokenDiff {
  tokenIndex: number;
  officialToken: string;
  scannedToken: string;
  match: boolean;
}

export interface OCRDiffResult {
  fixtureId?: string;
  deedNumber: string;
  overallMatch: boolean;
  officialRecordFound: boolean;
  fieldDiffs: FieldDiff[];
  tokenLevelDiff: {
    targetField: string;
    targetFieldBn: string;
    tokens: TokenDiff[];
    summary: string;
    summaryBn: string;
  } | null;
  canonicalHashOfficial?: string;
  canonicalHashScanned: string;
  verdictBn: string;
  verdictEn: string;
}

/**
 * Load synthetic deed fixtures.
 */
function loadFixtures(): Record<string, any> {
  if (fs.existsSync(FIXTURES_FILE)) {
    return JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8'));
  }
  return {};
}

/**
 * Perform token-level comparison between two Bangla or English strings.
 */
export function computeTokenLevelDiff(officialText: string, scannedText: string): TokenDiff[] {
  const officialTokens = officialText.trim().split(/\s+/);
  const scannedTokens = scannedText.trim().split(/\s+/);
  const maxLen = Math.max(officialTokens.length, scannedTokens.length);

  const diffs: TokenDiff[] = [];
  for (let i = 0; i < maxLen; i++) {
    const off = officialTokens[i] || '';
    const scn = scannedTokens[i] || '';
    diffs.push({
      tokenIndex: i,
      officialToken: off,
      scannedToken: scn,
      match: off.normalize('NFC') === scn.normalize('NFC'),
    });
  }
  return diffs;
}

/**
 * Extract deed claims from either a known synthetic fixture or submitted text.
 */
export function extractClaimsFromInput(input: {
  fixture?: 'genuine' | 'area_tampered' | 'khas';
  rawText?: string;
  deedNumber?: string;
}): any {
  const fixtures = loadFixtures();

  if (input.fixture && fixtures[input.fixture]) {
    return fixtures[input.fixture];
  }

  // If real OCR is requested behind flag
  if (ENABLE_REAL_OCR && input.rawText) {
    // Real OCR parsing fallback
    const raw = input.rawText;
    const deedMatch = raw.match(/LP-2026-\d{3,4}/);
    const khatianMatch = raw.match(/KH-2026-\d{4}/);
    const dagMatch = raw.match(/DAG-2026-\d{3,4}/);
    const areaMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:শতক|shotok|decimal)/i);

    return {
      deedNumber: deedMatch ? deedMatch[0] : input.deedNumber || 'UNKNOWN',
      khatianNumber: khatianMatch ? khatianMatch[0] : 'UNKNOWN',
      dagNumber: dagMatch ? dagMatch[0] : 'UNKNOWN',
      areaShotokEn: areaMatch ? areaMatch[1] : '0',
      sampleTextBn: raw,
    };
  }

  // Default to genuine fixture if none matched
  return fixtures['genuine'] || {};
}

/**
 * Execute scan-tolerant OCR difference check.
 */
export function verifyOCRDiff(input: {
  fixture?: 'genuine' | 'area_tampered' | 'khas';
  rawText?: string;
  deedNumber?: string;
}): OCRDiffResult {
  const extracted = extractClaimsFromInput(input);
  const db = getDb();

  const deedNumber = extracted.deedNumber || input.deedNumber || 'LP-2026-001';

  // Look up official record in database
  const deed = db.prepare('SELECT * FROM deeds WHERE deed_number = ?').get(deedNumber) as any;
  const khatian = deed ? db.prepare('SELECT * FROM khatians WHERE khatian_number = ?').get(deed.khatian_number) as any : null;

  if (!deed) {
    // Check if it's in seed database under recs
    return {
      deedNumber,
      overallMatch: false,
      officialRecordFound: false,
      fieldDiffs: [],
      tokenLevelDiff: null,
      canonicalHashScanned: hashString(canonicalize(extracted)),
      verdictBn: `দলিল নম্বর ${deedNumber} এর কোনো সরকারি রেকর্ড সিস্টেমে পাওয়া যায়নি।`,
      verdictEn: `No registered record found for deed number ${deedNumber}.`,
    };
  }

  const officialAreaShotok = fromMicroShotok(deed.transfer_area, 'shotok').toFixed(2);
  const scannedAreaShotok = extracted.areaShotokEn ? parseFloat(extracted.areaShotokEn).toFixed(2) : '0.00';

  const fieldDiffs: FieldDiff[] = [
    {
      field: 'deedNumber',
      fieldBn: 'দলিল নম্বর',
      officialValue: deed.deed_number,
      scannedValue: extracted.deedNumber || '',
      match: deed.deed_number === extracted.deedNumber,
    },
    {
      field: 'khatianNumber',
      fieldBn: 'খতিয়ান নম্বর',
      officialValue: deed.khatian_number,
      scannedValue: extracted.khatianNumber || '',
      match: deed.khatian_number === extracted.khatianNumber,
    },
    {
      field: 'dagNumber',
      fieldBn: 'দাগ নম্বর',
      officialValue: deed.dag_number,
      scannedValue: extracted.dagNumber || '',
      match: deed.dag_number === extracted.dagNumber,
    },
    {
      field: 'transferArea',
      fieldBn: 'জমির পরিমাণ',
      officialValue: `${officialAreaShotok} শতক`,
      scannedValue: `${scannedAreaShotok} শতক`,
      match: officialAreaShotok === scannedAreaShotok,
      notes: officialAreaShotok !== scannedAreaShotok
        ? `এলাকার অসঙ্গতি: সরকারি রেকর্ডে ${officialAreaShotok} শতক, কিন্তু স্ক্যানকৃত দলিলে ${scannedAreaShotok} শতক!`
        : undefined,
    },
  ];

  if (extracted.sellerNameBn && deed.seller_name_bn) {
    fieldDiffs.push({
      field: 'sellerName',
      fieldBn: 'বিক্রেতার নাম',
      officialValue: deed.seller_name_bn,
      scannedValue: extracted.sellerNameBn,
      match: deed.seller_name_bn.normalize('NFC') === extracted.sellerNameBn.normalize('NFC'),
    });
  }

  // Token-level diff specifically on the area description
  let tokenLevelDiff = null;
  const areaMismatch = officialAreaShotok !== scannedAreaShotok;
  if (areaMismatch) {
    const offText = `${officialAreaShotok} শতক`;
    const scnText = `${scannedAreaShotok} শতক`;
    const tokens = computeTokenLevelDiff(offText, scnText);

    tokenLevelDiff = {
      targetField: 'transferArea',
      targetFieldBn: 'জমির পরিমাণ',
      tokens,
      summary: `Altered Bangla area field: official record is '${offText}' while scanned document claims '${scnText}'.`,
      summaryBn: `জমির পরিমাণে অসঙ্গতি চিহ্নিত: সরকারি রেকর্ডে '${offText}' কিন্তু স্ক্যানকৃত দলিলে '${scnText}'।`,
    };
  }

  const overallMatch = fieldDiffs.every(f => f.match);

  // Canonical field hash (NOT raw image bytes)
  const officialCanonical = canonicalize({
    deedNumber: deed.deed_number,
    dagNumber: deed.dag_number,
    khatianNumber: deed.khatian_number,
    transferArea: deed.transfer_area,
  });
  const scannedCanonical = canonicalize({
    deedNumber: extracted.deedNumber,
    dagNumber: extracted.dagNumber,
    khatianNumber: extracted.khatianNumber,
    transferArea: toMicroShotok(parseFloat(scannedAreaShotok), 'shotok'),
  });

  return {
    fixtureId: input.fixture,
    deedNumber: deed.deed_number,
    overallMatch,
    officialRecordFound: true,
    fieldDiffs,
    tokenLevelDiff,
    canonicalHashOfficial: hashString(officialCanonical),
    canonicalHashScanned: hashString(scannedCanonical),
    verdictBn: overallMatch
      ? 'স্ক্যানকৃত দলিলের মূল তথ্যসমূহ সরকারি ডিজিটাল রেকর্ডের সাথে অক্ষত অবস্থায় মিলেছে।'
      : 'সতর্কতা: স্ক্যানকৃত দলিলের তথ্য ও সরকারি রেকর্ডের মাঝে অমিল পাওয়া গেছে!',
    verdictEn: overallMatch
      ? 'Canonical document claims match official registry records perfectly.'
      : 'DISCREPANCY DETECTED: Scanned document fields differ from official registered records.',
  };
}

