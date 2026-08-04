import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import API from '../../services/api';

const ActivityLogs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/activity-logs');
      if (res.data.success) setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Timestamp', accessor: 'createdAt', cell: (r) => new Date(r.createdAt).toLocaleString() },
    { header: 'User Name', accessor: 'userName' },
    { header: 'Role', accessor: 'userRole' },
    { header: 'Action', accessor: 'action' },
    { header: 'Details', accessor: 'details' },
    { header: 'IP Address', accessor: 'ipAddress' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Audit Activity Trails & Security Logs</h1>
            <p className="text-xs text-slate-500">Immutable system action logs tracking user authentication, record modifications, and billing transactions</p>
          </div>

          <DataTable title="System Audit Logs" columns={columns} data={logs} />
        </main>
      </div>
    </div>
  );
};

export default ActivityLogs;
