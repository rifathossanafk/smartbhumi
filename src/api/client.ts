/**
 * SmartBhumi Frontend API Client Layer.
 *
 * Connects frontend screens to the live local server API.
 * Features:
 * - Persistent caching of latest STH and Public Keys for offline verification
 * - "Airplane Mode Simulation" toggle: when active, blocks all network calls to prove local offline execution!
 * - Automatic role header attribution (X-Demo-Role, X-Demo-User)
 */

export interface CachedSTH {
  epoch: number;
  treeSize: number;
  rootHash: string;
  timestamp: string;
  signatureEd25519: string;
  signatureMlDsa65?: string;
  algorithmId: string;
}

export interface CachedKeys {
  ed25519: string;
  mlDsa65?: string;
  algorithmId: string;
}

const STORAGE_KEY_STH = 'smartbhumi_cached_sth_v1';
const STORAGE_KEY_KEYS = 'smartbhumi_cached_keys_v1';
const STORAGE_KEY_AIRPLANE = 'smartbhumi_simulated_airplane_mode';

let _simulatedAirplaneMode = localStorage.getItem(STORAGE_KEY_AIRPLANE) === 'true';

export function isAirplaneMode(): boolean {
  return _simulatedAirplaneMode;
}

export function setAirplaneMode(enabled: boolean): void {
  _simulatedAirplaneMode = enabled;
  localStorage.setItem(STORAGE_KEY_AIRPLANE, String(enabled));
  window.dispatchEvent(new CustomEvent('smartbhumi:airplane-mode-changed', { detail: enabled }));
}

export function getCachedSTH(): CachedSTH | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedSTH(sth: CachedSTH): void {
  localStorage.setItem(STORAGE_KEY_STH, JSON.stringify(sth));
}

export function getCachedKeys(): CachedKeys | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KEYS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedKeys(keys: CachedKeys): void {
  localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(keys));
}

const STORAGE_KEY_QR = 'smartbhumi_cached_qr_v1';

interface CachedQR {
  deedNumber: string;
  qrString: string;
  cachedAt: string;
}

export function getCachedQR(deedNumber: string): CachedQR | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QR);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, CachedQR>;
    return all[deedNumber] || null;
  } catch {
    return null;
  }
}

export function setCachedQR(deedNumber: string, qrString: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QR);
    const all = raw ? (JSON.parse(raw) as Record<string, CachedQR>) : {};
    // Keep only the most recent few QRs — payloads are ~550-1000 bytes each
    const entries = Object.entries(all)
      .sort((a, b) => (a[1].cachedAt < b[1].cachedAt ? 1 : -1))
      .slice(0, 9);
    const trimmed: Record<string, CachedQR> = {};
    for (const [k, v] of entries) trimmed[k] = v;
    trimmed[deedNumber] = { deedNumber, qrString, cachedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY_QR, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — cache is best-effort
  }
}

/**
 * Base HTTP fetch wrapper with Simulated Airplane Mode interceptor
 * and demo role header injection.
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (_simulatedAirplaneMode) {
    throw new Error('AIRPLANE MODE ACTIVE: Network calls blocked to prove offline local verification.');
  }

  const role = localStorage.getItem('smartbhumi_demo_role') || 'citizen';
  const userName = localStorage.getItem('smartbhumi_demo_user_name') || 'Demo User';

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Demo-Role', role);
  headers.set('X-Demo-User', userName);

  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.reason || `HTTP error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// === High-Level API Methods ===

export async function fetchSystemHealth() {
  return apiFetch('/api/health');
}

export async function fetchRegistryState() {
  return apiFetch('/api/state');
}

export async function resetDatabase() {
  return apiFetch('/api/db/reset', { method: 'POST' });
}

export async function precheckDeed(payload: {
  khatianNumber: string;
  dagNumber: string;
  mouzaCode: string;
  transferArea: number;
  transferUnit?: string;
  sellerNid?: string;
  deedType?: string;
}) {
  return apiFetch('/api/deeds/precheck', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerDeed(payload: any) {
  return apiFetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fireStressTest() {
  return apiFetch('/api/stress-test', { method: 'POST' });
}

export async function fetchLatestSTH() {
  const data = await apiFetch<{ sth: CachedSTH; publicKeys: CachedKeys }>('/api/sth/latest');
  if (data?.sth) setCachedSTH(data.sth);
  if (data?.publicKeys) setCachedKeys(data.publicKeys);
  return data;
}

export async function fetchDeedQR(deedIdOrNumber: string): Promise<{ qrString: string; byteLength?: number; fromCache?: boolean }> {
  const data = await apiFetch(`/api/deeds/${encodeURIComponent(deedIdOrNumber)}/qr`);
  if (data?.qrString) setCachedQR(deedIdOrNumber, data.qrString);
  return data;
}

/**
 * Demo sample loader with offline fallback: in airplane mode the network is
 * blocked, so reuse the QR cached from the last online fetch. This models the
 * real scenario — the printed deed QR in the citizen's hand needs no network.
 * The cryptographic verification itself always runs 100% offline.
 */
export async function fetchDeedQROrCached(deedIdOrNumber: string): Promise<{ qrString: string; byteLength?: number; fromCache?: boolean }> {
  if (isAirplaneMode()) {
    const cached = getCachedQR(deedIdOrNumber);
    if (cached) return { qrString: cached.qrString, fromCache: true };
  }
  try {
    return await fetchDeedQR(deedIdOrNumber);
  } catch (err) {
    if (isAirplaneMode()) {
      const cached = getCachedQR(deedIdOrNumber);
      if (cached) return { qrString: cached.qrString, fromCache: true };
    }
    throw err;
  }
}

export async function runRedTeamSimulation(scenario: 'paper_tamper' | 'db_tamper' | 'key_compromise') {
  return apiFetch(`/api/redteam/${scenario}`, { method: 'POST' });
}

export async function fetchMutationCases(status?: string) {
  const q = status ? `?status=${status}` : '';
  return apiFetch(`/api/mutation/cases${q}`);
}

export async function approveMutationCase(caseId: string) {
  return apiFetch(`/api/mutation/cases/${encodeURIComponent(caseId)}/approve`, { method: 'POST' });
}

export async function rejectMutationCase(caseId: string, reason?: string) {
  return apiFetch(`/api/mutation/cases/${encodeURIComponent(caseId)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function checkOCRDiff(fixture: 'genuine' | 'area_tampered' | 'khas') {
  return apiFetch('/api/verify/ocr-diff', {
    method: 'POST',
    body: JSON.stringify({ fixture }),
  });
}

export async function fetchPlotLineage(plotOrDagId: string) {
  return apiFetch(`/api/plots/${encodeURIComponent(plotOrDagId)}/lineage`);
}

export async function calculateFaraiz(payload: {
  totalArea: number;
  unit?: string;
  hasSpouse?: boolean;
  deceasedGender?: 'male' | 'female';
  hasMother?: boolean;
  hasFather?: boolean;
  numSons?: number;
  numDaughters?: number;
}) {
  return apiFetch('/api/faraiz/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

