import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers & Components
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterPatient from './pages/RegisterPatient';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import Unauthorized from './pages/Unauthorized';

// Role Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';
import NurseDashboard from './pages/dashboards/NurseDashboard';
import LabAssistantDashboard from './pages/dashboards/LabAssistantDashboard';
import PharmacistDashboard from './pages/dashboards/PharmacistDashboard';
import CashierDashboard from './pages/dashboards/CashierDashboard';

// Feature Modules
import UserManagement from './pages/modules/UserManagement';
import StaffManagement from './pages/modules/StaffManagement';
import DepartmentManagement from './pages/modules/DepartmentManagement';
import PatientManagement from './pages/modules/PatientManagement';
import AppointmentManagement from './pages/modules/AppointmentManagement';
import DoctorSchedule from './pages/modules/DoctorSchedule';
import MedicalRecords from './pages/modules/MedicalRecords';
import PrescriptionModule from './pages/modules/PrescriptionModule';
import NurseVitalsModule from './pages/modules/NurseVitalsModule';
import LabManagement from './pages/modules/LabManagement';
import PharmacyInventory from './pages/modules/PharmacyInventory';
import BillingPayments from './pages/modules/BillingPayments';
import ReportsAnalytics from './pages/modules/ReportsAnalytics';
import ActivityLogs from './pages/modules/ActivityLogs';
import SystemSettings from './pages/modules/SystemSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Toast />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterPatient />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/patients" element={<PatientManagement />} />
                <Route path="/appointments" element={<AppointmentManagement />} />
                <Route path="/medical-records" element={<MedicalRecords />} />
                <Route path="/prescriptions" element={<PrescriptionModule />} />
                <Route path="/lab/management" element={<LabManagement />} />
                <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
                <Route path="/billing" element={<BillingPayments />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/staff" element={<StaffManagement />} />
                <Route path="/admin/departments" element={<DepartmentManagement />} />
                <Route path="/admin/reports" element={<ReportsAnalytics />} />
                <Route path="/admin/activity-logs" element={<ActivityLogs />} />
                <Route path="/admin/settings" element={<SystemSettings />} />
              </Route>

              {/* Doctor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Doctor', 'Admin']} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/schedule" element={<DoctorSchedule />} />
              </Route>

              {/* Patient Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Patient', 'Admin']} />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
              </Route>

              {/* Receptionist Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Receptionist', 'Admin']} />}>
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              </Route>

              {/* Nurse Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Nurse', 'Admin']} />}>
                <Route path="/nurse/dashboard" element={<NurseDashboard />} />
                <Route path="/nurse/vitals" element={<NurseVitalsModule />} />
              </Route>

              {/* Lab Assistant Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Lab Assistant', 'Admin']} />}>
                <Route path="/lab/dashboard" element={<LabAssistantDashboard />} />
              </Route>

              {/* Pharmacist Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Pharmacist', 'Admin']} />}>
                <Route path="/pharmacy/dashboard" element={<PharmacistDashboard />} />
              </Route>

              {/* Cashier Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Cashier', 'Admin']} />}>
                <Route path="/cashier/dashboard" element={<CashierDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
