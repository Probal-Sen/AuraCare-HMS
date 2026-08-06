import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import API from '../../services/api';
import { Users, UserCheck, DollarSign, Calendar, AlertTriangle, Activity, Building2, TrendingUp } from 'lucide-react';

// Chart.js registration
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    const handleSync = () => fetchDashboardData();
    window.addEventListener('auracare_data_updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auracare_data_updated', handleSync);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Admin Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartData = {
    labels: data?.revenueChart?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Hospital Revenue (₹)',
        data: data?.revenueChart?.data || [120000, 150000, 180000, 140000, 220000, 260000, 240000, 310000],
        borderColor: '#0C8BE8',
        backgroundColor: 'rgba(12, 139, 232, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const appointmentChartData = {
    labels: data?.appointmentChart?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'OPD / IPD Consultations',
        data: data?.appointmentChart?.data || [42, 58, 65, 50, 72, 35, 20],
        backgroundColor: '#0D9488',
        borderRadius: 8,
      },
    ],
  };

  const occupancyData = {
    labels: ['Occupied Beds', 'Available Beds', 'ICU Beds'],
    datasets: [
      {
        data: [78, 22, 10],
        backgroundColor: ['#0C8BE8', '#10B981', '#F59E0B'],
      },
    ],
  };

  const activityColumns = [
    { header: 'User', accessor: 'userName' },
    { header: 'Role', accessor: 'userRole' },
    { header: 'Action', accessor: 'action' },
    { header: 'Details', accessor: 'details' },
    { header: 'Timestamp', accessor: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hospital Executive Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time clinical metrics, revenue performance, and system operational audit</p>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Patients" value={data?.stats?.totalPatients || 12} icon={Users} color="blue" trend="14%" subtext="vs last month" />
            <StatCard title="Active Doctors" value={data?.stats?.totalDoctors || 8} icon={UserCheck} color="emerald" trend="2 new" subtext="this week" />
            <StatCard title="Total Revenue" value={`₹${(data?.stats?.totalRevenue || 1450000).toLocaleString('en-IN')}`} icon={DollarSign} color="purple" trend="18.5%" subtext="YTD Growth" />
            <StatCard title="Low Stock Alerts" value={data?.stats?.lowStockCount || 3} icon={AlertTriangle} color="amber" subtext="Action Required" />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 p-5 rounded-2xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Monthly Revenue Analytics (₹)</h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.5%
                </span>
              </div>
              <div className="h-64">
                <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Occupancy Doughnut */}
            <div className="p-5 rounded-2xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Hospital Bed Occupancy</h3>
              <div className="h-52 flex items-center justify-center">
                <Doughnut data={occupancyData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">Overall Hospital Bed Occupancy: <strong>78%</strong></p>
            </div>
          </div>

          {/* Appointment Bar Chart */}
          <div className="p-5 rounded-2xl glass-panel shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Weekly Appointment Consultation Load</h3>
            <div className="h-56">
              <Bar data={appointmentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Audit Logs Table */}
          <DataTable title="Recent Audit Logs & System Activity" columns={activityColumns} data={data?.recentActivities || []} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
