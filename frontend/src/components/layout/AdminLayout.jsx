import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/users', icon: 'group', label: 'User Management' },
    { path: '/admin/products', icon: 'inventory_2', label: 'Product Moderation' },
    { path: '/admin/reviews', icon: 'chat', label: 'Content Reviews' },
    { path: '/admin/reports', icon: 'bar_chart', label: 'System Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full transition-colors duration-200">
        <div className="p-6 flex flex-col gap-8 h-full">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <h1 className="text-[#0f0d1b] dark:text-white text-lg font-bold leading-tight">ShopAI Admin</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">Enterprise Suite</p>
            </div>
          </Link>

          <nav className="flex flex-col gap-1 grow">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}

            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-slate-500 hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 dark:text-white font-medium">Admin</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-primary transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Search data..."
                  type="text"
                />
              </label>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <div className="relative group">
              <button className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {user?.fullName || 'Admin'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
