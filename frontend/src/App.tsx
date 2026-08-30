import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { GovernmentPortalPage } from './pages/GovernmentPortalPage';
import { GemPortalPage } from './pages/GemPortalPage';

import { GovernmentPage } from './pages/GovernmentPage';
import { VendorPage } from './pages/VendorPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ScorePage } from './pages/ScorePage';
import { EvaluatorPage } from './pages/EvaluatorPage';
import { DecisionPage } from './pages/DecisionPage';

import { UserDashboard } from './pages/user/UserDashboard';
import { NewCheckWizard } from './pages/user/NewCheckWizard';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateBidPage } from './pages/admin/CreateBidPage';
import { VendorManagementPage } from './pages/admin/VendorManagementPage';
import { VendorComparisonPage } from './pages/admin/VendorComparisonPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';

// Protected Route Guard for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 text-xs font-semibold">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Protected Admin Guard (Admin only)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 text-xs font-semibold">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying evaluator authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Portal Demo Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/portal" element={<GovernmentPortalPage />} />

      {/* Hackathon Prototype Multi-Screen Routes */}
      <Route path="/government" element={<GovernmentPage />} />
      <Route path="/vendor" element={<VendorPage />} />
      <Route path="/processing/:bidId" element={<ProcessingPage />} />
      <Route path="/score/:bidId" element={<ScorePage />} />
      <Route path="/evaluator/:bidId" element={<EvaluatorPage />} />
      <Route path="/evaluator" element={<EvaluatorPage />} />
      <Route path="/decision/:bidId" element={<DecisionPage />} />

      <Route path="/gem-portal" element={<GemPortalPage />} />
      <Route path="/ap-portal" element={<GovernmentPortalPage />} />
      <Route path="/egp-portal" element={<GovernmentPortalPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* User / Bidder Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-check"
        element={
          <ProtectedRoute>
            <NewCheckWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify/:portal/:bidId"
        element={
          <ProtectedRoute>
            <NewCheckWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify/:bidId"
        element={
          <ProtectedRoute>
            <NewCheckWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <NewCheckWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare"
        element={
          <AdminRoute>
            <VendorComparisonPage />
          </AdminRoute>
        }
      />

      {/* Admin / Evaluator Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/create-bid"
        element={
          <AdminRoute>
            <CreateBidPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vendors"
        element={
          <AdminRoute>
            <VendorManagementPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/comparison"
        element={
          <AdminRoute>
            <VendorComparisonPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminRoute>
            <AuditLogPage />
          </AdminRoute>
        }
      />


      {/* Dedicated AI Verification Test Page */}
      <Route
        path="/test-page"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <NewCheckWizard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
