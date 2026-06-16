import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MyAccount from './pages/account/MyAccount'
import SellerRegister from './pages/seller/SellerRegister'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerProducts from './pages/seller/SellerProducts'
import SellerOrders from './pages/seller/SellerOrders'
import LegalPage from './pages/legal/LegalPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminSettings from './pages/admin/AdminSettings'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSellers from './pages/admin/AdminSellers'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/produtos" element={<AdminProducts />} />
        <Route path="/admin/pedidos" element={<AdminOrders />} />
        <Route path="/admin/vendedores" element={<AdminSellers />} />
        <Route path="/admin/configuracoes" element={<AdminSettings />} />

        <Route
          path="/*"
          element={
            <>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/produto/:id" element={<ProductDetail />} />
                  <Route path="/carrinho" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/entrar" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/minha-conta" element={<MyAccount />} />
                  <Route path="/vendedor/cadastro" element={<SellerRegister />} />
                  <Route path="/vendedor" element={<SellerDashboard />} />
                  <Route path="/vendedor/produtos" element={<SellerProducts />} />
                  <Route path="/vendedor/pedidos" element={<SellerOrders />} />
                  <Route path="/legal/:slug" element={<LegalPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}
