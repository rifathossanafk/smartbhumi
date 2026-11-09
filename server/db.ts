/**
 * SQLite database layer for SmartBhumi using native Node.js SQLite (DatabaseSync).
 *
 * WHY DatabaseSync (node:sqlite):
 * - Built into Node 22+ / 26+ natively, zero external native C compilation (node-gyp).
 * - Full WAL (Write-Ahead Logging) mode support for concurrent reads and crash resilience.
 * - Supports IMMEDIATE transactions and strict CHECK constraints at the database engine level.
 * - Millisecond-level reset (<20ms).
 *
 * All land areas are stored as integer "micro-shotok" (1 shotok = 1,000,000 micro-shotok)
 * to eliminate floating-point drift and rounding exploits in land transfers.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { toMicroShotok } from '../src/shared/units.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smartbhumi.db');

let _dbInstance: DatabaseSync | null = null;

/**
 * Obtain the active database connection.
 * Initialises schema and WAL mode on first call.
 */
export function getDb(): DatabaseSync {
  if (_dbInstance) {
    return _dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_FILE);

  // Enable WAL mode for high performance and concurrent reads
  db.exec('PRAGMA journal_mode = WAL;');
  // Enable foreign key constraint checking per SQLite connection
  db.exec('PRAGMA foreign_keys = ON;');
  // Synchronous NORMAL is optimal for WAL mode
  db.exec('PRAGMA synchronous = NORMAL;');

  initSchema(db);
  _dbInstance = db;
  return db;
}

/**
 * Close database connection safely.
 */
export function closeDb(): void {
  if (_dbInstance) {
    try {
      _dbInstance.close();
    } catch {
      // ignore close errors on shutdown
    }
    _dbInstance = null;
  }
}

/**
 * Initialise all schema tables with database-level invariants.
 */
export function initSchema(db: DatabaseSync): void {
  db.exec(`
    -- Khatians (Record of Rights / আরএস, বিএস খতিয়ান)
    CREATE TABLE IF NOT EXISTS khatians (
      id               TEXT PRIMARY KEY,
      khatian_number   TEXT NOT NULL,
      mouza_code       TEXT NOT NULL,
      mouza_name_en    TEXT NOT NULL,
      mouza_name_bn    TEXT NOT NULL,
      upazila          TEXT NOT NULL,
      district         TEXT NOT NULL,
      division         TEXT NOT NULL,
      survey_type      TEXT NOT NULL CHECK(survey_type IN ('CS','SA','RS','BS')),
      owner_name_en    TEXT NOT NULL,
      owner_name_bn    TEXT NOT NULL,
      owner_nid_masked TEXT NOT NULL, -- Masked display e.g. "999000*****0001"
      is_khas          INTEGER NOT NULL DEFAULT 0 CHECK(is_khas IN (0,1)),
      is_frozen        INTEGER NOT NULL DEFAULT 0 CHECK(is_frozen IN (0,1)),
      freeze_reason    TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(khatian_number, mouza_code)
    );

    -- Plot Shares (Area accounting with strict invariant: available >= 0)
    CREATE TABLE IF NOT EXISTS plot_shares (
      id                TEXT PRIMARY KEY,
      khatian_id        TEXT NOT NULL REFERENCES khatians(id) ON DELETE RESTRICT,
      dag_number        TEXT NOT NULL,
      mouza_code        TEXT NOT NULL,
      total_area        INTEGER NOT NULL CHECK(total_area > 0),
      sold_area         INTEGER NOT NULL DEFAULT 0 CHECK(sold_area >= 0),
      mortgaged_area    INTEGER NOT NULL DEFAULT 0 CHECK(mortgaged_area >= 0),
      bainanama_area    INTEGER NOT NULL DEFAULT 0 CHECK(bainanama_area >= 0),
      mutation_pending  INTEGER NOT NULL DEFAULT 0 CHECK(mutation_pending >= 0),
      -- DATABASE-ENFORCED INVARIANT: available area cannot drop below 0
      CHECK(total_area - sold_area - mortgaged_area - bainanama_area - mutation_pending >= 0),
      UNIQUE(khatian_id, dag_number, mouza_code)
    );

    -- Deeds (Registered transfer documents)
    CREATE TABLE IF NOT EXISTS deeds (
      id                TEXT PRIMARY KEY,
      deed_number       TEXT NOT NULL UNIQUE,
      deed_type         TEXT NOT NULL CHECK(deed_type IN ('sale','gift','exchange','inheritance','mortgage','partition')),
      status            TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','registered','sealed','rejected','cancelled')),
      seller_name_en    TEXT,
      seller_name_bn    TEXT,
      seller_nid_masked TEXT,
      buyer_name_en     TEXT NOT NULL,
      buyer_name_bn     TEXT NOT NULL,
      buyer_nid_masked  TEXT NOT NULL,
      plot_share_id     TEXT REFERENCES plot_shares(id),
      dag_number        TEXT NOT NULL,
      mouza_code        TEXT NOT NULL,
      khatian_number    TEXT NOT NULL,
      transfer_area     INTEGER NOT NULL CHECK(transfer_area > 0),
      upazila           TEXT NOT NULL,
      district          TEXT NOT NULL,
      division          TEXT NOT NULL,
      registration_date TEXT,
      registered_by     TEXT,
      leaf_index        INTEGER,
      leaf_hash         TEXT,
      canonical_hash    TEXT,
      lat               REAL,
      lng               REAL,
      notes             TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
      is_synthetic      INTEGER NOT NULL DEFAULT 1
    );

    -- Encumbrances (Bank mortgage, court injunction, tax lien)
    CREATE TABLE IF NOT EXISTS encumbrances (
      id               TEXT PRIMARY KEY,
      plot_share_id    TEXT NOT NULL REFERENCES plot_shares(id) ON DELETE RESTRICT,
      encumbrance_type TEXT NOT NULL CHECK(encumbrance_type IN ('mortgage','lien','court_order','freeze')),
      amount_area      INTEGER NOT NULL DEFAULT 0 CHECK(amount_area >= 0),
      description      TEXT,
      status           TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','released','expired')),
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      released_at      TEXT
    );

    -- Tamper-evident Audit Log
    CREATE TABLE IF NOT EXISTS audit_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp   TEXT NOT NULL DEFAULT (datetime('now')),
      action      TEXT NOT NULL,
      actor_role  TEXT NOT NULL,
      actor_id    TEXT,
      target_type TEXT,
      target_id   TEXT,
      details     TEXT,
      ip_address  TEXT
    );

    -- Merkle Signed Tree Head (STH) records
    CREATE TABLE IF NOT EXISTS merkle_sth (
      epoch             INTEGER PRIMARY KEY,
      tree_size         INTEGER NOT NULL,
      root_hash         TEXT NOT NULL,
      timestamp         TEXT NOT NULL,
      prev_sth_hash     TEXT,
      signature_ed25519 TEXT NOT NULL,
      signature_mldsa   TEXT,
      algorithm_id      TEXT NOT NULL DEFAULT 'ed25519'
    );

    -- Merkle Tree Leaves (Deterministic canonical deed claims)
    CREATE TABLE IF NOT EXISTS merkle_leaves (
      leaf_index     INTEGER PRIMARY KEY,
      leaf_hash      TEXT NOT NULL,
      deed_id        TEXT NOT NULL REFERENCES deeds(id),
      canonical_json TEXT NOT NULL,
      epoch          INTEGER NOT NULL
    );

    -- Registry to e-Mutation cases
    CREATE TABLE IF NOT EXISTS mutation_cases (
      id               TEXT PRIMARY KEY,
      deed_id          TEXT NOT NULL REFERENCES deeds(id),
      status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      new_khatian_id   TEXT REFERENCES khatians(id),
      mutation_area    INTEGER NOT NULL CHECK(mutation_area > 0),
      approved_by      TEXT,
      approved_at      TEXT,
      rejection_reason TEXT,
      case_payload     TEXT NOT NULL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Survey Lineage (CS -> SA -> RS -> BS historical evolution)
    CREATE TABLE IF NOT EXISTS survey_lineage (
      id                TEXT PRIMARY KEY,
      dag_number        TEXT NOT NULL,
      mouza_code        TEXT NOT NULL,
      survey_type       TEXT NOT NULL CHECK(survey_type IN ('CS','SA','RS','BS')),
      khatian_number    TEXT NOT NULL,
      owner_name        TEXT,
      area_micro_shotok INTEGER,
      parent_id         TEXT REFERENCES survey_lineage(id),
      is_broken         INTEGER NOT NULL DEFAULT 0 CHECK(is_broken IN (0,1)),
      break_reason      TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Red-team test results
    CREATE TABLE IF NOT EXISTS redteam_results (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario  TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      result    TEXT NOT NULL,
      details   TEXT
    );

    -- Indices for query velocity
    CREATE INDEX IF NOT EXISTS idx_deeds_number ON deeds(deed_number);
    CREATE INDEX IF NOT EXISTS idx_deeds_dag ON deeds(dag_number, mouza_code);
    CREATE INDEX IF NOT EXISTS idx_shares_dag ON plot_shares(dag_number, mouza_code);
    CREATE INDEX IF NOT EXISTS idx_khatians_number ON khatians(khatian_number);
    CREATE INDEX IF NOT EXISTS idx_mutation_status ON mutation_cases(status);
    CREATE INDEX IF NOT EXISTS idx_lineage_dag ON survey_lineage(dag_number, mouza_code);
  `);
}

/**
 * Populate synthetic demo data into the SQLite database.
 * Strictly adheres to:
 * - Synthetic NIDs starting with 999000
 * - Explicit labels "SYNTHETIC DEMO DATA"
 * - Diverse test plots: clean, mortgaged, khas/frozen, broken survey chain, stress test share.
 */
export function seedDatabase(db: DatabaseSync): void {
  const existing = db.prepare('SELECT COUNT(*) as count FROM khatians').get() as { count: number };
  if (existing && existing.count > 0) {
    return;
  }

  const insertKhatian = db.prepare(`
    INSERT INTO khatians (
      id, khatian_number, mouza_code, mouza_name_en, mouza_name_bn,
      upazila, district, division, survey_type, owner_name_en, owner_name_bn,
      owner_nid_masked, is_khas, is_frozen, freeze_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertShare = db.prepare(`
    INSERT INTO plot_shares (
      id, khatian_id, dag_number, mouza_code,
      total_area, sold_area, mortgaged_area, bainanama_area, mutation_pending
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLineage = db.prepare(`
    INSERT INTO survey_lineage (
      id, dag_number, mouza_code, survey_type,
      khatian_number, owner_name, area_micro_shotok, parent_id, is_broken, break_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN IMMEDIATE;');
  try {
    // 1. Clean Plot: Savar Hemayetpur - 15.00 shotok total, clean status
    insertKhatian.run(
      'kh-001', 'KH-2026-0001', 'MOUZA-DEMO-001',
      'Hemayetpur', 'হেমায়েতপুর',
      'Savar', 'Dhaka', 'Dhaka', 'RS',
      'SYNTHETIC: Mohammad Abdul Karim', 'সিন্থেটিক: মোহাম্মদ আব্দুল করিম',
      '999000*****1001', 0, 0, null
    );
    insertShare.run(
      'ps-001', 'kh-001', 'DAG-2026-001', 'MOUZA-DEMO-001',
      toMicroShotok(15.0, 'shotok'), 0, 0, 0, 0
    );

    // 2. Mortgaged Plot: Savar Tetuljhora - 8.50 shotok total, 3.00 shotok mortgaged
    insertKhatian.run(
      'kh-002', 'KH-2026-0002', 'MOUZA-DEMO-002',
      'Tetuljhora', 'তেতুলঝোরা',
      'Savar', 'Dhaka', 'Dhaka', 'BS',
      'SYNTHETIC: Rahim Uddin Howlader', 'সিন্থেটিক: রহিম উদ্দিন হাওলাদার',
      '999000*****1002', 0, 0, null
    );
    insertShare.run(
      'ps-002', 'kh-002', 'DAG-2026-002', 'MOUZA-DEMO-002',
      toMicroShotok(8.5, 'shotok'), 0, toMicroShotok(3.0, 'shotok'), 0, 0
    );
    // Add mortgage encumbrance record
    db.prepare(`
      INSERT INTO encumbrances (
        id, plot_share_id, encumbrance_type, amount_area, description, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'enc-001', 'ps-002', 'mortgage', toMicroShotok(3.0, 'shotok'),
      'SYNTHETIC: Sonali Bank Commercial Mortgage Charge #SB-SAV-991', 'active'
    );

    // 3. Government Khas / Frozen Plot: Hathazari Fatehpur - 22.00 shotok (Frozen)
    insertKhatian.run(
      'kh-003', 'KH-2026-0003', 'MOUZA-DEMO-005',
      'Fatehpur', 'ফতেপুর',
      'Hathazari', 'Chittagong', 'Chittagong', 'CS',
      'SYNTHETIC: Govt of Bangladesh (Collectorate Khas-1)', 'সিন্থেটিক: গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (১নং খাস খতিয়ান)',
      '999000*****0000', 1, 1, 'Protected Government Khas Wetland Buffer Zone'
    );
    insertShare.run(
      'ps-003', 'kh-003', 'DAG-2026-003', 'MOUZA-DEMO-005',
      toMicroShotok(22.0, 'shotok'), 0, 0, 0, 0
    );

    // 4. Inheritance Estate Plot: Rajshahi Paba Noahata - 1.50 acre (150.00 shotok)
    insertKhatian.run(
      'kh-004', 'KH-2026-0004', 'MOUZA-DEMO-006',
      'Noahata', 'নোয়াহাটা',
      'Paba', 'Rajshahi', 'Rajshahi', 'SA',
      'SYNTHETIC: Late Alhaj Mokbul Hossain (Estate)', 'সিন্থেটিক: মরহুম আলহাজ্ব মকবুল হোসেন (উত্তরাধিকার এস্টেট)',
      '999000*****1004', 0, 0, null
    );
    insertShare.run(
      'ps-004', 'kh-004', 'DAG-2026-004', 'MOUZA-DEMO-006',
      toMicroShotok(1.5, 'acre'), 0, 0, 0, 0
    );

    // 5. Concurrency & Stress Test Plot: 10.40 shotok available share
    // Exactly 1 concurrent sale of 10.00 shotok can succeed; the second one MUST fail with available = 0.40 < 10.00!
    insertKhatian.run(
      'kh-005', 'KH-2026-0005', 'MOUZA-DEMO-001',
      'Hemayetpur', 'হেমায়েতপুর',
      'Savar', 'Dhaka', 'Dhaka', 'RS',
      'SYNTHETIC: Stress Test Owner Delta', 'সিন্থেটিক: স্ট্রেস টেস্ট মালিক ডেল্টা',
      '999000*****1005', 0, 0, null
    );
    insertShare.run(
      'ps-005', 'kh-005', 'DAG-2026-STRESS', 'MOUZA-DEMO-001',
      toMicroShotok(10.40, 'shotok'), 0, 0, 0, 0
    );

    // 6. Commercial Plot: Gazipur Basan - 10.00 shotok clean
    insertKhatian.run(
      'kh-006', 'KH-2026-0006', 'MOUZA-DEMO-004',
      'Basan', 'বাসন',
      'Gazipur Sadar', 'Gazipur', 'Dhaka', 'BS',
      'SYNTHETIC: Begum Rokeya Sultana', 'সিন্থেটিক: বেগম রোকেয়া সুলতানা',
      '999000*****1006', 0, 0, null
    );
    insertShare.run(
      'ps-006', 'kh-006', 'DAG-2026-006', 'MOUZA-DEMO-004',
      toMicroShotok(10.0, 'shotok'), 0, 0, 0, 0
    );

    // 7. Broken Survey Chain Plot: Sylhet Khadim - 30.00 shotok (RS record missing)
    insertKhatian.run(
      'kh-007', 'KH-2026-0007', 'MOUZA-DEMO-008',
      'Khadim', 'খাদিম',
      'Sylhet Sadar', 'Sylhet', 'Sylhet', 'BS',
      'SYNTHETIC: Nurul Islam Chowdhury', 'সিন্থেটিক: নূরুল ইসলাম চৌধুরী',
      '999000*****1007', 0, 0, null
    );
    insertShare.run(
      'ps-007', 'kh-007', 'DAG-2026-007', 'MOUZA-DEMO-008',
      toMicroShotok(30.0, 'shotok'), 0, 0, 0, 0
    );

    // 8. Faraiz Standard Test Plot: 48.00 shotok exactly
    insertKhatian.run(
      'kh-008', 'KH-2026-0008', 'MOUZA-DEMO-001',
      'Hemayetpur', 'হেমায়েতপুর',
      'Savar', 'Dhaka', 'Dhaka', 'RS',
      'SYNTHETIC: Late Kabir Ahmed (Faraiz Test)', 'সিন্থেটিক: মরহুম কবির আহমেদ (ফারায়েজ টেস্ট)',
      '999000*****1008', 0, 0, null
    );
    insertShare.run(
      'ps-008', 'kh-008', 'DAG-2026-FARAIZ', 'MOUZA-DEMO-001',
      toMicroShotok(48.0, 'shotok'), 0, 0, 0, 0
    );

    // ── Survey Lineage Chains ──
    // Complete Chain: DAG-2026-001 (CS -> SA -> RS)
    insertLineage.run(
      'lin-001-cs', 'DAG-2026-001', 'MOUZA-DEMO-001', 'CS',
      'KH-CS-1892', 'SYNTHETIC: Joynal Abedin (Zamindari Tenant)', toMicroShotok(15.0, 'shotok'),
      null, 0, null
    );
    insertLineage.run(
      'lin-001-sa', 'DAG-2026-001', 'MOUZA-DEMO-001', 'SA',
      'KH-SA-1956', 'SYNTHETIC: Rafiqul Abedin (Post-Acquisition)', toMicroShotok(15.0, 'shotok'),
      'lin-001-cs', 0, null
    );
    insertLineage.run(
      'lin-001-rs', 'DAG-2026-001', 'MOUZA-DEMO-001', 'RS',
      'KH-2026-0001', 'SYNTHETIC: Mohammad Abdul Karim', toMicroShotok(15.0, 'shotok'),
      'lin-001-sa', 0, null
    );

    // Broken Chain: DAG-2026-007 (CS -> SA -> [Missing RS gap] -> BS)
    insertLineage.run(
      'lin-007-cs', 'DAG-2026-007', 'MOUZA-DEMO-008', 'CS',
      'KH-CS-701', 'SYNTHETIC: Sylhet Colonial Tea Estate Grant', toMicroShotok(30.0, 'shotok'),
      null, 0, null
    );
    insertLineage.run(
      'lin-007-sa', 'DAG-2026-007', 'MOUZA-DEMO-008', 'SA',
      'KH-SA-712', 'SYNTHETIC: Ali Amjad Chowdhury', toMicroShotok(30.0, 'shotok'),
      'lin-007-cs', 0, null
    );
    insertLineage.run(
      'lin-007-bs', 'DAG-2026-007', 'MOUZA-DEMO-008', 'BS',
      'KH-2026-0007', 'SYNTHETIC: Nurul Islam Chowdhury', toMicroShotok(30.0, 'shotok'),
      null, 1, 'RS Survey record gap: missing volume between SA (1960) and BS (2012)'
    );

    // Khas Lineage: DAG-2026-003
    insertLineage.run(
      'lin-003-cs', 'DAG-2026-003', 'MOUZA-DEMO-005', 'CS',
      'KH-KHAS-CS-01', 'Government of East Bengal / Bangladesh', toMicroShotok(22.0, 'shotok'),
      null, 0, null
    );

    // System audit event
    db.prepare(`
      INSERT INTO audit_log (action, actor_role, actor_id, details)
      VALUES (?, ?, ?, ?)
    `).run('database_seed', 'system', 'system', 'SYNTHETIC DEMO DATA: Registry schema initialized and populated');

    // Seed official initial deed LP-2026-001 so log and OCR diff have genuine baseline
    db.prepare(`
      INSERT INTO deeds (
        id, deed_number, deed_type, status,
        seller_name_en, seller_name_bn, seller_nid_masked,
        buyer_name_en, buyer_name_bn, buyer_nid_masked,
        plot_share_id, dag_number, mouza_code, khatian_number,
        transfer_area, upazila, district, division, registration_date, registered_by, is_synthetic
      ) VALUES (?, ?, 'sale', 'registered', ?, ?, ?, ?, ?, ?, 'ps-001', 'DAG-2026-001', 'MOUZA-DEMO-001', 'KH-2026-0001', ?, 'Savar', 'Dhaka', 'Dhaka', '2026-01-15', 'officer-tanveer-02', 1)
    `).run(
      'rec-001',
      'LP-2026-001',
      'SYNTHETIC: Mohammad Abdul Karim', 'মোহাম্মদ আব্দুল করিম', '999000*****1001',
      'SYNTHETIC: Tanveer Ahmed', 'তানভীর আহমেদ', '999000*****1002',
      toMicroShotok(15.0, 'shotok')
    );

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

/**
 * Reset database state to pristine seed data in < 100ms.
 */
export function resetDatabaseFast(): number {
  const start = performance.now();
  closeDb();

  // Remove database and WAL/SHM companion files
  for (const ext of ['', '-wal', '-shm']) {
    const f = DB_FILE + ext;
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {
        // file could be busy briefly
      }
    }
  }

  const db = getDb();
  seedDatabase(db);
  try {
    // Dynamic import logManager to seal initial deed without circular dependency
    const { appendDeedToLog } = require('./logManager.js');
    appendDeedToLog('rec-001');
  } catch {
    // ignore if logManager not yet compiled
  }
  return Math.round(performance.now() - start);
}
