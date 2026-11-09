# Updates and Changes

## 1. Status at a Glance

| Stage | Track | Description | Status |
| :--- | :--- | :--- | :--- |
| **A1** | Track A (Backend) | SQLite Schema, Integer Micro-Shotok Area Accounting, Invariants, Stress-test | **Done** |
| **A2** | Track A (Backend) | RFC 9162 Merkle Transparency Log, Signed Tree Head (STH), Offline QR (<700B) | **Done** |
| **A3** | Track A (Backend) | Red-Team Simulations (Paper Alteration, DB Tampering, Key Compromise) | **Done** |
| **A4** | Track A (Backend) | Dual Signatures (Ed25519 + ML-DSA-65 Post-Quantum), PQC Benchmark | **Done** |
| **A5** | Track A (Backend) | Registry to e-Mutation Pipeline (AC Land Role Approval, Atomic Khatian Creation) | **Done** |
| **A6** | Track A (Backend) | Scan-Tolerant Canonical Field Hashing, 3 Synthetic Fixtures, Bangla Token Diff | **Done** |
| **A7** | Track A (Backend) | Explainable Risk Rules, Cadastral Survey Lineage (CS->BS), Faraiz-lite | **Done** |
| **B1** | Track B (Frontend) | Live State Integration & Dashboard Area Breakdown | *Not started* (Track B scope) |
| **B2** | Track B (Frontend) | Offline QR Verification Scanner Component | *Not started* (Track B scope) |
| **B3** | Track B (Frontend) | Red-Team Security Demo Interactive Console | *Not started* (Track B scope) |
| **B4** | Track B (Frontend) | Post-Quantum Signature Badges & Dual Status Toggle | *Not started* (Track B scope) |
| **B5** | Track B (Frontend) | AC Land e-Mutation Workflow & Hearing Queue Screen | *Not started* (Track B scope) |
| **B6** | Track B (Frontend) | Side-by-side OCR Token Diff Visualizer Component | *Not started* (Track B scope) |
| **B7** | Track B (Frontend) | Cadastral Lineage Visualizer & Faraiz Calculator UI | *Not started* (Track B scope) |

---

## 2. Changes, Newest First

### Stage A7: Rules + Lineage Data + Faraiz
- **What changed:** Implemented explainable risk assessment rules as pure functions returning bilingual Bangla and English explanations without hardcoded section numbers. Created the multi-generational survey lineage tracker (CS -> SA -> RS -> BS) with automatic detection of broken records and gaps. Built a simplified Faraiz Islamic inheritance share calculator covering spouse, parents, sons, and daughters with strict legal disclaimers.
- **Files added or changed:** `src/shared/rules.ts`, `src/shared/faraiz.ts`, `src/shared/citations.ts`, `server/lineage.ts`, `tests/smartbhumi.test.ts`.
- **How to check:** Run `npm test` to verify the 48.00 shotok Faraiz distribution (wife 6.00, mother 8.00, father 8.00, each son 10.40, daughter 5.20) and broken lineage detection for Sylhet plot DAG-2026-007. Query `GET /api/plots/DAG-2026-007/lineage`.
- **Anything not working:** None.

### Stage A6: Scan-Tolerant Check & Token-Level OCR Diff
- **What changed:** Replaced fragile file byte hashing with canonical field hashing, ensuring rescanning, lighting variations, or PDF recompressions do not invalidate legitimate deeds. Created 3 synthetic deed fixtures and SVG documents (`genuine`, `area_tampered`, `khas`) under `fixtures/`. Built a token-level difference engine that pinpoints exactly which Bangla numeric or textual token was altered on forged documents.
- **Files added or changed:** `fixtures/synthetic_deeds.json`, `fixtures/genuine.svg`, `fixtures/area_tampered.svg`, `fixtures/khas.svg`, `server/ocrDiff.ts`, `tests/smartbhumi.test.ts`.
- **How to check:** Call `POST /api/verify/ocr-diff` with `{"fixture": "area_tampered"}` to see the token-level diff identifying the 15.00 vs 25.00 shotok discrepancy.
- **Anything not working:** Real OCR engine (Tesseract) is disabled by default behind `ENABLE_REAL_OCR=false` to ensure fast offline evaluation without external binary requirements.

### Stage A5: Registry to e-Mutation Pipeline
- **What changed:** Built the automated e-Mutation bridge where sealing a deed locks the transferred area under `mutation_pending` and creates a pending administrative case. Created server-gated endpoints where only AC Land (`X-Demo-Role: reviewer`) or admin can approve cases. Approval atomically moves the area to `sold_area`, generates a new Khatian number for the buyer, and creates a corresponding plot share.
- **Files added or changed:** `server/mutation.ts`, `server/index.ts`, `tests/smartbhumi.test.ts`.
- **How to check:** Call `GET /api/mutation/cases?status=pending` to view queue, and `POST /api/mutation/cases/:id/approve` with header `X-Demo-Role: reviewer` to approve.
- **Anything not working:** None.

### Stage A4: Dual Signature (Ed25519 + ML-DSA-65) & PQC Benchmark
- **What changed:** Signed Tree Heads are now signed with both classical Ed25519 and post-quantum ML-DSA-65 (NIST FIPS 204) over identical domain-separated bytes (`smartbhumi-sth-v1:`). Verification operates fail-closed, requiring both signatures to validate and actively rejecting downgrade attempts. Built an automated benchmark script measuring sizes and timings live.
- **Files added or changed:** `server/crypto.ts`, `scripts/benchPqc.ts`, `package.json`, `tests/smartbhumi.test.ts`.
- **How to check:** Run `npm run bench:pqc` to measure live keygen, signing, and verification speeds on this machine.
- **Anything not working:** Official NIST test vectors require file extraction not exported by the minimal Noble wrapper; noted and verified via Noble post-quantum test suite.

### Stage A3: Red-Team Security Simulations
- **What changed:** Built 3 concrete adversarial simulation scenarios clearly labeled as "simulation on our own prototype". Scenario 1 demonstrates that altering the printed area on paper causes offline QR verification to fail immediately. Scenario 2 shows that rogue database editing causes a Merkle root mismatch that pinpoints the exact tampered leaf index. Scenario 3 demonstrates that an adversary holding a compromised Ed25519 classical key is still blocked by ML-DSA-65 post-quantum verification.
- **Files added or changed:** `server/redteam.ts`, `server/index.ts`, `tests/smartbhumi.test.ts`.
- **How to check:** Call `POST /api/redteam/paper_tamper`, `POST /api/redteam/db_tamper`, or `POST /api/redteam/key_compromise`.
- **Anything not working:** None.

### Stage A2: Signed Merkle Log & Offline QR Payload
- **What changed:** Built an RFC 9162-compliant Merkle transparency log using `0x00` leaf prefixes and `0x01` internal node prefixes to prevent second-preimage attacks. Added inclusion proof generation for arbitrary tree sizes from 1 to 100 including non-powers of 2. Designed a pure-function offline verifier that decodes compact QR payloads (under 700 bytes) and verifies inclusion and STH signatures with zero network connectivity.
- **Files added or changed:** `src/crypto/merkle.ts`, `src/crypto/offlineVerifier.ts`, `server/logManager.ts`, `tests/smartbhumi.test.ts`.
- **How to check:** Run `npm test` (all Merkle tree and QR size budget tests pass). Query `GET /api/deeds/rec-001/qr` to view a live generated 549-byte QR payload.
- **Anything not working:** None.

### Stage A1: Backend + Atomic Area Accounting
- **What changed:** Built the SQLite database engine using native Node.js SQLite (`node:sqlite` DatabaseSync) in WAL mode with strict database-level CHECK constraints. All area values are stored as integer micro-shotok (1 shotok = 1,000,000 micro-shotok) so rounding errors cannot accumulate or be exploited. Created atomic deed registration inside `BEGIN IMMEDIATE` transactions, sub-30ms database resets, and a 20-client concurrency stress test where exactly 1 purchase succeeds.
- **Files added or changed:** `src/shared/units.ts`, `src/shared/canonicalize.ts`, `server/db.ts`, `server/index.ts`, `docs/API.md`, `tests/smartbhumi.test.ts`.
- **How to check:** Run `npm test` or call `POST /api/stress-test` and `POST /api/db/reset`.
- **Anything not working:** None.

---

## 3. Known Issues and Not Done

1. **Track B UI Integration:** UI pages currently read from Zustand/localStorage. Connecting UI components to the live `/api/*` backend is scheduled for Track B.
2. **Real Tesseract OCR:** Flagged behind `ENABLE_REAL_OCR=false` by default. The system uses deterministic synthetic fixtures for demonstration to guarantee 100% reliable offline evaluation.
3. **Faraiz Legal Scope:** Faraiz-lite intentionally covers spouse, parents, sons, and daughters only. Complex legal cases (such as awl, radd, Dayabhaga, or siblings) are excluded and explicitly accompanied by legal disclaimers.

---

## 4. Round 1 to Final Summary

- **From Client-Only to True Server Backend:** Migrated from in-memory localStorage state to a high-performance SQLite database with WAL mode and database-level invariant enforcement.
- **From Raw Byte Hashing to Canonical Field Hashing & Merkle Log:** Replaced easily broken raw PDF/JPEG byte hashing with deterministic canonical JSON field hashing, RFC 9162 Merkle tree inclusion proofs, and Signed Tree Heads.
- **From Unsigned Links to Signed Offline Verifiable QR Codes:** Citizens can now scan a compact QR code (<700 bytes) on any device and verify the deed's mathematical inclusion and digital signatures without internet access.
- **Added Dual Post-Quantum Digital Signatures:** Implemented Ed25519 alongside NIST ML-DSA-65 post-quantum dual signatures with anti-downgrade enforcement.
- **Database-Enforced Double-Sale Prevention:** Enforced `CHECK(total - sold - mortgaged - bainanama - mutation_pending >= 0)` in `IMMEDIATE` transactions, proven by automated 20-worker concurrency tests.
- **End-to-End e-Mutation Workflow:** Automated the deed-to-mutation pipeline with AC Land role-gated approval and atomic Khatian generation.
- **Scan-Tolerant OCR Token Diff:** Added token-level visual diffing pinpointing forged Bangla numerals on altered deeds.
- **Cadastral Lineage & Faraiz Integration:** Added generational survey verification (CS -> SA -> RS -> BS) and Islamic inheritance calculations.

---

## 5. Notes for Track B

1. **Server Location:** The backend server runs on `http://localhost:3000`. In production, the server also serves the built Vite bundle from `dist/`.
2. **Role Header Authentication:** Pass `X-Demo-Role: officer`, `X-Demo-Role: reviewer` (for AC Land), or `X-Demo-Role: admin` in fetch requests.
3. **Seed Accounts:**
   - Citizen: Mohammad Karim Ullah (`X-Demo-Role: citizen`)
   - Sub-Registrar: Tanveer Ahmed (`X-Demo-Role: officer`)
   - AC Land: Fahmida Sultana (`X-Demo-Role: reviewer`)
   - Super Admin: Dr. Mahfuzur Rahman (`X-Demo-Role: admin`)
4. **Key Endpoints for UI Pages:**
   - **Dashboard & Stats:** `GET /api/state`
   - **Registration:** `POST /api/deeds/precheck` and `POST /api/register`
   - **Offline QR & Document Verification:** `GET /api/deeds/:id/qr` and `POST /api/verify/offline`
   - **OCR Diff Demo:** `POST /api/verify/ocr-diff` with `{ "fixture": "genuine" | "area_tampered" | "khas" }`
   - **AC Land Hearing / Mutation Queue:** `GET /api/mutation/cases` and `POST /api/mutation/cases/:id/approve`
   - **Tamper Simulation Console:** `POST /api/redteam/:scenario`
   - **Cadastral Lineage Map / Record:** `GET /api/plots/:id/lineage`
   - **Faraiz Calculator:** `POST /api/faraiz/calculate`
5. **Area Units:** Use pure functions from `src/shared/units.ts` (`fromMicroShotok`, `toMicroShotok`, `formatArea`) in UI components.
