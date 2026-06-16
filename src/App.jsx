import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import DashboardAuth from './pages/DashboardAuth';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import Programs from './pages/Programs';
import ApplyPage from './pages/ApplyPage';
import ApplicationForm from './pages/ApplicationForm';
import MyApplications from './pages/MyApplications';
import ApplicationDetail from './pages/ApplicationDetail';
import AdminDashboard from './pages/AdminDashboard';
import Positions from './pages/Positions';
import InternDashboard from './pages/InternDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Attendance from './pages/Attendance';
import QRKiosk from './pages/QRKiosk';
import Leave from './pages/Leave';
import Tasks from './pages/Tasks';
import Reviews from './pages/Reviews';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import Reports from './pages/Reports';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<DashboardAuth />} />
            <Route path="/auth" element={<DashboardAuth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/reset-password/:token" element={<PasswordResetConfirm />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/intern-positions" element={<Positions />} />

            {/* Intern routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><InternDashboard /></ProtectedRoute>
            } />
            <Route path="/my-applications" element={
              <ProtectedRoute><MyApplications /></ProtectedRoute>
            } />
            <Route path="/apply" element={
              <ProtectedRoute><ApplyPage /></ProtectedRoute>
            } />
            <Route path="/apply/:programId" element={
              <ProtectedRoute><ApplicationForm /></ProtectedRoute>
            } />
            <Route path="/apply-for-internship/:programId" element={
              <ProtectedRoute><ApplicationForm /></ProtectedRoute>
            } />
            <Route path="/application/:id" element={
              <ProtectedRoute><ApplicationDetail /></ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute><Attendance /></ProtectedRoute>
            } />
            <Route path="/attendance/scan/:token" element={
              <ProtectedRoute><Attendance /></ProtectedRoute>
            } />
            <Route path="/qr-kiosk" element={
              <ProtectedRoute requireAdmin><QRKiosk /></ProtectedRoute>
            } />
            <Route path="/leave" element={
              <ProtectedRoute><Leave /></ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute><Tasks /></ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute><Reviews /></ProtectedRoute>
            } />
            <Route path="/onboarding/:applicationId" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><Notifications /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Supervisor routes */}
            <Route path="/supervisor" element={
              <ProtectedRoute requireSupervisor><SupervisorDashboard /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requireAdmin><Reports /></ProtectedRoute>
            } />

            {/* 404 catch-all */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="mt-4 text-xl text-gray-500">Page not found</p>
                  <a href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;