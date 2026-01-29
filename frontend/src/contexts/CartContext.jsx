import { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cartService";
import authService from "../services/authService";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Login prompt state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.getCart();

      // Handle API response: data.items from backend
      let rawItems = data?.items || data?.cartItems || data || [];
      if (!Array.isArray(rawItems)) rawItems = [];

      // Normalize cart items to expected format based on actual API response
      const normalizedItems = rawItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName || item.name || "Unknown Product",
        price: item.unitPrice || item.price || 0,
        quantity: item.quantity || 1,
        subtotal:
          item.subtotal ||
          (item.unitPrice || item.price || 0) * (item.quantity || 1),
        stockQuantity: item.stockQuantity || 999,
        size: item.size || "One Size",
        color: item.color || "Default",
        image:
          item.productThumbnail ||
          item.imageUrl ||
          item.image ||
          "/placeholder-product.png",
      }));

      setCartItems(normalizedItems);
      setSelectedItems(new Set(normalizedItems.map((item) => item.id)));

      const loadingStates = {};
      normalizedItems.forEach((item) => {
        loadingStates[item.id] = true;
      });
      setImageLoadingStates(loadingStates);
    } catch (err) {
      console.error("Error loading cart:", err);
      // Don't show error for empty cart or auth issues
      if (err.response?.status !== 401 && err.response?.status !== 404) {
        setError("Không thể tải giỏ hàng.");
      }
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    const existingItem = cartItems.find((item) => item.id === itemId);
    if (!existingItem) return;

    // Optimistic update with loading state
    setCartItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, loading: true }
          : item,
      ),
    );

    try {
      await cartService.updateQuantity(itemId, newQuantity);
      // Remove loading state on success
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId ? { ...item, loading: false } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Không thể cập nhật số lượng. Vui lòng thử lại.");

      // Revert optimistic update
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: existingItem.quantity, loading: false }
            : item,
        ),
      );
    }
  };

  const removeItem = async (itemId) => {
    // Store current state for rollback
    const previousItems = [...cartItems];
    const previousSelected = new Set(selectedItems);

    try {
      // Optimistic update
      setCartItems((items) => items.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => {
        const newSelected = new Set(prev);
        newSelected.delete(itemId);
        return newSelected;
      });

      // Call API
      await cartService.removeFromCart(itemId);
    } catch (err) {
      console.error("Error removing item:", err);
      // Revert on error
      setCartItems(previousItems);
      setSelectedItems(previousSelected);
      alert("Failed to remove item. Please try again.");
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      setLoginPromptMessage("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      setShowLoginPrompt(true);
      return { requiresLogin: true };
    }

    try {
      // Call API first
      const result = await cartService.addToCart(product.id, quantity);

      // Reload cart to get updated data
      await loadCart();

      // Auto open cart when item added
      setIsCartOpen(true);

      return result;
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
      throw error;
    }
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleImageLoad = (itemId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const handleImageError = (itemId) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Login prompt functions
  const openLoginPrompt = (
    message = "Bạn cần đăng nhập để thực hiện thao tác này!",
  ) => {
    setLoginPromptMessage(message);
    setShowLoginPrompt(true);
  };
  const closeLoginPrompt = () => setShowLoginPrompt(false);

  // Check if user is logged in
  const isLoggedIn = () => authService.isAuthenticated();

  // Calculations
  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.has(item.id),
  );
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + tax + shipping;
  const selectedItemsCount = selectedItems.size;
  const totalItemsCount = cartItems.length;

  const value = {
    cartItems,
    selectedItems,
    loading,
    error,
    isCartOpen,
    imageLoadingStates,
    selectedCartItems,
    subtotal,
    tax,
    shipping,
    total,
    selectedItemsCount,
    totalItemsCount,
    updateQuantity,
    removeItem,
    addToCart,
    toggleItemSelection,
    toggleSelectAll,
    handleImageLoad,
    handleImageError,
    openCart,
    closeCart,
    loadCart,
    // Login prompt
    showLoginPrompt,
    loginPromptMessage,
    openLoginPrompt,
    closeLoginPrompt,
    isLoggedIn,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
