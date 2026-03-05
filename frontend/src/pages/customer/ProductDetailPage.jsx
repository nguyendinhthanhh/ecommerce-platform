import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";
import { ProductDetailSkeleton } from "../../components/common/LoadingSpinner";
import { useCart } from "../../contexts/CartContext";
import Header from "../../components/layout/Header";
import ProductReviews from "../../components/reviews/ProductReviews";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // default to description

  // Image interaction states
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchProductDetail();
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;

      if (e.key === "Escape") {
        setShowLightbox(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedImage((prev) =>
          prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) =>
          prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, product]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const result = await addToCart(product, quantity);
      if (result?.requiresLogin) return;
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);
      const result = await addToCart(product, quantity);
      if (result?.requiresLogin) return;
      navigate("/cart");
    } catch (err) {
      console.error("Failed to buy now:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product)
    return (
      <div className="min-h-screen bg-[#f4f6f8]">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <Link to="/products" className="bg-primary text-white px-6 py-2 rounded font-bold mt-4">
            Về trang chủ
          </Link>
        </div>
      </div>
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || "https://via.placeholder.com/600x600?text=No+Image"];

  const oldPrice = product.oldPrice || (product.price * 1.15); // mock old price

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#111418] font-display pb-20">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-[#f4f6f8] py-3">
        <div className="max-w-[1200px] mx-auto px-4">
          <nav className="flex items-center gap-2 text-[13px] text-gray-500">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to={`/products?category=${product.categoryId}`} className="hover:text-primary">
              {product.categoryName || 'Sản phẩm'}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-gray-900 truncate font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4">
        {/* Main Product Area */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Gallery (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div
                className="w-full aspect-square border border-gray-100 rounded-lg overflow-hidden cursor-zoom-in relative bg-white flex items-center justify-center p-4 group"
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full flex items-center justify-center hidden group-hover:flex">
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded border flex-shrink-0 cursor-pointer p-1 bg-white ${selectedImage === index ? "border-primary" : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Title & Brand */}
              <div className="border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-yellow-400 text-[14px]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px] fill-current">
                        {i < Math.floor(product.averageRating || 5) ? 'star' : 'star_border'}
                      </span>
                    ))}
                    <span className="text-gray-500 ml-1 text-[13px]">({product.totalReviews || 0} đánh giá)</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Mã SP: <strong className="text-gray-700">{product.id?.substring(0, 8).toUpperCase()}</strong></span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">Tình trạng: <strong className="text-primary">{product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</strong></span>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex flex-col gap-2">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-primary leading-none">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-lg text-gray-500 line-through mb-1">
                    {formatPrice(oldPrice)}
                  </span>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-0.5 rounded ml-2 mb-1">
                    -{Math.round(((oldPrice - product.price) / oldPrice) * 100)}%
                  </span>
                </div>
                <div className="mt-2 text-[13px] text-gray-600">
                  <span className="text-green-600 font-bold mr-1">✓</span> Miễn phí vận chuyển toàn quốc
                </div>
              </div>

              {/* Promotion Box */}
              <div className="border border-[#e5e7eb] rounded-lg mt-2 overflow-hidden">
                <div className="bg-[#f3f4f6] px-4 py-2 border-b border-[#e5e7eb] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">featured_seasonal_and_gifts</span>
                  <h3 className="font-bold text-[#111418] uppercase text-[15px]">Quà tặng & Ưu đãi đặc biệt</h3>
                </div>
                <div className="p-4 bg-white text-[13px] space-y-3">
                  <div className="flex gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm h-fit mt-0.5">KM 1</span>
                    <span>Tặng Balo Gaming cao cấp trị giá 890.000₫</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm h-fit mt-0.5">KM 2</span>
                    <span>Tặng Chuột Gaming trị giá 550.000₫</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm h-fit mt-0.5">KM 3</span>
                    <span>Giảm 20% khi mua kèm lót chuột hoặc túi chống sốc</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold text-[14px]">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded h-9 w-28 overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      className="w-12 h-full text-center text-[14px] font-bold focus:outline-none border-x border-gray-300"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 bg-primary hover:bg-red-700 text-white rounded h-14 flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  >
                    <span className="font-bold text-[18px]">Mua Ngay</span>
                    <span className="text-[11px] font-medium">Giao nhanh 2h hoặc nhận tại cửa hàng</span>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stockQuantity === 0}
                    className="w-[180px] border-2 border-primary text-primary hover:bg-[#fff0f1] rounded h-14 flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  >
                    <span className="font-bold text-[15px]">Thêm Vào Giỏ</span>
                    <span className="text-[10px] font-medium">Tiếp tục mua sắm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Specs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Description & Reviews */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold uppercase mb-4 text-gray-900">Mô tả sản phẩm</h2>
              <div className="prose max-w-none text-[15px] text-gray-700 leading-relaxed">
                <p className="whitespace-pre-line">{product.description}</p>
                {/* Placeholder image for description */}
                <div className="my-6">
                  <img src="https://via.placeholder.com/800x400/101922/ffffff?text=Premium+Gaming+Experience" alt="Marketing" className="w-full rounded-lg" />
                </div>
              </div>
            </div>

            <div id="reviews" className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold uppercase mb-4 text-gray-900 border-b border-gray-100 pb-3">Khách hàng đánh giá</h2>
              <ProductReviews productId={id} />
            </div>
          </div>

          {/* Right: Technical Specs */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-20 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 bg-primary text-white px-3 py-2 rounded">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <h2 className="font-bold uppercase text-[15px]">Thông số kỹ thuật</h2>
              </div>

              <div className="space-y-0 text-[13px]">
                <div className="flex py-2.5 border-b border-gray-100 bg-gray-50 px-2 rounded-t">
                  <span className="w-1/3 text-gray-500 font-medium">Thương hiệu</span>
                  <span className="w-2/3 text-gray-900 font-bold text-right">GearVN Brand</span>
                </div>
                <div className="flex py-2.5 border-b border-gray-100 px-2">
                  <span className="w-1/3 text-gray-500 font-medium">Bảo hành</span>
                  <span className="w-2/3 text-gray-900 font-bold text-right">24 Tháng</span>
                </div>
                <div className="flex py-2.5 border-b border-gray-100 bg-gray-50 px-2">
                  <span className="w-1/3 text-gray-500 font-medium">Tình trạng</span>
                  <span className="w-2/3 text-gray-900 font-bold text-right">Mới 100%</span>
                </div>
                <div className="flex py-2.5 border-b border-gray-100 px-2">
                  <span className="w-1/3 text-gray-500 font-medium">SKU</span>
                  <span className="w-2/3 text-gray-900 font-bold text-right">{product.id?.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] py-2.5 rounded transition-colors uppercase">
                Xem chi tiết cấu hình
              </button>
            </div>

            <div className="bg-primary rounded-lg shadow-sm p-5 text-white flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-4xl mb-1">support_agent</span>
              <h3 className="font-bold text-[16px]">Cần tư vấn thêm?</h3>
              <p className="text-[12px] opacity-90 mb-2">Chuyên viên tư vấn luôn sẵn sàng hỗ trợ bạn chọn được sản phẩm ưng ý nhất.</p>
              <a href="tel:18006975" className="bg-white text-primary font-bold px-6 py-2 rounded-full mt-1 hover:bg-gray-100 transition-colors text-[18px]">
                1800 6975
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
          <button onClick={() => setShowLightbox(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10">
            <span className="material-symbols-outlined text-white text-xl">close</span>
          </button>

          <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
            {selectedImage + 1} / {images.length}
          </div>

          <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[selectedImage]} alt={product.name} className="max-w-full max-h-[85vh] object-contain" />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => prev === 0 ? images.length - 1 : prev - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => prev === images.length - 1 ? 0 : prev + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
