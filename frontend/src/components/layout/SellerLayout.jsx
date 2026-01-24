import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const SellerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [shopOpen, setShopOpen] = useState(true);
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary size-8 rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">storefront</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Seller Center</h1>
            <p className="text-xs text-slate-500 mt-1">Verified Merchant</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            to="/seller/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/seller/dashboard')
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={isActive('/seller/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              dashboard
            </span>
            <span className={`text-sm ${isActive('/seller/dashboard') ? 'font-bold' : 'font-medium'}`}>
              Dashboard
            </span>
          </Link>

          <Link
            to="/seller/orders"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/seller/orders')
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={isActive('/seller/orders') ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              package_2
            </span>
            <span className={`text-sm ${isActive('/seller/orders') ? 'font-bold' : 'font-medium'}`}>
              Orders
            </span>
          </Link>

          <Link
            to="/seller/products"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm font-medium">Products</span>
          </Link>

          <Link
            to="/seller/customers"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">Customers</span>
          </Link>

          <Link
            to="/seller/analytics"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm font-medium">Analytics</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/seller/settings"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>

          <div className="flex items-center gap-3 p-3 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.fullName || 'Seller Account'}</p>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-primary hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold tracking-tight">
              {isActive('/seller/dashboard') ? 'Dashboard' : isActive('/seller/orders') ? 'Order Management' : 'Seller Center'}
            </h2>
            {isActive('/seller/orders') && (
              <div className="max-w-md w-full ml-4">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                    placeholder="Search orders, customers, or SKUs..."
                    type="text"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Shop Status Toggle - only show on dashboard */}
            {isActive('/seller/dashboard') && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                <span className={`flex h-2 w-2 rounded-full ${shopOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {shopOpen ? 'Shop Open' : 'Shop Closed'}
                </span>
                <button
                  onClick={() => setShopOpen(!shopOpen)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    shopOpen ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`${
                      shopOpen ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200`}
                  ></span>
                </button>
              </div>
            )}

            <button className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <button className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>

            {isActive('/seller/orders') && (
              <>
                <div className="h-6 w-[1px] bg-slate-200 dark:border-slate-800 mx-2"></div>
                <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">add</span>
                  New Order
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default SellerLayout;
