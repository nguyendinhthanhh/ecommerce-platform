import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import productService from "../services/productService";
import Header from "../components/layout/Header";
import ProductCard from "../components/common/ProductCard";
import {
  ProductCardSkeleton,
  ProductCarouselSkeleton,
  ProductGridSkeleton,
} from "../components/common/LoadingSpinner";
import vi from "../utils/translations";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load top selling products
  const loadTopProducts = useCallback(async () => {
    try {
      setLoadingTop(true);
      const topData = await productService.getTopSellingProducts(0, 5); // 5 cols
      setTopProducts(topData.content || []);
    } catch (error) {
      console.error("Error loading top products:", error);
    } finally {
      setLoadingTop(false);
    }
  }, []);

  // Load all products (for main sections)
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const productsData = await productService.getAllProducts(0, 10);
      setProducts(productsData.content || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadTopProducts();
    loadProducts();
  }, [loadTopProducts, loadProducts]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#111418] font-display">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-8">
        {/* 1. Hero Section & Banners */}
        <div className="flex gap-4 h-[380px]">
          <div className="w-2/3 h-full rounded overflow-hidden">
            {/* Slider placeholder */}
            <img
              src="https://th.bing.com/th/id/OIP.24N4dYBPiGEIa6-_DjlcCQHaEK?w=286&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
              className="w-full h-full object-cover"
              alt="Banner 1"
            />
          </div>
          <div className="w-1/3 flex flex-col gap-4 h-full">
            <div className="flex-1 rounded overflow-hidden">
              <img
                src="https://th.bing.com/th/id/OIP.PL0wn8w9jeJt0s1YjnguGgHaEK?w=286&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
                className="w-full h-full object-cover"
                alt="Banner 2"
              />
            </div>
            <div className="flex-1 rounded overflow-hidden">
              <img
                src="data:image/webp;base64,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"
                className="w-full h-full object-cover"
                alt="Banner 3"
              />
            </div>
          </div>
        </div>

        {/* 2. Flash Sale Section */}
        <section className="bg-primary rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black italic text-yellow-400 uppercase tracking-wide">
                ⚡ FLASH SALE
              </h2>
              <div className="flex items-center gap-1 text-white font-bold">
                <span>KẾT THÚC SAU:</span>
                <span className="bg-black px-2 py-1 rounded text-sm ml-2">02</span> :
                <span className="bg-black px-2 py-1 rounded text-sm">45</span> :
                <span className="bg-black px-2 py-1 rounded text-sm">12</span>
              </div>
            </div>
            <a href="#" className="flex items-center gap-1 text-white hover:text-yellow-200 text-sm font-bold items-center">
              XEM TẤT CẢ
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {loadingTop ? (
              <ProductCarouselSkeleton count={5} />
            ) : topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="w-[calc(20%-12px)] min-w-[200px] flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="text-white text-center w-full">Đang cập nhật Flash Sale</div>
            )}
          </div>
        </section>

        {/* 3. Laptop Gaming Section */}
        <section className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between border-b-2 border-gray-100 mb-4 pb-2">
            <h2 className="text-xl font-bold uppercase text-gray-800 border-b-2 border-primary -mb-[10px] pb-2 inline-block">
              LAPTOP GAMING BÁN CHẠY
            </h2>
            <div className="flex gap-4 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">ASUS</a>
              <a href="#" className="hover:text-primary transition-colors">MSI</a>
              <a href="#" className="hover:text-primary transition-colors">ACER</a>
              <a href="#" className="hover:text-primary transition-colors">DELL</a>
              <a href="#" className="text-primary hover:underline ml-4">Xem tất cả </a>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {loadingProducts ? (
              <ProductGridSkeleton count={5} />
            ) : (
              products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

        {/* 4. PC GVN Section */}
        <section className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between border-b-2 border-gray-100 mb-4 pb-2">
            <h2 className="text-xl font-bold uppercase text-gray-800 border-b-2 border-primary -mb-[10px] pb-2 inline-block">
              DÀN PC GAMING GVN
            </h2>
            <div className="flex gap-4 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">Dưới 15 Triệu</a>
              <a href="#" className="hover:text-primary transition-colors">15 - 25 Triệu</a>
              <a href="#" className="hover:text-primary transition-colors">25 - 40 Triệu</a>
              <a href="#" className="hover:text-primary transition-colors">Trên 40 Triệu</a>
              <a href="#" className="text-primary hover:underline ml-4">Xem tất cả </a>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {loadingProducts ? (
              <ProductGridSkeleton count={5} />
            ) : (
              products.slice(5, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

      </main>

      {/* Footer Refactor */}
      <footer className="bg-slate-900 border-t-4 border-primary mt-12 text-gray-300">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <h2 className="text-2xl font-black italic text-primary">ShopAI</h2>
              </div>
              <p className="text-sm">
                Hệ thống showroom chuyên cung cấp Laptop Gaming, PC High-end, Màn hình, Phụ kiện hàng đầu Việt Nam.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold uppercase mb-4">Tổng đài hỗ trợ</h3>
              <ul className="space-y-2 text-sm">
                <li>Mua hàng: <span className="text-white font-bold">1800 6975</span></li>
                <li>Khiếu nại: <span className="text-white font-bold">1800 6173</span></li>
                <li>Email: cskh@shopai.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold uppercase mb-4">Thông tin</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">Hệ thống cửa hàng</a></li>
                <li><a href="#" className="hover:text-primary">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-primary">Chính sách thanh toán</a></li>
                <li><a href="#" className="hover:text-primary">Vận chuyển & Giao hàng</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold uppercase mb-4">Đăng ký nhận tin</h3>
              <div className="flex">
                <input type="email" placeholder="Nhập email của bạn" className="px-3 py-2 bg-slate-800 text-white w-full focus:outline-none focus:ring-1 focus:ring-primary" />
                <button className="bg-primary text-white px-4 py-2 font-bold hover:bg-red-700 transition-colors">GỬI</button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 mt-8 text-center text-xs text-slate-500">
            © 2026 SHOPAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
