import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerOrders from "./pages/seller/SellerOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Profile - Accessible by all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "SELLER", "CUSTOMER"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Only accessible by ADMIN role */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes - Only accessible by SELLER role */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute allowedRoles={["SELLER"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
