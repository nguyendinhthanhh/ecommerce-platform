import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    agreeToTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || null,
        address: formData.address || null,
        role: formData.role,
      };

      const response = await authService.register(registerData);
      const user = response.data.user;

      // Check if there's a redirect URL saved (from login prompt)
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");

      if (redirectAfterLogin) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectAfterLogin);
      } else {
        // Redirect based on user role
        const redirectPath = authService.getRedirectPath(user);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Calculate password strength
    if (name === "password") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const getStrengthLabel = () => {
    const labels = ["WEAK", "FAIR", "MEDIUM", "STRONG"];
    return labels[passwordStrength - 1] || "WEAK";
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] sidebar-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
          >
            <div className="size-8">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
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
            <h1 className="text-4xl font-black leading-tight mb-4">
              Shop Smarter with AI
            </h1>
            <p className="text-white/80 text-lg">
              Experience a modern way to manage your orders and personalized
              shopping journeys with our intelligent engine.
            </p>
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
          <Link
            to="/"
            className="lg:hidden flex items-center gap-3 text-primary mb-12 hover:opacity-80 transition-opacity"
          >
            <div className="size-8">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              ShopAI
            </h2>
          </Link>

          {/* Registration Form */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-[#0f0d1b] dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] mb-2">
                Create Account
              </h2>
              <p className="text-[#524c9a] dark:text-gray-400 text-base font-normal">
                Join us for a personalized AI shopping experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f0d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">
                  Full Name
                </label>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">
                      person
                    </span>
                  </div>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0"
                    placeholder="John Doe"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f0d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0"
                    placeholder="john@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f0d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
                {/* Strength Bar */}
                <div className="flex gap-1 mt-1 px-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${
                        level <= passwordStrength
                          ? "bg-primary"
                          : "bg-primary/20"
                      }`}
                    ></div>
                  ))}
                  {formData.password && (
                    <span className="text-[10px] text-primary font-bold ml-2 -mt-1">
                      STRENGTH: {getStrengthLabel()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f0d1b] dark:text-gray-200 text-xs font-bold uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="flex w-full items-stretch rounded-xl border border-[#d1cfe7] dark:border-gray-700 bg-[#f8f8fc] dark:bg-gray-800 focus-within:border-primary transition-all">
                  <div className="text-[#524c9a] dark:text-gray-400 flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">
                      verified_user
                    </span>
                  </div>
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent h-12 px-3 text-[#0f0d1b] dark:text-white placeholder:text-[#524c9a]/50 text-sm focus:ring-0"
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 px-1 mt-2">
                <input
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-[#d1cfe7] dark:bg-gray-800 dark:border-gray-700"
                  id="terms"
                  type="checkbox"
                />
                <label
                  className="text-[#524c9a] dark:text-gray-400 text-xs leading-relaxed"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <a className="text-primary font-bold" href="#">
                    Terms &amp; Conditions
                  </a>{" "}
                  and understand how my data is processed.
                </label>
              </div>

              <button
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#524c9a] dark:text-gray-400">
              Already have an account?
              <Link
                className="text-primary font-bold hover:underline ml-1"
                to="/login"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
