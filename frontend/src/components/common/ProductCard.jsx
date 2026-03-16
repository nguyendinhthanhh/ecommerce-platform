import { Link } from "react-router-dom";
import { getSmartFallbackImage } from "../../utils/smartImageFallback";
import { useCart } from "../../contexts/CartContext";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Prevent navigating to product detail
        e.stopPropagation(); // Stop link click
        await addToCart(product);
        // Modal handles login requirement if needed
    };

    // Price Logic from backend DTO (ProductResponse)
    // price: original price, discountPrice: selling price (if exists)
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const sellingPrice = hasDiscount ? product.discountPrice : product.price;
    const originalPrice = hasDiscount ? product.price : null;
    const discount = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    const handleImageError = (e) => {
        e.target.src = getSmartFallbackImage(product);
        e.target.onerror = null; // Prevent infinite loop
    };

    return (
        <Link
            to={`/products/${product.id}`}
            className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full"
        >
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {discount > 0 && (
                    <div className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        -{discount}%
                    </div>
                )}
            </div>
            <div className="absolute top-2 right-2 z-10">
                <div className="bg-[#facc15] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    Trả góp 0%
                </div>
            </div>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white p-4">
                <img
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    src={product.thumbnail || product.imageUrl || "https://via.placeholder.com/400?text=Product"}
                    onError={handleImageError}
                />
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                    {product.name}
                </h3>

                <div className="mt-auto space-y-1">
                    {/* Prices */}
                    <div className="flex items-center gap-2 h-5">
                        {originalPrice && (
                            <span className="text-[13px] text-gray-400 line-through">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                            </span>
                        )}
                    </div>
                    <div className="text-[17px] font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sellingPrice)}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                        <div className="flex text-yellow-400 text-[12px]">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[14px] fill-current">
                                    {i < Math.floor(product.averageRating || 5) ? 'star' : 'star_border'}
                                </span>
                            ))}
                        </div>
                        <span className="text-[11px] text-gray-500">
                            ({product.reviewsCount || 0})
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover Add to Cart Button */}
            <div className="absolute left-0 right-0 bottom-0 bg-white p-3 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-gray-100">
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-primary hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    THÊM VÀO GIỎ
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;
