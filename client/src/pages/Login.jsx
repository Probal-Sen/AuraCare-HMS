import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Activity, LogIn, Lock, Mail, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const demoAccounts = [
  { role: 'Admin', email: 'admin@auracare.com', label: 'Admin (Rajesh)', color: 'bg-purple-600' },
  { role: 'Doctor', email: 'doctor@auracare.com', label: 'Doctor (Dr. Ananya)', color: 'bg-blue-600' },
  { role: 'Receptionist', email: 'receptionist@auracare.com', label: 'Receptionist (Priya)', color: 'bg-teal-600' },
  { role: 'Nurse', email: 'nurse@auracare.com', label: 'Nurse (Sunita)', color: 'bg-emerald-600' },
  { role: 'Lab Assistant', email: 'lab@auracare.com', label: 'Lab (Ramesh)', color: 'bg-cyan-600' },
  { role: 'Pharmacist', email: 'pharmacist@auracare.com', label: 'Pharmacy (Vikram)', color: 'bg-amber-600' },
  { role: 'Cashier', email: 'cashier@auracare.com', label: 'Cashier (Amit)', color: 'bg-orange-600' },
  { role: 'Patient', email: 'patient@auracare.com', label: 'Patient (Rahul)', color: 'bg-rose-600' },
];

const Login = () => {
  const [email, setEmail] = useState('admin@auracare.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  const { login, loading } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleFastFill = (account) => {
    setEmail(account.email);
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password);
    if (res?.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
      switch (res.user.role) {
        case 'Admin': navigate('/admin/dashboard'); break;
        case 'Doctor': navigate('/doctor/dashboard'); break;
        case 'Patient': navigate('/patient/dashboard'); break;
        case 'Receptionist': navigate('/receptionist/dashboard'); break;
        case 'Nurse': navigate('/nurse/dashboard'); break;
        case 'Lab Assistant': navigate('/lab/dashboard'); break;
        case 'Pharmacist': navigate('/pharmacy/dashboard'); break;
        case 'Cashier': navigate('/cashier/dashboard'); break;
        default: navigate('/');
      }
    } else {
      setError(res?.message || 'Invalid credentials');
      addToast(res?.message || 'Login failed', 'danger', 'Authentication Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative">
      {/* Top-Left Fixed Return Button */}
      <Link
        to="/"
        className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4 text-medical-600 dark:text-medical-400" />
        <span>Return to Home</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-medical-600/30 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Aura<span className="text-medical-600 dark:text-medical-400">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">AuraCare Portal Login</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a demo role or enter your credentials</p>
        </div>

        {/* Fast Fill Demo Buttons */}
        <div className="p-4 rounded-2xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            ⚡ Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleFastFill(acc)}
                className={`py-1.5 px-2 rounded-xl text-white font-semibold text-[11px] truncate transition-transform active:scale-95 shadow-sm ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-xl border border-slate-200/80 dark:border-slate-800">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500/50"
                  placeholder="name@hospital.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-medical-600 dark:text-medical-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm shadow-lg shadow-medical-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Enter System</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs space-y-2">
            <div>
              <span className="text-slate-500">New patient seeking care? </span>
              <Link to="/register" className="font-bold text-medical-600 dark:text-medical-400 hover:underline">
                Create Patient Account
              </Link>
            </div>
            <div>
              <Link to="/" className="inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Main Landing Page</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
