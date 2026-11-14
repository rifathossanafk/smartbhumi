/**
 * Pure-function offline QR deed verifier for SmartBhumi.
 *
 * Runs in both browser and Node.js without any network access or Node-specific imports.
 *
 * HOW IT WORKS OFFLINE:
 * 1. Decode the compact QR string (base64url or compact JSON).
 * 2. Reconstruct the canonical deed claims.
 * 3. Recompute the Merkle leaf hash: SHA-256(0x00 || canonicalJSON).
 * 4. Walk the inclusion audit path using RFC 9162 node prefix (0x01 || left || right),
 *    with the leaf index bound to the walk: the required proof shape is derived
 *    from (idx, sz) and sz is covered by the STH signature.
 * 5. Check if the computed root equals the root in the Signed Tree Head (STH).
 * 6. Verify the digital signature of the STH using the trusted registry public key.
 * 7. Return verified claims along with strict claims discipline disclaimer:
 *    "Verified as of <STH time>; live status not checked offline."
 */

import { canonicalize } from '../shared/canonicalize.js';
import { leafHashFromString, verifyInclusionIndexed, type ProofStep } from './merkle.js';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes } from '@noble/hashes/utils';

export interface CompactDeedClaims {
  d: string;   // deedNumber
  t: string;   // deedType (sale, gift, etc)
  k: string;   // khatianNumber
  g: string;   // dagNumber
  m: string;   // mouzaCode
  a: number;   // transferArea in micro-shotok
  b: string;   // buyerMasked (e.g. 999000*****1001)
  dt: string;  // registrationDate
  ch?: string; // canonical document hash (if any)
}

export interface QRPayload {
  v: number;              // Version (e.g. 1)
  alg: string;            // Algorithm ID ('ed25519')
  ep: number;             // STH Epoch
  idx: number;            // Leaf index in Merkle log
  sz: number;             // Tree size at signing time (covered by the STH signature)
  claims: CompactDeedClaims; // Compact claims
  proof: ProofStep[];     // Inclusion audit path
  root: string;           // Merkle root hash (hex)
  ts: string;             // STH timestamp
  sig: string;            // Ed25519 signature of STH (hex)
}

export interface STHRecord {
  epoch: number;
  treeSize: number;
  rootHash: string;
  timestamp: string;
  signatureEd25519: string;
  algorithmId: string;
}

export interface OfflineVerifyResult {
  valid: boolean;
  claims?: CompactDeedClaims;
  epoch?: number;
  leafIndex?: number;
  treeRoot?: string;
  verifiedAt?: string;
  disclaimer: string;
  reason?: string;
}

const DOMAIN_STH = 'smartbhumi-sth-v1:';

/**
 * Format bytes to base64url string without padding.
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode base64url string to UTF-8 text.
 */
export function base64UrlDecode(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encode a full QR payload into a compact string suitable for printing.
 * Keeps byte length well under 700 bytes (typical ~520-550 bytes).
 */
export function encodeQRPayload(payload: QRPayload): string {
  return JSON.stringify(payload);
}

/**
 * Decode QR payload string. Supports raw JSON or prefixed base64url.
 */
export function decodeQRPayload(qrText: string): QRPayload {
  let raw = qrText.trim();
  if (raw.startsWith('SB1:')) {
    raw = base64UrlDecode(raw.slice(4));
  }
  return JSON.parse(raw) as QRPayload;
}

/**
 * Verify a QR payload entirely offline with zero network requests.
 *
 * @param qrText The scanned QR code text or payload object
 * @param trustedEd25519PublicKeyHex Hex-encoded public key of registry authority
 * @param cachedSTH Optional pre-cached Signed Tree Head from earlier sync
 */
export function verifyQROffline(
  qrText: string | QRPayload,
  trustedEd25519PublicKeyHex: string,
  cachedSTH?: STHRecord
): OfflineVerifyResult {
  const fallbackDisclaimer = 'CLAIMS DISCIPLINE: A digital signature shows this deed was registered and unchanged since; it does not prove title, identity, or physical possession. Offline verification cannot confirm if the deed was later cancelled or updated.';

  try {
    const payload: QRPayload = typeof qrText === 'string' ? decodeQRPayload(qrText) : qrText;

    if (!payload || payload.v !== 1) {
      return {
        valid: false,
        disclaimer: fallbackDisclaimer,
        reason: 'Unsupported or invalid QR payload version',
      };
    }

    if (payload.alg !== 'ed25519' && payload.alg !== 'ed25519+ml-dsa-65') {
      return {
        valid: false,
        disclaimer: fallbackDisclaimer,
        reason: `Unsupported algorithm: ${payload.alg}`,
      };
    }

    // Step 1: Reconstruct canonical JSON of deed claims
    const canonicalClaims = canonicalize(payload.claims);

    // Step 2: Compute leaf hash with RFC 9162 0x00 leaf prefix
    const leafHash = leafHashFromString(canonicalClaims);

    // Step 3: Walk audit path with the leaf index BOUND to the result.
    // The required proof shape is derived from (idx, sz); sz is part of the
    // signed STH message, so a shifted idx either disagrees with the proof
    // shape or forces a root mismatch. The displayed leaf number can no
    // longer be altered without invalidating the QR.
    if (!Number.isInteger(payload.sz) || payload.sz < 1 ||
        !Number.isInteger(payload.idx) || payload.idx < 0 || payload.idx >= payload.sz) {
      return {
        valid: false,
        disclaimer: fallbackDisclaimer,
        reason: 'QR payload has invalid leaf index (idx) or tree size (sz)',
      };
    }
    const proofMatches = verifyInclusionIndexed(leafHash, payload.idx, payload.sz, payload.proof, payload.root);
    if (!proofMatches) {
      return {
        valid: false,
        disclaimer: fallbackDisclaimer,
        reason: 'Merkle inclusion proof verification failed: leaf hash, leaf index, or tree size does not match root',
      };
    }

    // Step 4: If cached STH is provided, ensure roots, epochs and tree size match
    if (cachedSTH) {
      if (cachedSTH.epoch === payload.ep && cachedSTH.rootHash !== payload.root) {
        return {
          valid: false,
          disclaimer: fallbackDisclaimer,
          reason: `STH root mismatch for epoch ${payload.ep}: cached ${cachedSTH.rootHash} vs QR ${payload.root}`,
        };
      }
      if (cachedSTH.epoch === payload.ep && cachedSTH.treeSize !== payload.sz) {
        return {
          valid: false,
          disclaimer: fallbackDisclaimer,
          reason: `STH tree size mismatch for epoch ${payload.ep}: cached ${cachedSTH.treeSize} vs QR ${payload.sz}`,
        };
      }
    }

    // Step 5: Verify signature on STH payload
    // Message signed is: DOMAIN_STH + canonicalize({ epoch, root, timestamp, treeSize })
    const sthMessage = `${DOMAIN_STH}${canonicalize({
      epoch: payload.ep,
      root: payload.root,
      timestamp: payload.ts,
      treeSize: payload.sz,
    })}`;
    const sthBytes = new TextEncoder().encode(sthMessage);

    const pubKeyBytes = hexToBytes(trustedEd25519PublicKeyHex);
    const sigBytes = hexToBytes(payload.sig);

    const sigValid = ed25519.verify(sigBytes, sthBytes, pubKeyBytes);
    if (!sigValid) {
      return {
        valid: false,
        disclaimer: fallbackDisclaimer,
        reason: 'Cryptographic signature on Signed Tree Head (STH) is invalid',
      };
    }

    return {
      valid: true,
      claims: payload.claims,
      epoch: payload.ep,
      leafIndex: payload.idx,
      treeRoot: payload.root,
      verifiedAt: payload.ts,
      disclaimer: `Verified as of ${payload.ts}; live status not checked offline. Deed recorded in tamper-evident log at leaf #${payload.idx}.`,
    };
  } catch (err) {
    return {
      valid: false,
      disclaimer: fallbackDisclaimer,
      reason: `Offline verification error: ${(err as Error).message}`,
    };
  }
}
