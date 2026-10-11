import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import VoucherList from './pages/VoucherList';
import CreateVoucher from './pages/CreateVoucher';
import EditVoucher from './pages/EditVoucher';
import PrintVoucher from './pages/PrintVoucher';

// Root redirect based on active role
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
  if (user.role === 'director') return <Navigate to="/director/dashboard" replace />;
  if (user.role === 'accounts') return <Navigate to="/accounts/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// App Layout Wrapper
function Layout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/vouchers"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Layout>
                  <VoucherList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/create"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Layout>
                  <CreateVoucher />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Layout>
                  <EditVoucher />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Director Routes */}
          <Route
            path="/director/dashboard"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <Layout>
                  <DirectorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/pending"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <Layout>
                  <VoucherList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/vouchers"
            element={
              <ProtectedRoute allowedRoles={['director']}>
                <Layout>
                  <VoucherList />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Accounts Routes */}
          <Route
            path="/accounts/dashboard"
            element={
              <ProtectedRoute allowedRoles={['accounts']}>
                <Layout>
                  <AccountsDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/vouchers"
            element={
              <ProtectedRoute allowedRoles={['accounts']}>
                <Layout>
                  <VoucherList />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Printable Voucher View */}
          <Route
            path="/print/:id"
            element={
              <ProtectedRoute allowedRoles={['employee', 'director', 'accounts']}>
                <PrintVoucher />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
