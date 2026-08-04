import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  Pill,
  TestTube,
  CreditCard,
  Activity,
  History,
  Settings,
  HeartPulse,
  Award,
  Stethoscope,
  ClipboardList,
  FolderLock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  // Role-Specific Navigation Definitions
  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Management', path: '/admin/users', icon: Users },
          { label: 'Staff Directory', path: '/admin/staff', icon: UserCheck },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'All Patients', path: '/patients', icon: HeartPulse },
          { label: 'Appointments', path: '/appointments', icon: Calendar },
          { label: 'Medical Records', path: '/medical-records', icon: FileText },
          { label: 'Pharmacy Stock', path: '/pharmacy/inventory', icon: Pill },
          { label: 'Lab & Diagnostics', path: '/lab/management', icon: TestTube },
          { label: 'Billing & Cashier', path: '/billing', icon: CreditCard },
          { label: 'Reports & Analytics', path: '/admin/reports', icon: Activity },
          { label: 'Audit Activity Logs', path: '/admin/activity-logs', icon: History },
          { label: 'System Settings', path: '/admin/settings', icon: Settings },
        ];

      case 'Doctor':
        return [
          { label: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'My Appointments', path: '/appointments', icon: Calendar },
          { label: 'Patient EMR Records', path: '/medical-records', icon: Stethoscope },
          { label: 'Write Prescription', path: '/prescriptions', icon: Pill },
          { label: 'Recommend Lab Tests', path: '/lab/management', icon: TestTube },
          { label: 'My Daily Schedule', path: '/doctor/schedule', icon: ClipboardList },
        ];

      case 'Receptionist':
        return [
          { label: 'Reception Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { label: 'Register Patient', path: '/patients', icon: HeartPulse },
          { label: 'Book Appointment', path: '/appointments', icon: Calendar },
          { label: 'OPD / IPD Admissions', path: '/patients', icon: Building2 },
        ];

      case 'Nurse':
        return [
          { label: 'Nurse Dashboard', path: '/nurse/dashboard', icon: LayoutDashboard },
          { label: 'Ward Patients & Vitals', path: '/nurse/vitals', icon: HeartPulse },
          { label: 'Specimen Collection', path: '/lab/management', icon: TestTube },
        ];

      case 'Lab Assistant':
        return [
          { label: 'Lab Dashboard', path: '/lab/dashboard', icon: LayoutDashboard },
          { label: 'Pending Lab Tests', path: '/lab/management', icon: TestTube },
        ];

      case 'Pharmacist':
        return [
          { label: 'Pharmacy Dashboard', path: '/pharmacy/dashboard', icon: LayoutDashboard },
          { label: 'Medicine Inventory', path: '/pharmacy/inventory', icon: Pill },
          { label: 'Prescription Queue', path: '/prescriptions', icon: ClipboardList },
        ];

      case 'Cashier':
        return [
          { label: 'Cashier Dashboard', path: '/cashier/dashboard', icon: LayoutDashboard },
          { label: 'Generate & Pay Bills', path: '/billing', icon: CreditCard },
        ];

      case 'Patient':
        return [
          { label: 'Patient Portal', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Book Appointment', path: '/appointments', icon: Calendar },
          { label: 'My Prescriptions', path: '/prescriptions', icon: Pill },
          { label: 'My Lab Reports', path: '/lab/management', icon: TestTube },
          { label: 'Billing & Receipts', path: '/billing', icon: CreditCard },
          { label: 'Medical History', path: '/medical-records', icon: FolderLock },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800 transform transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
        {/* User Role Badge */}
        <div className="mb-4 p-3 rounded-xl bg-medical-50/80 dark:bg-medical-950/50 border border-medical-200/60 dark:border-medical-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-medical-600 dark:text-medical-400">
            Active Role
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{role}</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-medical-600 text-white shadow-md shadow-medical-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* System Version */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">AuraCare • Protected RBAC</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
