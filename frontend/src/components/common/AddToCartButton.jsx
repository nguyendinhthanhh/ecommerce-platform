import { useCart } from "../../contexts/CartContext";

const AddToCartButton = ({ product, className = "" }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const result = await addToCart(product);
    // If login required, modal will show automatically
    if (result?.requiresLogin) return;
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 13l1.5 6M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;
