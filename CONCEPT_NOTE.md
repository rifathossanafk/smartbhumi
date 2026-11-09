# LandProof — Concept Note
## Bangladesh Land Document Verification and Digital Land Intelligence Platform
**LandTech 2026 — LandTech Innovation Hackathon, Bangladesh**  
**Track:** Digital Land Records, Verification & Digitization  
**Selected Problem:** Problem P2 — Verify Deeds & Ownership  

---

### 1. Executive Summary & Problem Context in Bangladesh

Land transactions in Bangladesh form the backbone of household wealth, agricultural livelihood, and commercial real estate. However, the land administration domain historically grapples with severe challenges:
1. **Multi-Survey Discrepancies**: Over a century of surveying—from colonial **CS** (Cadastral Survey) to **SA** (State Acquisition), **RS** (Revisional Survey), and contemporary **BS / City Survey**—creates overlapping records, duplicated plot numbering, and misaligned mouza boundaries.
2. **Deed Forgery & Unauthorized Alterations**: Paper deeds and photocopy scans are vulnerable to alteration of plot dimensions, seller names, or DAG references before submission to banks, mortgage lenders, or prospective buyers.
3. **Ghost Sellers & Unmutated Ownership**: Deeds are frequently executed by individuals who do not possess updated mutation records (ই-নামজারি) or legal title over the specific plot.
4. **Cognitive Burden on Citizens**: Legal jargon and fragmented government portals leave ordinary citizens unable to independently verify whether a document matches official records.

**LandProof** addresses these challenges by introducing a decentralized cryptographic fingerprinting layer coupled with automated ownership consistency checks, accessible through an intuitive, bilingual, Bangla-first web interface.

---

### 2. Proposed Solution: The LandProof Platform

LandProof serves as an intelligence and verification intermediary between citizens, registry officers, and financial evaluators. Key pillars of the solution include:

#### A. Cryptographic Document Fingerprinting (Web Crypto API)
- When a land deed is executed or registered, the system calculates a deterministic **SHA-256 hash** directly from the exact binary bytes of the document.
- Only the 64-character hexadecimal digest is stored in the registry index alongside the deed metadata.
- When any citizen or institution inspects the deed, they upload their digital copy. The browser calculates the hash in real-time. If even a single byte, comma, or digit in the document has been altered, the hashes mismatch completely, immediately flagging **DOCUMENT MISMATCH**.

#### B. Automated Ownership Consistency Engine
- Land deeds reference a specific plot identified by **Division**, **District**, **Upazila**, **Mouza**, **JL Number**, **Khatian Number**, and **Dag Number**.
- LandProof correlates the deed’s declared seller with the registered owner in the plot-ownership database.
- If the seller reference does not match the active owner reference, the system triggers **MANUAL REVIEW REQUIRED**, warning the buyer before financial commitment.

#### C. QR Code Instant Field Access
- Each deed record receives an auto-generated high-resolution QR code.
- Field officers, bank loan inspectors, or prospective buyers can scan the QR code with any mobile device to immediately open the secure verification portal for that specific deed.

#### D. Interactive GIS Land Intelligence Map
- Citizens can explore demo plots on an interactive map of Bangladesh, filtering by division, district, and survey type.
- Each plot displays relevant khatian/dag metadata and links directly to verification workflows.

---

### 3. User Journey & Role-Based Workflows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LANDPROOF USER JOURNEYS                         │
└────────────────────────────────────────────────────────────────────────┘

 1. CITIZEN / BUYER JOURNEY
    [Scan QR or Enter Deed No.] ──> [Inspect Record Metadata]
                                              │
                                              ▼
                             [Upload PDF / Image File]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [SHA-256 Match: VERIFIED]                       [Hash Mismatch: ALERT]
                      │
                      ▼
         [Ownership Consistency Check]
          ├── Seller Matches Owner  --> Transaction Cleared
          └── Seller Mismatches     --> Manual Review Required

 2. REGISTRY OFFICER JOURNEY
    [Fill Survey Details] ──> [Upload Executed Deed] ──> [Compute SHA-256]
                                                                │
                                                                ▼
                                                [Generate Verification QR]
                                                                │
                                                                ▼
                                                [Store in Registry Index]

 3. VERIFICATION REVIEWER JOURNEY
    [Inspect Flagged Records] ──> [Review Mismatch Reason] ──> [Add Review Note & Status]
```

---

### 4. Technical Architecture & Security Standards

- **Zero-Knowledge Document Privacy**: The platform does not require server-side retention of citizens' private documents. The SHA-256 hash calculation occurs client-side via the browser's native **Web Crypto API**, preserving document privacy.
- **Relational Integrity**: Records maintain structured foreign references across administrative hierarchies (`Division` → `District` → `Upazila` → `Mouza` → `Plot/Dag`).
- **Resilient Client State**: Utilizes persistent storage schemas with reactive state management, enabling offline-friendly and refresh-resilient evaluation.

---

### 5. Roadmap for Nationwide Applicability in Bangladesh

While developed as a hackathon prototype with synthetic demonstration data, LandProof's architectural paradigm can integrate with national infrastructure:
1. **API Integration with Digital Land Portals**: Integrate with `mutation.land.gov.bd` (e-Namjari) and `eporcha.gov.bd` to ingest authentic Khatian hashes at the time of official issuance.
2. **Sub-Registry Office Digitization**: Deploy hash generation at the 500+ Sub-Registry offices nationwide during deed registration.
3. **Banking & Mortgage Verification API**: Provide commercial banks and microfinance institutions with an automated API to verify mortgaged deeds before loan disbursement, drastically reducing non-performing loans stemming from forged land collateral.

---

### 6. Prototype Safety & Ethical Disclaimers

1. **Synthetic Data Policy**: All names, plot numbers, seller codes, and coordinates in this prototype are entirely fictional.
2. **Legal Limitations**: The platform explicitly informs users that a cryptographic hash match confirms file-integrity against a registered demo index, but does not substitute for formal court title investigations or physical land measurement by certified Amins.

---

### 7. Team Information

- **Track**: LandTech 2026 — Problem Track P2
- **Developers**: Two-Student Development Team, Bangladesh
- **AI Tools Disclosed**: Google Antigravity, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Gemini 2.5 Flash
