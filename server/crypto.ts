/**
 * Cryptographic signing and verification for SmartBhumi.
 *
 * Implements:
 * - Ed25519 classical signatures (always active)
 * - ML-DSA-65 NIST-standardized Post-Quantum digital signatures (behind ENABLE_PQC, default true)
 * - Domain separation ('smartbhumi-sth-v1:')
 * - Fail-closed verification and anti-downgrade checks.
 */

import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { canonicalize } from '../src/shared/canonicalize.js';

// ML-DSA-65 from noble post-quantum
let mlDsa65Module: any = null;

export const ALG_ED25519 = 'ed25519' as const;
export const ALG_MLDSA65 = 'ml-dsa-65' as const;
export const ALG_DUAL = 'ed25519+ml-dsa-65' as const;

export const ENABLE_PQC = process.env.ENABLE_PQC !== 'false'; // default true

export const DOMAIN_STH = 'smartbhumi-sth-v1:';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface DualKeyPair {
  ed25519: KeyPair;
  mlDsa65?: KeyPair;
}

export interface STHSignatureEnvelope {
  algorithmId: string;
  signatureEd25519: string; // hex (64 bytes = 128 chars)
  signatureMlDsa65?: string; // hex (3309 bytes = 6618 chars)
}

let _keys: DualKeyPair | null = null;

/**
 * Initialize key pairs on server startup.
 */
export async function initKeys(): Promise<DualKeyPair> {
  if (_keys) return _keys;

  const edPriv = ed25519.utils.randomPrivateKey();
  const edPub = ed25519.getPublicKey(edPriv);

  _keys = {
    ed25519: { publicKey: edPub, privateKey: edPriv },
  };

  if (ENABLE_PQC) {
    try {
      const pq = await import('@noble/post-quantum/ml-dsa');
      mlDsa65Module = pq.ml_dsa65;
      const seed = new Uint8Array(32);
      crypto.getRandomValues(seed);
      const mlKeys = mlDsa65Module.keygen(seed);
      _keys.mlDsa65 = {
        publicKey: mlKeys.publicKey,
        privateKey: mlKeys.secretKey,
      };
      console.log('[crypto] ML-DSA-65 Post-Quantum keys successfully generated');
    } catch (err) {
      console.warn('[crypto] ML-DSA-65 keygen warning:', (err as Error).message);
    }
  }

  console.log('[crypto] Ed25519 authority keys initialized');
  return _keys;
}

/**
 * Retrieve public keys in hex format.
 */
export function getPublicKeys(): { ed25519: string; mlDsa65?: string; algorithmId: string } {
  if (!_keys) throw new Error('Authority keys not initialized. Call initKeys() first.');
  return {
    ed25519: bytesToHex(_keys.ed25519.publicKey),
    mlDsa65: _keys.mlDsa65 ? bytesToHex(_keys.mlDsa65.publicKey) : undefined,
    algorithmId: _keys.mlDsa65 ? ALG_DUAL : ALG_ED25519,
  };
}

/**
 * Format domain-separated canonical STH message bytes.
 */
export function formatSTHMessageBytes(epoch: number, rootHash: string, timestamp: string): Uint8Array {
  const canon = canonicalize({
    epoch,
    root: rootHash,
    timestamp,
  });
  const full = `${DOMAIN_STH}${canon}`;
  return new TextEncoder().encode(full);
}

/**
 * Sign Signed Tree Head (STH) payload.
 * Generates Ed25519 and ML-DSA-65 signatures over the exact same domain-separated bytes.
 */
export function signSTH(epoch: number, rootHash: string, timestamp: string): STHSignatureEnvelope {
  if (!_keys) throw new Error('Authority keys not initialized');

  const msgBytes = formatSTHMessageBytes(epoch, rootHash, timestamp);

  const edSig = ed25519.sign(msgBytes, _keys.ed25519.privateKey);

  const envelope: STHSignatureEnvelope = {
    algorithmId: _keys.mlDsa65 ? ALG_DUAL : ALG_ED25519,
    signatureEd25519: bytesToHex(edSig),
  };

  if (_keys.mlDsa65 && mlDsa65Module) {
    const mlSig = mlDsa65Module.sign(_keys.mlDsa65.privateKey, msgBytes);
    envelope.signatureMlDsa65 = bytesToHex(mlSig);
  }

  return envelope;
}

/**
 * Verify STH signatures with fail-closed semantics and anti-downgrade enforcement.
 */
export function verifySTHSignatures(
  epoch: number,
  rootHash: string,
  timestamp: string,
  envelope: STHSignatureEnvelope,
  trustedPubKeys: { ed25519: string; mlDsa65?: string }
): { valid: boolean; ed25519Valid: boolean; mlDsaValid: boolean; reason: string } {
  const msgBytes = formatSTHMessageBytes(epoch, rootHash, timestamp);

  // Anti-downgrade check: if server has PQC configured, reject downgraded ed25519-only requests
  if (trustedPubKeys.mlDsa65 && envelope.algorithmId === ALG_ED25519) {
    return {
      valid: false,
      ed25519Valid: false,
      mlDsaValid: false,
      reason: 'REJECTED: Downgrade attack detected. Authority requires dual signature (Ed25519 + ML-DSA-65).',
    };
  }

  // 1. Verify Ed25519
  let edValid = false;
  try {
    const edPub = hexToBytes(trustedPubKeys.ed25519);
    const edSig = hexToBytes(envelope.signatureEd25519);
    edValid = ed25519.verify(edSig, msgBytes, edPub);
  } catch (err) {
    return {
      valid: false,
      ed25519Valid: false,
      mlDsaValid: false,
      reason: `Ed25519 verification error: ${(err as Error).message}`,
    };
  }

  if (!edValid) {
    return {
      valid: false,
      ed25519Valid: false,
      mlDsaValid: false,
      reason: 'Ed25519 signature is invalid',
    };
  }

  // 2. Verify ML-DSA-65 if algorithm is dual
  let mlValid = true;
  if (envelope.algorithmId === ALG_DUAL || envelope.algorithmId === ALG_MLDSA65) {
    if (!envelope.signatureMlDsa65) {
      return {
        valid: false,
        ed25519Valid: true,
        mlDsaValid: false,
        reason: 'FAIL CLOSED: Envelope claims dual signature but ML-DSA-65 signature is missing',
      };
    }
    if (!trustedPubKeys.mlDsa65 || !mlDsa65Module) {
      return {
        valid: false,
        ed25519Valid: true,
        mlDsaValid: false,
        reason: 'FAIL CLOSED: ML-DSA-65 key or library unavailable to verify declared dual signature',
      };
    }
    try {
      const mlPub = hexToBytes(trustedPubKeys.mlDsa65);
      const mlSig = hexToBytes(envelope.signatureMlDsa65);
      mlValid = mlDsa65Module.verify(mlPub, msgBytes, mlSig);
    } catch (err) {
      return {
        valid: false,
        ed25519Valid: true,
        mlDsaValid: false,
        reason: `ML-DSA-65 verification error: ${(err as Error).message}`,
      };
    }

    if (!mlValid) {
      return {
        valid: false,
        ed25519Valid: true,
        mlDsaValid: false,
        reason: 'ML-DSA-65 post-quantum signature verification failed',
      };
    }
  }

  return {
    valid: edValid && mlValid,
    ed25519Valid: edValid,
    mlDsaValid: mlValid,
    reason: 'Signatures verified successfully',
  };
}

export function hashBytes(bytes: Uint8Array): string {
  return bytesToHex(sha256(bytes));
}

export function hashString(str: string): string {
  return hashBytes(new TextEncoder().encode(str));
}

export function _dangerouslySetKeys(keys: DualKeyPair): void {
  _keys = keys;
}
