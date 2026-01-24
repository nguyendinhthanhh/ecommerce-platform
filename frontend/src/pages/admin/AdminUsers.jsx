import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    totalCustomers: 12482,
    customersGrowth: 4.2,
    activeSellers: 842,
    sellersGrowth: 1.8,
    pendingApproval: 14,
    bannedUsers: 128
  });

  // Mock data - replace with API call
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // const response = await api.get('/admin/users', { params: filters });
    
    // Mock data
    setTimeout(() => {
      setUsers([
        {
          id: 1024,
          fullName: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          lastLogin: '2 hours ago',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
          id: 1023,
          fullName: 'Mark Thompson',
          email: 'm.thompson@seller.net',
          role: 'SELLER',
          status: 'BANNED',
          lastLogin: '3 days ago',
          avatar: 'https://i.pravatar.cc/150?img=2'
        },
        {
          id: 1022,
          fullName: 'David Chen',
          email: 'dchen_official@gmail.com',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          lastLogin: 'Just now',
          avatar: 'https://i.pravatar.cc/150?img=3'
        },
        {
          id: 1021,
          fullName: 'Elena Rodriguez',
          email: 'elena.rod@boutique.co',
          role: 'SELLER',
          status: 'ACTIVE',
          lastLogin: '12 hours ago',
          avatar: 'https://i.pravatar.cc/150?img=4'
        },
        {
          id: 1020,
          fullName: 'Julian Black',
          email: 'jblack_99@hotmail.com',
          role: 'CUSTOMER',
          status: 'BANNED',
          lastLogin: 'Oct 24, 2023',
          avatar: 'https://i.pravatar.cc/150?img=5'
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      // TODO: API call to ban user
      console.log('Ban user:', userId);
      loadUsers();
    }
  };

  const handleUnbanUser = async (userId) => {
    if (window.confirm('Are you sure you want to unban this user?')) {
      // TODO: API call to unban user
      console.log('Unban user:', userId);
      loadUsers();
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Send password reset email to this user?')) {
      // TODO: API call to reset password
      console.log('Reset password for user:', userId);
    }
  };

  const getRoleBadgeColor = (role) => {
    return role === 'CUSTOMER' ? 'blue' : 'purple';
  };

  const getStatusBadgeColor = (status) => {
    return status === 'ACTIVE' ? 'green' : 'red';
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          
          <div className="flex items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
              <select 
                className="border-none bg-transparent text-sm p-0 focus:ring-0 cursor-pointer min-w-[100px]"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="all">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select 
                className="border-none bg-transparent text-sm p-0 focus:ring-0 cursor-pointer min-w-[100px]"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            <button className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-slate-600 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">User Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Last Login</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-slate-400">#{user.id}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            alt={user.fullName} 
                            className="h-8 w-8 rounded-full border border-slate-200" 
                            src={user.avatar}
                          />
                          <span className="text-sm font-semibold">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 text-[11px] font-bold bg-${getRoleBadgeColor(user.role)}-100 text-${getRoleBadgeColor(user.role)}-700 dark:bg-${getRoleBadgeColor(user.role)}-900/30 dark:text-${getRoleBadgeColor(user.role)}-400 rounded-full uppercase tracking-tighter`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-${getStatusBadgeColor(user.status)}-100 text-${getStatusBadgeColor(user.status)}-700 dark:bg-${getStatusBadgeColor(user.status)}-900/30 dark:text-${getStatusBadgeColor(user.status)}-400 rounded-full uppercase tracking-tighter`}>
                          <span className={`h-1.5 w-1.5 rounded-full bg-${getStatusBadgeColor(user.status)}-500`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">{user.lastLogin}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all" 
                            title="Edit User"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          
                          {user.status === 'ACTIVE' ? (
                            <button 
                              onClick={() => handleBanUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all" 
                              title="Ban Account"
                            >
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUnbanUser(user.id)}
                              className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/40 rounded-md transition-all" 
                              title="Unban Account"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleResetPassword(user.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-all" 
                            title="Reset Password"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700 dark:text-slate-300">1 to 5</span> of <span className="font-bold text-slate-700 dark:text-slate-300">128</span> users
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="px-3 py-1 bg-primary text-white text-xs font-bold rounded">1</button>
              <button className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 rounded hover:bg-slate-50">2</button>
              <button className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 rounded hover:bg-slate-50">3</button>
              <span className="px-2 text-slate-400">...</span>
              <button className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 rounded hover:bg-slate-50">24</button>
              <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-400 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Customers</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</h3>
              <span className="text-xs text-green-500 font-semibold">+{stats.customersGrowth}%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Sellers</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stats.activeSellers}</h3>
              <span className="text-xs text-green-500 font-semibold">+{stats.sellersGrowth}%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Approval</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stats.pendingApproval}</h3>
              <span className="text-xs text-amber-500 font-semibold">Review Required</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Banned Users</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stats.bannedUsers}</h3>
              <span className="text-xs text-slate-400 font-semibold">Total History</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
