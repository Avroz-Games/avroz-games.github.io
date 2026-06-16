import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminSettings from './pages/admin/AdminSettings'
import AdminOrders from './pages/admin/AdminOrders'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Routes>
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/produtos" element={<AdminProducts />} />
      <Route path="/admin/pedidos" element={<AdminOrders />} />
      <Route path="/admin/configuracoes" element={<AdminSettings />} />

      {/* Store routes */}
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
