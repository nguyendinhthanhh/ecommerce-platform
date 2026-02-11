import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import categoryService from "../../services/categoryService";
import { toast, Toaster } from "react-hot-toast";
import vi from "../../utils/translations";

const AdminCategoriesNew = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'tree'
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    rootCategories: 0,
    totalProducts: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL", // ALL, ACTIVE, INACTIVE
    type: "ALL", // ALL, ROOT, CHILD
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentId: null,
    isActive: true,
    // Enterprise fields
    slug: "",
    bannerUrl: "",
    isMenu: true,
    isFilterable: true,
    position: 0,
    metaTitle: "",
    metaDescription: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategoriesHierarchy();
      setCategories(Array.isArray(response) ? response : []);

      // Calculate stats
      const allCategories = flattenCategories(response);
      const active = allCategories.filter(c => c.isActive).length;
      const rootCats = response.length;
      const totalProds = allCategories.reduce((sum, c) => sum + (c.productCount || 0), 0);

      setStats({
        total: allCategories.length,
        active,
        inactive: allCategories.length - active,
        rootCategories: rootCats,
        totalProducts: totalProds,
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Tải danh mục thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Flatten hierarchy for stats
  const flattenCategories = (cats) => {
    let result = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children));
      }
    });
    return result;
  };

  // Filter categories
  const getFilteredCategories = () => {
    let filtered = [...categories];
    const allFlat = flattenCategories(filtered);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchedIds = new Set(
        allFlat.filter(c => c.name.toLowerCase().includes(searchLower)).map(c => c.id)
      );
      filtered = filtered.filter(c => matchedIds.has(c.id));
    }

    if (filters.status !== "ALL") {
      const isActive = filters.status === "ACTIVE";
      filtered = filtered.filter(c => c.isActive === isActive);
    }

    if (filters.type === "ROOT") {
      // Already root level
    } else if (filters.type === "CHILD") {
      filtered = allFlat.filter(c => c.parentId !== null);
    }

    return filtered;
  };

  // Handlers
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      name: "",
      description: "",
      image: "",
      parentId: null,
      isActive: true,
      slug: "",
      bannerUrl: "",
      isMenu: true,
      isFilterable: true,
      position: 0,
      metaTitle: "",
      metaDescription: "",
    });
    setFormErrors({});
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId,
      isActive: category.isActive,
      slug: category.slug || "",
      bannerUrl: category.bannerUrl || "",
      isMenu: category.isMenu !== undefined ? category.isMenu : true,
      isFilterable: category.isFilterable !== undefined ? category.isFilterable : true,
      position: category.position || 0,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (category) => {
    setModalMode('view');
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Xóa "${category.name}"? Hành động này không thể hoàn tác.`)) return;

    try {
      await categoryService.deleteCategory(category.id);
      toast.success("Xóa danh mục thành công");
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa danh mục thất bại");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormErrors({ name: "Category name is required" });
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: formData.name,
        description: formData.description || null,
        image: formData.image || null,
        parentId: formData.parentId || null,
        isActive: formData.isActive,
        slug: formData.slug || null,
        bannerUrl: formData.bannerUrl || null,
        isMenu: formData.isMenu,
        isFilterable: formData.isFilterable,
        position: formData.position,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
      };

      if (modalMode === 'create') {
        await categoryService.createCategory(data);
        toast.success("Tạo danh mục thành công");
      } else {
        await categoryService.updateCategory(selectedCategory.id, data);
        toast.success("Cập nhật danh mục thành công");
      }

      setShowModal(false);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category) => {
    try {
      await categoryService.updateCategory(category.id, {
        ...category,
        isActive: !category.isActive,
      });
      toast.success(`Danh mục đã ${!category.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
      loadCategories();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  // Render category card - Compact version
  const CategoryCard = ({ category, level = 0 }) => (
    <div className={`${level > 0 ? 'ml-6 mt-1.5' : ''}`}>
      <div className={`bg-slate-50 rounded-lg border transition-all hover:shadow-md hover:bg-white ${
        category.isActive ? 'border-slate-200 hover:border-blue-300' : 'border-slate-200 opacity-60'
      }`}>
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Category Image - Smaller */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border border-slate-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/48?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-slate-400">category</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Info - Compact */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-900 truncate">{category.name}</h3>
                {category.level !== undefined && category.level > 0 && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                    L{category.level}
                  </span>
                )}
                {category.isMenu && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded" title="Hiển thị trong menu">
                    MENU
                  </span>
                )}
                {category.isFilterable && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded" title="Dùng làm bộ lọc">
                    FILTER
                  </span>
                )}
                {!category.isActive && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded">
                    ẨN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">
                {category.description || "Chưa có mô tả"}
              </p>
              {category.slug && (
                <p className="text-[10px] text-slate-400 mt-0.5">/{category.slug}</p>
              )}
            </div>

            {/* Stats - Compact */}
            <div className="flex items-center gap-3 px-3 border-l border-slate-200">
              <div className="flex items-center gap-1 text-xs">
                <span className="material-symbols-outlined text-[16px] text-blue-600">inventory_2</span>
                <span className="font-semibold text-slate-900">{category.productCount || 0}</span>
              </div>
              {category.children && category.children.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-purple-600">account_tree</span>
                  <span className="font-semibold text-slate-900">{category.children.length}</span>
                </div>
              )}
            </div>

            {/* Actions - Compact */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleView(category)}
                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                title="Xem"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
              <button
                onClick={() => handleEdit(category)}
                className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                title="Sửa"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                onClick={() => toggleStatus(category)}
                className={`p-1.5 rounded transition-colors ${
                  category.isActive
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
                title={category.isActive ? 'Ẩn' : 'Hiện'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {category.isActive ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                title="Xóa"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render children - Compact */}
      {viewMode === 'tree' && category.children && category.children.length > 0 && (
        <div className="border-l-2 border-slate-200 ml-6 pl-2">
          {category.children.map(child => (
            <CategoryCard key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      <div className="p-6 space-y-4">
        
        {/* Header with Stats - Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{vi.category.categoryManagement}</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý danh mục sản phẩm và cấu trúc phân cấp</p>
          </div>
          
          {/* Compact Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">category</span>
              <div>
                <p className="text-xs text-blue-600 font-medium">{vi.category.total}</p>
                <p className="text-lg font-bold text-blue-700">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
              <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
              <div>
                <p className="text-xs text-green-600 font-medium">{vi.common.active}</p>
                <p className="text-lg font-bold text-green-700">{stats.active}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
              <span className="material-symbols-outlined text-purple-600 text-[20px]">inventory_2</span>
              <div>
                <p className="text-xs text-purple-600 font-medium">{vi.product.products}</p>
                <p className="text-lg font-bold text-purple-700">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls - Compact */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder={vi.common.search + "..."}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilters({...filters, status})}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filters.status === status
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL' ? vi.common.all : status === 'ACTIVE' ? vi.common.active : vi.common.inactive}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {['ALL', 'ROOT', 'CHILD'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilters({...filters, type})}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filters.type === type
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? vi.common.all : type === 'ROOT' ? vi.category.root : vi.category.child}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
                title={vi.category.gridView}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'tree' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
                title={vi.category.treeView}
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-300"></div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {vi.category.createCategory}
            </button>
          </div>
        </div>

        {/* Categories List - Compact */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3 border border-slate-100 rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : getFilteredCategories().length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">category</span>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Không tìm thấy danh mục</h3>
              <p className="text-sm text-slate-500 mb-4">Thử điều chỉnh bộ lọc hoặc tạo danh mục mới</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Tạo danh mục đầu tiên
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {getFilteredCategories().map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b border-slate-200 ${
              modalMode === 'create' ? 'bg-gradient-to-r from-green-50 to-transparent' :
              modalMode === 'edit' ? 'bg-gradient-to-r from-yellow-50 to-transparent' :
              'bg-gradient-to-r from-blue-50 to-transparent'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    modalMode === 'create' ? 'bg-green-100' :
                    modalMode === 'edit' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      modalMode === 'create' ? 'text-green-600' :
                      modalMode === 'edit' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {modalMode === 'create' ? 'add_circle' : modalMode === 'edit' ? 'edit' : 'visibility'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {modalMode === 'create' ? 'Tạo danh mục mới' :
                     modalMode === 'edit' ? 'Sửa danh mục' : 'Chi tiết danh mục'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {modalMode === 'view' ? (
                <div className="space-y-6">
                  {/* View Mode */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                      {selectedCategory?.image ? (
                        <img src={selectedCategory.image} alt={selectedCategory.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-slate-400">category</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{selectedCategory?.name}</h4>
                      <p className="text-sm text-slate-500">ID: {selectedCategory?.id}</p>
                      {selectedCategory?.slug && (
                        <p className="text-sm text-blue-600 font-mono">/{selectedCategory.slug}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                      <p className="text-lg font-bold">{selectedCategory?.isActive ? 'Hoạt động' : 'Không hoạt động'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Cấp độ</p>
                      <p className="text-lg font-bold">{selectedCategory?.level || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Sản phẩm</p>
                      <p className="text-lg font-bold">{selectedCategory?.productCount || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">menu</span>
                        <div>
                          <p className="text-xs text-blue-600 mb-1">Hiển thị trong menu</p>
                          <p className="text-lg font-bold text-blue-700">{selectedCategory?.isMenu ? 'Có' : 'Không'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">filter_alt</span>
                        <div>
                          <p className="text-xs text-green-600 mb-1">Dùng làm bộ lọc</p>
                          <p className="text-lg font-bold text-green-700">{selectedCategory?.isFilterable ? 'Có' : 'Không'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-slate-500 mb-2">Mô tả</h5>
                    <p className="text-slate-700">{selectedCategory?.description || "Chưa có mô tả"}</p>
                  </div>

                  {selectedCategory?.metaTitle && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-500 mb-2">Tiêu đề SEO</h5>
                      <p className="text-slate-700">{selectedCategory.metaTitle}</p>
                    </div>
                  )}

                  {selectedCategory?.metaDescription && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-500 mb-2">Mô tả SEO</h5>
                      <p className="text-slate-700">{selectedCategory.metaDescription}</p>
                    </div>
                  )}

                  {selectedCategory?.bannerUrl && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-500 mb-2">Banner</h5>
                      <img src={selectedCategory.bannerUrl} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form Mode */}
                  
                  {/* Basic Information Section */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      Thông tin cơ bản
                    </h5>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setFormData({
                            ...formData, 
                            name: newName,
                            slug: formData.slug || generateSlug(newName)
                          });
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Nhập tên danh mục"
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="Nhập mô tả danh mục"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Danh mục cha</label>
                        <select
                          value={formData.parentId || ""}
                          onChange={(e) => setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : null})}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Không có (Danh mục gốc)</option>
                          {flattenCategories(categories).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Vị trí</label>
                        <input
                          type="number"
                          value={formData.position}
                          onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                        />
                        <p className="text-xs text-slate-500 mt-1">Thứ tự hiển thị (số nhỏ hơn = hiển thị trước)</p>
                      </div>
                    </div>
                  </div>

                  {/* SEO & URL Section */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h5 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      SEO & URL
                    </h5>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Đường dẫn URL
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="tu-dong-tao-tu-ten"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Tự động tạo từ tên, hoặc tùy chỉnh</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tiêu đề SEO</label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Tiêu đề SEO cho công cụ tìm kiếm"
                        maxLength="60"
                      />
                      <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length}/60 ký tự</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả SEO</label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="2"
                        placeholder="Mô tả SEO cho công cụ tìm kiếm"
                        maxLength="160"
                      />
                      <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length}/160 ký tự</p>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                    <h5 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">image</span>
                      Hình ảnh
                    </h5>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Biểu tượng/Hình ảnh danh mục</label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/icon.jpg"
                      />
                      <p className="text-xs text-slate-500 mt-1">Biểu tượng nhỏ hiển thị trong thẻ danh mục</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Hình Banner</label>
                      <input
                        type="text"
                        value={formData.bannerUrl}
                        onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/banner.jpg"
                      />
                      <p className="text-xs text-slate-500 mt-1">Banner lớn cho trang danh mục</p>
                    </div>
                  </div>

                  {/* Display Settings Section */}
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <h5 className="text-sm font-bold text-green-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Cài đặt hiển thị
                    </h5>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                        Hoạt động (hiển thị cho khách hàng)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isMenu"
                        checked={formData.isMenu}
                        onChange={(e) => setFormData({...formData, isMenu: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="isMenu" className="text-sm font-medium text-slate-700">
                        Hiển thị trong menu điều hướng
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFilterable"
                        checked={formData.isFilterable}
                        onChange={(e) => setFormData({...formData, isFilterable: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="isFilterable" className="text-sm font-medium text-slate-700">
                        Dùng làm bộ lọc sản phẩm
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {saving ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo danh mục' : 'Cập nhật danh mục'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategoriesNew;
