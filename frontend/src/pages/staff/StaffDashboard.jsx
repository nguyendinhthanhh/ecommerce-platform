import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        pendingApprovals: 24,
        approvalsGrowth: 8.4,
        flaggedProducts: 12,
        flagsGrowth: -15,
        pendingOrders: 42,
        ordersGrowth: 12.5,
        assignedTasks: 8,
        tasksGrowth: 0
    });

    const [recentModerations] = useState([
        {
            timestamp: 'Today, 11:30 AM',
            event: 'Order #CONF-2024 Approved',
            user: 'staff_user_01',
            status: 'Confirmed',
            statusColor: 'emerald'
        },
        {
            timestamp: 'Today, 10:15 AM',
            event: 'Flagged Product: Samsung S24 Ultra',
            user: 'Moderation System',
            status: 'Pending',
            statusColor: 'orange'
        },
        {
            timestamp: 'Yesterday, 05:40 PM',
            event: 'New Category: Luxury Cases',
            user: 'system_admin',
            status: 'Updated',
            statusColor: 'blue'
        },
        {
            timestamp: 'Yesterday, 02:20 PM',
            event: 'Order #SHIP-9912 Dispatched',
            user: 'Staff-Bot-01',
            status: 'Shipped',
            statusColor: 'blue'
        }
    ]);

    return (
        <AdminLayout>
            <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                {/* Page Title */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Workspace</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor platform activity, process orders, and moderate community content.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
                            <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-1.5 rounded-lg">fact_check</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingApprovals}</h3>
                            <span className={`text-sm font-medium mb-1 ${stats.approvalsGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stats.approvalsGrowth >= 0 ? '+' : ''}{stats.approvalsGrowth}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Flagged Items</p>
                            <span className="material-symbols-outlined text-red-500 bg-red-500/10 p-1.5 rounded-lg">report</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.flaggedProducts}</h3>
                            <span className={`text-sm font-medium mb-1 ${stats.flagsGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stats.flagsGrowth >= 0 ? '+' : ''}{stats.flagsGrowth}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Orders</p>
                            <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-1.5 rounded-lg">shopping_cart</span>
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
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Assigned Tasks</p>
                            <span className="material-symbols-outlined text-purple-500 bg-purple-500/10 p-1.5 rounded-lg">assignment</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.assignedTasks}</h3>
                            <span className="text-sm font-medium mb-1 text-slate-400">Steady</span>
                        </div>
                    </div>
                </div>

                {/* Action Center - Quick Links */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Moderation Queue</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">shopping_bag</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Product Approvals</h4>
                                        <p className="text-xs text-slate-500">8 items waiting for review</p>
                                    </div>
                                </div>
                                <button className="text-primary text-xs font-bold hover:underline">Process →</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <span className="material-symbols-outlined text-red-600 dark:text-red-400">verified_user</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Flagged Content</h4>
                                        <p className="text-xs text-slate-500">12 urgent issues reported</p>
                                    </div>
                                </div>
                                <button className="text-primary text-xs font-bold hover:underline">Investigate →</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentModerations.map((activity, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 pr-4">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.event}</p>
                                                <p className="text-xs text-slate-500">{activity.timestamp}</p>
                                            </td>
                                            <td className="py-3 text-right">
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
            </div>
        </AdminLayout>
    );
};

export default StaffDashboard;
