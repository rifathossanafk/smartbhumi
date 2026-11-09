/**
 * Land area unit converter for Bangladesh.
 *
 * All internal storage uses "micro-shotok" (1 shotok = 1_000_000 micro-shotok)
 * to avoid floating-point errors in area accounting.
 *
 * Conversion table (common convention — actual ratios vary by region):
 *   1 acre    = 100 shotok  = 3 bigha (standard)
 *   1 bigha   = 33.33 shotok (≈ 33 shotok 33 decimal)
 *   1 katha   = 1.65 shotok (standard, varies 1.5-2.0 by region)
 *   1 chatak  = 0.69 shotok (≈ 69 decimal)
 *   1 decimal = 1 shotok    (same unit, different name)
 *
 * These are COMMON CONVENTIONS. Regional variations exist.
 * Always confirm with the local land office.
 */

/** Micro-shotok per 1 unit of the named type */
export const MICRO_SHOTOK_PER_UNIT = {
  shotok: 1_000_000,
  decimal: 1_000_000, // decimal and shotok are the same
  katha: 1_650_000, // 1 katha = 1.65 shotok (standard)
  chatak: 690_000, // 1 chatak ≈ 0.69 shotok
  bigha: 33_330_000, // 1 bigha ≈ 33.33 shotok
  acre: 100_000_000, // 1 acre = 100 shotok
} as const;

export type AreaUnit = keyof typeof MICRO_SHOTOK_PER_UNIT;

/**
 * Convert a human-readable area value to micro-shotok (integer).
 * Example: toMicroShotok(10.40, 'shotok') => 10_400_000
 */
export function toMicroShotok(value: number, unit: AreaUnit): number {
  const factor = MICRO_SHOTOK_PER_UNIT[unit];
  if (factor === undefined) {
    throw new Error(`Unknown area unit: ${unit}`);
  }
  return Math.round(value * factor);
}

/**
 * Convert micro-shotok back to a human-readable area value.
 * Example: fromMicroShotok(10_400_000, 'shotok') => 10.4
 */
export function fromMicroShotok(microShotok: number, unit: AreaUnit): number {
  const factor = MICRO_SHOTOK_PER_UNIT[unit];
  if (factor === undefined) {
    throw new Error(`Unknown area unit: ${unit}`);
  }
  return microShotok / factor;
}

/**
 * Convert between any two units.
 * Example: convertArea(1, 'acre', 'shotok') => 100
 */
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  const micro = toMicroShotok(value, from);
  return fromMicroShotok(micro, to);
}

/**
 * Format area for display with unit label.
 */
export function formatArea(microShotok: number, unit: AreaUnit = 'shotok'): string {
  const value = fromMicroShotok(microShotok, unit);
  // Show up to 2 decimal places, remove trailing zeros
  const formatted = value.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${unit}`;
}
