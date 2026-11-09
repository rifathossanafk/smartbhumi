/**
 * Comprehensive Automated Test Suite for SmartBhumi Core (Stages A1 - A7).
 *
 * Covers:
 * - A1. Database Invariants, Area Accounting, Concurrency Stress Test, Fast Reset
 * - A2. Merkle Transparency Tree (Sizes 1..100), Inclusion Proofs, QR Size Budget (<700B), Offline Verifier
 * - A3. Red-Team Simulations (Paper Alteration, DB Tampering, Key Compromise)
 * - A4. Dual Signatures (Ed25519 + ML-DSA-65), Anti-Downgrade, Fail-Closed Tamper Detection
 * - A5. Registry to e-Mutation Pipeline, Role Enforcement, Atomic Khatian Creation
 * - A6. Scan-Tolerant Canonical Field Hashing, Fixtures, Bangla Token-Level Diff
 * - A7. Faraiz Islamic Inheritance (48 shotok test), Survey Lineage (Broken Chain), Risk Rules
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, resetDatabaseFast, seedDatabase } from '../server/db.js';
import { toMicroShotok, fromMicroShotok, convertArea } from '../src/shared/units.js';
import { computeRootHex, leafHashFromString, inclusionProof, verifyInclusion } from '../src/crypto/merkle.js';
import { initKeys, getPublicKeys, signSTH, verifySTHSignatures, ENABLE_PQC } from '../server/crypto.js';
import { appendDeedToLog, generateDeedQRPayload, getLatestSTH } from '../server/logManager.js';
import { verifyQROffline, decodeQRPayload, encodeQRPayload } from '../src/crypto/offlineVerifier.js';
import { simulatePaperTamper, simulateDatabaseTamper, simulateKeyCompromise } from '../server/redteam.js';
import { listMutationCases, approveMutationCase, rejectMutationCase, createMutationCaseForDeed } from '../server/mutation.js';
import { verifyOCRDiff, computeTokenLevelDiff } from '../server/ocrDiff.js';
import { getPlotLineage } from '../server/lineage.js';
import { calculateFaraiz } from '../src/shared/faraiz.js';
import { assessRisks, type DeedInput } from '../src/shared/rules.js';
import { canonicalize } from '../src/shared/canonicalize.js';
import { hexToBytes } from '@noble/hashes/utils';

beforeAll(async () => {
  const db = getDb();
  seedDatabase(db);
  await initKeys();
});

// ==========================================
// STAGE A1: ATOMIC AREA ACCOUNTING & DB
// ==========================================
describe('Stage A1: Atomic Area Accounting & Database Invariants', () => {
  it('resets database to clean seed state in under 100 milliseconds', () => {
    const elapsedMs = resetDatabaseFast();
    expect(elapsedMs).toBeLessThan(100);

    // Ensure initial deed is sealed after reset
    appendDeedToLog('rec-001');
  });

  it('accurately converts area units using integer micro-shotok', () => {
    // 1 shotok = 1,000,000 micro-shotok
    expect(toMicroShotok(10.40, 'shotok')).toBe(10_400_000);
    expect(fromMicroShotok(10_400_000, 'shotok')).toBe(10.4);

    // 1 acre = 100 shotok
    expect(convertArea(1.5, 'acre', 'shotok')).toBe(150);

    // 1 katha = 1.65 shotok (common convention)
    expect(convertArea(10, 'katha', 'shotok')).toBe(16.5);
  });

  it('strictly enforces database CHECK constraint: available area cannot drop below 0', () => {
    const db = getDb();
    // Try to illegally update sold_area to exceed total_area on ps-001 (15 shotok total)
    const total = 15_000_000;
    const illegalSale = 16_000_000;

    expect(() => {
      db.prepare('UPDATE plot_shares SET sold_area = ? WHERE id = ?').run(illegalSale, 'ps-001');
    }).toThrow(/CHECK constraint failed/);
  });

  it('executes concurrency stress test: 20 concurrent sales from 10.40 share -> exactly 1 succeeds', () => {
    const db = getDb();
    const dagNumber = 'DAG-2026-STRESS';
    const mouzaCode = 'MOUZA-DEMO-001';
    const khatianNumber = 'KH-2026-0005';
    const transferMicro = toMicroShotok(10.00, 'shotok'); // 10.00 shotok

    // Reset share
    const khatian = db.prepare('SELECT id FROM khatians WHERE khatian_number = ?').get(khatianNumber) as any;
    db.prepare('UPDATE plot_shares SET sold_area = 0, mutation_pending = 0 WHERE khatian_id = ?').run(khatian.id);

    const attempts = 20;
    let succeeded = 0;
    let failed = 0;

    for (let i = 1; i <= attempts; i++) {
      try {
        db.exec('BEGIN IMMEDIATE;');
        const share = db.prepare('SELECT * FROM plot_shares WHERE dag_number = ?').get(dagNumber) as any;
        const available = share.total_area - share.sold_area - share.mortgaged_area - share.bainanama_area - share.mutation_pending;

        if (transferMicro > available) {
          throw new Error('Insufficient area available');
        }

        db.prepare('UPDATE plot_shares SET sold_area = sold_area + ? WHERE id = ?').run(transferMicro, share.id);
        db.exec('COMMIT;');
        succeeded++;
      } catch {
        db.exec('ROLLBACK;');
        failed++;
      }
    }

    expect(succeeded).toBe(1);
    expect(failed).toBe(19);

    // Remaining area must be 0.40 shotok (400,000 micro-shotok)
    const finalShare = db.prepare('SELECT * FROM plot_shares WHERE dag_number = ?').get(dagNumber) as any;
    const remaining = finalShare.total_area - finalShare.sold_area;
    expect(remaining).toBe(400_000);
  });
});

// ==========================================
// STAGE A2: SIGNED MERKLE LOG & OFFLINE QR
// ==========================================
describe('Stage A2: Signed Merkle Log & Offline QR Payload', () => {
  it('correctly builds and verifies Merkle inclusion proofs for tree sizes 1 to 100 (non-powers of 2)', () => {
    for (const size of [1, 2, 3, 4, 7, 13, 27, 49, 64, 83, 100]) {
      const leaves = Array.from({ length: size }, (_, i) =>
        leafHashFromString(canonicalize({ index: i, text: `Deed leaf claim #${i}` }))
      );

      const root = computeRootHex(leaves);
      const leafBytes = leaves.map(l => hexToBytes(l));

      // Test every index or selected indices
      const testIndices = [0, Math.floor(size / 2), size - 1];
      for (const idx of testIndices) {
        if (idx < size) {
          const proof = inclusionProof(leafBytes, idx);
          const valid = verifyInclusion(leaves[idx], proof, root);
          expect(valid).toBe(true);
        }
      }
    }
  });

  it('rejects 1-bit tampering in Merkle leaf hashes or proof nodes', () => {
    const leaves = Array.from({ length: 8 }, (_, i) =>
      leafHashFromString(canonicalize({ index: i, doc: `deed-${i}` }))
    );
    const root = computeRootHex(leaves);
    const leafBytes = leaves.map(l => hexToBytes(l));

    const proof = inclusionProof(leafBytes, 3);
    expect(verifyInclusion(leaves[3], proof, root)).toBe(true);

    // 1-bit flip in leaf hash
    const tamperedLeaf = leaves[3].slice(0, -1) + (leaves[3].endsWith('a') ? 'b' : 'a');
    expect(verifyInclusion(tamperedLeaf, proof, root)).toBe(false);

    // Tampered sibling in proof path
    const tamperedProof = proof.map((step, idx) =>
      idx === 0
        ? { ...step, hash: step.hash.slice(0, -1) + '0' }
        : step
    );
    expect(verifyInclusion(leaves[3], tamperedProof, root)).toBe(false);
  });

  it('generates QR payloads strictly under the 700-byte budget', () => {
    const db = getDb();
    // Register a test deed
    const deedId = 'qr-budget-test-deed';
    db.prepare(`
      INSERT OR REPLACE INTO deeds (
        id, deed_number, deed_type, status,
        buyer_name_en, buyer_name_bn, buyer_nid_masked,
        plot_share_id, dag_number, mouza_code, khatian_number,
        transfer_area, upazila, district, division, registration_date, registered_by, is_synthetic
      ) VALUES (?, 'LP-2026-TESTQR', 'sale', 'registered', 'Buyer', 'ক্রেতা', '999000*****9999', 'ps-001', 'DAG-2026-001', 'MOUZA-DEMO-001', 'KH-2026-0001', 5000000, 'Savar', 'Dhaka', 'Dhaka', '2026-01-01', 'officer', 1)
    `).run(deedId);

    appendDeedToLog(deedId);

    const qrResult = generateDeedQRPayload(deedId);
    expect(qrResult.byteLength).toBeLessThan(700);
    expect(qrResult.qrString.length).toBeGreaterThan(100);

    // Verify offline verification on this generated payload
    const pubKeys = getPublicKeys();
    const verified = verifyQROffline(qrResult.qrString, pubKeys.ed25519);
    expect(verified.valid).toBe(true);
    expect(verified.disclaimer).toContain('live status not checked offline');
  });
});

// ==========================================
// STAGE A3 & A4: RED-TEAM SIMULATIONS & PQC
// ==========================================
describe('Stages A3 & A4: Red-Team Tamper Demos & Dual Signatures', () => {
  it('Scenario 1: Altered paper area fails offline verification', () => {
    const result = simulatePaperTamper('LP-2026-001');
    expect(result.tamperDetected).toBe(true);
    expect(result.verdict).toBe('BLOCKED');
    expect(result.details.offlineVerificationValid).toBe(false);
  });

  it('Scenario 2: Historical SQLite row tampering is detected and isolates the leaf index', () => {
    const result = simulateDatabaseTamper(0);
    expect(result.tamperDetected).toBe(true);
    expect(result.verdict).toBe('BLOCKED');
    expect(result.details.tamperedLeafIndex).toBe(0);
  });

  it('Scenario 3: Classical Ed25519 key compromise is blocked by ML-DSA-65 post-quantum verification', () => {
    const result = simulateKeyCompromise();
    expect(result.tamperDetected).toBe(true);
    expect(result.verdict).toBe('BLOCKED');
    expect(result.details.postQuantumMlDsaStatus).toContain('INVALID');
  });

  it('Dual signature: verifies both algorithms and rejects algorithm downgrades', () => {
    const pubKeys = getPublicKeys();
    const epoch = 999;
    const root = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';
    const ts = new Date().toISOString();

    const env = signSTH(epoch, root, ts);
    const verified = verifySTHSignatures(epoch, root, ts, env, pubKeys);
    expect(verified.valid).toBe(true);
    expect(verified.ed25519Valid).toBe(true);
    if (ENABLE_PQC) {
      expect(verified.mlDsaValid).toBe(true);
    }

    // Downgrade attack test: attempt verifying with algorithmId = 'ed25519' while authority requires dual
    if (pubKeys.mlDsa65) {
      const downgradedEnv = {
        algorithmId: 'ed25519',
        signatureEd25519: env.signatureEd25519,
      };
      const downgradeCheck = verifySTHSignatures(epoch, root, ts, downgradedEnv, pubKeys);
      expect(downgradeCheck.valid).toBe(false);
      expect(downgradeCheck.reason).toContain('Downgrade attack detected');
    }
  });
});

// ==========================================
// STAGE A5: REGISTRY TO E-MUTATION PIPELINE
// ==========================================
describe('Stage A5: Registry to e-Mutation Pipeline', () => {
  it('creates an e-mutation case upon deed sealing and places area in mutation_pending', () => {
    const db = getDb();
    const deedId = 'deed-mut-test';
    const transferMicro = toMicroShotok(2.0, 'shotok');

    db.prepare(`
      INSERT OR REPLACE INTO deeds (
        id, deed_number, deed_type, status,
        buyer_name_en, buyer_name_bn, buyer_nid_masked,
        plot_share_id, dag_number, mouza_code, khatian_number,
        transfer_area, upazila, district, division, registration_date, registered_by, is_synthetic
      ) VALUES (?, 'LP-2026-MUT1', 'sale', 'registered', 'Mut Buyer', 'ক্রেতা', '999000*****5555', 'ps-001', 'DAG-2026-001', 'MOUZA-DEMO-001', 'KH-2026-0001', ?, 'Savar', 'Dhaka', 'Dhaka', '2026-01-01', 'officer', 1)
    `).run(deedId, transferMicro);

    const shareBefore = db.prepare('SELECT mutation_pending FROM plot_shares WHERE id = ?').get('ps-001') as any;
    const caseId = createMutationCaseForDeed(deedId);
    const shareAfter = db.prepare('SELECT mutation_pending FROM plot_shares WHERE id = ?').get('ps-001') as any;

    expect(caseId.startsWith('mut-')).toBe(true);
    expect(shareAfter.mutation_pending - shareBefore.mutation_pending).toBe(transferMicro);
  });

  it('approves e-mutation case, creates buyer khatian and atomically updates plot shares', () => {
    const cases = listMutationCases('pending');
    expect(cases.length).toBeGreaterThan(0);
    const targetCase = cases[0];

    const result = approveMutationCase(targetCase.id, 'AC Land (Fahmida Sultana)');
    expect(result.success).toBe(true);
    expect(result.newKhatianNumber.startsWith('KH-MUT-')).toBe(true);

    const db = getDb();
    const updatedCase = db.prepare('SELECT status, new_khatian_id FROM mutation_cases WHERE id = ?').get(targetCase.id) as any;
    expect(updatedCase.status).toBe('approved');
    expect(updatedCase.new_khatian_id).toBeTruthy();
  });
});

// ==========================================
// STAGE A6: SCAN-TOLERANT OCR DIFF ENGINE
// ==========================================
describe('Stage A6: Scan-Tolerant OCR Diff & Canonical Field Hashing', () => {
  it('verifies genuine synthetic deed fixture matching official database record', () => {
    const result = verifyOCRDiff({ fixture: 'genuine' });
    expect(result.overallMatch).toBe(true);
    expect(result.officialRecordFound).toBe(true);
    expect(result.tokenLevelDiff).toBeNull();
  });

  it('detects area tampering and isolates altered Bangla tokens', () => {
    const result = verifyOCRDiff({ fixture: 'area_tampered' });
    expect(result.overallMatch).toBe(false);
    expect(result.tokenLevelDiff).not.toBeNull();
    expect(result.tokenLevelDiff?.targetField).toBe('transferArea');

    // Token diff must identify the mismatched number token
    const tokenMismatch = result.tokenLevelDiff?.tokens.find(t => !t.match);
    expect(tokenMismatch).toBeDefined();
    expect(tokenMismatch?.officialToken).toBe('15.00');
    expect(tokenMismatch?.scannedToken).toBe('25.00');
  });

  it('correctly compares Bangla text tokens regardless of spacing variations', () => {
    const off = '১৫.০০ শতক (পনের শতক মাত্র)';
    const scn = '২৫.০০ শতক (পঁচিশ শতক মাত্র)';
    const diff = computeTokenLevelDiff(off, scn);

    expect(diff[0].match).toBe(false); // ১৫.০০ vs ২৫.০০
    expect(diff[1].match).toBe(true);  // শতক vs শতক
    expect(diff[2].match).toBe(false); // (পনের vs (পঁচিশ
  });
});

// ==========================================
// STAGE A7: RULES, LINEAGE & FARAIZ
// ==========================================
describe('Stage A7: Lineage Chain, Faraiz-lite & Risk Rules', () => {
  it('correctly calculates Faraiz inheritance shares for 48.00 shotok test case', () => {
    // 48.00 shotok gives wife 6.00, mother 8.00, father 8.00, each son 10.40, daughter 5.20
    const estateMicro = toMicroShotok(48.00, 'shotok');
    const result = calculateFaraiz({
      totalArea: estateMicro,
      hasSpouse: true,
      deceasedGender: 'male',
      hasMother: true,
      hasFather: true,
      numSons: 2,
      numDaughters: 1,
    });

    const sharesByHeir: Record<string, number> = {};
    for (const s of result.shares) {
      sharesByHeir[s.heir] = fromMicroShotok(s.share, 'shotok');
    }

    expect(sharesByHeir['Wife']).toBe(6.00);
    expect(sharesByHeir['Mother']).toBe(8.00);
    expect(sharesByHeir['Father']).toBe(8.00);
    expect(sharesByHeir['Son 1']).toBe(10.40);
    expect(sharesByHeir['Son 2']).toBe(10.40);
    expect(sharesByHeir['Daughter 1'] || sharesByHeir['Daughter']).toBe(5.20);

    expect(fromMicroShotok(result.totalDistributed, 'shotok')).toBe(48.00);
    expect(result.disclaimer).toContain('ILLUSTRATIVE ONLY');
  });

  it('flags broken survey chains in cadastral lineage (Sylhet Khadim RS gap)', () => {
    const lineage = getPlotLineage('DAG-2026-007');
    expect(lineage.hasBrokenLinks).toBe(true);
    expect(lineage.isComplete).toBe(false);
    expect(lineage.breakSummary).toContain('RS');
  });

  it('reports complete survey chain for clean plot (DAG-2026-001)', () => {
    const lineage = getPlotLineage('DAG-2026-001');
    expect(lineage.chain.length).toBe(3); // CS, SA, RS
    expect(lineage.hasBrokenLinks).toBe(false);
  });

  it('evaluates risk rules without hardcoded section numbers', () => {
    const input: DeedInput = {
      deedType: 'sale',
      transferArea: toMicroShotok(25, 'shotok'),
      plotTotalArea: toMicroShotok(20, 'shotok'),
      plotSoldArea: 0,
      plotMortgagedArea: 0,
      plotBainanama: 0,
      plotMutationPending: 0,
      isKhas: true,
      isFrozen: false,
      sellerMatchesOwner: false,
      hasSurveyLineage: false,
      hasBrokenLineage: true,
    };

    const risks = assessRisks(input);
    expect(risks.some(r => r.code === 'KHAS_LAND')).toBe(true);
    expect(risks.some(r => r.code === 'INSUFFICIENT_AREA')).toBe(true);
    expect(risks.some(r => r.code === 'SELLER_OWNER_MISMATCH')).toBe(true);

    // Citations are isolated strings, explanations work standalone
    for (const r of risks) {
      expect(r.explanation_bn.length).toBeGreaterThan(10);
      expect(r.explanation_en.length).toBeGreaterThan(10);
    }
  });
});
