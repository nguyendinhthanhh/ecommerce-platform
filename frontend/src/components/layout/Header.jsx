import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../../services/authService";
import CartIcon from "../common/CartIcon";

const Header = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

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

    // Load categories for red nav bar
    const fetchCategories = async () => {
      try {
        const module = await import("../../services/categoryService");
        const data = await module.default.getCategoriesHierarchy();
        setCategories(data?.slice(0, 7) || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();

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
    <header className="sticky top-0 z-50 w-full shadow-sm bg-white font-display">
      {/* 1. Top Bar */}
      <div className="bg-gray-100 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center justify-between text-[11px] font-medium text-gray-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[14px]">headset_mic</span>
              Hotline: 1800 6975
            </span>
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[14px]">storefront</span>
              Hệ thống Showroom
            </span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Khuyến mãi</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Tin công nghệ</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Tuyển dụng</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <h1 className="text-3xl font-black italic tracking-tighter text-primary">
              GEARVN
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative group flex items-center h-10 bg-gray-100 rounded focus-within:ring-1 focus-within:ring-primary focus-within:bg-white overflow-hidden transition-all">
              <input
                className="w-full h-full pl-4 pr-12 bg-transparent border-none text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                placeholder="Bạn cần tìm sản phẩm nào..."
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
              />
              <button
                type="submit"
                className="absolute right-0 h-full px-3 text-gray-500 hover:text-primary flex items-center justifying-center transition-colors"
                title="Tìm kiếm"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Account Info */}
            {user ? (
              <div className="relative group hidden md:flex items-center gap-2 text-left cursor-pointer hover:text-primary transition-colors text-gray-700">
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500">Xin chào,</span>
                  <span className="text-sm font-bold truncate max-w-[100px]">{user.fullName || 'User'}</span>
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                  <Link to="/profile" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Tài khoản
                  </Link>
                  <Link to="/my-orders" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    Đơn hàng
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link to="/admin/dashboard" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      Admin
                    </Link>
                  )}
                  {user.role === "SELLER" && (
                    <Link to="/seller/dashboard" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      <span className="material-symbols-outlined text-[18px]">storefront</span>
                      Seller
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-primary hover:bg-red-50">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 text-left hover:text-primary transition-colors text-gray-700">
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium">Đăng nhập /</span>
                  <span className="text-sm font-bold">Tài khoản</span>
                </div>
              </Link>
            )}

            {/* Cart Icon */}
            <CartIcon />
          </div>
        </div>
      </div>

      {/* 3. Category Nav (Red Bar) */}
      <div className="bg-primary text-white hidden md:block border-t border-red-700">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center h-10 text-[12px] font-bold uppercase tracking-wide">
          <Link to="/products" className="flex items-center gap-2 px-4 h-full bg-black/20 hover:bg-black/30 transition-colors">
            <span className="material-symbols-outlined text-[18px]">menu</span>
            DANH MỤC SẢN PHẨM
          </Link>
          <nav className="flex items-center flex-1 ml-4 justify-between">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="px-3 h-full flex items-center hover:bg-black/10 transition-colors uppercase">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
