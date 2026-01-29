import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  ProductTableRowSkeleton,
  AdminHeaderSkeleton,
  AdminFilterSkeleton,
  StatsRowSkeleton,
} from "../../components/common/LoadingSpinner";
import productService from "../../services/productService";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
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
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleViewProduct = async (productId) => {
    try {
      setLoadingDetail(true);
      const product = await productService.getProductById(productId);
      setSelectedProduct(product);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading product details:", error);
      showToast("Không thể tải chi tiết sản phẩm", "error");
    } finally {
      setLoadingDetail(false);
    }
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
            Đang bán
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Ngừng bán
          </span>
        );
      case "OUT_OF_STOCK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Hết hàng
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
                Quản lý sản phẩm
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Xem và quản lý tất cả sản phẩm trên hệ thống
                {!loading && (
                  <span className="ml-2 text-primary font-medium">
                    ({pagination.totalElements} sản phẩm)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
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
                {loading ? "Đang tải..." : "Làm mới"}
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
                  Tổng
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pagination.totalElements}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tổng sản phẩm
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
                  Đang bán
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.filter((p) => p.status === "ACTIVE").length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sản phẩm hoạt động
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
                  Tồn kho thấp
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.filter((p) => p.stockQuantity <= 10).length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cần nhập thêm
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
                  Hết hàng
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
                  Sản phẩm hết
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
                    placeholder="Tìm kiếm sản phẩm..."
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
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Ngừng bán</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
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
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="soldCount-desc">Bán chạy nhất</option>
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
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kho
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Thao tác
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
                          Không tìm thấy sản phẩm nào
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

                      {/* Shop */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px] block">
                          {product.shopName || "N/A"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-lg">
                              visibility
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
                Hiển thị{" "}
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
                trong{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pagination.totalElements}
                </span>{" "}
                sản phẩm
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
        {showDetailModal && selectedProduct && (
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
                    <h3 className="text-lg font-bold">Chi tiết sản phẩm</h3>
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
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        Mô tả sản phẩm
                      </h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {selectedProduct.description || "Không có mô tả"}
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
                        <p className="text-xs text-slate-500">Tồn kho</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-green-500 mb-1">
                          shopping_cart
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.soldCount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Đã bán</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-yellow-500 mb-1">
                          star
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.averageRating?.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-xs text-slate-500">Đánh giá</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <span className="material-symbols-outlined text-2xl text-purple-500 mb-1">
                          rate_review
                        </span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedProduct.totalReviews || 0}
                        </p>
                        <p className="text-xs text-slate-500">Nhận xét</p>
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                        Thông tin Shop
                      </h5>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">
                            storefront
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {selectedProduct.shopName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Shop ID: {selectedProduct.shopId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images */}
                    {selectedProduct.images &&
                      selectedProduct.images.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                            Hình ảnh khác
                          </h5>
                          <div className="flex gap-2 flex-wrap">
                            {selectedProduct.images.map((img, index) => (
                              <div
                                key={index}
                                className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
                              >
                                <img
                                  src={img}
                                  alt={`${selectedProduct.name} - ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
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
