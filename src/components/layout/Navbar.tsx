import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, LogOut, Menu, X, Gift, Wallet, Compass } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useSearchStore } from '../../stores/searchStore'
import { productService, Category } from '../../services/productService'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const { searchQuery, setSearchQuery } = useSearchStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    productService.getCategories().then(setCategories)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/catalogo')
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#080910]/95 backdrop-blur-md border-b border-white/5 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-primary via-[#e000ff] to-secondary bg-clip-text text-transparent neon-text-pink">
                ANIGAMES
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 rounded-md">
                Store
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Busca anime, figuras, hardware geek..."
                className={`w-full px-4 py-2.5 pl-10 bg-[#121422] text-sm text-geek-light rounded-xl border border-white/10 focus:outline-none focus:border-secondary transition-all ${
                  searchFocused ? 'shadow-neon-cyan border-secondary/50' : ''
                }`}
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-geek-muted" />
              {searchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#121422] border border-white/10 rounded-xl shadow-2xl">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-geek-muted uppercase tracking-wider">
                    Sugerencias rápidas
                  </div>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 text-sm text-geek-light hover:bg-white/5 rounded-lg transition"
                  >
                    Buscar &quot;{searchQuery}&quot; en el catálogo
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Icons navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/catalogo" className="flex items-center text-geek-light hover:text-secondary transition text-sm font-medium">
              <Compass className="w-4 h-4 mr-1.5" />
              Explorar
            </Link>

            {/* Wallet Balance Widget for logged users */}
            {user && (
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-geek-light">
                  S/ {user.wallet_balance.toFixed(2)}
                </span>
              </div>
            )}

            <Link to="/panelcliente" className="text-geek-light hover:text-primary transition" title="Lista de Deseos">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <Link to="/carrito" className="relative text-geek-light hover:text-secondary transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-neon-pink">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Session Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-geek-light hover:text-primary focus:outline-none transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-primary/40 shadow-neon-pink"
                  />
                  <span className="text-sm font-medium">{user.first_name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#121422] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-geek-muted">Conectado como</p>
                      <p className="text-sm font-bold text-geek-light truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary rounded">
                        {user.role}
                      </span>
                    </div>

                    {(user.role === 'Superadmin' || user.role === 'Administrador' || user.role === 'Vendedor') && (
                      <Link
                        to="/paneladmin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-geek-light hover:bg-white/5 transition"
                      >
                        ⚙️ Panel Administrador
                      </Link>
                    )}

                    <Link
                      to="/panelcliente"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-geek-light hover:bg-white/5 transition"
                    >
                      👤 Mi Perfil / Pedidos
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                        navigate('/')
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-primary text-primary hover:bg-primary hover:text-white rounded-xl shadow-neon-pink transition-all"
              >
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/carrito" className="relative text-geek-light hover:text-secondary">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-geek-light focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/5 bg-[#080910] space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full my-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca anime, figuras..."
              className="w-full px-4 py-2.5 pl-10 bg-[#121422] text-sm text-geek-light rounded-xl border border-white/10 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-geek-muted" />
          </form>

          <div className="flex flex-col space-y-3">
            <Link
              to="/catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-geek-light hover:bg-white/5 rounded-lg transition"
            >
              Explorar Catálogo
            </Link>

            {user && (
              <>
                <Link
                  to="/panelcliente"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-geek-light hover:bg-white/5 rounded-lg transition"
                >
                  Mi Billetera (S/ {user.wallet_balance.toFixed(2)})
                </Link>
                {(user.role === 'Superadmin' || user.role === 'Administrador' || user.role === 'Vendedor') && (
                  <Link
                    to="/paneladmin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-geek-light hover:bg-white/5 rounded-lg transition"
                  >
                    ⚙️ Panel Admin
                  </Link>
                )}
                <Link
                  to="/panelcliente"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-geek-light hover:bg-white/5 rounded-lg transition"
                >
                  Mis Pedidos / Puntos
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                    navigate('/')
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-neon-pink"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
