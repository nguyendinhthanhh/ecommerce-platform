import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  ProductTableRowSkeleton,
  AdminHeaderSkeleton,
  AdminFilterSkeleton,
  StatsRowSkeleton,
} from "../../components/common/LoadingSpinner";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ImageUrlManager from "../../components/admin/ImageUrlManager";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    keyword: "",
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    thumbnail: "",
    images: [],
    categoryId: "",
    status: "INACTIVE",
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
      price: "",
      discountPrice: "",
      stockQuantity: "",
      thumbnail: "",
      images: [],
      categoryId: "",
      status: "INACTIVE",
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    // Price validation
    if (!formData.price || parseFloat(formData.price) < 0.01) {
      errors.price = "Price must be at least 0.01";
    }

    // Discount price validation
    if (formData.discountPrice && parseFloat(formData.discountPrice) < 0) {
      errors.discountPrice = "Discount price cannot be negative";
    }
    if (
      formData.discountPrice &&
      parseFloat(formData.discountPrice) >= parseFloat(formData.price)
    ) {
      errors.discountPrice = "Discount price must be less than original price";
    }

    // Stock quantity validation
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      errors.stockQuantity = "Stock quantity must be 0 or greater";
    }
    if (parseInt(formData.stockQuantity) > 1073741824) {
      errors.stockQuantity = "Stock quantity exceeds maximum limit";
    }

    // Category validation
    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }

    // Status validation
    const validStatuses = ["ACTIVE", "INACTIVE", "PENDING", "REJECTED"];
    if (!validStatuses.includes(formData.status)) {
      errors.status = "Status must be ACTIVE, INACTIVE, PENDING or REJECTED";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      let data;
      if (filters.keyword) {
        // Use search API
        data = await productService.searchProducts(
          filters.keyword,
          pagination.page,
          pagination.size,
        );
      } else {
        // Use getAllProducts
        data = await productService.getAllProducts(
          pagination.page,
          pagination.size,
          filters.sortBy,
          filters.sortDir,
        );
      }

      if (data) {
        if (data.content) {
          setProducts(data.content);
          setPagination((prev) => ({
            ...prev,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
          }));
        } else if (Array.isArray(data)) {
          setProducts(data);
          setPagination((prev) => ({
            ...prev,
            totalElements: data.length,
            totalPages: 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  const handleViewProduct = async (productId) => {
    // Show modal immediately with loading state
    setShowDetailModal(true);
    setLoadingDetail(true);
    setSelectedProduct(null);

    try {
      const product = await productService.getProductById(productId);
      setSelectedProduct(product);
    } catch (error) {
      console.error("Error loading product details:", error);
      showToast("Failed to load product details", "error");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    try {
      setSaving(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : 0,
        stockQuantity: parseInt(formData.stockQuantity),
        thumbnail: formData.thumbnail,
        images: formData.images,
        categoryId: parseInt(formData.categoryId),
        status: formData.status,
      };

      await productService.createProduct(productData);
      showToast("Product created successfully!");
      setShowCreateModal(false);
      resetFormData();
      loadProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      const errorData = error.response?.data;
      if (errorData?.message) {
        showToast(errorData.message, "error");
      } else if (errorData?.errors) {
        setFormErrors(errorData.errors);
        showToast("Please fix the validation errors", "error");
      } else {
        showToast("Failed to create product", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    try {
      setSaving(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : 0,
        stockQuantity: parseInt(formData.stockQuantity),
        thumbnail: formData.thumbnail,
        images: formData.images,
        categoryId: parseInt(formData.categoryId),
        status: formData.status,
      };

      await productService.updateProduct(selectedProduct.id, productData);
      showToast("Product updated successfully!");
      setShowEditModal(false);
      resetFormData();
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      const errorData = error.response?.data;
      if (errorData?.message) {
        showToast(errorData.message, "error");
      } else if (errorData?.errors) {
        setFormErrors(errorData.errors);
        showToast("Please fix the validation errors", "error");
      } else {
        showToast("Failed to update product", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setSaving(true);
      await productService.deleteProduct(selectedProduct.id);
      showToast("Product deleted successfully!");
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast(
        error.response?.data?.message || "Failed to delete product",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      discountPrice: product.discountPrice?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      thumbnail: product.thumbnail || "",
      images: product.images || [],
      categoryId: product.categoryId?.toString() || "",
      status: product.status || "INACTIVE",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Active
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Inactive
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case "OUT_OF_STOCK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        {loading && products.length === 0 ? (
          <AdminHeaderSkeleton />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Product Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                View and manage all products in the system
                {!loading && (
                  <span className="ml-2 text-primary font-medium">
                    ({pagination.totalElements} products)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  resetFormData();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Product
              </button>
              <button
                onClick={() => {
                  productService.invalidateCache();
                  loadProducts();
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}
                >
                  refresh
                </span>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards - Show when loaded */}
        {loading && products.length === 0 ? (
          <StatsRowSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    inventory_2
                  </span>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pagination.totalElements}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Products
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                    check_circle
                  </span>
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.filter((p) => p.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active Products
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                    warning
                  </span>
                </div>
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  Low Stock
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.filter((p) => p.stockQuantity <= 10).length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Need Restock
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                    inventory
                  </span>
                </div>
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {
                    products.filter(
                      (p) =>
                        p.stockQuantity === 0 || p.status === "OUT_OF_STOCK",
                    ).length
                  }
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sold Out
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {loading && products.length === 0 ? (
          <AdminFilterSkeleton />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.keyword}
                    onChange={(e) =>
                      handleFilterChange("keyword", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              {/* Sort */}
              <select
                value={`${filters.sortBy}-${filters.sortDir}`}
                onChange={(e) => {
                  const [sortBy, sortDir] = e.target.value.split("-");
                  setFilters((prev) => ({ ...prev, sortBy, sortDir }));
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="soldCount-desc">Best Selling</option>
              </select>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <ProductTableRowSkeleton rows={pagination.size} />
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">
                          inventory_2
                        </span>
                        <p className="text-slate-500 dark:text-slate-400">
                          No products found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/48?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400">
                                  image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {product.categoryName || "N/A"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <p className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(product.discountPrice)}
                              </p>
                              <p className="text-xs text-slate-400 line-through">
                                {formatCurrency(product.price)}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(product.price)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            product.stockQuantity <= 10
                              ? "text-red-600 dark:text-red-400"
                              : product.stockQuantity <= 50
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      {/* Sold Count */}
                      <td className="px-6 py-4">
                        <span className="text-slate-600 dark:text-slate-300">
                          {product.soldCount || 0}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-500 text-sm">
                            star
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {product.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-slate-400 text-xs">
                            ({product.totalReviews || 0})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
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

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pagination.page * pagination.size + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {Math.min(
                    (pagination.page + 1) * pagination.size,
                    pagination.totalElements,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pagination.totalElements}
                </span>{" "}
                products
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.page === 0}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    first_page
                  </span>
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i;
                      } else if (pagination.page < 3) {
                        pageNum = i;
                      } else if (pagination.page > pagination.totalPages - 4) {
                        pageNum = pagination.totalPages - 5 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                            pagination.page === pageNum
                              ? "bg-primary text-white"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages - 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    last_page
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <span className="material-symbols-outlined text-primary">
                        inventory_2
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Product Details</h3>
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
                {loadingDetail || !selectedProduct ? (
                  <div className="space-y-6 animate-pulse">
                    {/* Skeleton: Product Image & Basic Info */}
                    <div className="flex gap-6">
                      <div className="w-40 h-40 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      </div>
                    </div>

                    {/* Skeleton: Description */}
                    <div>
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>

                    {/* Skeleton: Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex flex-col items-center"
                        >
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Product Image & Basic Info */}
                    <div className="flex gap-6">
                      <div className="w-40 h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {selectedProduct.thumbnail ? (
                          <img
                            src={selectedProduct.thumbnail}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/160?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-400">
                              image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                            {selectedProduct.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            ID: {selectedProduct.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(selectedProduct.status)}
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {selectedProduct.categoryName}
                          </span>
                        </div>
                        <div>
                          {selectedProduct.discountPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-red-600">
                                {formatCurrency(selectedProduct.discountPrice)}
                              </span>
                              <span className="text-lg text-slate-400 line-through">
                                {formatCurrency(selectedProduct.price)}
                              </span>
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-semibold">
                                -
                                {Math.round(
                                  ((selectedProduct.price -
                                    selectedProduct.discountPrice) /
                                    selectedProduct.price) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatCurrency(selectedProduct.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        Product Description
                      </h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {selectedProduct.description || "No description"}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-blue-500 mb-1">
                          inventory
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.stockQuantity}
                        </p>
                        <p className="text-xs text-slate-500">In Stock</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-green-500 mb-1">
                          shopping_cart
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.soldCount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Sold</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-yellow-500 mb-1">
                          star
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.averageRating?.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-xs text-slate-500">Rating</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-purple-500 mb-1">
                          rate_review
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.totalReviews || 0}
                        </p>
                        <p className="text-xs text-slate-500">Reviews</p>
                      </div>
                    </div>

                    {/* Additional Images */}
                    {selectedProduct.images &&
                      selectedProduct.images.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                            Additional Images ({selectedProduct.images.length})
                          </h5>
                          <div className="flex gap-2 flex-wrap">
                            {selectedProduct.images.map((img, index) => (
                              <div
                                key={index}
                                className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onClick={() => window.open(img, "_blank")}
                                title="Click to view full image"
                              >
                                <img
                                  src={img}
                                  alt={`${selectedProduct.name} - ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/80?text=Error";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Seller Information */}
                    {selectedProduct.shopName && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                        <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-500 text-lg">
                            storefront
                          </span>
                          Seller Information
                        </h5>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">
                              store
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {selectedProduct.shopName}
                            </p>
                            {selectedProduct.shopId && (
                              <p className="text-xs text-slate-500">
                                Shop ID: {selectedProduct.shopId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.createdAt && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">
                              calendar_today
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Created At
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {new Date(
                              selectedProduct.createdAt,
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                      {selectedProduct.updatedAt && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">
                              update
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Last Updated
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {new Date(
                              selectedProduct.updatedAt,
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleEditClick(selectedProduct);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                        Edit Product
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleDeleteClick(selectedProduct);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                        Delete Product
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-green-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-green-500">
                        add_circle
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Create New Product</h3>
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
                onSubmit={handleCreateProduct}
                className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
              >
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Product Name <span className="text-red-500">*</span>
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
                      placeholder="Enter product name"
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
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price & Discount Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.price
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0.00"
                      />
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.discountPrice
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0.00"
                      />
                      {formErrors.discountPrice && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.discountPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.stockQuantity
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0"
                      />
                      {formErrors.stockQuantity && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.stockQuantity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.categoryId
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoryId && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.categoryId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Thumbnail URL
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Images - Create Modal */}
                  <ImageUrlManager
                    images={formData.images}
                    onImagesChange={(newImages) =>
                      setFormData((prev) => ({ ...prev, images: newImages }))
                    }
                  />

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        formErrors.status
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } bg-slate-50 dark:bg-slate-800`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    {formErrors.status && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.status}
                      </p>
                    )}
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
                        Create Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-yellow-500">
                        edit
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Edit Product</h3>
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
                onSubmit={handleUpdateProduct}
                className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]"
              >
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Product Name <span className="text-red-500">*</span>
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
                      placeholder="Enter product name"
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
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price & Discount Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.price
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0.00"
                      />
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.discountPrice
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0.00"
                      />
                      {formErrors.discountPrice && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.discountPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.stockQuantity
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                        placeholder="0"
                      />
                      {formErrors.stockQuantity && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.stockQuantity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                          formErrors.categoryId
                            ? "border-red-500"
                            : "border-slate-200 dark:border-slate-700"
                        } bg-slate-50 dark:bg-slate-800`}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoryId && (
                        <p className="mt-1 text-sm text-red-500">
                          {formErrors.categoryId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Thumbnail URL
                    </label>
                    <input
                      type="text"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Images - Edit Modal */}
                  <ImageUrlManager
                    images={formData.images}
                    onImagesChange={(newImages) =>
                      setFormData((prev) => ({ ...prev, images: newImages }))
                    }
                  />

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        formErrors.status
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      } bg-slate-50 dark:bg-slate-800`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    {formErrors.status && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.status}
                      </p>
                    )}
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
        {showDeleteModal && selectedProduct && (
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
                        delete
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">Delete Product</h3>
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
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete the product{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{selectedProduct.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
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
                      Delete Product
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

export default AdminProducts;
