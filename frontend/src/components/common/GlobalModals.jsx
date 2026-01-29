import React from "react";
import { useCart } from "../../contexts/CartContext";
import LoginPromptModal from "./LoginPromptModal";

const GlobalModals = () => {
  const { showLoginPrompt, loginPromptMessage, closeLoginPrompt } = useCart();

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        message={loginPromptMessage}
      />
    </>
  );
};

export default GlobalModals;
