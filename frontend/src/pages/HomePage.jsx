import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import authService from '../services/authService';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load top selling products for carousel
      const topData = await productService.getTopSellingProducts(0, 4);
      setTopProducts(topData.content || []);

      // Load all products for grid
      const productsData = await productService.getAllProducts(0, 6);
      setProducts(productsData.content || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-[#f0f2f4] dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="size-8 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">AI Shop</h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Home</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Categories</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Deals</a>
              <a className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1" href="#">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                AI Recommendations
              </a>
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg hidden md:block">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary">search</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-[#f0f2f4] dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm" 
                  placeholder="Search products with AI suggestions..." 
                  type="text"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                </div>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full"></span>
              </button>
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
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">person</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#f0f2f4] dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary" 
              placeholder="Ask AI to find products..." 
              type="text"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Hero Section */}
        <section className="rounded-2xl overflow-hidden relative min-h-[400px] flex items-center bg-gray-900">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Abstract blue futuristic digital waves background" 
              className="w-full h-full object-cover opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz9fohaXE-RwPNbWKl4IHyMRjA2hKn8jzE5Nygb0t0KIPNRWO9aZENc4AqGevOLEHUVjDIH_8FjNber18MozDS8wB8CfFRKIyJmZy4xMBDO_rz2w8qS61d-yYAknw6fXDsGp35_Ec4JR4KkFcQXrY5LF1d8O0NarhCnNYPzRB6k66EwOREgjlzwihCONAB0sXw4U-E4uzP8MDXnzkGD5rRS-0-oDQI05BcnLuaRa_sJPcShl72WrVcn5Pdi5y4ejVWsak0MvqV1xg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>
          <div className="relative z-10 px-8 md:px-12 max-w-2xl text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span className="text-xs font-semibold tracking-wide uppercase text-primary-50">Personalized for you</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Smart Shopping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">Powered by AI</span>
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed max-w-lg">
              Stop searching, start finding. Our AI analyzes your taste to recommend products you'll actually love instantly.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-base transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30">
                Start Shopping
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-lg font-bold text-base transition-colors">
                How it Works
              </button>
            </div>
          </div>
        </section>

        {/* AI Picks Carousel */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Picks for You</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Based on trending items in your region</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
            {/* Product Cards */}
            {loading ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] snap-center bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <div className="absolute top-3 left-3 z-10 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span> Top Selling
                    </div>
                    <img 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={product.imageUrl || 'https://via.placeholder.com/400x300?text=Product'} 
                    />
                    <button className="absolute bottom-3 right-3 bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white">
                      <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                      <div className="flex items-center text-yellow-400 text-xs">
                        <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">({product.averageRating || '0.0'})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-12">
                <div className="text-gray-500">No products available</div>
              </div>
            )}
          </div>
        </section>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button className="text-xs text-primary font-medium hover:underline">Reset</button>
              </div>

              {/* AI Confidence Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <span className="material-symbols-outlined text-primary text-base">psychology</span>
                  AI Match Score
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700" type="checkbox" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">90% + Match</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700" type="checkbox" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">80% - 90% Match</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6 border-t border-gray-100 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Categories</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Electronics', count: 120 },
                    { name: 'Fashion', count: 85 },
                    { name: 'Home & Living', count: 42 }
                  ].map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center group cursor-pointer">
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary">{cat.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Price Range</h4>
                <div className="flex items-center gap-2 mb-2">
                  <input className="w-full text-sm p-2 rounded border border-gray-200 dark:border-slate-600 bg-transparent" placeholder="Min" type="number" />
                  <span className="text-gray-400">-</span>
                  <input className="w-full text-sm p-2 rounded border border-gray-200 dark:border-slate-600 bg-transparent" placeholder="Max" type="number" />
                </div>
                <input className="w-full accent-primary h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" type="range" />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">All Recommendations</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                <select className="text-sm border-gray-200 dark:border-slate-700 rounded-lg py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary bg-white dark:bg-slate-800">
                  <option>AI Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {/* Product Cards */}
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading products...</div>
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={product.imageUrl || 'https://via.placeholder.com/400?text=Product'} 
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">{product.name}</h4>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {product.stockQuantity > 0 ? 'In Stock' : 'Out'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                        <button className="size-8 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-gray-500">No products available</div>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex justify-center">
              <nav className="flex items-center gap-1">
                <button className="size-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="size-9 flex items-center justify-center rounded-lg bg-primary text-white font-medium text-sm">1</button>
                <button className="size-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium">2</button>
                <button className="size-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium">3</button>
                <span className="px-2 text-gray-400">...</span>
                <button className="size-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="size-6 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">smart_toy</span>
                </div>
                <h2 className="text-lg font-bold">AI Shop</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Experience the future of shopping. Our AI-driven platform connects you with products you'll love, instantly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">All Products</a></li>
                <li><a href="#" className="hover:text-primary">Categories</a></li>
                <li><a href="#" className="hover:text-primary">Deals</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-slate-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 AI Shop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
