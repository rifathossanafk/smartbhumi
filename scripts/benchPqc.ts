/**
 * Benchmark script for SmartBhumi Dual Post-Quantum Digital Signatures.
 *
 * Measures:
 * - Ed25519 (Classical)
 * - ML-DSA-65 (Post-Quantum, NIST FIPS 204)
 * - Dual Signature (Ed25519 + ML-DSA-65 combined)
 *
 * Run via: npm run bench:pqc
 */

import { ed25519 } from '@noble/curves/ed25519';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { DOMAIN_STH, formatSTHMessageBytes } from '../server/crypto.js';

function benchmarkOperation(fn: () => void, iterations: number = 200): number {
  // Warmup
  for (let i = 0; i < 20; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const total = performance.now() - start;
  return total / iterations;
}

export async function runBench(): Promise<void> {
  console.log('\n=== SMARTBHUMI DUAL POST-QUANTUM SIGNATURE BENCHMARK ===\n');
  console.log(`Node.js: ${process.version}`);
  console.log(`Architecture: ${process.arch} (${process.platform})`);
  console.log(`Domain Separation Prefix: "${DOMAIN_STH}"\n`);

  const sampleMessage = formatSTHMessageBytes(1, '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', new Date().toISOString());

  // 1. Ed25519 Benchmarks
  const edPriv = ed25519.utils.randomPrivateKey();
  const edPub = ed25519.getPublicKey(edPriv);
  const edSig = ed25519.sign(sampleMessage, edPriv);

  const edKeygenMs = benchmarkOperation(() => {
    const p = ed25519.utils.randomPrivateKey();
    ed25519.getPublicKey(p);
  });
  const edSignMs = benchmarkOperation(() => ed25519.sign(sampleMessage, edPriv));
  const edVerifyMs = benchmarkOperation(() => ed25519.verify(edSig, sampleMessage, edPub));

  // 2. ML-DSA-65 Benchmarks
  const seed = new Uint8Array(32);
  crypto.getRandomValues(seed);
  const mlKeys = ml_dsa65.keygen(seed);
  const mlSig = ml_dsa65.sign(mlKeys.secretKey, sampleMessage);

  const mlKeygenMs = benchmarkOperation(() => ml_dsa65.keygen(seed), 50);
  const mlSignMs = benchmarkOperation(() => ml_dsa65.sign(mlKeys.secretKey, sampleMessage), 50);
  const mlVerifyMs = benchmarkOperation(() => ml_dsa65.verify(mlKeys.publicKey, sampleMessage, mlSig), 50);

  // 3. Dual Signature Combined
  const dualSignMs = edSignMs + mlSignMs;
  const dualVerifyMs = edVerifyMs + mlVerifyMs;

  const edPubBytes = edPub.length;
  const edSigBytes = edSig.length;
  const mlPubBytes = mlKeys.publicKey.length;
  const mlSigBytes = mlSig.length;

  console.log('| Algorithm | Public Key (bytes) | Signature (bytes) | Keygen (ms) | Sign (ms) | Verify (ms) | Security Level |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  console.log(`| **Ed25519** (Classical) | ${edPubBytes} B | ${edSigBytes} B | ${edKeygenMs.toFixed(3)} ms | ${edSignMs.toFixed(3)} ms | ${edVerifyMs.toFixed(3)} ms | Classical 128-bit |`);
  console.log(`| **ML-DSA-65** (Post-Quantum) | ${mlPubBytes} B | ${mlSigBytes} B | ${mlKeygenMs.toFixed(3)} ms | ${mlSignMs.toFixed(3)} ms | ${mlVerifyMs.toFixed(3)} ms | NIST Category 3 (AES-192 equivalent) |`);
  console.log(`| **Dual Signature** (Ed25519 + ML-DSA-65) | ${edPubBytes + mlPubBytes} B | ${edSigBytes + mlSigBytes} B | ${(edKeygenMs + mlKeygenMs).toFixed(3)} ms | ${dualSignMs.toFixed(3)} ms | ${dualVerifyMs.toFixed(3)} ms | Hybrid / Dual (Requires breaking BOTH) |`);
  console.log('\n> [!NOTE]');
  console.log('> Benchmark measured live in pure TypeScript with `@noble/curves` and `@noble/post-quantum`. Zero native C dependencies.\n');
}

runBench().catch(console.error);

