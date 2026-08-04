import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useContext(NotificationContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Password reset link sent to your registered email.', 'info');
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

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-medical-600/30 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Aura<span className="text-medical-600 dark:text-medical-400">Care</span>
            </span>
          </Link>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset AuraCare Password</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Enter your registered email to receive password reset instructions.</p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold">Reset Email Dispatched!</p>
            <p className="mt-1">Check your inbox for step-by-step instructions to create a new password.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="name@hospital.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-medical-600">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Login</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-medical-600">
            <span>Return to Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
