import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DemoUser,
  UserRole,
  LandRecord,
  PlotOwnership,
  VerificationEvent,
  EventType,
  VerificationOutcome,
  ReviewStatus,
  DashboardMetrics,
  FraudAlert,
} from '../types';
import {
  INITIAL_LAND_RECORDS,
  INITIAL_PLOT_OWNERSHIP,
  INITIAL_EVENTS,
} from '../data/seedData';

interface AppState {
  // Auth
  currentUser: DemoUser | null;
  login: (role: UserRole) => void;
  loginWithUser: (user: DemoUser) => void;
  logout: () => void;

  // Land Records
  landRecords: LandRecord[];
  addLandRecord: (record: LandRecord) => void;
  updateLandRecord: (id: string, updates: Partial<LandRecord>) => void;
  getRecordByDeedNumber: (deedNumber: string) => LandRecord | undefined;
  getRecordById: (id: string) => LandRecord | undefined;

  // Admin Super Powers
  freezeRecord: (id: string, reason: string) => void;
  unfreezeRecord: (id: string) => void;

  // AI Fraud Radar Alerts
  fraudAlerts: FraudAlert[];
  dismissFraudAlert: (id: string) => void;

  // Plot Ownership
  plotOwnership: PlotOwnership[];
  addPlotOwnership: (ownership: PlotOwnership) => void;
  getOwnershipByDag: (dagNumber: string, mouza: string) => PlotOwnership | undefined;

  // Verification Events
  verificationEvents: VerificationEvent[];
  addEvent: (event: Omit<VerificationEvent, 'id' | 'timestamp'>) => void;

  // Dashboard
  getMetrics: () => DashboardMetrics;

  // Data reset
  resetDemoData: () => void;

  // Initialized flag
  isInitialized: boolean;
  initializeIfNeeded: () => void;
}

export const OFFICIAL_DEMO_USERS: Record<UserRole, DemoUser> = {
  citizen: {
    id: 'citizen-karim-01',
    role: 'citizen',
    nameEn: 'Mohammad Karim Ullah',
    nameBn: 'মোহাম্মদ করিম উল্লাহ',
    nidOrGovId: '19852694123456789',
    email: 'karim.citizen@land.gov.bd',
    designationEn: 'Registered Land Owner / Citizen',
    designationBn: 'জমি মালিক ও সাধারণ নাগরিক',
    jurisdictionEn: 'Hemayetpur, Savar, Dhaka',
    jurisdictionBn: 'হেমায়েতপুর মৌজা, সাভার, ঢাকা',
    phone: '+880 1712-345678',
  },
  officer: {
    id: 'officer-tanveer-02',
    role: 'officer',
    nameEn: 'Tanveer Ahmed',
    nameBn: 'জনাব তানভীর আহমেদ',
    nidOrGovId: 'REG-DHAKA-4091',
    email: 'subregistrar.savar@minland.gov.bd',
    designationEn: 'Sub-Registrar (Deed Registration Officer)',
    designationBn: 'সাব-রেজিস্ট্রার (দলিল নিবন্ধন কর্মকর্তা)',
    jurisdictionEn: 'Savar Sub-Registry Office, Dhaka',
    jurisdictionBn: 'সাভার সাব-রেজিস্ট্রি কার্যালয়, ঢাকা',
    phone: '+880 1819-876543',
  },
  reviewer: {
    id: 'acland-fahmida-03',
    role: 'reviewer',
    nameEn: 'Fahmida Sultana',
    nameBn: 'বেগম ফাহমিদা সুলতানা',
    nidOrGovId: 'ACLAND-SAVAR-102',
    email: 'acland.savar@dhaka.gov.bd',
    designationEn: 'Assistant Commissioner (Land) / AC Land',
    designationBn: 'সহকারী কমিশনার - ভূমি (এসি ল্যান্ড)',
    jurisdictionEn: 'Upazila Land Revenue Court, Savar, Dhaka',
    jurisdictionBn: 'উপজেলা রাজস্ব আদালত, সাভার, ঢাকা',
    phone: '+880 1911-234567',
  },
  admin: {
    id: 'admin-dg-04',
    role: 'admin',
    nameEn: 'Dr. Mahfuzur Rahman',
    nameBn: 'ড. মাহফুজুর রহমান',
    nidOrGovId: 'ADMIN-MINLAND-001',
    email: 'superadmin@land.gov.bd',
    designationEn: 'Director General (DLCRS & National Registry)',
    designationBn: 'মহাপরিচালক (ডিএলআরএস ও জাতীয় ভূমি ব্যবস্থাপনা)',
    jurisdictionEn: 'National Land Registry Command Center, Dhaka',
    jurisdictionBn: 'ভূমি ভবন, তেজগাঁও, ঢাকা (জাতীয় প্রশাসনিক অধিক্ষেত্র)',
    phone: '+880 1552-987654',
  },
};

const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'alert-01',
    severity: 'critical',
    titleBn: 'একাধিক বিক্রেতা অসঙ্গতি (Double Selling Attempt)',
    titleEn: 'Double Selling Anomaly Detected',
    descriptionBn: 'দাগ নং DAG-2026-002 (তেতুলঝোরা মৌজা)-তে নিবন্ধিত মালিকের এনআইডি ব্যতিরেকে ভিন্ন ব্যক্তি কর্তৃক হস্তান্তরের প্রচেষ্টা চিহ্নিত।',
    descriptionEn: 'Deed LP-2026-002 attempts transfer where seller does not match registered title holder in Cadastral Database.',
    targetDeedOrDag: 'DAG-2026-002 / LP-2026-002',
    mouza: 'তেতুলঝোরা (মৌজা ১০২)',
    detectedAt: '২০২৬-০৩-১৫ ১০:৪৫',
    aiConfidence: 94,
    status: 'active',
  },
  {
    id: 'alert-02',
    severity: 'high',
    titleBn: 'নদী তীরবর্তী খাস জমি দখল ঝুঁকি (Wetland Encroachment Risk)',
    titleEn: 'Wetland / Government Khas Encroachment Alert',
    descriptionBn: 'স্যাটেলাইট জিআইএস বিশ্লেষণে দেখা গেছে খতিয়ান KH-2026-0005 এর দাগ তুরাগ নদীর সুরক্ষিত তীরবর্তী সীমানায় প্রবেশ করেছে।',
    descriptionEn: 'Satellite GIS boundary analysis indicates potential overlap with protected river bank buffer zone.',
    targetDeedOrDag: 'DAG-2026-005',
    mouza: 'খালিশপুর (মৌজা ৬০১)',
    detectedAt: '২০২৬-০৩-১৪ ১৬:২০',
    aiConfidence: 88,
    status: 'active',
  },
  {
    id: 'alert-03',
    severity: 'medium',
    titleBn: 'ডিজিটাল দলিলের হ্যাশ অমিল (Tampered Document Hash)',
    titleEn: 'Document Cryptographic Signature Discrepancy',
    descriptionBn: 'যাচাইকালে স্ক্যানকৃত দলিলের SHA-256 ফিঙ্গারপ্রিন্ট ডাটাবেসের অনুমোদিত দলিলের সাথে মেলেনি।',
    descriptionEn: 'Uploaded deed PDF produced SHA-256 fingerprint mismatch against registered official copy.',
    targetDeedOrDag: 'LP-2026-002 (Re-upload)',
    mouza: 'সাভার সাব-রেজিস্ট্রি',
    detectedAt: '২০২৬-০৩-১৩ ০৯:১০',
    aiConfidence: 99,
    status: 'investigating',
  },
];

let eventCounter = 100;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      login: (role: UserRole) => {
        set({ currentUser: OFFICIAL_DEMO_USERS[role] });
      },
      loginWithUser: (user: DemoUser) => {
        set({ currentUser: user });
      },
      logout: () => {
        set({ currentUser: null });
      },

      // Land Records
      landRecords: [],
      addLandRecord: (record: LandRecord) => {
        set((state) => ({
          landRecords: [...state.landRecords, record],
        }));
      },
      updateLandRecord: (id: string, updates: Partial<LandRecord>) => {
        set((state) => ({
          landRecords: state.landRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      getRecordByDeedNumber: (deedNumber: string) => {
        return get().landRecords.find(
          (r) => r.deedNumber.toLowerCase() === deedNumber.toLowerCase()
        );
      },
      getRecordById: (id: string) => {
        return get().landRecords.find((r) => r.id === id);
      },

      // Admin Super Powers: Emergency Registry Freeze
      freezeRecord: (id: string, reason: string) => {
        const state = get();
        const target = state.landRecords.find((r) => r.id === id);
        if (!target) return;

        set((s) => ({
          landRecords: s.landRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  isFrozen: true,
                  freezeReason: reason,
                  status: 'flagged',
                  frozenAt: new Date().toISOString(),
                  frozenBy: s.currentUser?.nameBn || 'মহাপরিচালক (এডমিন)',
                }
              : r
          ),
        }));

        eventCounter++;
        const freezeEvent: VerificationEvent = {
          id: `evt-freeze-${eventCounter}-${Date.now()}`,
          recordRef: target.deedNumber,
          eventType: 'recordFreeze',
          timestamp: new Date().toISOString(),
          outcome: 'flagged',
          role: 'admin',
          details: `জাতীয় জরুরি লক: ${reason} (দ্বারা: ${state.currentUser?.nameBn || 'সিস্টেম প্রশাসক'})`,
        };

        set((s) => ({
          verificationEvents: [freezeEvent, ...s.verificationEvents],
        }));
      },

      unfreezeRecord: (id: string) => {
        const state = get();
        const target = state.landRecords.find((r) => r.id === id);
        if (!target) return;

        set((s) => ({
          landRecords: s.landRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  isFrozen: false,
                  freezeReason: undefined,
                  status: 'active',
                }
              : r
          ),
        }));

        eventCounter++;
        const unfreezeEvent: VerificationEvent = {
          id: `evt-unfreeze-${eventCounter}-${Date.now()}`,
          recordRef: target.deedNumber,
          eventType: 'recordUnfreeze',
          timestamp: new Date().toISOString(),
          outcome: 'success',
          role: 'admin',
          details: `জরুরি লক প্রত্যাহার ও রেকর্ড সক্রিয়করণ (দ্বারা: ${state.currentUser?.nameBn || 'সিস্টেম প্রশাসক'})`,
        };

        set((s) => ({
          verificationEvents: [unfreezeEvent, ...s.verificationEvents],
        }));
      },

      // AI Fraud Alerts
      fraudAlerts: INITIAL_FRAUD_ALERTS,
      dismissFraudAlert: (id: string) => {
        set((state) => ({
          fraudAlerts: state.fraudAlerts.map((a) =>
            a.id === id ? { ...a, status: 'resolved' } : a
          ),
        }));
      },

      // Plot Ownership
      plotOwnership: [],
      addPlotOwnership: (ownership: PlotOwnership) => {
        set((state) => ({
          plotOwnership: [...state.plotOwnership, ownership],
        }));
      },
      getOwnershipByDag: (dagNumber: string, mouza: string) => {
        return get().plotOwnership.find(
          (o) => o.dagNumber === dagNumber && o.mouza === mouza
        );
      },

      // Verification Events
      verificationEvents: [],
      addEvent: (event) => {
        eventCounter++;
        const fullEvent: VerificationEvent = {
          ...event,
          id: `evt-${eventCounter}-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          verificationEvents: [fullEvent, ...state.verificationEvents],
        }));
      },

      // Dashboard Metrics
      getMetrics: () => {
        const state = get();
        const events = state.verificationEvents;
        return {
          totalRecords: state.landRecords.length,
          verifiedDocs: events.filter((e) => e.outcome === 'verified').length,
          mismatches: events.filter((e) => e.outcome === 'mismatch').length,
          unknownAttempts: events.filter((e) => e.eventType === 'unknownLookup').length,
          reviewCases: state.landRecords.filter(
            (r) => r.status === 'flagged' || r.status === 'under_review' || r.isFrozen
          ).length,
          frozenRecords: state.landRecords.filter((r) => r.isFrozen).length,
          totalEvents: events.length,
        };
      },

      // Reset
      resetDemoData: () => {
        const user = get().currentUser;
        set({
          landRecords: [...INITIAL_LAND_RECORDS],
          plotOwnership: [...INITIAL_PLOT_OWNERSHIP],
          verificationEvents: [...INITIAL_EVENTS],
          fraudAlerts: INITIAL_FRAUD_ALERTS,
        });
        if (user) {
          eventCounter++;
          const resetEvent: VerificationEvent = {
            id: `evt-${eventCounter}-${Date.now()}`,
            recordRef: 'SYSTEM',
            eventType: 'demoReset' as EventType,
            timestamp: new Date().toISOString(),
            outcome: 'success' as VerificationOutcome,
            role: user.role,
            details: 'System database refreshed to standard registry state',
          };
          set((state) => ({
            verificationEvents: [resetEvent, ...state.verificationEvents],
          }));
        }
      },

      // Initialization
      isInitialized: false,
      initializeIfNeeded: () => {
        const state = get();
        if (!state.isInitialized || state.landRecords.length === 0) {
          set({
            landRecords: [...INITIAL_LAND_RECORDS],
            plotOwnership: [...INITIAL_PLOT_OWNERSHIP],
            verificationEvents: [...INITIAL_EVENTS],
            fraudAlerts: INITIAL_FRAUD_ALERTS,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'landproof-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        landRecords: state.landRecords,
        plotOwnership: state.plotOwnership,
        verificationEvents: state.verificationEvents,
        fraudAlerts: state.fraudAlerts,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Helper: check if user has permission
export function hasPermission(role: UserRole | undefined, action: string): boolean {
  if (!role) return false;
  const permissions: Record<string, UserRole[]> = {
    search: ['citizen', 'officer', 'reviewer', 'admin'],
    verify: ['citizen', 'officer', 'reviewer', 'admin'],
    register: ['officer', 'admin'],
    review: ['reviewer', 'admin'],
    viewHistory: ['officer', 'reviewer', 'admin'],
    viewFlagged: ['reviewer', 'admin'],
    resetDemo: ['admin'],
    viewStats: ['admin'],
    freezeRecord: ['admin'],
    manageOfficers: ['admin'],
    viewFraudRadar: ['admin'],
    payTax: ['citizen'],
    downloadPorcha: ['citizen', 'officer', 'reviewer', 'admin'],
  };
  return permissions[action]?.includes(role) ?? false;
}

// Helper: update review status
export function updateReviewStatus(
  recordId: string,
  newStatus: ReviewStatus,
  note: string,
  role: UserRole
) {
  const store = useStore.getState();
  store.updateLandRecord(recordId, {
    reviewStatus: newStatus,
    status: newStatus === 'completed' ? 'active' : 'under_review',
  });
  store.addEvent({
    recordRef: store.getRecordById(recordId)?.deedNumber || recordId,
    eventType: 'reviewUpdate',
    outcome: newStatus === 'completed' ? 'success' : 'reviewRequired',
    role,
    reviewStatus: newStatus,
    reviewNote: note,
  });
}
