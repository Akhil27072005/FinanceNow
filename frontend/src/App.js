import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppThemeProvider } from './contexts/AppThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import MarketingShell from './components/layout/MarketingShell';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Subcategories from './pages/Subcategories';
import Tags from './pages/Tags';
import PaymentMethods from './pages/PaymentMethods';
import Subscriptions from './pages/Subscriptions';
import Budgets from './pages/Budgets';
import Investments from './pages/Investments';
import Settings from './pages/Settings';
import LandingRoute from './components/LandingRoute';

const Reports = lazy(() => import('./pages/Reports'));

/**
 * Main App Component
 * Sets up routing and authentication context
 */
function App() {
  return (
    <AuthProvider>
      <AppThemeProvider>
      <Router>
        <Routes>
          <Route element={<MarketingShell />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingRoute />} />
          </Route>

          {/* Public Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Transactions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Categories />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subcategories"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subcategories />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tags"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Tags />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-methods"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PaymentMethods />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subscriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Budgets />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense
                    fallback={
                      <div className="reports-page" style={{ padding: '2rem', opacity: 0.7 }}>
                        Loading reports…
                      </div>
                    }
                  >
                    <Reports />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Investments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Landing (guests) or redirect to dashboard (authenticated) */}
        </Routes>
      </Router>
      </AppThemeProvider>
    </AuthProvider>
  );
}

export default App;
