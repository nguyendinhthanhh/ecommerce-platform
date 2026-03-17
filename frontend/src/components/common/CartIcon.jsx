import { useCart } from "../../contexts/CartContext";

const CartIcon = () => {
  const { totalItemsCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="flex flex-col items-center justify-center p-2 text-gray-700 hover:text-primary rounded-lg transition-colors relative group"
      title={`Giỏ hàng (${totalItemsCount})`}
    >
      <div className="relative">
        <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
        {totalItemsCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-primary border-2 border-white text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
            {totalItemsCount > 99 ? "99+" : totalItemsCount}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium mt-0.5 hidden sm:block">Giỏ hàng</span>
    </button>
  );
};

export default CartIcon;
