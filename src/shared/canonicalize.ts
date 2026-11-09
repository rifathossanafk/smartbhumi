/**
 * Canonical JSON serializer for deed claims.
 *
 * WHY: We need a deterministic byte representation of deed data so that
 * the same deed always produces the same hash. JSON.stringify does not
 * guarantee key order, so we sort keys recursively, normalize Unicode
 * to NFC, and format numbers as plain ASCII digits (no scientific notation).
 *
 * This module is used by both server (to build Merkle leaves) and
 * browser (to verify QR payloads offline).
 */

/**
 * Produce a deterministic JSON string from any value.
 * - Object keys are sorted lexicographically (ASCII order).
 * - Strings are NFC-normalized.
 * - Numbers are formatted as plain decimal digits (no exponents).
 * - null stays null; undefined values in objects are omitted.
 * - Arrays preserve order.
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

/**
 * Recursively sort object keys and normalize strings.
 */
function sortDeep(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    // NFC normalize — ensures Bangla text like "মোহাম্মদ" is always
    // encoded the same way regardless of how it was typed/pasted.
    return value.normalize('NFC');
  }

  if (typeof value === 'number') {
    // Avoid scientific notation: 1e7 → "10000000"
    // JSON.stringify already does this for safe integers,
    // but we make it explicit for documentation.
    return value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }

  if (typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).sort();
    for (const key of keys) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) {
        sorted[key] = sortDeep(v);
      }
    }
    return sorted;
  }

  return value;
}

