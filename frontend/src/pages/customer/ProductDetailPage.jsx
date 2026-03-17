import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSmartFallbackImage } from "../../utils/smartImageFallback";
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
  const [category, setCategory] = useState(null); // Giữ từ main
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-analysis"); // Giữ từ feat

  // Image interaction states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
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

    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [id]);

  // Logic fetch category từ nhánh main
  useEffect(() => {
    const fetchCategory = async () => {
      if (product?.categoryId) {
        try {
          const data = await import("../../services/categoryService").then(m => m.default.getCategoryById(product.categoryId));
          setCategory(data);
        } catch (error) {
          console.error("Failed to load category info", error);
          setCategory(null);
        }
      }
    };
    fetchCategory();
  }, [product]);

  // ... (Giữ nguyên các hàm handleKeyDown, handleAddToCart, formatPrice giống như trong file của bạn)

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) return <div>Error or Product not found</div>;

  // Logic xử lý ảnh từ nhánh main (an toàn hơn)
  const images = product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || "https://via.placeholder.com/600x600?text=No+Image"];

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const sellingPrice = hasDiscount ? product.discountPrice : product.price;
  const originalPrice = hasDiscount ? product.price : null;
  const discount = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleImageError = (e) => {
    e.target.src = getSmartFallbackImage(product);
    e.target.onerror = null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Tiếp tục phần HTML/JSX bên dưới của bạn */}
    </div>
  );
};

export default ProductDetailPage;