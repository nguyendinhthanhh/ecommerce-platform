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
              src="https://via.placeholder.com/800x400/137fec/ffffff?text=GEARVN+BANNER+1"
              className="w-full h-full object-cover"
              alt="Banner 1"
            />
          </div>
          <div className="w-1/3 flex flex-col gap-4 h-full">
            <div className="flex-1 rounded overflow-hidden">
              <img
                src="https://via.placeholder.com/400x180/e30019/ffffff?text=SALE+LAPTOP+GAMING"
                className="w-full h-full object-cover"
                alt="Banner 2"
              />
            </div>
            <div className="flex-1 rounded overflow-hidden">
              <img
                src="https://via.placeholder.com/400x180/333333/ffffff?text=PC+GAMING+CUSTOM"
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
                <h2 className="text-2xl font-black italic text-primary">GEARVN</h2>
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
                <li>Email: cskh@gearvn.com</li>
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
            © 2024 GEARVN. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
