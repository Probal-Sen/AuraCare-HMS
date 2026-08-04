import React, { useState, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { NotificationContext } from '../../context/NotificationContext';
import { Settings, Save, Shield, Database, Mail } from 'lucide-react';

const SystemSettings = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [settings, setSettings] = useState({
    hospitalName: 'AuraCare Medical Center & Hospital',
    emergencyPhone: '+91 80 5550 0199',
    taxRate: '18',
    currency: 'INR (₹)',
    enableEmailAlerts: true,
    enableAutoBackup: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Settings & Global Configuration</h1>
            <p className="text-xs text-slate-500">Hospital metadata, billing taxes, email notification server, and security policies</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={settings.hospitalName}
                    onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={settings.emergencyPhone}
                    onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.enableEmailAlerts}
                    onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                    className="rounded text-medical-600 focus:ring-medical-500"
                  />
                  <span>Enable Email Notifications for Low Stock & Appointments</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.enableAutoBackup}
                    onChange={(e) => setSettings({ ...settings, enableAutoBackup: e.target.checked })}
                    className="rounded text-medical-600 focus:ring-medical-500"
                  />
                  <span>Enable Automated Daily Database Backups</span>
                </label>
              </div>

              <button type="submit" className="px-5 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
