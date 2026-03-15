import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { ProductCardSkeleton } from '../../components/common/LoadingSpinner';
import Header from '../../components/layout/Header';
import vi from '../../utils/translations';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const pageSize = 12;

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategoriesHierarchy();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    const searchParam = searchParams.get('search') || '';
    setSelectedCategory(categoryParam);
    setSearchQuery(searchParam);
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchQuery, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      
      if (searchQuery) {
        // Search mode - ignore category filter
        data = await productService.searchProducts(searchQuery, page, pageSize);
      } else if (selectedCategory && selectedCategory !== 'all') {
        // Category filter mode
        data = await productService.getProductsByCategory(selectedCategory, page, pageSize);
      } else {
        // All products mode
        const sortField = sortBy === 'priceAsc' || sortBy === 'priceDesc' ? 'price' : 'createdAt';
        const sortDir = sortBy === 'priceAsc' ? 'asc' : 'desc';
        data = await productService.getAllProducts(page, pageSize, sortField, sortDir);
      }

      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(vi.messages.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
    
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    // Clear search when selecting category
    newParams.delete('search');
    setSearchQuery('');
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchWithoutEvent();
  };

  const handleSearchWithoutEvent = () => {
    setPage(0);
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
      // Clear category when searching
      setSelectedCategory('all');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary">
              {vi.common.home}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{vi.product.products}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Search */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `${vi.product.searchProducts} "${searchQuery}"` : vi.product.products}
          </h1>
          
          {/* Search Bar */}
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={vi.product.searchProducts}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                {vi.common.search}
              </button>
            </form>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {vi.common.all}
            </button>
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id.toString())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id.toString()
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">{vi.product.newest}</option>
            <option value="priceAsc">{vi.product.priceAsc}</option>
            <option value="priceDesc">{vi.product.priceDesc}</option>
          </select>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {vi.product.showingResults} {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} {vi.product.of} {totalElements} {vi.product.results}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              {vi.messages.tryAgain}
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
            <p className="text-gray-600 mb-4">{vi.product.noProducts}</p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              {vi.product.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden relative">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">image</span>
                        <p className="text-sm text-gray-500">Không có ảnh</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2 text-sm">
                    {renderStars(Math.round(product.averageRating || 0))}
                    <span className="text-gray-500 ml-1">
                      ({product.totalReviews || 0})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(product.discountPrice || product.price)}
                      </div>
                      {product.discountPrice && product.price > product.discountPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                    {product.stockQuantity > 0 ? (
                      <span className="text-xs text-green-600 font-medium">
                        {vi.product.inStock}
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        {vi.product.outOfStock}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            {totalPages > 5 && page < totalPages - 3 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  className="w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
