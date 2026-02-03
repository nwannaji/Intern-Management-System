import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import DashboardAuth from './pages/DashboardAuth';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import TestPasswordReset from './pages/TestPasswordReset';
import Programs from './pages/Programs';
import ApplyPage from './pages/ApplyPage';
import ApplicationForm from './pages/ApplicationForm';
import MyApplications from './pages/MyApplications';
import ApplicationDetail from './pages/ApplicationDetail';
import AdminDashboard from './pages/AdminDashboard';
import Positions from './pages/Positions';

// Simple component to test routing
const SimplePasswordReset = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Password Reset</h1>
    <p>Simple password reset page for testing</p>
    <a href="/login">Back to Login</a>
  </div>
);

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<DashboardAuth />} />
            <Route path="/auth" element={<DashboardAuth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/simple-password-reset" element={<SimplePasswordReset />} />
            <Route path="/test-password-reset" element={<TestPasswordReset />} />
            <Route path="/reset-password/:token" element={<PasswordResetConfirm />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/apply" element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            } />
            <Route path="/apply/:programId" element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            } />
            <Route path="/apply-for-internship/:programId" element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            } />
            <Route path="/intern-positions" element={<Positions />} />
            
            <Route path="/my-applications" element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            } />
            
            <Route path="/application/:id" element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;