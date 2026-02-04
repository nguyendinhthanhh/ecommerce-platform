import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { TableRowSkeleton } from "../../components/common/LoadingSpinner";
import categoryService from "../../services/categoryService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    isActive: "",
    rootOnly: "",
  });

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentId: "",
    isActive: true,
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      parentId: "",
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.isActive !== "")
        params.isActive = filters.isActive === "true";
      if (filters.rootOnly !== "")
        params.rootOnly = filters.rootOnly === "true";

      const data = await categoryService.getAllCategories(params);
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleViewCategory = async (categoryId) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setSelectedCategory(null);

    try {
      const category = await categoryService.getCategoryById(categoryId);
      setSelectedCategory(category);
    } catch (error) {
      console.error("Error loading category details:", error);
      showToast("Failed to load category details", "error");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    try {
      setSaving(true);
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        image: formData.image || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        isActive: formData.isActive,
      };

      await categoryService.createCategory(categoryData);
      showToast("Category created successfully!");
      setShowCreateModal(false);
      resetFormData();
      loadCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      const errorData = error.response?.data;
      if (errorData?.message) {
        showToast(errorData.message, "error");
      } else if (errorData?.errors) {
        setFormErrors(errorData.errors);
        showToast("Please fix the validation errors", "error");
      } else {
        showToast("Failed to create category", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    try {
      setSaving(true);
      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        image: formData.image || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        isActive: formData.isActive,
      };

      await categoryService.updateCategory(selectedCategory.id, categoryData);
      showToast("Category updated successfully!");
      setShowEditModal(false);
      resetFormData();
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      const errorData = error.response?.data;
      if (errorData?.message) {
        showToast(errorData.message, "error");
      } else if (errorData?.errors) {
        setFormErrors(errorData.errors);
        showToast("Please fix the validation errors", "error");
      } else {
        showToast("Failed to update category", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setSaving(true);
      await categoryService.deleteCategory(selectedCategory.id);
      showToast("Category deleted successfully!");
      setShowDeleteModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(
        error.response?.data?.message || "Failed to delete category",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId?.toString() || "",
      isActive: category.isActive ?? true,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
        Inactive
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Category Management
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage product categories
              {!loading && (
                <span className="ml-2 text-primary font-medium">
                  ({categories.length} categories)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                className="border-none bg-transparent text-sm p-0 focus:ring-0 w-40"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm shadow-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Root Only Filter */}
            <select
              value={filters.rootOnly}
              onChange={(e) => handleFilterChange("rootOnly", e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm shadow-sm"
            >
              <option value="">All Categories</option>
              <option value="true">Root Only</option>
            </select>

            {/* Create Button */}
            <button
              onClick={() => {
                resetFormData();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Category
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                categoryService.invalidateCache();
                loadCategories();
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

        {/* Categories Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Description
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Parent
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Products
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
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-slate-300">
                          category
                        </span>
                        <p>No categories found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-slate-500">
                        {category.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">
                                  category
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {category.parentName || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {category.productCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(category.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCategory(category.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => handleEditClick(category)}
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-lg">
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
        </div>

        {/* Category Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <span className="material-symbols-outlined text-primary">
                        category
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Category Details</h3>
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
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {loadingDetail || !selectedCategory ? (
                  <div className="space-y-6 animate-pulse">
                    {/* Skeleton: Category Image & Title */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex-1">
                        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>

                    {/* Skeleton: Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"
                        >
                          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>

                    {/* Skeleton: Description */}
                    <div>
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Category Image */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {selectedCategory.image ? (
                          <img
                            src={selectedCategory.image}
                            alt={selectedCategory.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-slate-400">
                              category
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                          {selectedCategory.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          ID: {selectedCategory.id}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        {getStatusBadge(selectedCategory.isActive)}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Products</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {selectedCategory.productCount || 0}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">
                          Parent Category
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {selectedCategory.parentName || "None (Root)"}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Parent ID</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {selectedCategory.parentId || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        Description
                      </h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {selectedCategory.description || "No description"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-green-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-green-500">
                        add_circle
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Create New Category</h3>
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
                onSubmit={handleCreateCategory}
                className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
              >
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        formErrors.name
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } bg-slate-50 dark:bg-slate-800`}
                      placeholder="Enter category name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter category description"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Parent ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Parent Category
                    </label>
                    <select
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">-- None (Root Category) --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Active
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          add
                        </span>
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-yellow-500">
                        edit
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Edit Category</h3>
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
                onSubmit={handleUpdateCategory}
                className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
              >
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        formErrors.name
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } bg-slate-50 dark:bg-slate-800`}
                      placeholder="Enter category name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter category description"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Parent ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Parent Category
                    </label>
                    <select
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">-- None (Root Category) --</option>
                      {categories
                        .filter((cat) => cat.id !== selectedCategory?.id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="editIsActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="editIsActive"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Active
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          save
                        </span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-red-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-red-500">
                        delete
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Delete Category</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400">
                      close
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete the category{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{selectedCategory.name}"
                  </span>
                  ? This action cannot be undone.
                </p>

                {selectedCategory.productCount > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <span className="material-symbols-outlined text-lg">
                        warning
                      </span>
                      <span className="text-sm font-medium">
                        This category has {selectedCategory.productCount}{" "}
                        products
                      </span>
                    </div>
                  </div>
                )}

                {/* Confirmation Input */}
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    To confirm, type{" "}
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                      {selectedCategory.name}
                    </span>{" "}
                    below:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${selectedCategory.name}" to confirm`}
                    className="w-full px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteCategory();
                    setDeleteConfirmText("");
                  }}
                  disabled={
                    saving || deleteConfirmText !== selectedCategory.name
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                      Delete Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${
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
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
