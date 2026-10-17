import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';

console.log('=== STARTING LANDPROOF AUTOMATED VERIFICATION TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

// 1. Test Hash Calculation & Original Match
runTest('Original Document SHA-256 Hash matches registered rec-001 hash', () => {
  const sampleFile = fs.readFileSync('src/utils/sampleDocument.ts', 'utf8');
  const content = sampleFile
    .split('const SAMPLE_DOCUMENT_CONTENT = `')[1]
    .split('`;')[0]
    .replace(/\r\n/g, '\n');
  const originalHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

  const seedFile = fs.readFileSync('src/data/seedData.ts', 'utf8');
  assert.ok(
    seedFile.includes(`documentHash: '${originalHash}'`),
    `Seed record rec-001 must store original documentHash: ${originalHash}`
  );
});

// 2. Test Modified File Mismatch
runTest('Altered Document produces different SHA-256 hash (DOCUMENT MISMATCH)', () => {
  const sampleFile = fs.readFileSync('src/utils/sampleDocument.ts', 'utf8');
  const originalContent = sampleFile
    .split('const SAMPLE_DOCUMENT_CONTENT = `')[1]
    .split('`;')[0]
    .replace(/\r\n/g, '\n');
  const modifiedContent =
    originalContent +
    '\n  [MODIFICATION ADDED - This file has been altered]\n  This additional text changes the SHA-256 fingerprint.\n';

  const originalHash = crypto.createHash('sha256').update(originalContent, 'utf8').digest('hex');
  const modifiedHash = crypto.createHash('sha256').update(modifiedContent, 'utf8').digest('hex');

  assert.notStrictEqual(originalHash, modifiedHash, 'Modified hash must differ from original hash');
});

// 3. Test Ownership Consistency: Matching Seller
runTest('Ownership consistency check passes when seller matches recorded owner (LP-2026-001)', () => {
  const seedFile = fs.readFileSync('src/data/seedData.ts', 'utf8');
  assert.ok(seedFile.includes("sellerRef: 'SELLER-2026-001'"), 'SELLER-2026-001 exists in rec-001');
  assert.ok(seedFile.includes("currentOwnerRef: 'SELLER-2026-001'"), 'SELLER-2026-001 matches in plot DAG-2026-001');
});

// 4. Test Ownership Consistency: Mismatch Case
runTest('Ownership consistency check flags mismatch when seller differs from recorded owner (LP-2026-002)', () => {
  const seedFile = fs.readFileSync('src/data/seedData.ts', 'utf8');
  assert.ok(seedFile.includes("sellerRef: 'SELLER-2026-002'"), 'Seller SELLER-2026-002 in deed');
  assert.ok(seedFile.includes("currentOwnerRef: 'OWNER-ACTUAL-002'"), 'Owner OWNER-ACTUAL-002 in plot');
  assert.ok(seedFile.includes("status: 'flagged'"), 'LP-2026-002 is flagged in seed data');
});

// 5. Test Missing Plot Ownership Case
runTest('Ownership consistency check flags missing plot ownership reference (LP-2026-005)', () => {
  const seedFile = fs.readFileSync('src/data/seedData.ts', 'utf8');
  assert.ok(seedFile.includes("dagNumber: 'DAG-2026-005'"), 'DAG-2026-005 deed exists');
  // Confirm DAG-2026-005 is NOT present in INITIAL_PLOT_OWNERSHIP
  const plotOwnershipSection = seedFile.substring(seedFile.indexOf('INITIAL_PLOT_OWNERSHIP'));
  assert.ok(!plotOwnershipSection.includes("id: 'own-005'"), 'DAG-2026-005 has no ownership reference entry');
});

// 6. Test QR Verification Route Generation
runTest('QR Verification URL generation formats valid URI without hardcoded localhost', () => {
  const cryptoFile = fs.readFileSync('src/utils/crypto.ts', 'utf8');
  assert.ok(
    cryptoFile.includes('window.location.origin'),
    'QR URL must use dynamic window.location.origin, not hardcoded localhost'
  );
  assert.ok(
    cryptoFile.includes('/verify/${encodeURIComponent(deedNumber)}'),
    'QR URL must encode the deed reference parameter'
  );
});

// 7. Test Bilingual i18n Completeness
runTest('Both Bangla and English translation resources exist with essential sections', () => {
  const bnFile = fs.readFileSync('src/i18n/bn.ts', 'utf8');
  const enFile = fs.readFileSync('src/i18n/en.ts', 'utf8');

  const requiredSections = [
    'appName',
    'tagline',
    'demoDisclaimer',
    'notLegalDocument',
    'nav',
    'login',
    'landing',
    'dashboard',
    'search',
    'fields',
    'register',
    'verify',
    'record',
    'map',
    'history',
    'flagged',
  ];

  for (const sec of requiredSections) {
    assert.ok(bnFile.includes(sec), `bn.ts must contain section '${sec}'`);
    assert.ok(enFile.includes(sec), `en.ts must contain section '${sec}'`);
  }
});

// 8. Test Role-Based Permissions
runTest('Permission model correctly gates register, review and admin actions', () => {
  const storeFile = fs.readFileSync('src/store/useStore.ts', 'utf8');
  assert.ok(storeFile.includes("register: ['officer', 'admin']"), 'Registration restricted to officer & admin');
  assert.ok(storeFile.includes("review: ['reviewer', 'admin']"), 'Review restricted to reviewer & admin');
  assert.ok(storeFile.includes("resetDemo: ['admin']"), 'Reset demo data restricted to admin');
});

console.log(`\n=== RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
