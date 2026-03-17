import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../../services/authService";
import CartIcon from "../common/CartIcon";

const Header = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial user
    const userData = authService.getUser();
    setUser(userData);

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      const updatedUser = authService.getUser();
      setUser(updatedUser);
    };

    window.addEventListener('auth-change', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    // Force reload to clear all state
    window.location.href = "/login";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-[#f0f2f4] dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="size-8 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">
                smart_toy
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              ShopAI
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Shop
            </Link>
            <a
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              href="#"
            >
              Deals
            </a>
            <a
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              href="#"
            >
              What's New
            </a>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-600">
                  search
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-10 py-2 border-none rounded-lg leading-5 bg-[#f0f2f4] dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Tìm kiếm sản phẩm..."
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors mr-1"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">
                      close
                    </span>
                  </button>
                )}
                <button
                  type="submit"
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="Tìm kiếm"
                >
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    auto_awesome
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <CartIcon />
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            {user ? (
              <div className="relative group">
                <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">person</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      account_circle
                    </span>
                    Personal Info
                  </Link>
                  <Link
                    to="/my-orders"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      receipt_long
                    </span>
                    My Orders
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin/dashboard"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        admin_panel_settings
                      </span>
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === "SELLER" && (
                    <Link
                      to="/seller/dashboard"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        storefront
                      </span>
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400">
              search
            </span>
          </div>
          <input
            className="block w-full pl-10 pr-10 py-2 border-none rounded-lg bg-[#f0f2f4] dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600"
            placeholder="Tìm kiếm sản phẩm..."
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="material-symbols-outlined text-gray-400 text-[18px]">
                close
              </span>
            </button>
          )}
        </form>
      </div>
    </header>
  );
};

export default Header;
