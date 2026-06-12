import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layout & Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ChatBubble from './components/layout/ChatBubble'

// Pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background">
        
        {/* Navigation Header */}
        <Navbar />

        {/* Main content view */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/producto/:slug" element={<ProductDetails />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/panelcliente" element={<ClientDashboard />} />
            <Route path="/paneladmin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Support Chat float */}
        <ChatBubble />

        {/* Global Footer */}
        <Footer />

      </div>
    </BrowserRouter>
  )
}
