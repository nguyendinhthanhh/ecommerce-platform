import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      const user = response.data.user;
      
      // Redirect based on user role
      const redirectPath = authService.getRedirectPath(user);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] sidebar-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <div className="size-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">ShopAI</h2>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-full aspect-square max-w-[320px] mx-auto rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center p-8 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 w-full h-full opacity-60">
              <div className="bg-white/20 rounded-lg transform rotate-12"></div>
              <div className="bg-white/40 rounded-lg transform -rotate-12"></div>
              <div className="bg-white/20 rounded-lg"></div>
              <div className="bg-white/40 rounded-lg transform -rotate-6"></div>
              <div className="bg-white/20 rounded-lg transform rotate-45"></div>
              <div className="bg-white/40 rounded-lg"></div>
              <div className="bg-white/20 rounded-lg transform -rotate-12"></div>
              <div className="bg-white/40 rounded-lg"></div>
              <div className="bg-white/20 rounded-lg transform rotate-12"></div>
            </div>
          </div>
          <div className="text-white">
            <h1 className="text-4xl font-black leading-tight mb-4">Shop Smarter with AI</h1>
            <p className="text-white/80 text-lg">Experience a modern way to manage your orders and personalized shopping journeys with our intelligent engine.</p>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2024 ShopAI Technologies Inc.
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-background-dark">
        <div className="w-full max-w-[480px] flex flex-col">
          {/* Logo for mobile */}
          <Link to="/" className="lg:hidden flex items-center gap-3 text-primary mb-12 hover:opacity-80 transition-opacity">
            <div className="size-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ShopAI</h2>
          </Link>

          {/* Login Form */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h2 className="text-[#0f0d1b] dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] mb-2">Welcome Back!</h2>
              <p className="text-[#524c9a] dark:text-gray-400 text-base font-normal">Please login to manage your orders</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#0f0d1b] dark:text-gray-200 text-sm font-semibold">Email Address</label>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0" 
                    placeholder="name@company.com" 
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[#0f0d1b] dark:text-gray-200 text-sm font-semibold">Password</label>
                  <a className="text-primary text-xs font-semibold hover:underline" href="#">Forgot Password?</a>
                </div>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button 
                    className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pr-4" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-[#d1cfe7] dark:bg-gray-800 dark:border-gray-700" 
                  id="remember" 
                  type="checkbox"
                />
                <label className="text-[#524c9a] dark:text-gray-400 text-sm" htmlFor="remember">Keep me signed in</label>
              </div>

              <button 
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e8e7f3] dark:border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-background-dark px-2 text-[#524c9a] dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 h-12 border border-[#d1cfe7] dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <img alt="Google logo" className="size-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVD9F1EhNe_xHFWSuqq0EWhp6guU2HZr0ZDvxlYLugRswQl4Ts3jbzKnCVWzeV981g10T4WMcV33KhfNxDWH_WPgSP2UFJKSCcGWBD6Jf3NSDLuGTYMRRbl0rtEW7ZQt1EcykcZnHF2M7ZG7k6LODKKaXLYj4yh2H8IISg9kidjo23ETxdXb9JwzECYPU-Em52DQlVZ6kT437KyFpsXKnkybx-XV-X7-5EYouunoV7F26UnL3L1TI7WLHnruQM9iuXd2N6_gmkd2I" />
                <span className="text-sm font-semibold text-[#0f0d1b] dark:text-white">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 h-12 border border-[#d1cfe7] dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-[#1877F2] text-[20px]">social_leaderboard</span>
                <span className="text-sm font-semibold text-[#0f0d1b] dark:text-white">Facebook</span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#524c9a] dark:text-gray-400">
              Don't have an account? 
              <Link className="text-primary font-bold hover:underline ml-1" to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
