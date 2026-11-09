import { computeBufferHash } from './crypto';

/**
 * Generate a sample PDF-like document for demo purposes.
 * This is a text file with .pdf extension containing clearly fictional demo content.
 * The same bytes will always produce the same SHA-256 hash.
 */
const SAMPLE_DOCUMENT_CONTENT = `
=====================================================
  NOT A LEGAL DOCUMENT
  SYNTHETIC HACKATHON DEMO DATA ONLY
=====================================================

  LandProof Demo Deed Document
  Deed Reference: LP-2026-001

  This is a demonstration document created for the
  LandTech 2026 Hackathon prototype.

  All information in this document is entirely fictional
  and does not represent any real land transaction,
  ownership, or legal instrument.

  ---------------------------------------------------
  Deed Type: Sale Deed (বিক্রয় দলিল)
  Registration Date: 15 January 2026
  Division: Dhaka (ঢাকা)
  District: Dhaka (ঢাকা)
  Upazila: Savar (সাভার)
  Mouza: Hemayetpur (হেমায়েতপুর)
  JL Number: 101
  Khatian Type: RS (আর.এস.)
  Khatian Number: KH-2026-0001
  Dag/Plot Number: DAG-2026-001
  Land Area: 15 Decimal (শতাংশ)
  Classification: Residential (আবাসিক)
  Survey Type: RS (Revisional Survey)

  Seller Reference: SELLER-2026-001
  Buyer Reference: BUYER-2026-001
  Current Owner Reference: OWNER-2026-001

  ---------------------------------------------------
  DEMO DATA — NOT AN OFFICIAL LAND RECORD
  ডেমো ডেটা — বাস্তব ভূমি রেকর্ড নয়
=====================================================
`;

const MODIFIED_DOCUMENT_CONTENT = SAMPLE_DOCUMENT_CONTENT + `
  [MODIFICATION ADDED - This file has been altered]
  This additional text changes the SHA-256 fingerprint.
`;

/**
 * Get the sample document as a Blob.
 */
export function getSampleDocumentBlob(): Blob {
  return new Blob([SAMPLE_DOCUMENT_CONTENT.replace(/\r\n/g, '\n')], { type: 'application/pdf' });
}

/**
 * Get the modified sample document as a Blob.
 */
export function getModifiedDocumentBlob(): Blob {
  return new Blob([MODIFIED_DOCUMENT_CONTENT.replace(/\r\n/g, '\n')], { type: 'application/pdf' });
}

/**
 * Compute the hash of the sample document.
 */
export async function getSampleDocumentHash(): Promise<string> {
  const blob = getSampleDocumentBlob();
  const buffer = await blob.arrayBuffer();
  return computeBufferHash(buffer);
}

/**
 * Download the sample document.
 */
export function downloadSampleDocument(filename: string = 'demo_deed_LP-2026-001.pdf') {
  const blob = getSampleDocumentBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download the modified sample document (for testing mismatch).
 */
export function downloadModifiedDocument(filename: string = 'demo_deed_LP-2026-001_modified.pdf') {
  const blob = getModifiedDocumentBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
