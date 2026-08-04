import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Activity, ShieldCheck, Clock, Users, Heart, ArrowRight, Stethoscope, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical-100 dark:bg-medical-950/80 border border-medical-200 dark:border-medical-900 text-medical-700 dark:text-medical-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Activity className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <span>Next-Generation Healthcare SaaS</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Streamlined Hospital Management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500">Modern Medical Excellence</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                A complete full-stack Hospital Management Platform connecting 8 specialized hospital roles seamlessly — Admin, Doctors, Receptionists, Nurses, Lab Assistants, Pharmacists, Cashiers, and Patients.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-2xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-base shadow-lg shadow-medical-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Access Demo Portals</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base transition-all"
                >
                  Patient Self Registration
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">8+</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Specialized Roles</p>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">99.9%</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">System Uptime</p>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">REST API Ready</p>
                </div>
              </div>
            </motion.div>

            {/* Right Card Mockup */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative">
              <div className="p-6 rounded-3xl glass-panel shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-medical-500 flex items-center justify-center text-white font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Live OPD Queue Dashboard</h4>
                      <p className="text-xs text-slate-500">Dr. Ananya Sharma • Room 201</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    Live Sync
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Rahul Kumar', age: '38M', type: 'Cardiac Follow-up', status: 'Consultation In Progress', time: '09:00 AM' },
                    { name: 'Priya Sharma', age: '29F', type: 'Neuro Post-Op Review', status: 'Vitals Recorded', time: '10:30 AM' },
                    { name: 'Vikram Malhotra', age: '45M', type: 'General Checkup', status: 'Scheduled', time: '11:15 AM' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{p.name} <span className="font-normal text-slate-400">({p.age})</span></p>
                        <p className="text-slate-500">{p.type}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-medical-100 dark:bg-medical-950 text-medical-700 dark:text-medical-300 font-semibold text-[10px]">
                          {p.status}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">{p.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/40 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Unified Clinical & Operational Modules</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Built with React, Express, Node.js, and MongoDB for complete enterprise healthcare workflow management.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Multi-Role Security', desc: 'Granular JWT RBAC authorization protecting sensitive EMR patient records across all 8 user roles.' },
              { icon: Stethoscope, title: 'EMR & Prescriptions', desc: 'Digital doctor consultation suites, symptom logging, automated prescription generation, and PDF downloads.' },
              { icon: Activity, title: 'Lab & Imaging Uploads', desc: 'Direct upload of lab test reports, X-rays, MRI, CT scans, and pathology results.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-medical-100 dark:bg-medical-950 text-medical-600 dark:text-medical-400 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 AuraCare • Production Full Stack Hospital Management Application</p>
      </footer>
    </div>
  );
};

export default LandingPage;
