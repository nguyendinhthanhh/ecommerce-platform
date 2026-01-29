import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";
import { ProductDetailSkeleton } from "../../components/common/LoadingSpinner";
import { useCart } from "../../contexts/CartContext";
import Header from "../../components/layout/Header";

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
  const [activeTab, setActiveTab] = useState("reviews");

  // Image interaction states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
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
      // If login required, don't continue (modal will show)
      if (result?.requiresLogin) return;
      // Success feedback - cart drawer will auto open
    } catch (err) {
      console.error("Failed to add to cart:", err);
      // Error already handled in CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);
      const result = await addToCart(product, quantity);
      // If login required, don't continue (modal will show)
      if (result?.requiresLogin) return;
      // Navigate to cart page after adding
      navigate("/cart");
    } catch (err) {
      console.error("Failed to buy now:", err);
      // Error already handled in CartContext
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

  const calculateDiscount = () => {
    if (product?.discountPrice && product?.price) {
      return Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      );
    }
    return 0;
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            🏠 Home
          </Link>
          <span>/</span>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            Electronics
          </Link>
          <span>/</span>
          <span className="text-gray-600">Audio</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Gallery */}
          <div className="flex flex-col gap-6">
            {/* Main Image with Zoom Effect */}
            <div className="relative group">
              <div
                className="w-full aspect-square bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-2xl overflow-hidden shadow-lg cursor-zoom-in relative"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPosition({ x, y });
                }}
                onClick={() => setShowLightbox(true)}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-contain p-8 transition-transform duration-300 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : {}
                  }
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x600?text=No+Image";
                  }}
                />

                {/* Zoom hint overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
                    isZoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-gray-700">
                      zoom_in
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Hover to zoom • Click to expand
                    </span>
                  </div>
                </div>
              </div>

              {product.status === "ACTIVE" && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg z-10">
                  <span>✓</span> AI VISION VERIFIED
                </div>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails with animation */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 cursor-pointer shrink-0 overflow-hidden border-2 transition-all duration-300 hover:shadow-md ${
                    selectedImage === index
                      ? "border-blue-600 scale-110 shadow-lg ring-2 ring-blue-300"
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col gap-6">
            {/* AI Match Badge & Rating */}
            <div className="flex items-center gap-3">
              <div className="flex bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full items-center gap-1.5">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  98% AI Match
                </span>
              </div>
              <div className="flex items-center text-yellow-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(product.averageRating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
                <span className="text-gray-600 text-sm ml-1">
                  {product.averageRating.toFixed(1)} ({product.totalReviews})
                </span>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-600 text-sm">
                Model: ShopAI-Elite X1 | {product.categoryName}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="flex items-end justify-between p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Current Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-gray-900">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-gray-400 line-through text-xl">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
              {calculateDiscount() > 0 && (
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                    <span>📉</span> {calculateDiscount()}% OFF
                  </span>
                  <div className="flex items-end gap-0.5 h-8">
                    <div className="w-1 bg-blue-200 rounded-full h-4"></div>
                    <div className="w-1 bg-blue-200 rounded-full h-6"></div>
                    <div className="w-1 bg-blue-300 rounded-full h-5"></div>
                    <div className="w-1 bg-blue-400 rounded-full h-7"></div>
                    <div className="w-1 bg-blue-500 rounded-full h-8"></div>
                    <div className="w-1 bg-blue-600 rounded-full h-4"></div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase">
                    Price Stability: High
                  </span>
                </div>
              )}
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl">
                ✨
              </div>
              <h3 className="flex items-center gap-2 text-gray-900 font-bold text-lg mb-4">
                <span className="text-blue-600">✨</span>
                Why you might like this
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                      Superior Quality
                    </p>
                    <p className="text-xs text-gray-600">
                      AI analysis confirms high-quality materials and
                      construction.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                      Great Value
                    </p>
                    <p className="text-xs text-gray-600">
                      Price matches the advertised quality and features.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                      Highly Rated
                    </p>
                    <p className="text-xs text-gray-600">
                      Consistently positive reviews from verified buyers.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center font-bold text-lg transition-all"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          product.stockQuantity,
                          parseInt(e.target.value) || 1,
                        ),
                      ),
                    )
                  }
                  className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-bold focus:border-blue-600 focus:outline-none"
                  min="1"
                  max={product.stockQuantity}
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center font-bold text-lg transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stockQuantity === 0}
                className="flex-1 bg-blue-600 text-white h-14 rounded-xl font-bold text-base hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">🛒</span>
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="flex-1 border-2 border-blue-600 text-blue-600 h-14 rounded-xl font-bold text-base hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400 transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs & Reviews */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 gap-8">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 border-b-2 font-bold text-base transition-colors ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              AI-Analyzed Reviews
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 border-b-2 font-bold text-base transition-colors ${
                activeTab === "specs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 border-b-2 font-bold text-base transition-colors ${
                activeTab === "description"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              Description
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-10">
            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sentiment Analysis */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-xl font-black mb-6">
                    Sentiment Analysis
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Positive Sentiment</span>
                        <span className="text-green-500">92%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[92%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Neutral</span>
                        <span className="text-gray-400">5%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 w-[5%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Negative Sentiment</span>
                        <span className="text-red-500">3%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[3%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                      <span className="text-xl">👍</span>
                      AI-Distilled Pros
                    </div>
                    <ul className="space-y-3 text-sm text-green-800">
                      <li className="flex gap-2">
                        • Exceptional clarity and quality
                      </li>
                      <li className="flex gap-2">
                        • Very comfortable for extended use
                      </li>
                      <li className="flex gap-2">
                        • Fast delivery and secure packaging
                      </li>
                      <li className="flex gap-2">
                        • Reliable performance and durability
                      </li>
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
                      <span className="text-xl">👎</span>
                      AI-Distilled Cons
                    </div>
                    <ul className="space-y-3 text-sm text-red-800">
                      <li className="flex gap-2">
                        • Price might be high for some budgets
                      </li>
                      <li className="flex gap-2">
                        • Limited color options available
                      </li>
                      <li className="flex gap-2">
                        • Setup instructions could be clearer
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Category:
                      </span>
                      <span className="text-gray-900">
                        {product.categoryName}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Stock:
                      </span>
                      <span className="text-gray-900">
                        {product.stockQuantity} units
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Status:
                      </span>
                      <span
                        className={`font-bold ${product.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Rating:
                      </span>
                      <span className="text-gray-900">
                        {product.averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Reviews:
                      </span>
                      <span className="text-gray-900">
                        {product.totalReviews} reviews
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">Sold:</span>
                      <span className="text-gray-900">
                        {product.soldCount} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Product Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-blue-600 text-2xl">✨</span>
            <h2 className="text-2xl font-black text-gray-900">
              Similar Products Picked by AI
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Placeholder for similar products - you can fetch from API later */}
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                    HOT MATCH
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
                    Similar Product {item}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-blue-600">
                      $199.00
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <span className="material-symbols-outlined text-white text-2xl">
              close
            </span>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white/80 text-lg font-medium">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Main image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fade-in"
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined text-white text-3xl">
                  chevron_left
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <span className="material-symbols-outlined text-white text-3xl">
                  chevron_right
                </span>
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-xl backdrop-blur-sm">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-white scale-110"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 right-4 text-white/50 text-sm hidden md:block">
            Use ← → to navigate • ESC to close
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
