import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JudgeDemoBar } from './components/JudgeDemoBar';

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

export const App: React.FC = () => {
  const { initializeIfNeeded } = useStore();

  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
        {/* Official Top Ribbon + Main Navigation */}
        <Navbar />

        {/* Main Application Routes */}
        <main className="flex-1 w-full">
          <Routes>
            {/* 1. Official National Landing Portal */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Hackathon Core Modules (P2, P3, P4) */}
            {/* P2: Cryptographic Deed Verification & Tamper Simulation */}
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:deedNumber" element={<VerifyPage />} />

            {/* P3: Deed Registration & Area Accounting Double-Sale Prevention */}
            <Route path="/register" element={<RegisterPage />} />

            {/* P4: e-Mutation Pipeline & AC Land Queue */}
            <Route path="/mutation" element={<MutationPage />} />

            {/* Auditability: RFC 9162 Merkle Log, PQC Signatures, & Red-Team Lab */}
            <Route path="/ledger" element={<LedgerPage />} />

            {/* Cadastral Survey Graph, Faraiz Inheritance, & OCR Token Diff */}
            <Route path="/lineage" element={<LineagePage />} />

            {/* Printable A4 Deeds Kit for Judges */}
            <Route path="/print-deeds" element={<PrintDeedsPage />} />

            {/* 3. Civic Search, Cadastral Maps, & Dashboards */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/record/:id" element={<RecordDetailsPage />} />
            <Route path="/flagged" element={<FlaggedReviewPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Official Government Footer */}
        <Footer />

        {/* Floating Judge 3-Minute Presentation Launcher & Fast DB Reset */}
        <JudgeDemoBar />
      </div>
    </BrowserRouter>
  );
};

export default App;
