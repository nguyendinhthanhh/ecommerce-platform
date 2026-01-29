import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import LoadingSpinner, {
  TableRowSkeleton,
} from "../../components/common/LoadingSpinner";
import userService from "../../services/userService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    deleted: "all",
    keyword: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form errors for validation
  const [formErrors, setFormErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      };

      if (filters.role !== "all") params.role = filters.role;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.deleted !== "all")
        params.deleted = filters.deleted === "true";
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await userService.getAllUsers(params);

      if (response.data) {
        // If paginated response
        if (response.data.content) {
          setUsers(response.data.content);
          setPagination((prev) => ({
            ...prev,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
          }));
        } else if (Array.isArray(response.data)) {
          // If array response
          setUsers(response.data);
          setPagination((prev) => ({
            ...prev,
            totalElements: response.data.length,
            totalPages: 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
      if (error.response?.status === 403) {
        showToast("Access denied. You need ADMIN role to view users.", "error");
      } else {
        showToast("Failed to load users", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetFormData = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      address: "",
      avatar: "",
      role: "CUSTOMER",
      status: "ACTIVE",
    });
    setShowPassword(false);
    setFormErrors({});
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateCreateForm()) {
      return;
    }

    try {
      setSaving(true);
      await userService.createUser(formData);
      showToast("User created successfully!");
      setShowCreateModal(false);
      resetFormData();
      setFormErrors({});
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);

      // Parse API error response for field-level errors
      const errorData = error.response?.data;
      if (errorData) {
        // Handle field-specific errors from API
        if (errorData.errors && typeof errorData.errors === "object") {
          setFormErrors(errorData.errors);
        } else if (errorData.field) {
          // Single field error
          setFormErrors({ [errorData.field]: errorData.message });
        } else if (errorData.message) {
          // Check common error messages
          const msg = errorData.message.toLowerCase();
          if (msg.includes("email")) {
            setFormErrors({ email: errorData.message });
          } else if (msg.includes("password")) {
            setFormErrors({ password: errorData.message });
          } else {
            showToast(errorData.message, "error");
          }
        } else {
          showToast("Failed to create user", "error");
        }
      } else {
        showToast("Failed to create user", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // Validate Vietnamese phone number: starts with 03, 05, 07, 08, 09 and has 10 digits total
  const validateVietnamesePhone = (phone) => {
    if (!phone || phone.trim() === "") return true; // Phone is optional
    const vietnamesePhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vietnamesePhoneRegex.test(phone);
  };

  // Validate form for Update User
  const validateUpdateForm = () => {
    const errors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    // Phone validation - Vietnamese phone format
    if (formData.phone && !validateVietnamesePhone(formData.phone)) {
      errors.phone =
        "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09 và có 10 chữ số";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form before submitting
    if (!validateUpdateForm()) {
      showToast("Vui lòng sửa các lỗi validation", "error");
      return;
    }

    try {
      setSaving(true);

      // Build update data matching API format exactly
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
        role: formData.role,
        status: formData.status,
      };

      console.log("Updating user with data:", updateData);
      await userService.updateUser(selectedUser.id, updateData);
      showToast("User updated successfully!");
      setShowEditModal(false);
      resetFormData();
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      console.error("Error response:", error.response?.data);

      // Handle field-specific errors from API
      const errorData = error.response?.data;
      if (errorData) {
        const errors = {};

        // Handle Spring Boot validation errors array format
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err) => {
            if (err.field) {
              errors[err.field] = err.defaultMessage || err.message;
            }
          });
        } else if (errorData.errors && typeof errorData.errors === "object") {
          // Handle errors object format
          Object.assign(errors, errorData.errors);
        }

        // Parse field from message if no explicit errors
        if (Object.keys(errors).length === 0 && errorData.message) {
          const msg = errorData.message.toLowerCase();
          if (msg.includes("phone")) {
            errors.phone = errorData.message;
          } else if (msg.includes("email")) {
            errors.email = errorData.message;
          } else if (msg.includes("fullname") || msg.includes("full name")) {
            errors.fullName = errorData.message;
          } else if (msg.includes("address")) {
            errors.address = errorData.message;
          }
        }

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          showToast("Please fix the validation errors", "error");
        } else {
          showToast(errorData.message || "Failed to update user", "error");
        }
      } else {
        showToast("Failed to update user", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setSaving(true);
      await userService.deleteUser(selectedUser.id);
      showToast("User deleted successfully!");
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(
        error.response?.data?.message || "Failed to delete user",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const user = await userService.getUserById(userId);
      setSelectedUser(user);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading user details:", error);
      showToast("Failed to load user details", "error");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      password: "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      role: user.role || "CUSTOMER",
      status: user.status || "ACTIVE",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form for Create User
  const validateCreateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    // Phone validation - Vietnamese phone format: starts with 03, 05, 07, 08, 09
    if (formData.phone && !validateVietnamesePhone(formData.phone)) {
      errors.phone =
        "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09 và có 10 chữ số";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "SELLER":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "CUSTOMER":
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "INACTIVE":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "BANNED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: "all",
      status: "all",
      deleted: "all",
      keyword: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortDir: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search keyword..."
                className="border-none bg-transparent text-sm p-0 focus:ring-0 w-40"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role
              </label>
              <select
                className="border-none bg-transparent text-sm p-0 focus:ring-0 cursor-pointer min-w-[100px]"
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <select
                className="border-none bg-transparent text-sm p-0 focus:ring-0 cursor-pointer min-w-[100px]"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                showAdvancedFilters
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                tune
              </span>
              Filters
            </button>

            {/* Create User Button */}
            <button
              onClick={() => {
                resetFormData();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">
                person_add
              </span>
              Add User
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                userService.invalidateCache();
                loadUsers();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}
              >
                refresh
              </span>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              {/* Deleted Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Deleted
                </label>
                <select
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
                  value={filters.deleted}
                  onChange={(e) =>
                    setFilters({ ...filters, deleted: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="false">Not Deleted</option>
                  <option value="true">Deleted</option>
                </select>
              </div>

              {/* Date From */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Created From
                </label>
                <input
                  type="date"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Created To
                </label>
                <input
                  type="date"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>

              {/* Sort By */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[130px]"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option value="createdAt">Created Date</option>
                  <option value="fullName">Full Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Direction */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sort Direction
                </label>
                <select
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
                  value={filters.sortDir}
                  onChange={(e) =>
                    setFilters({ ...filters, sortDir: e.target.value })
                  }
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  restart_alt
                </span>
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    User
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={7} />
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-300">
                          person_off
                        </span>
                        <p>No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${
                        idx % 2 === 1
                          ? "bg-slate-50/30 dark:bg-slate-900/20"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-slate-400">
                        #{user.id}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                person
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold">
                            {user.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-tighter ${getRoleBadgeStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-tighter ${getStatusBadgeStyle(user.status)}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-green-500"
                                : user.status === "INACTIVE"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          ></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all"
                            title="Edit User"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
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
              Showing{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {users.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {pagination.totalElements}
              </span>{" "}
              users
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(0, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 0}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <span className="px-3 py-1 text-sm font-semibold">
                Page {pagination.page + 1} of{" "}
                {Math.max(1, pagination.totalPages)}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages - 1, prev.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages - 1}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
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
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary">
                      person_add
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">Create New User</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleCreateUser}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Email Field */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all ${
                      formErrors.email
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="user@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        error
                      </span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all pr-12 ${
                        formErrors.password
                          ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                          : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        error
                      </span>
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Full Name Field */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all ${
                      formErrors.fullName
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.fullName && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        error
                      </span>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all ${
                      formErrors.phone
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="VD: 0912345678"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số
                  </p>
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        error
                      </span>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Address Field */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="123 Main St, City"
                  />
                </div>

                {/* Avatar URL Field */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Status Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-blue-500">
                      edit
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">Edit User</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleUpdateUser}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl transition-all ${
                      formErrors.fullName
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="John Doe"
                    required
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        error
                      </span>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl transition-all ${
                      formErrors.phone
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="VD: 0912345678"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Start with 03, 05, 07, 08, 09 và có 10 chữ số
                  </p>
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        error
                      </span>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl transition-all ${
                      formErrors.address
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    }`}
                    placeholder="123 Main St, City"
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        error
                      </span>
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <span className="material-symbols-outlined text-primary">
                      person
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">User Details</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="size-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-4xl">
                      person
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{selectedUser.fullName}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${getRoleBadgeStyle(selectedUser.role)}`}
                    >
                      {selectedUser.role}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${getStatusBadgeStyle(selectedUser.status)}`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    User ID
                  </p>
                  <p className="font-semibold">#{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <p className="font-semibold">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Address
                  </p>
                  <p className="font-semibold">
                    {selectedUser.address || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Created At
                  </p>
                  <p className="font-semibold text-sm">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Updated At
                  </p>
                  <p className="font-semibold text-sm">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditClick(selectedUser);
                  }}
                  className="flex-1 px-5 py-2.5 bg-blue-500 text-white font-semibold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  Edit User
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeleteClick(selectedUser);
                  }}
                  className="px-5 py-2.5 bg-red-500 text-white font-semibold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-red-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-red-500">
                      warning
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">Delete User</h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">
                      person
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold">{selectedUser.fullName}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone and all user data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-5 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 bg-red-500 text-white font-semibold text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
