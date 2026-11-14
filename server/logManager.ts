/**
 * Merkle Transparency Log Manager for SmartBhumi.
 *
 * Coordinates:
 * - Deterministic canonical JSON serialization of deed claims
 * - RFC 9162 Merkle tree construction (0x00 leaf / 0x01 node prefixes)
 * - Inclusion proof generation for any deed leaf index
 * - Signed Tree Head (STH) creation with Ed25519 + ML-DSA-65 signatures
 * - QR payload generation under 700 bytes
 */

import { getDb, setLogAppender } from './db.js';
import { canonicalize } from '../src/shared/canonicalize.js';
import {
  leafHashFromString,
  computeRootHex,
  inclusionProof,
  type ProofStep,
} from '../src/crypto/merkle.js';
import {
  signSTH,
  getPublicKeys,
  type STHSignatureEnvelope,
} from './crypto.js';
import {
  encodeQRPayload,
  type CompactDeedClaims,
  type QRPayload,
} from '../src/crypto/offlineVerifier.js';
import { hexToBytes } from '@noble/hashes/utils';

export interface DeedRecord {
  id: string;
  deed_number: string;
  deed_type: string;
  status: string;
  seller_name_en: string | null;
  seller_name_bn: string | null;
  seller_nid_masked: string | null;
  buyer_name_en: string;
  buyer_name_bn: string;
  buyer_nid_masked: string;
  dag_number: string;
  mouza_code: string;
  khatian_number: string;
  transfer_area: number; // micro-shotok
  registration_date: string;
  canonical_hash?: string;
  leaf_index?: number;
}

export interface STHData {
  epoch: number;
  treeSize: number;
  rootHash: string;
  timestamp: string;
  prevSthHash: string | null;
  signatureEd25519: string;
  signatureMlDsa65?: string;
  algorithmId: string;
}

/**
 * Build the canonical claim dictionary for a deed.
 * Keys are strictly ordered, numbers as standard digits, strings NFC normalized.
 */
export function buildDeedCanonicalClaims(deed: {
  deed_number: string;
  deed_type: string;
  khatian_number: string;
  dag_number: string;
  mouza_code: string;
  transfer_area: number;
  buyer_nid_masked: string;
  registration_date: string;
  canonical_hash?: string;
}): CompactDeedClaims {
  return {
    d: deed.deed_number,
    t: deed.deed_type,
    k: deed.khatian_number,
    g: deed.dag_number,
    m: deed.mouza_code,
    a: deed.transfer_area,
    b: deed.buyer_nid_masked,
    dt: deed.registration_date,
    ch: deed.canonical_hash,
  };
}

/**
 * Append a registered deed to the Merkle Transparency Log.
 * Calculates leaf hash, updates Merkle tree, updates Signed Tree Head (STH).
 */
export function appendDeedToLog(deedId: string): {
  leafIndex: number;
  leafHash: string;
  rootHash: string;
  epoch: number;
} {
  const db = getDb();

  const deed = db.prepare('SELECT * FROM deeds WHERE id = ?').get(deedId) as any;
  if (!deed) {
    throw new Error(`Deed not found: ${deedId}`);
  }

  // 1. Determine next leaf index
  const lastLeaf = db.prepare('SELECT MAX(leaf_index) as max_idx FROM merkle_leaves').get() as { max_idx: number | null };
  const leafIndex = (lastLeaf && lastLeaf.max_idx !== null) ? lastLeaf.max_idx + 1 : 0;

  // 2. Build canonical claims and deterministic leaf hash
  const compactClaims = buildDeedCanonicalClaims(deed);
  const canonicalJson = canonicalize(compactClaims);
  const leafHash = leafHashFromString(canonicalJson);

  // 3. Determine current epoch
  const lastSTH = db.prepare('SELECT * FROM merkle_sth ORDER BY epoch DESC LIMIT 1').get() as any;
  const epoch = lastSTH ? lastSTH.epoch + 1 : 1;
  const prevSthHash = lastSTH ? lastSTH.root_hash : '0'.repeat(64);

  // 4. Insert leaf into database
  db.prepare(`
    INSERT INTO merkle_leaves (leaf_index, leaf_hash, deed_id, canonical_json, epoch)
    VALUES (?, ?, ?, ?, ?)
  `).run(leafIndex, leafHash, deedId, canonicalJson, epoch);

  // 5. Query all leaves to compute new Merkle root
  const allLeaves = db.prepare('SELECT leaf_hash FROM merkle_leaves ORDER BY leaf_index ASC').all() as { leaf_hash: string }[];
  const rootHash = computeRootHex(allLeaves.map(l => l.leaf_hash));
  const timestamp = new Date().toISOString();

  // 6. Sign STH with dual signatures (Ed25519 + ML-DSA-65); treeSize is part
  // of the signed message so the QR's leaf index is cryptographically bound
  const env: STHSignatureEnvelope = signSTH(epoch, rootHash, timestamp, allLeaves.length);

  db.prepare(`
    INSERT INTO merkle_sth (
      epoch, tree_size, root_hash, timestamp, prev_sth_hash,
      signature_ed25519, signature_mldsa, algorithm_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    epoch,
    allLeaves.length,
    rootHash,
    timestamp,
    prevSthHash,
    env.signatureEd25519,
    env.signatureMlDsa65 || null,
    env.algorithmId
  );

  // 7. Update deed record with leaf metadata and mark sealed
  db.prepare(`
    UPDATE deeds
    SET leaf_index = ?, leaf_hash = ?, status = 'sealed', updated_at = datetime('now')
    WHERE id = ?
  `).run(leafIndex, leafHash, deedId);

  return {
    leafIndex,
    leafHash,
    rootHash,
    epoch,
  };
}

/**
 * Retrieve the latest Signed Tree Head.
 */
export function getLatestSTH(): STHData | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM merkle_sth ORDER BY epoch DESC LIMIT 1').get() as any;
  if (!row) return null;

  return {
    epoch: row.epoch,
    treeSize: row.tree_size,
    rootHash: row.root_hash,
    timestamp: row.timestamp,
    prevSthHash: row.prev_sth_hash,
    signatureEd25519: row.signature_ed25519,
    signatureMlDsa65: row.signature_mldsa || undefined,
    algorithmId: row.algorithm_id,
  };
}

/**
 * Generate inclusion proof and full QR payload for a deed by ID or deed number.
 */
export function generateDeedQRPayload(deedIdOrNumber: string): {
  payload: QRPayload;
  qrString: string;
  byteLength: number;
} {
  const db = getDb();

  const deed = db.prepare(`
    SELECT * FROM deeds WHERE id = ? OR deed_number = ?
  `).get(deedIdOrNumber, deedIdOrNumber) as any;

  if (!deed) {
    throw new Error(`Deed not found: ${deedIdOrNumber}`);
  }

  if (deed.leaf_index === null || deed.leaf_index === undefined) {
    throw new Error(`Deed ${deed.deed_number} has not been sealed into the Merkle log yet`);
  }

  // Get all leaves up to the epoch this deed was sealed in, or all current leaves
  const allLeaves = db.prepare('SELECT leaf_hash FROM merkle_leaves ORDER BY leaf_index ASC').all() as { leaf_hash: string }[];
  const leafHashesBytes = allLeaves.map(l => hexToBytes(l.leaf_hash));

  // Generate audit path
  const proof = inclusionProof(leafHashesBytes, deed.leaf_index);

  const sth = getLatestSTH();
  if (!sth) {
    throw new Error('No Signed Tree Head available in system');
  }

  const compactClaims = buildDeedCanonicalClaims(deed);

  const payload: QRPayload = {
    v: 1,
    alg: 'ed25519',
    ep: sth.epoch,
    idx: deed.leaf_index,
    sz: sth.treeSize,
    claims: compactClaims,
    proof,
    root: sth.rootHash,
    ts: sth.timestamp,
    sig: sth.signatureEd25519,
  };

  const qrString = encodeQRPayload(payload);
  const byteLength = new TextEncoder().encode(qrString).length;

  return {
    payload,
    qrString,
    byteLength,
  };
}

// Register auto-sealer for pristine DB resets
setLogAppender(appendDeedToLog);


