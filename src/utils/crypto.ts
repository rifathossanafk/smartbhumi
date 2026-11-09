/**
 * Compute SHA-256 hash of a file using the Web Crypto API.
 * Operates on the raw bytes of the file, not the filename.
 */
export async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 hash of an ArrayBuffer.
 */
export async function computeBufferHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate file type and size.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'invalidFile' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'fileTooLarge' };
  }
  return { valid: true };
}

/**
 * Generate a unique record ID.
 */
export function generateId(prefix: string = 'rec'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate a deed number.
 */
export function generateDeedNumber(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `LP-2026-${num}`;
}

/**
 * Get the verification URL for a record. Uses the current origin.
 */
export function getVerificationUrl(deedNumber: string): string {
  const origin = window.location.origin;
  const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
  return `${origin}${basePath}/verify/${encodeURIComponent(deedNumber)}`;
}

/**
 * Format a date string to Bangladesh locale.
 */
export function formatDate(dateStr: string, locale: string = 'bn-BD'): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a timestamp.
 */
export function formatTimestamp(dateStr: string, locale: string = 'bn-BD'): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Truncate a hash for display.
 */
export function truncateHash(hash: string, length: number = 16): string {
  if (hash.length <= length) return hash;
  return hash.substring(0, length) + '...';
}

/**
 * Sanitize user input text.
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
