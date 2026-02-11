import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import categoryService from "../../services/categoryService";

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategoryId = searchParams.get('category');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoriesHierarchy();
      const activeCategories = Array.isArray(data) ? data.filter(cat => cat.isActive) : [];
      setCategories(activeCategories);
      
      // Auto expand category nếu đang được chọn
      if (selectedCategoryId) {
        const categoryId = parseInt(selectedCategoryId);
        // Tìm parent của category được chọn và expand nó
        activeCategories.forEach(cat => {
          if (cat.children && cat.children.some(child => child.id === categoryId)) {
            setExpandedCategories(prev => new Set([...prev, cat.id]));
          }
        });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId) {
      navigate(`/products?category=${categoryId}`);
    } else {
      navigate('/products');
    }
  };

  const handleReset = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          Danh mục
        </h3>
        <button 
          onClick={handleReset}
          className="text-xs text-primary font-medium hover:underline"
        >
          Đặt lại
        </button>
      </div>

      {/* All Products Option */}
      <div
        onClick={() => handleCategoryClick(null)}
        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors mb-2 ${
          !selectedCategoryId
            ? 'bg-primary text-white'
            : 'hover:bg-gray-50 dark:hover:bg-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">apps</span>
          <span className="text-sm font-medium">Tất cả sản phẩm</span>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {categories.map((category) => (
          <div key={category.id}>
            {/* Parent Category */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                selectedCategoryId === String(category.id)
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <div
                onClick={() => handleCategoryClick(category.id)}
                className="flex items-center gap-2 flex-1"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {category.image ? 'image' : 'folder'}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
                {category.productCount > 0 && (
                  <span className="text-xs text-gray-400 ml-auto mr-2">
                    ({category.productCount})
                  </span>
                )}
              </div>
              
              {/* Expand/Collapse Button */}
              {category.children && category.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                >
                  <span className={`material-symbols-outlined text-[18px] transition-transform ${
                    expandedCategories.has(category.id) ? 'rotate-180' : ''
                  }`}>
                    expand_more
                  </span>
                </button>
              )}
            </div>

            {/* Child Categories */}
            {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-slate-700 pl-2">
                {category.children.filter(child => child.isActive).map((child) => (
                  <div
                    key={child.id}
                    onClick={() => handleCategoryClick(child.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCategoryId === String(child.id)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-gray-400">
                        subdirectory_arrow_right
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {child.name}
                      </span>
                    </div>
                    {child.productCount > 0 && (
                      <span className="text-xs text-gray-400">
                        ({child.productCount})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">
            category
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có danh mục
          </p>
        </div>
      )}

      {/* Price Range Section */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
        <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">payments</span>
          Khoảng giá
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <input
            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tối thiểu"
            type="number"
          />
          <span className="text-gray-400">-</span>
          <input
            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tối đa"
            type="number"
          />
        </div>
        <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default CategorySidebar;
