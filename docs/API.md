# SmartBhumi Core API Documentation (Track A)

All endpoints run on the unified local server: `http://localhost:3000` (or configured `$PORT`).
The server automatically serves the built client SPA from `dist/` as well as all `/api/*` endpoints.

---

## 1. Authentication & Role Model
SmartBhumi uses a deterministic header-based demo authentication stub designed for offline student demonstration:
- Send `X-Demo-Role: <role>` with requests to authenticate.
- Valid roles:
  - `citizen`: General public, title verification, faraiz calculations.
  - `officer`: Sub-Registrar deed registration, precheck, sealing.
  - `reviewer`: AC Land (Assistant Commissioner Land), e-Mutation approval/rejection.
  - `admin`: Super Administrator, database resets, red-team tamper simulations.
- Optional: Send `X-Demo-User: <name>` for audit trail attribution.

---

## 2. API Endpoints

### 2.1 System & State
#### `GET /api/health`
Returns system status, active Node.js version, and Post-Quantum status.
- **Response `200`:**
  ```json
  {
    "status": "ok",
    "system": "SmartBhumi Land Registry Core API",
    "nodeVersion": "v26.13.0",
    "pqcEnabled": true,
    "timestamp": "2026-11-09T18:30:00.000Z"
  }
  ```

#### `GET /api/state`
Returns the complete real-time registry state including all khatians, plot shares (with computed available areas in micro-shotok and human-readable decimal shotok), registered deeds, encumbrances, audit log, current Signed Tree Head, and e-Mutation cases.
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "khatians": [...],
      "shares": [
        {
          "id": "ps-001",
          "dag_number": "DAG-2026-001",
          "mouza_code": "MOUZA-DEMO-001",
          "total_area": 15000000,
          "sold_area": 0,
          "mortgaged_area": 0,
          "bainanama_area": 0,
          "mutation_pending": 0,
          "available_micro_shotok": 15000000,
          "available_shotok": 15.0,
          "total_shotok": 15.0
        }
      ],
      "deeds": [...],
      "encumbrances": [...],
      "auditLog": [...],
      "latestSTH": {...},
      "mutationCases": [...]
    }
  }
  ```

#### `POST /api/db/reset`
Drops and re-seeds the SQLite database with pristine synthetic demo records.
- **Performance:** Completes in `< 30ms` (guaranteed `< 100ms`).
- **Response `200`:**
  ```json
  {
    "success": true,
    "resetTimeMs": 24,
    "message": "Database reset to synthetic demo state in 24ms (<100ms requirement achieved)."
  }
  ```

---

### 2.2 Deed Precheck & Registration (Area Accounting)
#### `POST /api/deeds/precheck`
Evaluates whether a planned land transfer is legally and computationally valid without mutating database state.
- **Request Body:**
  ```json
  {
    "khatianNumber": "KH-2026-0001",
    "dagNumber": "DAG-2026-001",
    "mouzaCode": "MOUZA-DEMO-001",
    "transferArea": 5.0,
    "transferUnit": "shotok",
    "sellerNid": "9990001001",
    "deedType": "sale"
  }
  ```
- **Response `200`:**
  ```json
  {
    "allowed": true,
    "plotDag": "DAG-2026-001",
    "khatianNumber": "KH-2026-0001",
    "totalAreaShotok": 15.0,
    "availableAreaShotok": 15.0,
    "requestedTransferShotok": 5.0,
    "remainingAfterTransferShotok": 10.0,
    "risks": []
  }
  ```

#### `POST /api/register` (or `POST /api/deeds/register`)
Atomically registers a deed, deducts area from the seller's plot share, appends the canonical deed claims to the Merkle Transparency Log, creates a Signed Tree Head, and initiates an e-Mutation case.
- **Request Body:**
  ```json
  {
    "deedType": "sale",
    "khatianNumber": "KH-2026-0001",
    "dagNumber": "DAG-2026-001",
    "mouzaCode": "MOUZA-DEMO-001",
    "transferArea": 5.0,
    "transferUnit": "shotok",
    "sellerNameEn": "SYNTHETIC: Mohammad Abdul Karim",
    "sellerNameBn": "সিন্থেটিক: মোহাম্মদ আব্দুল করিম",
    "sellerNid": "9990001001",
    "buyerNameEn": "SYNTHETIC: Tanveer Ahmed",
    "buyerNameBn": "সিন্থেটিক: তানভীর আহমেদ",
    "buyerNid": "9990002002",
    "notes": "Legitimate land purchase"
  }
  ```
- **Response `200`:**
  ```json
  {
    "success": true,
    "deed": {
      "id": "deed-174154...",
      "deedNumber": "LP-2026-4821",
      "status": "sealed",
      "transferAreaShotok": 5.0,
      "merkleLeafIndex": 1,
      "merkleRoot": "3f82...",
      "mutationCaseId": "mut-174154..."
    }
  }
  ```
- **Response `400` (Double-Sale / Area Deficit):**
  ```json
  {
    "success": false,
    "error": "Insufficient available area: requested 10.00 shotok, but only 0.40 shotok available on this share."
  }
  ```

#### `POST /api/stress-test`
Simulates 20 concurrent transactions attempting to purchase 10.00 shotok each from a plot share with only 10.40 shotok available.
- **Response `200`:**
  ```json
  {
    "totalAttempts": 20,
    "succeeded": 1,
    "failed": 19,
    "expectedInvariant": "Exactly 1 succeeds, 19 fail",
    "invariantSatisfied": true,
    "results": [...]
  }
  ```

---

### 2.3 Signed Merkle Log & Offline QR Payload
#### `GET /api/sth/latest`
Returns the current Signed Tree Head (STH) and trusted public authority keys.
- **Response `200`:**
  ```json
  {
    "sth": {
      "epoch": 1,
      "treeSize": 2,
      "rootHash": "e1f98...",
      "timestamp": "2026-11-09T18:25:00.000Z",
      "prevSthHash": "000000...",
      "signatureEd25519": "a1b2...",
      "signatureMlDsa65": "c3d4...",
      "algorithmId": "ed25519+ml-dsa-65"
    },
    "publicKeys": {
      "ed25519": "2498...",
      "mlDsa65": "8df1...",
      "algorithmId": "ed25519+ml-dsa-65"
    }
  }
  ```

#### `GET /api/deeds/:id/qr`
Generates the printable compact QR payload for a sealed deed.
- **Size Guarantee:** Always under 700 bytes (typical ~520-550 bytes).
- **Response `200`:**
  ```json
  {
    "success": true,
    "payload": {
      "v": 1,
      "alg": "ed25519",
      "ep": 1,
      "idx": 0,
      "claims": {
        "d": "LP-2026-001",
        "t": "sale",
        "k": "KH-2026-0001",
        "g": "DAG-2026-001",
        "m": "MOUZA-DEMO-001",
        "a": 15000000,
        "b": "999000*****1002",
        "dt": "2026-01-15"
      },
      "proof": [...],
      "root": "e1f98...",
      "ts": "2026-11-09T18:25:00.000Z",
      "sig": "a1b2..."
    },
    "qrString": "{\"v\":1,\"alg\":\"ed25519\",...}",
    "byteLength": 549,
    "withinBudgetUnder700Bytes": true
  }
  ```

#### `POST /api/verify/offline`
Executes pure-function offline verification of a scanned QR payload.
- **Request Body:** `{ "qrString": "..." }`
- **Response `200`:**
  ```json
  {
    "valid": true,
    "claims": {...},
    "epoch": 1,
    "leafIndex": 0,
    "treeRoot": "e1f98...",
    "verifiedAt": "2026-11-09T18:25:00.000Z",
    "disclaimer": "Verified as of 2026-11-09T18:25:00.000Z; live status not checked offline. Deed recorded in tamper-evident log at leaf #0."
  }
  ```

---

### 2.4 Red-Team Simulations (Demonstrations)
#### `POST /api/redteam/:scenario`
Simulates adversarial attack vectors on SmartBhumi:
1. `paper_tamper`: Area claim modified on paper -> offline proof fails.
2. `db_tamper`: Direct SQLite edit -> Merkle root recomputation isolates leaf index #0.
3. `key_compromise`: Leaked classical Ed25519 key -> blocked by ML-DSA-65 post-quantum signature.

- **Response `200`:**
  ```json
  {
    "scenario": "key_compromise",
    "label": "simulation on our own prototype",
    "success": true,
    "tamperDetected": true,
    "verdict": "BLOCKED",
    "details": {
      "classicalEd25519Status": "VALID (Compromised key accepted)",
      "postQuantumMlDsaStatus": "INVALID (Forged PQ signature rejected)",
      "overallVerificationPassed": false
    },
    "explanation": "Even when the classical Ed25519 private key is leaked, the dual-signature policy requires ML-DSA-65 post-quantum verification. The fraudulent STH is rejected with fail-closed semantics: BLOCKED."
  }
  ```

---

### 2.5 Registry to e-Mutation
#### `GET /api/mutation/cases?status=pending`
Lists e-Mutation cases.

#### `POST /api/mutation/cases/:id/approve`
- **Header:** `X-Demo-Role: reviewer` (or `admin`)
- Atomically moves area from `mutation_pending` to `sold_area`, creates buyer's new Khatian (`KH-MUT-2026-XXXX`), and assigns plot share.
- **Response `200`:**
  ```json
  {
    "success": true,
    "newKhatianNumber": "KH-MUT-2026-4091",
    "buyerName": "SYNTHETIC: Tanveer Ahmed",
    "mutatedAreaShotok": 5.0
  }
  ```

#### `POST /api/mutation/cases/:id/reject`
- **Header:** `X-Demo-Role: reviewer` (or `admin`)
- Releases pending mutation area back to available pool.

---

### 2.6 Scan-Tolerant OCR Diff
#### `POST /api/verify/ocr-diff`
Compares extracted document claims against official records with token-level diff.
- **Request Body:** `{ "fixture": "area_tampered" }` (or `"genuine"`, `"khas"`)
- **Response `200`:**
  ```json
  {
    "deedNumber": "LP-2026-001",
    "overallMatch": false,
    "fieldDiffs": [
      {
        "field": "transferArea",
        "officialValue": "15.00 শতক",
        "scannedValue": "25.00 শতক",
        "match": false
      }
    ],
    "tokenLevelDiff": {
      "targetField": "transferArea",
      "tokens": [
        { "tokenIndex": 0, "officialToken": "15.00", "scannedToken": "25.00", "match": false },
        { "tokenIndex": 1, "officialToken": "শতক", "scannedToken": "শতক", "match": true }
      ],
      "summaryBn": "জমির পরিমাণে অসঙ্গতি চিহ্নিত: সরকারি রেকর্ডে '15.00 শতক' কিন্তু স্ক্যানকৃত দলিলে '25.00 শতক'।"
    }
  }
  ```

---

### 2.7 Cadastral Lineage & Faraiz
#### `GET /api/plots/:id/lineage`
Returns multi-generational survey lineage (CS -> SA -> RS -> BS) and flags broken chains.
- Example: `GET /api/plots/DAG-2026-007/lineage` flags missing RS survey gap.

#### `POST /api/faraiz/calculate`
Calculates simplified Islamic inheritance shares (spouse, parents, sons, daughters).
- **Request Body:**
  ```json
  {
    "totalArea": 48.0,
    "unit": "shotok",
    "hasSpouse": true,
    "deceasedGender": "male",
    "hasMother": true,
    "hasFather": true,
    "numSons": 2,
    "numDaughters": 1
  }
  ```
- **Response `200`:**
  ```json
  {
    "shares": [
      { "heir": "Wife", "shareShotok": 6.0 },
      { "heir": "Mother", "shareShotok": 8.0 },
      { "heir": "Father", "shareShotok": 8.0 },
      { "heir": "Son 1", "shareShotok": 10.4 },
      { "heir": "Son 2", "shareShotok": 10.4 },
      { "heir": "Daughter 1", "shareShotok": 5.2 }
    ],
    "totalDistributedShotok": 48.0,
    "disclaimer": "ILLUSTRATIVE ONLY — This is a simplified calculation covering only spouse, parents, sons, and daughters. It does not handle awl, radd, Dayabhaga, or complex cases. Not legal advice. Consult a qualified lawyer."
  }
  ```

