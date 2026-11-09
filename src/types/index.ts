// ===== TYPE DEFINITIONS FOR SMART LAND BANGLADESH / LANDPROOF =====

export type UserRole = 'citizen' | 'officer' | 'reviewer' | 'admin';

export interface DemoUser {
  id: string;
  role: UserRole;
  nameEn: string;
  nameBn: string;
  email?: string;
  nidOrGovId?: string;
  designationEn?: string;
  designationBn?: string;
  jurisdictionEn?: string;
  jurisdictionBn?: string;
  phone?: string;
  avatar?: string;
}

export interface LandRecord {
  id: string;
  deedNumber: string;
  deedType: string;
  registrationDate: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  mouzaCode: string;
  jlNumber: string;
  khatianType: string;
  khatianNumber: string;
  dagNumber: string;
  landArea: number;
  landAreaUnit: string;
  landClassification: string;
  surveyType: string;
  sellerRef: string;
  buyerRef: string;
  ownerRef: string;
  documentHash: string;
  documentName: string;
  notes: string;
  status: 'active' | 'flagged' | 'under_review';
  reviewStatus?: ReviewStatus;
  flagReason?: string;
  lat: number;
  lng: number;
  createdAt: string;
  createdBy: string;
  isSynthetic: boolean;
  cadastralPolygon?: [number, number][]; // Cadastral plot vector coordinates
  taxStatus?: 'paid' | 'due';
  isFrozen?: boolean;
  freezeReason?: string;
  frozenAt?: string;
  frozenBy?: string;
}

export interface PlotOwnership {
  id: string;
  dagNumber: string;
  mouza: string;
  mouzaCode: string;
  division: string;
  district: string;
  upazila: string;
  khatianNumber: string;
  currentOwnerRef: string;
  surveyType: string;
  landArea: number;
  landAreaUnit: string;
  nid?: string;
}

export interface VerificationEvent {
  id: string;
  recordRef: string;
  eventType: EventType;
  timestamp: string;
  outcome: VerificationOutcome;
  role: UserRole;
  uploadedHash?: string;
  expectedHash?: string;
  sellerRef?: string;
  ownerRef?: string;
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
  details?: string;
}

export type EventType =
  | 'registration'
  | 'verification'
  | 'verificationFailed'
  | 'unknownLookup'
  | 'reviewUpdate'
  | 'recordFreeze'
  | 'recordUnfreeze'
  | 'demoReset';

export type VerificationOutcome =
  | 'success'
  | 'verified'
  | 'mismatch'
  | 'notFound'
  | 'flagged'
  | 'reviewRequired';

export type ReviewStatus =
  | 'new'
  | 'underReview'
  | 'additionalReview'
  | 'completed';

export interface VerificationResult {
  documentMatch: 'verified' | 'mismatch' | 'notFound' | 'noUpload';
  ownershipMatch: 'match' | 'mismatch' | 'notFound' | 'noCheck';
  record?: LandRecord;
  ownership?: PlotOwnership;
  uploadedHash?: string;
  expectedHash?: string;
  sellerRef?: string;
  ownerRef?: string;
}

export interface DashboardMetrics {
  totalRecords: number;
  verifiedDocs: number;
  mismatches: number;
  unknownAttempts: number;
  reviewCases: number;
  totalEvents: number;
  frozenRecords?: number;
}

// Admin Intelligence / Fraud Alert types
export interface FraudAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  targetDeedOrDag: string;
  mouza: string;
  detectedAt: string;
  aiConfidence: number;
  status: 'active' | 'investigating' | 'resolved';
}

// Bangladesh administrative hierarchy
export interface Division {
  id: string;
  nameEn: string;
  nameBn: string;
  districts: District[];
}

export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  divisionId: string;
  upazilas: Upazila[];
}

export interface Upazila {
  id: string;
  nameEn: string;
  nameBn: string;
  districtId: string;
  mouzas: Mouza[];
}

export interface Mouza {
  id: string;
  nameEn: string;
  nameBn: string;
  code: string;
  upazilaId: string;
  jlNumber: string;
}
