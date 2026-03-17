import { useCart } from "../../contexts/CartContext";

const CartIcon = () => {
  const { totalItemsCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative group"
      title={`Shopping Cart (${totalItemsCount} items)`}
    >
      <span className="material-symbols-outlined">shopping_cart</span>
      {totalItemsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItemsCount > 99 ? "99+" : totalItemsCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
