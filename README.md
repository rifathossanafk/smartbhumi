# LandProof — Bangladesh Land Document Verification
## LandTech 2026 | Digital Land Records, Verification & Digitization
### System: SmartBhumi (স্মার্ট ভূমি সেবা ও ডিজিটাল দলিল যাচাইকরণ)

[![Hackathon Track](https://img.shields.io/badge/LandTech%202026-Track%20P2%3A%20Verify%20Deeds%20%26%20Ownership-006A4E)](https://landtech.gov.bd)
[![Automated Tests](https://img.shields.io/badge/Tests-8%2F8%20Passed-brightgreen)](file:///tests/verification.test.mjs)
[![Language](https://img.shields.io/badge/Language-Bangla%20First%20%7C%20Bilingual-emerald)](file:///src/i18n)
[![Cryptography](https://img.shields.io/badge/Hash-SHA--256%20Web%20Crypto-blue)](file:///src/utils/crypto.ts)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**LandProof** (deployed under the official platform brand **SmartBhumi**) is a Bangla-first, bilingual web application prototype developed for **LandTech 2026 — LandTech Innovation Hackathon, Bangladesh**. It addresses **Problem Track P2: Verify Deeds & Ownership** by demonstrating cryptographic document-integrity checks, QR-based record lookup, and synthetic ownership-reference consistency checks.

The project aims to make land-document verification easier to understand for citizens while providing a useful demonstration workflow for professional users, registry officials, and financial evaluators.

🌐 Live Demo

<p align="center">
  <a href="https://smartbhumi.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Launch-SmartBhumi-006A4E?style=for-the-badge" alt="Launch SmartBhumi"/>
  </a>
</p>

Live Website: https://smartbhumi.vercel.app/

🎥 Project Demonstration

<p align="center">
  <a href="https://www.youtube.com/watch?v=vg9ztqZPWQM">
    <img src="https://img.youtube.com/vi/vg9ztqZPWQM/maxresdefault.jpg"
         alt="Watch the LandProof project demonstration"
         width="800"/>
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/vg9ztqZPWQM">
    ▶️ <strong>Watch the Full Demo on YouTube</strong>
  </a>
</p>


> [!IMPORTANT]
> **Important Prototype Disclaimer**: LandProof is a hackathon prototype, not an official Bangladesh government service. It uses synthetic demonstration records and does not establish legal ownership or provide authoritative verification of real land records.

---

## 1. Problem Statement

Land-document verification in Bangladesh can be difficult when document copies have been modified or when the information associated with a transaction does not match the available ownership references:
- **Historical Survey Complexity**: Citizens must navigate multiple generations of land surveys—**CS** (Cadastral Survey, 1888–1940), **SA** (State Acquisition, 1956–1962), **RS** (Revisional Survey, 1965–present), and **BS / City Survey**.
- **Specialized Nomenclature**: Land parcels require correlating Khatian (খতিয়ান — record of rights), Dag (দাগ — plot number), Mouza (মৌজা — revenue village), and JL numbers (জে.এল. নম্বর — jurisdiction list number).
- **Document Tampering Risks**: Scanned deed PDFs and photocopies are vulnerable to unauthorized alterations of plot dimensions, seller names, or DAG numbers prior to submission to prospective buyers, registry offices, or banks.
- **Unverified Sellers & Ghost Titles**: Severe financial disputes occur when a deed seller does not hold recorded mutation (ই-নামজারি) or survey title over the transacted plot.

**LandProof** demonstrates how cryptographic hashing and structured record checks can help identify document mismatches and inconsistencies before financial commitment is made.

---

## 2. Main Features

Only features fully implemented and tested in the submitted version are listed:

1. **Bangla-First Interface**:
   - Bangla (বাংলা) is the default language across all views, forms, metrics, alerts, and badges.
   - Immediate toggle to English with persistent language state stored in the browser (`localStorage`).

2. **Demo Login with Role-Based Access Control**:
   - Instant 1-click demonstration accounts for:
     - **Citizen / Buyer (নাগরিক / ক্রেতা)**: Search deeds, inspect details, verify documents, and scan QR codes.
     - **Registry Officer (নিবন্ধন কর্মকর্তা)**: Register synthetic deeds, compute document hashes, and generate verification QR codes.
     - **Verification Reviewer (যাচাই পর্যালোচক)**: Review flagged records with mismatch reasons and update review status.
     - **Demo Administrator (সিস্টেম প্রশাসক)**: View platform metrics, audit trail, and execute system data reset.

3. **Synthetic Land Records**:
   - Comprehensive synthetic dataset covering fictional deeds, CS/SA/RS/BS khatians, dags, mouzas, sellers, buyers, and plot-ownership records across Bangladesh administrative divisions.

4. **Cryptographic Document Integrity Verification (SHA-256)**:
   - Computes SHA-256 cryptographic fingerprints from raw binary file bytes in the browser via the native **Web Crypto API**.
   - Zero-knowledge privacy: Documents are evaluated client-side and never transmitted to external third-party servers.
   - Compares the uploaded file fingerprint against the original expected hash stored at deed registration.

5. **QR-Based Lookup**:
   - High-resolution SVG QR codes generated automatically for registered records (`/verify/:deedNumber`).
   - Dynamically bound to the deployment host, allowing mobile devices to open verification workflows instantly.

6. **Ownership Consistency Checks**:
   - Cross-references deed `sellerRef` against recorded `plotOwnership` for the designated Dag and Mouza.
   - Automatically detects when a seller differs from the registered plot owner and flags the record for manual review.

7. **Interactive Bangladesh Land Map**:
   - Interactive GIS map built with Leaflet and OpenStreetMap, centered on Bangladesh.
   - Demonstrates geographic exploration of fictional land parcels with administrative division filters and status markers.

8. **Audit Activity Log**:
   - Records chronological verification events (`registration`, `verification`, `verificationFailed`, `unknownLookup`, `reviewUpdate`, `demoReset`).
   - Supports 1-click client-side CSV export of the session audit trail.

9. **Responsive Interface**:
   - Designed for desktop, tablet, and mobile browsers with clean typography (Hind Siliguri & Inter) and official government color schemes.

10. **1-Click Quick-Test Verification Scenarios**:
    - Pre-configured test presets on `/verify` enabling evaluators and judges to test original matching files, altered mismatch files, seller discrepancies, and unknown records without manual file creation.

---

## 3. Technology Stack

- **Frontend**: React 19 (`react` 19.3.1, `react-dom` 19.3.1) and TypeScript (`typescript` ~6.0.2)
- **Styling**: Tailwind CSS v4 (`tailwindcss` ^4.3.3, `@tailwindcss/vite` ^4.3.3) with custom vanilla design tokens and Google Fonts (**Hind Siliguri** for Bengali & **Inter** for Latin/numerals)
- **Database & Persistence**: Client-side reactive store using **Zustand v5** (`zustand` ^5.0.15) with `persist` middleware backed by Browser `localStorage` and synthetic seed datasets (`src/data/seedData.ts`)
- **Routing**: React Router DOM v7 (`react-router-dom` ^7.18.4) with role-guarded navigation
- **Mapping**: Leaflet v1.9 (`leaflet` ^1.9.4, `@types/leaflet` ^1.9.22) & React-Leaflet v5 (`react-leaflet` ^5.0.0) with OpenStreetMap tile integration
- **Document Hashing**: SHA-256 using native Browser **Web Crypto API** (`crypto.subtle.digest`) with hexadecimal encoding
- **QR Generation**: `qrcode.react` v4.2.0 (SVG rendering with high-contrast quiet zone)
- **Internationalization (i18n)**: `i18next` v26.4.7 and `react-i18next` v17.0.20
- **Testing**: Node.js Automated Verification Test Suite (`node tests/verification.test.mjs`) covering 8 domain & crypto test cases
- **Date Handling**: `date-fns` v4.4.0
- **Icons**: `lucide-react` v1.58.0
- **Build & Development Tool**: Vite v8 (`vite` ^8.3.0, `@vitejs/plugin-react` ^6.1.2)
- **Deployment**: Static Single Page Application (SPA) deployable on Vercel, Netlify, Cloudflare Pages, or GitHub Pages

---

## 4. How Document Verification Works

The document verification lifecycle operates as follows:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DOCUMENT VERIFICATION LIFECYCLE                      │
└────────────────────────────────────────────────────────────────────────┘

 1. REGISTRATION PHASE (Registry Officer)
    [Fill Survey Details] ──> [Upload Deed File] ──> [Compute SHA-256]
                                                           │
                                                           ▼
    [Store Record & Fingerprint in DB] <─────── [Generate Verification QR]

 2. VERIFICATION PHASE (Citizen / Buyer / Evaluator)
    [Scan QR or Search Deed No.] ──> [Retrieve Expected Record Fingerprint]
                                                    │
                                                    ▼
                                         [Upload Copy for Check]
                                                    │
                                                    ▼
                                       [Compute SHA-256 in Browser]
                                                    │
                                                    ▼
                                  [Compare Hashes (Byte-Level Strict)]
                                                    │
                      ┌─────────────────────────────┴─────────────────────────────┐
                      ▼                                                           ▼
             [HASHES MATCH]                                              [HASHES DIFFER]
                      │                                                           │
                      ▼                                                           ▼
       [Ownership Consistency Check]                                    DOCUMENT MISMATCH (Altered)
        ├── Seller = Recorded Owner  ──> VERIFIED (Success)
        └── Seller ≠ Recorded Owner  ──> MANUAL REVIEW REQUIRED
```

### Step-by-Step Flow:
1. **Record Registration**: An authorized demo user (Registry Officer) registers a fictional deed record with administrative hierarchy (Division, District, Upazila, Mouza, JL Number), survey type (CS, SA, RS, BS), plot/dag number, seller reference, and buyer reference, and uploads or generates a sample document.
2. **SHA-256 Fingerprint**: The application calculates the document's SHA-256 fingerprint from the raw binary bytes via the Web Crypto API.
3. **Database Storage**: The record metadata and expected cryptographic fingerprint are securely stored in the configured database (browser `localStorage`). The expected hash is immutable during verification.
4. **QR Generation**: The application generates a high-resolution QR code encoding the link to the record's verification page (`/verify/:deedNumber`).
5. **Document Submission**: A citizen or buyer opens the record via search or QR scan and uploads a document copy for verification.
6. **Hash Comparison**: The application calculates the uploaded file's SHA-256 fingerprint client-side and performs strict byte-level comparison against the originally registered fingerprint.
7. **Ownership Reference Cross-Check**: Concurrently, the engine checks whether the seller named on the deed matches the recorded owner for that specific Dag and Mouza in the plot ownership dataset.
8. **Verdict Display**: The application displays the verification verdict, side-by-side hash comparison, and ownership-reference status.

### Verification Outcomes:
- **`VERIFIED`**: The uploaded file's cryptographic hash exactly matches the registered fingerprint, and the declared seller matches the recorded plot owner.
- **`DOCUMENT MISMATCH`**: The uploaded file differs from the originally registered file by even a single byte or character.
- **`MANUAL REVIEW REQUIRED`**: The file hash matches, but an ownership inconsistency exists (the declared seller differs from the recorded plot owner, or no plot ownership record was found).
- **`RECORD NOT FOUND`**: No corresponding demo record exists for the provided reference number.

> [!NOTE]
> **Integrity vs. Authenticity**: A matching SHA-256 fingerprint demonstrates file integrity relative to the registered reference copy. It does not independently establish that a document is legally authentic or that a person owns a property under civil law.

---

## 5. Data Used

LandProof uses synthetic demonstration data created specifically for the LandTech 2026 Hackathon:
- The dataset contains fictional deed references (`LP-2026-001` through `LP-2026-006`), khatian references, dag/plot references, ownership identifiers, verification activities, and demonstration map coordinates.
- **Zero Real Private Data**: No real private land records, real people's National Identity (NID) numbers, real telephone numbers, or genuine personal documents are included or required.
- **Geographic Data**: Map coordinates and boundary representations are synthetic sample markers across Bangladesh divisions used solely to demonstrate GIS interactions; they do not represent verified cadastral survey data.

### Research Sources Consulted During Development:
1. **Ministry of Land (ভূমি মন্ত্রণালয়)**: [https://www.land.gov.bd/](https://www.land.gov.bd/) and [https://minland.gov.bd/](https://minland.gov.bd/)
2. **Digital Record Room / E-Porcha (খতিয়ান ও মৌজা নকশা)**: [https://dlrms-stg.land.gov.bd/](https://dlrms-stg.land.gov.bd/) and [https://eporcha.gov.bd/](https://eporcha.gov.bd/)
3. **E-Mutation Guidance (ই-নামজারি নির্দেশিকা)**: [https://mutation.land.gov.bd/nirdeshika](https://mutation.land.gov.bd/nirdeshika) and [https://mutation.land.gov.bd/](https://mutation.land.gov.bd/)
4. **National Land Mapping Portal (জাতীয় ভূমি নকশা)**: [https://map.land.gov.bd/](https://map.land.gov.bd/)

*Note: These links are domain research references; they do not imply an official integration or connection with those government services.*

---

## 6. Installation and Setup

### Prerequisites:
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**

### Run Locally:
1. Clone the repository:
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd "Final  LandTech Project"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables if necessary (see `.env.example`). *The application runs fully out-of-the-box with client-side state and mock datasets.*
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local URL displayed in the terminal (typically `http://localhost:5173`).

### Other Useful Commands:
- **Execute Automated Tests**:
  ```bash
  npm test
  # Or run directly with Node:
  node tests/verification.test.mjs
  ```
- **Create Production Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 7. Demo Instructions

Follow this walk-through to test all core capabilities of LandProof:

1. **Open the Application**: Visit `http://localhost:5173`.
2. **Select Language**: Click the language toggle button in the top national ribbon to switch between **বাংলা** (default) and **English**.
3. **Sign In with a Demo Role**:
   - Click **লগইন / প্রবেশ (Sign In)** in the navigation header.
   - Select any demo role card (**নাগরিক / ক্রেতা**, **নিবন্ধন কর্মকর্তা**, **যাচাই পর্যালোচক**, or **সিস্টেম প্রশাসক**).
4. **Test Document Verification (Quick-Test Presets)**:
   - Navigate to `/verify` (যাচাইকরণ).
   - Use the pre-configured 1-click test buttons:
     - **Test Case 1 (Pass)**: Select `LP-2026-001` and click **Test Original Document (Pass)** → Displays green **VERIFIED** badge with matching SHA-256 fingerprints and ownership match.
     - **Test Case 2 (Fail - Tampering)**: On `LP-2026-001`, click **Test Altered Document (Fail)** → Displays red **DOCUMENT MISMATCH** alert with differing SHA-256 fingerprints side-by-side.
     - **Test Case 3 (Seller Mismatch)**: Select `LP-2026-002` → Displays yellow **MANUAL REVIEW REQUIRED** warning because the declared seller differs from the recorded plot owner.
     - **Test Case 4 (No Plot Record)**: Select `LP-2026-005` → Displays yellow **MANUAL REVIEW REQUIRED** warning because no plot ownership record was found.
     - **Test Case 5 (Unknown Deed)**: Search `LP-UNKNOWN-999` → Displays **RECORD NOT FOUND** alert.
5. **Register a New Demo Record**:
   - Sign in as **নিবন্ধন কর্মকর্তা (Registry Officer)**.
   - Go to `/register` (দলিল নিবন্ধন).
   - Select Division, District, Upazila, Mouza, and Khatian type.
   - Click **Use Standard Synthetic Sample Document** to compute the SHA-256 hash in real-time.
   - Submit the deed and view the auto-generated QR code.
6. **Review Flagged Cases**:
   - Sign in as **যাচাই পর্যালোচক (Verification Reviewer)**.
   - Go to `/flagged` (পর্যালোচনা).
   - Inspect flagged cases, write reviewer notes, and update the review status (`New`, `Under Review`, `Additional Review`, `Completed`).
7. **Explore the Interactive Map**:
   - Navigate to `/map` (ভূমি মানচিত্র).
   - Filter parcels by administrative division (e.g., ঢাকা, চট্টগ্রাম, রাজশাহী).
   - Click a parcel pin to view khatian, dag, and mouza metadata, or jump directly to verification.
8. **View Audit History & Export CSV**:
   - Navigate to `/history` (অডিট লগ).
   - Review recorded verification events and click **CSV ডাউনলোড** to download the activity log.
9. **Reset Demo State**:
   - Sign in as **সিস্টেম প্রশাসক (Administrator)**.
   - Go to `/dashboard` and click **ডেমো ডেটা রিসেট (Reset Demo Data)** to restore the original seed records at any time.

---

## 8. Testing

LandProof includes an automated verification test suite located in [tests/verification.test.mjs](file:///tests/verification.test.mjs).

### Executing Tests:
```bash
node tests/verification.test.mjs
```

### Verified Test Cases:
| Test ID | Test Case | Assertion | Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Original Document Hashing | Uploaded original document matches registered SHA-256 hash for `rec-001` | **PASS** |
| **TC-02** | Altered Document Detection | Modified document produces a completely different hash (`DOCUMENT MISMATCH`) | **PASS** |
| **TC-03** | Ownership Consistency (Match) | Consistency passes when deed seller matches recorded plot owner (`LP-2026-001`) | **PASS** |
| **TC-04** | Ownership Consistency (Mismatch) | Flags mismatch when seller differs from recorded owner (`LP-2026-002`) | **PASS** |
| **TC-05** | Missing Plot Ownership | Flags missing plot ownership gracefully without runtime exceptions (`LP-2026-005`) | **PASS** |
| **TC-06** | QR Verification URL | QR URL generator constructs valid relative/origin URI without hardcoded localhost | **PASS** |
| **TC-07** | Bilingual Translation Coverage | Both Bangla (`bn.ts`) and English (`en.ts`) dictionaries contain essential keys | **PASS** |
| **TC-08** | Role Permission Matrix | RBAC gates registry, review, and admin functions to authorized roles only | **PASS** |

**Summary: 8/8 Tests Passed (100% success rate).**

---

## 9. Limitations

1. **Synthetic Data**: The application operates entirely on synthetic mock records and is not connected to live government land databases.
2. **Prototype Status**: The application does not provide legally authoritative ownership verification or formal title certification.
3. **Integrity vs Authenticity**: SHA-256 cryptographic matching strictly verifies that a file is identical byte-for-byte to its registered reference copy; it does not prove the legal validity or authenticity of the underlying physical document.
4. **Ownership-Reference Dataset**: Consistency checks depend on the internal completeness and correctness of the demo plot-ownership dataset.
5. **GIS Representation**: Map coordinates and boundary pins are illustrative demonstration points, not official cadastral survey polygons.
6. **Authentication Scope**: The 1-click role switcher is designed for hackathon demonstration and evaluation, not production-grade identity management.
7. **Future Production Requirements**: A production rollout would require integration with Bangladesh National Digital Architecture (BNDA), sub-registry office APIs, multi-factor authentication, PKI digital signatures, and formal data governance review.

---

## 10. AI Tools Used

| Tool | Actual Use |
| :--- | :--- |
| **Google Antigravity** | Google Antigravity (Advanced Agentic AI Coding Assistant by Google DeepMind) was the sole AI tool utilized during development. Antigravity was used for architectural planning, implementing the React 19 + TypeScript frontend and Tailwind CSS styling, integrating the client-side Web Crypto API for SHA-256 document hashing, implementing Leaflet GIS mapping, designing the complete Bangla-first bilingual localization system (`i18next`), writing the automated verification test suite (`tests/verification.test.mjs`), integrating the transparent LandProof Bangladesh logo, and drafting technical documentation. |

*(All other AI coding tools were removed as only Google Antigravity was used for this project).*

---

## 11. Open-Source Credits

We gratefully acknowledge the following open-source projects, libraries, and resources:

| Library / Resource | License | Purpose in LandProof |
| :--- | :--- | :--- |
| **React & React DOM** (`v19.3.1`) | MIT | Core UI component framework |
| **TypeScript** (`~6.0.2`) | Apache-2.0 | Type safety and domain interface definitions |
| **Vite** (`v8.3.0`) | MIT | Next-generation frontend build tooling |
| **Tailwind CSS** (`v4.3.3`) | MIT | Utility-first styling and responsive layouts |
| **Zustand** (`v5.0.15`) | MIT | Lightweight reactive client state management with persistence |
| **Leaflet** (`v1.9.4`) & **React-Leaflet** (`v5.0.0`) | BSD-2-Clause | Interactive GIS land mapping and parcel markers |
| **OpenStreetMap** | ODbL | Map tile background provider |
| **qrcode.react** (`v4.2.0`) | ISC | Dynamic QR code generation for deed records |
| **i18next** (`v26.4.7`) & **react-i18next** (`v17.0.20`) | MIT | Bilingual internationalization framework |
| **Lucide React** (`v1.58.0`) | ISC | Modern UI icon library |
| **date-fns** (`v4.4.0`) | MIT | Modern date formatting and manipulation |
| **Google Fonts (Hind Siliguri & Inter)** | OFL | Typography for native Bangla and Latin typography |

---

## 12. Team

- **Student 1**: [Name — Lead Developer & Domain Architecture]
- **Student 2**: [Name — Frontend Engineering & GIS Development]
- **Faculty Mentor**: [Name — Department & University]
- **Industry Mentor**: [Name — Organization & Title]

---

## 13. Development History

- **Milestone 1 — Domain Research & Concept Formulation**: Researched Bangladesh land administration history (CS, SA, RS, BS surveys, e-Porcha, e-Namjari), identified forgery vulnerabilities, and designed the concept note for Problem Track P2 (Verify Deeds & Ownership).
- **Milestone 2 — Core Cryptographic Verification & Data Engine**: Implemented client-side SHA-256 fingerprinting using the Web Crypto API, designed the synthetic record schema (`src/types/index.ts`), pre-seeded realistic test records (`seedData.ts`), and implemented the ownership-consistency cross-check engine.
- **Milestone 3 — GIS Mapping & QR Verification**: Added Leaflet mapping with division filtering, implemented dynamic QR code generation, built role-based workflows (Citizen, Registry Officer, Reviewer, Admin), and created the flagged-record review queue.
- **Milestone 4 — Final Round Polish & Submission Readiness**: Completed full Bangla-first bilingual localization, implemented the 8-test automated domain test suite, integrated the transparent official LandProof Bangladesh logo, refined header navigation before and after login, and created comprehensive documentation.

---

## 14. Disclaimer

**LandProof** (SmartBhumi) is an educational and demonstration prototype developed for **LandTech 2026**. It uses synthetic demonstration data and is not an official Bangladesh government platform. Verification results must not be treated as legal proof of land ownership, title, registration, or document authenticity under the laws of Bangladesh.
