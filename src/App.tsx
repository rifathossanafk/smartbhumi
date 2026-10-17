import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore, hasPermission } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyPage } from './pages/VerifyPage';
import { RecordDetailsPage } from './pages/RecordDetailsPage';
import { MapPage } from './pages/MapPage';
import { HistoryPage } from './pages/HistoryPage';
import { FlaggedReviewPage } from './pages/FlaggedReviewPage';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredAction?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredAction }) => {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredAction && !hasPermission(currentUser.role, requiredAction)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  const { initializeIfNeeded } = useStore();

  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes (Authentication Required) */}
            <Route
              path="/verify"
              element={
                <ProtectedRoute>
                  <VerifyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify/:deedNumber"
              element={
                <ProtectedRoute>
                  <VerifyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/record/:id"
              element={
                <ProtectedRoute>
                  <RecordDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Role-Restricted Protected Routes */}
            <Route
              path="/register"
              element={
                <ProtectedRoute requiredAction="register">
                  <RegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flagged"
              element={
                <ProtectedRoute requiredAction="review">
                  <FlaggedReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requiredAction="viewHistory">
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
