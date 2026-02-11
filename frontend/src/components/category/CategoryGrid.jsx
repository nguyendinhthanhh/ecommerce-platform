import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import categoryService from "../../services/categoryService";

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoriesHierarchy();
      // Chỉ lấy root categories (không có parent)
      const rootCategories = Array.isArray(data) ? data.filter(cat => cat.isActive) : [];
      setCategories(rootCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping cho các category phổ biến
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('phone') || name.includes('điện thoại') || name.includes('iphone') || name.includes('samsung')) {
      return 'smartphone';
    } else if (name.includes('laptop') || name.includes('máy tính')) {
      return 'laptop_mac';
    } else if (name.includes('tablet') || name.includes('máy tính bảng')) {
      return 'tablet';
    } else if (name.includes('watch') || name.includes('đồng hồ')) {
      return 'watch';
    } else if (name.includes('audio') || name.includes('âm thanh') || name.includes('tai nghe') || name.includes('headphone')) {
      return 'headphones';
    } else if (name.includes('camera') || name.includes('máy ảnh')) {
      return 'photo_camera';
    } else if (name.includes('tv') || name.includes('tivi') || name.includes('television')) {
      return 'tv';
    } else if (name.includes('gaming') || name.includes('game')) {
      return 'sports_esports';
    } else if (name.includes('accessory') || name.includes('phụ kiện')) {
      return 'cable';
    } else if (name.includes('home') || name.includes('nhà cửa') || name.includes('gia dụng')) {
      return 'home';
    } else if (name.includes('fashion') || name.includes('thời trang')) {
      return 'checkroom';
    } else if (name.includes('book') || name.includes('sách')) {
      return 'menu_book';
    } else if (name.includes('toy') || name.includes('đồ chơi')) {
      return 'toys';
    } else if (name.includes('sport') || name.includes('thể thao')) {
      return 'fitness_center';
    } else if (name.includes('beauty') || name.includes('làm đẹp') || name.includes('mỹ phẩm')) {
      return 'face';
    } else {
      return 'category';
    }
  };

  if (loading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Danh mục sản phẩm</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg mb-3 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <span className="material-symbols-outlined">apps</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Danh mục sản phẩm</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Khám phá theo danh mục</p>
          </div>
        </div>
        <Link 
          to="/products" 
          className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="group bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-slate-700 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className="material-symbols-outlined text-primary text-2xl md:text-3xl"
                style={{ display: category.image ? 'none' : 'flex' }}
              >
                {getCategoryIcon(category.name)}
              </span>
            </div>

            {/* Category Name */}
            <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {category.name}
            </h3>

            {/* Product Count - Hidden on mobile */}
            {category.productCount > 0 && (
              <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {category.productCount} SP
              </p>
            )}

            {/* Arrow Icon on Hover - Hidden on mobile */}
            <div className="hidden md:block mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary text-[16px]">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Show subcategories for featured category (optional) */}
      {categories.length > 0 && categories[0].children && categories[0].children.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-100 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">star</span>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {categories[0].name} - Danh mục phổ biến
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories[0].children.slice(0, 8).map((subCat) => (
              <Link
                key={subCat.id}
                to={`/products?category=${subCat.id}`}
                className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors border border-gray-200 dark:border-slate-600"
              >
                {subCat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
