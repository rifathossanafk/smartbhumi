/**
 * RFC 9162-style Merkle Transparency Log for SmartBhumi.
 *
 * WHY a Merkle tree:
 *   A Merkle tree lets anyone verify that a specific deed is included
 *   in the official log without downloading the entire database.
 *   If anyone tampers with a historical record, the root hash changes
 *   and the tampering is detectable.
 *
 * Structure (RFC 9162 Certificate Transparency):
 *   - Leaf: SHA-256(0x00 || data)  — the 0x00 prefix distinguishes leaves
 *   - Node: SHA-256(0x01 || left || right)  — the 0x01 prefix distinguishes nodes
 *   - This prevents second-preimage attacks where someone could create
 *     a fake leaf that looks like an internal node.
 *
 * This module is pure functions (no database, no I/O) so it can be
 * used in both the server and the browser for offline verification.
 */

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

/** Prefix byte for leaf nodes (RFC 9162) */
const LEAF_PREFIX = new Uint8Array([0x00]);
/** Prefix byte for internal nodes (RFC 9162) */
const NODE_PREFIX = new Uint8Array([0x01]);

/**
 * Compute a leaf hash: SHA-256(0x00 || data).
 */
export function leafHash(data: Uint8Array): Uint8Array {
  const buf = new Uint8Array(1 + data.length);
  buf.set(LEAF_PREFIX, 0);
  buf.set(data, 1);
  return sha256(buf);
}

/**
 * Compute a leaf hash from a UTF-8 string (canonical JSON).
 */
export function leafHashFromString(canonicalJson: string): string {
  const bytes = new TextEncoder().encode(canonicalJson);
  return bytesToHex(leafHash(bytes));
}

/**
 * Compute an internal node hash: SHA-256(0x01 || left || right).
 */
export function nodeHash(left: Uint8Array, right: Uint8Array): Uint8Array {
  const buf = new Uint8Array(1 + left.length + right.length);
  buf.set(NODE_PREFIX, 0);
  buf.set(left, 1);
  buf.set(right, 1 + left.length);
  return sha256(buf);
}

/**
 * Compute the Merkle root from a list of leaf hashes.
 *
 * For non-power-of-2 sizes, we use the RFC 9162 algorithm:
 * split at the largest power of 2 less than n.
 */
export function computeRoot(leafHashes: Uint8Array[]): Uint8Array {
  const n = leafHashes.length;
  if (n === 0) {
    // Empty tree: root is SHA-256 of empty string
    return sha256(new Uint8Array(0));
  }
  if (n === 1) {
    return leafHashes[0];
  }
  // Split at largest power of 2 less than n
  const k = largestPowerOf2LessThan(n);
  const left = computeRoot(leafHashes.slice(0, k));
  const right = computeRoot(leafHashes.slice(k));
  return nodeHash(left, right);
}

/**
 * Compute the Merkle root from hex-encoded leaf hashes.
 */
export function computeRootHex(leafHashHexes: string[]): string {
  const leaves = leafHashHexes.map(h => hexToBytes(h));
  return bytesToHex(computeRoot(leaves));
}

/**
 * Generate an inclusion proof (audit path) for leaf at `index`
 * in a tree of `n` leaves.
 *
 * Returns array of { hash, direction } where direction is 'left' or 'right',
 * indicating which side the proof node is on.
 */
export interface ProofStep {
  hash: string; // hex
  direction: 'left' | 'right';
}

export function inclusionProof(
  leafHashes: Uint8Array[],
  index: number
): ProofStep[] {
  const n = leafHashes.length;
  if (n <= 1) return [];
  if (index < 0 || index >= n) throw new Error(`Index ${index} out of range [0, ${n})`);

  const k = largestPowerOf2LessThan(n);

  if (index < k) {
    // Leaf is in the left subtree
    const proof = inclusionProof(leafHashes.slice(0, k), index);
    const rightRoot = computeRoot(leafHashes.slice(k));
    proof.push({ hash: bytesToHex(rightRoot), direction: 'right' });
    return proof;
  } else {
    // Leaf is in the right subtree
    const proof = inclusionProof(leafHashes.slice(k), index - k);
    const leftRoot = computeRoot(leafHashes.slice(0, k));
    proof.push({ hash: bytesToHex(leftRoot), direction: 'left' });
    return proof;
  }
}

/**
 * Verify an inclusion proof offline.
 *
 * Given a leaf hash, an audit path, and a root hash,
 * verify that the leaf is included in the tree.
 *
 * This is a PURE FUNCTION — no database or network needed.
 */
export function verifyInclusion(
  leafHashHex: string,
  proof: ProofStep[],
  rootHashHex: string
): boolean {
  let current = hexToBytes(leafHashHex);

  for (const step of proof) {
    const sibling = hexToBytes(step.hash);
    if (step.direction === 'right') {
      // sibling is on the right → current is on the left
      current = nodeHash(current, sibling);
    } else {
      // sibling is on the left → current is on the right
      current = nodeHash(sibling, current);
    }
  }

  return bytesToHex(current) === rootHashHex;
}

/**
 * Largest power of 2 that is strictly less than n.
 * Example: largestPowerOf2LessThan(5) = 4
 *          largestPowerOf2LessThan(8) = 4
 *          largestPowerOf2LessThan(1) = error
 */
function largestPowerOf2LessThan(n: number): number {
  if (n <= 1) throw new Error('n must be > 1');
  let k = 1;
  while (k * 2 < n) k *= 2;
  return k;
}

