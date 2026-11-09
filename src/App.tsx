import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SyntheticBanner } from './components/SyntheticBanner';
import { AppNavbar } from './components/AppNavbar';
import { BottomNav } from './components/BottomNav';
import { JudgeDemoBar } from './components/JudgeDemoBar';

// Track B Redesigned Pages
import { VerifyPage } from './pages/VerifyPage';
import { RegisterPage } from './pages/RegisterPage';
import { MutationPage } from './pages/MutationPage';
import { LedgerPage } from './pages/LedgerPage';
import { LineagePage } from './pages/LineagePage';
import { PrintDeedsPage } from './pages/PrintDeedsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#f8faf8] text-slate-900 font-sans antialiased selection:bg-emerald-700 selection:text-white pb-20 lg:pb-0">
        {/* 1. Persistent Synthetic Demo Data Warning Banner (Hard Rule 1) */}
        <SyntheticBanner />

        {/* 2. Top Navigation Bar (Demo Roles, Airplane Mode, Lang Toggle, Desktop Links) */}
        <AppNavbar />

        {/* 3. Judge Demo Bar (Acts 1, 2, 3 shortcuts + Sub-100ms DB Reset) */}
        <JudgeDemoBar />

        {/* 4. Main App Routes */}
        <main className="flex-1 w-full">
          <Routes>
            {/* The Hero Verification Screen (Default Landing) */}
            <Route path="/" element={<VerifyPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:deedNumber" element={<VerifyPage />} />

            {/* Registration, Area Accounting, & Concurrency Stress-Test */}
            <Route path="/register" element={<RegisterPage />} />

            {/* e-Mutation Pipeline & AC Land Queue */}
            <Route path="/mutation" element={<MutationPage />} />

            {/* Merkle Transparency Log, PQC Signatures, & Red-Team Security Lab */}
            <Route path="/ledger" element={<LedgerPage />} />

            {/* Cadastral Survey Graph, Faraiz Inheritance, & OCR Token Diff */}
            <Route path="/lineage" element={<LineagePage />} />

            {/* Printable A4 Deeds Kit for Judges */}
            <Route path="/print-deeds" element={<PrintDeedsPage />} />

            {/* Fallback to Hero Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 5. Mobile Bottom Navigation (WCAG AA, 48px touch targets, mobile-first) */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
