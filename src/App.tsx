import React, { useEffect, Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JudgeDemoBar } from './components/JudgeDemoBar';
import { BottomNav } from './components/BottomNav';

/* ── Protected Route: redirects to /login if not authenticated ── */
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

// Landing & Auth
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Track A/B Hackathon Core Modules
import { VerifyPage } from './pages/VerifyPage';
import { RegisterPage } from './pages/RegisterPage';
import { MutationPage } from './pages/MutationPage';
import { LedgerPage } from './pages/LedgerPage';
import { LineagePage } from './pages/LineagePage';
import { PrintDeedsPage } from './pages/PrintDeedsPage';

// Civic & Officer Portals
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { MapPage } from './pages/MapPage';
import { RecordDetailsPage } from './pages/RecordDetailsPage';
import { FlaggedReviewPage } from './pages/FlaggedReviewPage';
import { HistoryPage } from './pages/HistoryPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SmartBhumi ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4 font-sans text-slate-900">
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-8 max-w-lg text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-900">স্মার্ট ভূমি সেবা পোর্টাল</h2>
            <p className="text-sm text-slate-600">
              ব্রাউজার ক্যাশ রিসেট করে পোর্টাল পুনরায় চালু করুন:
            </p>
            <div className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-200 text-slate-700 text-left overflow-x-auto">
              {this.state.error?.message || 'Application State Hydration Exception'}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('landproof-store');
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => {
                    for (const reg of regs) reg.unregister();
                  });
                }
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition cursor-pointer shadow-sm"
            >
              ক্যাশ সম্পূর্ণ পরিষ্কার করে রিলোড করুন (Clear Cache & Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const { initializeIfNeeded } = useStore();

  useEffect(() => {
    try {
      initializeIfNeeded();
    } catch (err) {
      console.warn('Initialization caught:', err);
    }
  }, [initializeIfNeeded]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f0fdf4] print:bg-white print:min-h-0 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
          {/* Official Top Ribbon + Main Navigation */}
          <Navbar />

          {/* Main Application Routes */}
          <main className="flex-1 w-full pb-16 lg:pb-0">
            <Routes>
              {/* 1. Official National Landing Portal */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* 2. Hackathon Core Modules (P2, P3, P4) */}
              {/* P2: Cryptographic Deed Verification & Tamper Simulation */}
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/verify/:deedNumber" element={<VerifyPage />} />

              {/* P3: Deed Registration & Area Accounting Double-Sale Prevention */}
              <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />

              {/* P4: e-Mutation Pipeline & AC Land Queue */}
              <Route path="/mutation" element={<ProtectedRoute><MutationPage /></ProtectedRoute>} />

              {/* Auditability: RFC 9162 Merkle Log, PQC Signatures, & Red-Team Lab */}
              <Route path="/ledger" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />

              {/* Cadastral Survey Graph, Faraiz Inheritance, & OCR Token Diff */}
              <Route path="/lineage" element={<ProtectedRoute><LineagePage /></ProtectedRoute>} />

              {/* Printable A4 Deeds Kit for Judges */}
              <Route path="/print-deeds" element={<ProtectedRoute><PrintDeedsPage /></ProtectedRoute>} />

              {/* 3. Civic Search, Cadastral Maps, & Dashboards */}
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/record/:id" element={<ProtectedRoute><RecordDetailsPage /></ProtectedRoute>} />
              <Route path="/flagged" element={<ProtectedRoute><FlaggedReviewPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Official Government Footer */}
          <Footer />

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav />

          {/* Floating Judge 3-Minute Presentation Launcher & Fast DB Reset */}
          <JudgeDemoBar />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
