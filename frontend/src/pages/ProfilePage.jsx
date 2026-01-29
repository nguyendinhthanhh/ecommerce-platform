import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import authService from "../services/authService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'auth' or 'network'
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Deactivate account states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState("");

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);
      const data = await userService.getMyProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
        avatar: data.avatar || "",
      });
    } catch (err) {
      console.error("Error loading profile:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Your session has expired. Please log in again.");
        setErrorType("auth");
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to server. Please check your network connection.",
        );
        setErrorType("network");
      } else {
        setError(
          `Error: ${err.response?.data?.message || err.message || "Unable to load user information"}`,
        );
        setErrorType("network");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Parse validation errors from backend response
  const parseValidationErrors = (error) => {
    const errors = {};
    const responseData = error.response?.data;

    // Handle Spring Boot validation errors format
    if (responseData?.errors && Array.isArray(responseData.errors)) {
      responseData.errors.forEach((err) => {
        if (err.field) {
          errors[err.field] = err.defaultMessage || err.message;
        }
      });
    }

    // Handle single field error in message
    if (responseData?.message) {
      const message = responseData.message;
      // Try to extract field name from validation message
      const fieldMatch = message.match(/field '(\w+)'/);
      if (fieldMatch) {
        errors[fieldMatch[1]] = message;
      }
      // Check for common field patterns in error message
      const fieldPatterns = ["phone", "fullName", "address", "email", "avatar"];
      fieldPatterns.forEach((field) => {
        if (message.toLowerCase().includes(field.toLowerCase())) {
          errors[field] = message;
        }
      });
    }

    return errors;
  };

  // Validate Vietnamese phone number: starts with 03, 05, 07, 08, 09 and has 10 digits total
  const validateVietnamesePhone = (phone) => {
    if (!phone || phone.trim() === "") return true; // Phone is optional
    const vietnamesePhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vietnamesePhoneRegex.test(phone);
  };

  // Validate form before save
  const validateForm = () => {
    const errors = {};

    // Phone validation - Vietnamese phone format
    if (formData.phone && !validateVietnamesePhone(formData.phone)) {
      errors.phone =
        "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09 và có 10 chữ số";
    }

    return errors;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate form before submitting
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      showToast("Vui lòng sửa các lỗi validation", "error");
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(formData);
      await loadProfile();
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      const errors = parseValidationErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        showToast("Please fix the validation errors", "error");
      } else {
        showToast(
          err.response?.data?.message || "Unable to save information",
          "error",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword(passwordData);
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
        showToast("Password changed successfully!");
      }, 1500);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Unable to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirm !== user?.email) {
      return;
    }

    setDeactivating(true);
    try {
      await userService.deactivateAccount(user?.id);
      showToast("Account has been deactivated");
      await authService.logout();
      navigate("/login");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to deactivate account",
        "error",
      );
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-primary/10 text-primary border-primary/20";
      case "SELLER":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "CUSTOMER":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "SELLER":
        return "Seller";
      case "CUSTOMER":
        return "Customer";
      default:
        return role;
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0f0d1b] dark:text-white font-display">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between border-b border-solid border-[#e8e7f3] dark:border-white/10 bg-white dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="size-8 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-5 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
          </div>
          <nav className="hidden md:flex items-center gap-9">
            <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-9 w-36 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse"></div>
          <div className="size-10 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse"></div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          {/* Profile Summary Card Skeleton */}
          <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse"></div>
              </div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-3"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Sidebar Menu Skeleton */}
          <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-b-0"
              >
                <div className="size-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            {/* Section Header Skeleton */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <div className="h-6 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="h-9 w-20 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
            </div>

            {/* Form Fields Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                  <div className="h-11 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center max-w-md shadow-lg">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              errorType === "auth"
                ? "bg-amber-100 dark:bg-amber-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            <span
              className={`material-symbols-outlined text-4xl ${
                errorType === "auth" ? "text-amber-500" : "text-red-500"
              }`}
            >
              {errorType === "auth" ? "lock" : "cloud_off"}
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#0f0d1b] dark:text-white mb-2">
            {errorType === "auth" ? "Login Required" : "An Error Occurred"}
          </h2>

          <p className="text-[#524c9a] dark:text-white/60 mb-6">{error}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {errorType === "auth" ? (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    login
                  </span>
                  Log in
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 text-[#0f0d1b] dark:text-white font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Back to Home
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={loadProfile}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  Try Again
                </button>
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 text-[#0f0d1b] dark:text-white font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Back to Home
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#0f0d1b] dark:text-white font-display">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-solid border-[#e8e7f3] dark:border-white/10 bg-white dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 text-primary">
            <div className="size-8">
              <span className="material-symbols-outlined text-3xl">
                smart_toy
              </span>
            </div>
            <h2 className="text-[#0f0d1b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              AI Shop
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            <Link
              to="/"
              className="text-[#0f0d1b] dark:text-white/80 text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className="text-[#0f0d1b] dark:text-white/80 text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "SELLER" && (
              <Link
                to="/seller/dashboard"
                className="text-[#0f0d1b] dark:text-white/80 text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
            <span className="text-primary text-sm font-bold border-b-2 border-primary cursor-default">
              Settings
            </span>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <div className="hidden sm:flex bg-background-light dark:bg-white/5 items-center rounded-xl px-3 py-1.5 border border-[#e8e7f3] dark:border-white/10">
            <span className="material-symbols-outlined text-[#524c9a] dark:text-white/60 text-xl">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#524c9a]/60 dark:placeholder:text-white/40 w-32"
              placeholder="Search..."
              type="text"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-transparent">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">
                      account_circle
                    </span>
                    Personal Info
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-purple-500">
                        admin_panel_settings
                      </span>
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === "SELLER" && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-blue-500">
                        storefront
                      </span>
                      Seller Dashboard
                    </Link>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === "error" ? "error" : "check_circle"}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Page Heading - Improved Design */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    settings
                  </span>
                </div>
                <h1 className="text-[#0f0d1b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Account Settings
                </h1>
              </div>
              <p className="text-[#524c9a] dark:text-white/60 text-base md:text-lg">
                Manage your personal information and account security.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  user?.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user?.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                {user?.status === "ACTIVE" ? "Active" : user?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card & Quick Info */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Profile Summary Card */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-[#6366f1]"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="size-24 rounded-full border-4 border-white dark:border-background-dark bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <span
                      className="material-symbols-outlined text-5xl text-primary"
                      style={{ display: user?.avatar ? "none" : "block" }}
                    >
                      person
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f0d1b] dark:text-white">
                      {user?.fullName}
                    </h3>
                    <p className="text-[#524c9a] dark:text-white/60 text-sm">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${getRoleBadgeStyle(
                      user?.role,
                    )}`}
                  >
                    {user?.role}
                  </span>
                </div>
                <div className="mt-8 space-y-4 border-t border-[#e8e7f3] dark:border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f8f8fc] dark:bg-white/5 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined">
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#524c9a] dark:text-white/40 uppercase font-bold tracking-tight">
                        Member Since
                      </p>
                      <p className="text-sm font-medium">
                        {user?.accountAgeDays || 0} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f8f8fc] dark:bg-white/5 p-2 rounded-lg text-green-500">
                      <span className="material-symbols-outlined">
                        verified_user
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#524c9a] dark:text-white/40 uppercase font-bold tracking-tight">
                        Status
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          user?.status === "ACTIVE"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {user?.status === "ACTIVE" ? "Active" : user?.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        user?.isOnline
                          ? "bg-green-100 dark:bg-green-900/30 text-green-500"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {user?.isOnline ? "wifi" : "wifi_off"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#524c9a] dark:text-white/40 uppercase font-bold tracking-tight">
                        Online
                      </p>
                      <p className="text-sm font-medium">
                        {user?.isOnline
                          ? "Online"
                          : user?.lastActivityStatus || "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Nav Links */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 p-2">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-primary/5 text-primary"
                      : "text-[#524c9a] dark:text-white/70 hover:bg-background-light dark:hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-sm font-semibold">Personal Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "security"
                      ? "bg-primary/5 text-primary"
                      : "text-[#524c9a] dark:text-white/70 hover:bg-background-light dark:hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined">shield</span>
                  <span className="text-sm font-semibold">Security</span>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "notifications"
                      ? "bg-primary/5 text-primary"
                      : "text-[#524c9a] dark:text-white/70 hover:bg-background-light dark:hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  <span className="text-sm font-semibold">Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "billing"
                      ? "bg-primary/5 text-primary"
                      : "text-[#524c9a] dark:text-white/70 hover:bg-background-light dark:hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span className="text-sm font-semibold">Billing</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Personal Information Section */}
            {activeTab === "profile" && (
              <section className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 overflow-hidden">
                {/* Section Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-[#e8e7f3] dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <span className="material-symbols-outlined text-primary">
                          badge
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#0f0d1b] dark:text-white">
                          Personal Information
                        </h2>
                        <p className="text-sm text-[#524c9a] dark:text-white/60">
                          Update your personal information
                        </p>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {!isEditing ? (
                    /* View Mode */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="group p-4 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                              <span className="material-symbols-outlined text-primary">
                                person
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#524c9a] dark:text-white/40 uppercase tracking-wider mb-1">
                                Full Name
                              </p>
                              <p className="text-[#0f0d1b] dark:text-white font-semibold truncate">
                                {user?.fullName || "Not updated"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="group p-4 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-transparent">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                              <span className="material-symbols-outlined text-[#524c9a] dark:text-white/40">
                                mail
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#524c9a] dark:text-white/40 uppercase tracking-wider mb-1">
                                Email
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-[#0f0d1b] dark:text-white font-semibold truncate">
                                  {user?.email}
                                </p>
                                <span className="material-symbols-outlined text-xs text-[#524c9a] dark:text-white/40">
                                  lock
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="group p-4 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                              <span className="material-symbols-outlined text-primary">
                                call
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#524c9a] dark:text-white/40 uppercase tracking-wider mb-1">
                                Phone Number
                              </p>
                              <p className="text-[#0f0d1b] dark:text-white font-semibold truncate">
                                {user?.phone || "Not updated"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="group p-4 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                              <span className="material-symbols-outlined text-primary">
                                location_on
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#524c9a] dark:text-white/40 uppercase tracking-wider mb-1">
                                Address
                              </p>
                              <p className="text-[#0f0d1b] dark:text-white font-semibold truncate">
                                {user?.address || "Not updated"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                              <span className="material-symbols-outlined text-primary">
                                verified
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#524c9a] dark:text-white/40 uppercase tracking-wider">
                                Role
                              </p>
                              <p className="text-[#0f0d1b] dark:text-white font-semibold">
                                {getRoleLabel(user?.role)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider border ${getRoleBadgeStyle(user?.role)}`}
                          >
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode */
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                            Full Name
                          </label>
                          <div
                            className={`flex items-center bg-white dark:bg-background-dark/50 border-2 rounded-xl px-4 py-3 transition-all ${
                              fieldErrors.fullName
                                ? "border-red-500 ring-2 ring-red-500/20"
                                : "border-[#e8e7f3] dark:border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined mr-3 ${fieldErrors.fullName ? "text-red-500" : "text-primary"}`}
                            >
                              person
                            </span>
                            <input
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white font-medium"
                              type="text"
                              placeholder="Nhập họ và tên"
                            />
                          </div>
                          {fieldErrors.fullName && (
                            <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                error
                              </span>
                              {fieldErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                            Email
                          </label>
                          <div className="flex items-center bg-[#e8e7f3] dark:bg-white/5 border-2 border-transparent rounded-xl px-4 py-3 cursor-not-allowed opacity-60">
                            <span className="material-symbols-outlined text-[#524c9a] dark:text-white/40 mr-3">
                              mail
                            </span>
                            <input
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#524c9a] dark:text-white/40 cursor-not-allowed font-medium"
                              readOnly
                              type="email"
                              value={user?.email || ""}
                            />
                            <span className="material-symbols-outlined text-sm text-[#524c9a] dark:text-white/40">
                              lock
                            </span>
                          </div>
                          <p className="text-xs text-primary/80 font-medium px-1">
                            Contact support to change email
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                            Phone Number
                            <span className="text-xs font-normal text-[#524c9a]/60 dark:text-white/40 ml-1">
                              (Không bắt buộc)
                            </span>
                          </label>
                          <div
                            className={`flex items-center bg-white dark:bg-background-dark/50 border-2 rounded-xl px-4 py-3 transition-all ${
                              fieldErrors.phone
                                ? "border-red-500 ring-2 ring-red-500/20"
                                : "border-[#e8e7f3] dark:border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined mr-3 ${fieldErrors.phone ? "text-red-500" : "text-primary"}`}
                            >
                              call
                            </span>
                            <input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white font-medium"
                              placeholder="VD: 0912345678"
                              type="tel"
                            />
                          </div>
                          <p className="text-xs text-[#524c9a]/60 dark:text-white/40 px-1">
                            Bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số
                          </p>
                          {fieldErrors.phone && (
                            <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                error
                              </span>
                              {fieldErrors.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                            Address
                          </label>
                          <div
                            className={`flex items-center bg-white dark:bg-background-dark/50 border-2 rounded-xl px-4 py-3 transition-all ${
                              fieldErrors.address
                                ? "border-red-500 ring-2 ring-red-500/20"
                                : "border-[#e8e7f3] dark:border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined mr-3 ${fieldErrors.address ? "text-red-500" : "text-primary"}`}
                            >
                              location_on
                            </span>
                            <input
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white font-medium"
                              placeholder="Hà Nội, Việt Nam"
                              type="text"
                            />
                          </div>
                          {fieldErrors.address && (
                            <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                error
                              </span>
                              {fieldErrors.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                          Avatar URL
                        </label>
                        <div className="flex items-center bg-white dark:bg-background-dark/50 border-2 border-[#e8e7f3] dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                          <span className="material-symbols-outlined text-primary mr-3">
                            image
                          </span>
                          <input
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white font-medium"
                            placeholder="https://example.com/avatar.jpg"
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#e8e7f3] dark:border-white/10">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-2.5 text-[#524c9a] dark:text-white/70 font-bold text-sm bg-[#f8f8fc] dark:bg-white/10 hover:bg-[#e8e7f3] dark:hover:bg-white/20 rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving && <LoadingSpinner size="sm" />}
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}

            {/* Security & Privacy Section */}
            {activeTab === "security" && (
              <section className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 overflow-hidden">
                {/* Section Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-[#e8e7f3] dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <span className="material-symbols-outlined text-primary">
                        security
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0f0d1b] dark:text-white">
                        Security & Privacy
                      </h2>
                      <p className="text-sm text-[#524c9a] dark:text-white/60">
                        Manage security and privacy for your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Change Password */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5 hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                        <span className="material-symbols-outlined text-primary text-xl">
                          key
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f0d1b] dark:text-white">
                          Change Password
                        </h4>
                        <p className="text-sm text-[#524c9a] dark:text-white/60">
                          Change your password regularly to protect your account
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Two Factor Auth */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                        <span className="material-symbols-outlined text-primary text-xl">
                          phonelink_lock
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f0d1b] dark:text-white">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-[#524c9a] dark:text-white/60">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={(e) =>
                            setTwoFactorEnabled(e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ms-3 text-sm font-bold text-[#0f0d1b] dark:text-white">
                          {twoFactorEnabled ? "On" : "Off"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#f8f8fc] dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                        <span className="material-symbols-outlined text-primary text-xl">
                          devices
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f0d1b] dark:text-white">
                          Login Sessions
                        </h4>
                        <p className="text-sm text-[#524c9a] dark:text-white/60">
                          Manage devices that are logged in
                        </p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 text-primary border-2 border-primary/30 font-bold text-sm rounded-xl hover:bg-primary/5 transition-all">
                      View All
                    </button>
                  </div>

                  {/* Deactivate Account */}
                  <div className="mt-8 pt-6 border-t border-[#e8e7f3] dark:border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <span className="material-symbols-outlined text-red-500 text-xl">
                            warning
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-red-600 dark:text-red-400">
                            Deactivate Account
                          </h4>
                          <p className="text-sm text-[#524c9a] dark:text-white/60">
                            Deactivate your account. This action can be reversed
                            by Admin.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDeactivateModal(true)}
                        className="px-5 py-2.5 text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-900/50 font-bold text-sm rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <section className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 p-8">
                <div className="flex items-center gap-2 mb-8 text-primary">
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  <h2 className="text-xl font-bold text-[#0f0d1b] dark:text-white">
                    Notification Settings
                  </h2>
                </div>
                <div className="space-y-6">
                  {[
                    {
                      icon: "mail",
                      title: "Email Notifications",
                      desc: "Receive order notifications via email",
                    },
                    {
                      icon: "campaign",
                      title: "Promotions",
                      desc: "Receive information about offers and promotions",
                    },
                    {
                      icon: "inventory_2",
                      title: "Order Updates",
                      desc: "Get notified when your order has updates",
                    },
                    {
                      icon: "reviews",
                      title: "Product Reviews",
                      desc: "Reminder to review after receiving products",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background-light dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                          <span className="material-symbols-outlined text-primary">
                            {item.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0f0d1b] dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#524c9a] dark:text-white/60">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Billing Section */}
            {activeTab === "billing" && (
              <section className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#e8e7f3] dark:border-white/10 p-8">
                <div className="flex items-center gap-2 mb-8 text-primary">
                  <span className="material-symbols-outlined">payments</span>
                  <h2 className="text-xl font-bold text-[#0f0d1b] dark:text-white">
                    Payment Methods
                  </h2>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background-light dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">
                          credit_card
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0f0d1b] dark:text-white">
                          Credit/Debit Card
                        </h4>
                        <p className="text-xs text-[#524c9a] dark:text-white/60">
                          No cards linked yet
                        </p>
                      </div>
                    </div>
                    <button className="px-5 py-2 text-primary border border-primary/30 font-bold text-xs rounded-lg hover:bg-primary/5 transition-all">
                      Add Card
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background-light dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">
                          account_balance
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0f0d1b] dark:text-white">
                          Bank Account
                        </h4>
                        <p className="text-xs text-[#524c9a] dark:text-white/60">
                          Link your bank account for payments
                        </p>
                      </div>
                    </div>
                    <button className="px-5 py-2 text-primary border border-primary/30 font-bold text-xs rounded-lg hover:bg-primary/5 transition-all">
                      Link Account
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-background-light dark:bg-white/5 border border-[#e8e7f3] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">
                          receipt_long
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0f0d1b] dark:text-white">
                          Transaction History
                        </h4>
                        <p className="text-xs text-[#524c9a] dark:text-white/60">
                          View payment history and invoices
                        </p>
                      </div>
                    </div>
                    <button className="px-5 py-2 text-primary border border-primary/30 font-bold text-xs rounded-lg hover:bg-primary/5 transition-all">
                      View History
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#e8e7f3] dark:border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <span className="material-symbols-outlined text-2xl">
              smart_toy
            </span>
            <span className="text-sm font-bold">AI Shop</span>
          </div>
          <p className="text-sm text-[#524c9a] dark:text-white/40">
            © 2026 AI Shop Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-[#524c9a] dark:text-white/40">
            <a className="hover:text-primary" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-[#e8e7f3] dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary">
                      key
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f0d1b] dark:text-white">
                    Change Password
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[#524c9a] dark:text-white/60">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {passwordError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">
                    error
                  </span>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500">
                    check_circle
                  </span>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {passwordSuccess}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                  Current Password
                </label>
                <div className="flex items-center bg-[#f8f8fc] dark:bg-background-dark/50 border-2 border-[#e8e7f3] dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="material-symbols-outlined text-[#524c9a] dark:text-white/40 mr-3">
                    lock
                  </span>
                  <input
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="ml-2 text-[#524c9a] dark:text-white/40 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showCurrentPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                  New Password
                </label>
                <div className="flex items-center bg-[#f8f8fc] dark:bg-background-dark/50 border-2 border-[#e8e7f3] dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary mr-3">
                    key
                  </span>
                  <input
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white"
                    placeholder="Enter new password (at least 8 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="ml-2 text-[#524c9a] dark:text-white/40 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showNewPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                  Confirm New Password
                </label>
                <div className="flex items-center bg-[#f8f8fc] dark:bg-background-dark/50 border-2 border-[#e8e7f3] dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <span className="material-symbols-outlined text-primary mr-3">
                    key
                  </span>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white"
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-[#524c9a] dark:text-white/40 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="flex-1 px-5 py-3 text-[#524c9a] dark:text-white/70 font-bold text-sm bg-[#f8f8fc] dark:bg-white/10 hover:bg-[#e8e7f3] dark:hover:bg-white/20 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-5 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {changingPassword && <LoadingSpinner size="sm" />}
                  {changingPassword ? "Processing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeactivateModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-red-500/10 to-transparent border-b border-[#e8e7f3] dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <span className="material-symbols-outlined text-red-500">
                      warning
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                    Deactivate Account
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setDeactivateConfirm("");
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[#524c9a] dark:text-white/60">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Warning:</strong> After deactivating your account, you
                  will not be able to log in until Admin reactivates it.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#524c9a] dark:text-white/60">
                  Enter email{" "}
                  <span className="text-red-500">{user?.email}</span> to confirm
                </label>
                <div className="flex items-center bg-[#f8f8fc] dark:bg-background-dark/50 border-2 border-[#e8e7f3] dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
                  <span className="material-symbols-outlined text-red-500 mr-3">
                    mail
                  </span>
                  <input
                    type="email"
                    value={deactivateConfirm}
                    onChange={(e) => setDeactivateConfirm(e.target.value)}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#0f0d1b] dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setDeactivateConfirm("");
                  }}
                  className="flex-1 px-5 py-3 text-[#524c9a] dark:text-white/70 font-bold text-sm bg-[#f8f8fc] dark:bg-white/10 hover:bg-[#e8e7f3] dark:hover:bg-white/20 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateAccount}
                  disabled={deactivating || deactivateConfirm !== user?.email}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deactivating && <LoadingSpinner size="sm" />}
                  {deactivating ? "Processing..." : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
