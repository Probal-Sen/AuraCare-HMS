import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Sun, Moon, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Admin': return '/admin/dashboard';
      case 'Doctor': return '/doctor/dashboard';
      case 'Patient': return '/patient/dashboard';
      case 'Receptionist': return '/receptionist/dashboard';
      case 'Nurse': return '/nurse/dashboard';
      case 'Lab Assistant': return '/lab/dashboard';
      case 'Pharmacist': return '/pharmacy/dashboard';
      case 'Cashier': return '/cashier/dashboard';
      default: return '/login';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-medical-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Aura<span className="text-medical-600 dark:text-medical-400">Care</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <button
              onClick={() => navigate(getDashboardPath())}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm shadow-md shadow-medical-600/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-medical-600 hover:bg-medical-700 text-white shadow-md shadow-medical-600/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Patient Registration</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
