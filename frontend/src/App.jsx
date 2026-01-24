import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerOrders from './pages/seller/SellerOrders'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin Routes - Only accessible by ADMIN role */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />

        {/* Seller Routes - Only accessible by SELLER role */}
        <Route 
          path="/seller/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/orders" 
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <SellerOrders />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

