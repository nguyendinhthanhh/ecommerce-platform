import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPromptModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleLogin = () => {
    // Store the current path to redirect back after login
    sessionStorage.setItem(
      "redirectAfterLogin",
      location.pathname + location.search,
    );
    onClose();
    navigate("/login");
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in overflow-hidden">
        {/* Decorative Header */}
        <div className="bg-gradient-to-br from-primary via-primary to-blue-600 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-white">
              login
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Đăng nhập để tiếp tục
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 text-center mb-6">
            {message ||
              "Bạn cần đăng nhập để thực hiện thao tác này. Đăng nhập ngay để tiếp tục mua sắm!"}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">
                  shopping_cart
                </span>
              </div>
              <span>Lưu giỏ hàng và mua sắm dễ dàng</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                  local_shipping
                </span>
              </div>
              <span>Theo dõi đơn hàng của bạn</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg">
                  loyalty
                </span>
              </div>
              <span>Nhận ưu đãi và khuyến mãi độc quyền</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Để sau
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Đăng nhập
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => {
                sessionStorage.setItem(
                  "redirectAfterLogin",
                  location.pathname + location.search,
                );
                onClose();
                navigate("/register");
              }}
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPromptModal;
