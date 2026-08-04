import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { Activity, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Outpatient (OPD) Revenue', data: [45000, 52000, 61000, 75000], backgroundColor: '#0C8BE8' },
      { label: 'Inpatient (IPD) Revenue', data: [85000, 92000, 110000, 125000], backgroundColor: '#10B981' },
      { label: 'Pharmacy & Lab Sales', data: [28000, 31000, 38000, 42000], backgroundColor: '#F59E0B' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hospital Financial & Clinical Analytics</h1>
            <p className="text-xs text-slate-500">Executive financial breakdowns, quarterly performance metrics, and bed occupancy trends</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Quarterly Growth" value="+22.4%" icon={TrendingUp} color="emerald" />
            <StatCard title="Average Stay Duration" value="3.2 Days" icon={Users} color="blue" />
            <StatCard title="Pharmacy Revenue" value="₹4,20,000" icon={DollarSign} color="purple" />
            <StatCard title="Lab Diagnostic Sales" value="₹1,85,000" icon={Activity} color="amber" />
          </div>

          <div className="p-6 rounded-2xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Quarterly Revenue Breakdown by Department (₹)</h3>
            <div className="h-80">
              <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
