import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 128430,
    salesGrowth: 12.5,
    newUsers: 1240,
    usersGrowth: 5.2,
    pendingOrders: 42,
    ordersGrowth: -2.1,
    aiFlags: 18,
    flagsGrowth: 14
  });

  const [recentActivities] = useState([
    {
      timestamp: 'Today, 10:45 AM',
      event: 'Product ID #402 flagged',
      user: 'ShopAI-Moderator-v2',
      status: 'Critical',
      statusColor: 'red'
    },
    {
      timestamp: 'Today, 09:12 AM',
      event: 'New User Registered',
      user: 'alex.j@example.com',
      status: 'Completed',
      statusColor: 'emerald'
    },
    {
      timestamp: 'Yesterday, 06:22 PM',
      event: 'System Update Deployed',
      user: 'Deploy-Bot-Alpha',
      status: 'Information',
      statusColor: 'blue'
    },
    {
      timestamp: 'Yesterday, 04:50 PM',
      event: 'High Revenue Alert',
      user: 'Finance-Engine',
      status: 'Successful',
      statusColor: 'emerald'
    }
  ]);

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* Page Title */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time insight into your platform performance and AI monitoring.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sales</p>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">payments</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalSales.toLocaleString()}</h3>
              <span className={`text-sm font-medium mb-1 ${stats.salesGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">New Users</p>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">person_add</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newUsers.toLocaleString()}</h3>
              <span className={`text-sm font-medium mb-1 ${stats.usersGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Orders</p>
              <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-1.5 rounded-lg">shopping_cart</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOrders}</h3>
              <span className={`text-sm font-medium mb-1 ${stats.ordersGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.ordersGrowth >= 0 ? '+' : ''}{stats.ordersGrowth}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">AI Flags</p>
              <span className="material-symbols-outlined text-red-600 bg-red-600/10 p-1.5 rounded-lg">report</span>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.aiFlags}</h3>
              <span className={`text-sm font-medium mb-1 ${stats.flagsGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.flagsGrowth >= 0 ? '+' : ''}{stats.flagsGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Performance</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800">12M</button>
                <button className="px-3 py-1 text-xs font-semibold rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">30D</button>
              </div>
            </div>
            <div className="w-full h-64 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {[20, 40, 35, 60, 55, 80, 75, 90].map((height, idx) => (
                  <div
                    key={idx}
                    className="bg-primary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%`, width: '8%', opacity: 0.2 + (idx * 0.1) }}
                  ></div>
                ))}
              </div>
              <div className="z-10 text-slate-400 text-xs font-medium">Monthly Revenue Visualization</div>
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sales by Category</h3>
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-40 h-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent -rotate-12"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">64%</span>
                  <span className="text-xs text-slate-500">Electronics</span>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                {[
                  { label: 'Electronics', color: 'bg-primary' },
                  { label: 'Apparel', color: 'bg-slate-300' },
                  { label: 'Home', color: 'bg-indigo-400' },
                  { label: 'Others', color: 'bg-blue-200' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity Logs</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User/System</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivities.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{activity.timestamp}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{activity.event}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{activity.user}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded bg-${activity.statusColor}-100 text-${activity.statusColor}-600 dark:bg-${activity.statusColor}-900/30 dark:text-${activity.statusColor}-400`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
