import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Clock, Award, ShieldCheck, Zap, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { productService, Product, Category } from '../services/productService'
import ProductCard from '../components/ui/ProductCard'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>()
  const [flashSales, setFlashSales] = useState<Product[]>()
  const [categories, setCategories] = useState<Category[]>([])
  
  // Timer State for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 })

  useEffect(() => {
    // Fetch categories
    productService.getCategories().then(setCategories)
    
    // Fetch products
    productService.getProducts().then(res => {
      setFeaturedProducts(res.slice(0, 4))
      setFlashSales(res.filter(p => p.tags.includes('Oferta Flash')).slice(0, 2))
    })

    // Countdown Timer Interval
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 4, minutes: 0, seconds: 0 } // Reset
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-16 pb-20 bg-background text-geek-light">
      
      {/* 1. HERO MAIN PROMO BANNER */}
      <section className="relative overflow-hidden bg-[#0d0e17] border-b border-white/5 py-20 lg:py-24">
        {/* Neon decorative gradient circles */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-secondary/20 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center px-3.5 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full animate-bounce">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Colección Especial Wano Kuni
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Despierta el Poder del <br />
              <span className="bg-gradient-to-r from-primary via-[#e000ff] to-secondary bg-clip-text text-transparent neon-text-pink">
                GEAR 5 - JOY BOY
              </span>
            </h1>
            <p className="text-base sm:text-lg text-geek-muted max-w-lg mx-auto lg:mx-0">
              Llévate la figura legendaria de Luffy Gear 5 con 20% de descuento y obtén cashback automático directo en tu monedero virtual.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/producto/figura-luffy-gear5-joyboy"
                className="px-8 py-3.5 glow-btn-pink text-white font-extrabold rounded-xl shadow-lg transition text-center"
              >
                Comprar Ahora (20% OFF)
              </Link>
              <Link
                to="/catalogo"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-geek-light border border-white/10 hover:border-white/20 font-bold rounded-xl transition text-center"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          {/* Hero Banner Showcase image */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-neon-pink group">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                alt="Luffy Gear 5 Showcase"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Edición Limitada</span>
                <h3 className="text-lg font-bold text-white mt-1">Luffy Gear 5 - Bandai Spirits</h3>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-base font-extrabold text-white">S/ 199.90</span>
                  <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded">Ahorra S/ 50.00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. MENU DE CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-geek-light flex items-center">
              <Flame className="w-5 h-5 text-primary mr-2" />
              Explora por Categoría
            </h2>
            <p className="text-sm text-geek-muted">Encuentra tus coleccionables geek favoritos por sección.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoria=${cat.slug}`}
              className="group p-5 bg-[#121422] rounded-2xl border border-white/5 hover:border-secondary/40 shadow-sm hover:shadow-neon-cyan text-center transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-secondary/10 flex items-center justify-center mx-auto text-geek-muted group-hover:text-secondary mb-3 transition">
                🚀
              </div>
              <h4 className="text-sm font-bold text-geek-light group-hover:text-secondary transition">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. OFERTAS FLASH CON CONTADOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-gradient-to-br from-[#121422] via-[#0d0e17] to-[#1a1c38] rounded-3xl border border-primary/20 shadow-neon-pink relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 mb-8 border-b border-white/5 pb-6">
            
            {/* Header + Timer */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center space-x-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-xl border border-primary/20 font-bold text-sm">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span>OFERTAS FLASH</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-geek-muted" />
                <span className="text-xs text-geek-muted uppercase tracking-wider">Termina en:</span>
                <div className="flex items-center space-x-1 font-mono text-sm text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            <Link
              to="/catalogo"
              className="text-sm text-secondary hover:text-secondary/95 font-bold flex items-center gap-1 hover:underline"
            >
              Ver Todas las Ofertas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Flash items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flashSales?.map(prod => (
              <div
                key={prod.id}
                className="p-4 bg-[#1a1b2d] rounded-2xl border border-white/5 flex gap-4 items-center group hover:border-primary/40 transition duration-300"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-background flex-shrink-0">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/15">{prod.franchise}</span>
                  <Link to={`/producto/${prod.slug}`} className="block mt-1">
                    <h4 className="text-sm font-bold text-geek-light hover:text-primary truncate transition">
                      {prod.name}
                    </h4>
                  </Link>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-base font-extrabold text-geek-light">S/ {(prod.price_offer || prod.price_normal).toFixed(2)}</span>
                    <span className="text-xs text-geek-muted line-through">S/ {prod.price_normal.toFixed(2)}</span>
                    <span className="text-[10px] text-accent font-bold">-{prod.discount_percentage}% OFF</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-primary h-full w-[45%]" title="45% vendido"></div>
                  </div>
                  <p className="text-[10px] text-geek-muted mt-1">Solo quedan {prod.stock} unidades en stock</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. MAS VENDIDOS / RECOMENDADOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-10">
          <h2 className="text-2xl font-bold text-geek-light flex items-center justify-center md:justify-start">
            <TrendingUp className="w-5 h-5 text-secondary mr-2" />
            Productos Destacados
          </h2>
          <p className="text-sm text-geek-muted">Las piezas más deseadas por coleccionistas y gamers esta semana.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts?.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 5. SEGURIDAD COMPRA Y GARANTÍA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-start space-x-4">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-geek-light">Garantía de Autenticidad</h4>
              <p className="text-xs text-geek-muted mt-1">Figuras 100% oficiales. Importadas directamente con sellos oficiales de Bandai y Good Smile.</p>
            </div>
          </div>
          <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-geek-light">Envíos Rápidos a Provincias</h4>
              <p className="text-xs text-geek-muted mt-1">Empaques ultra-protegidos con burbujas dobles. Despacho por Olva y Shalom en menos de 24 horas.</p>
            </div>
          </div>
          <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-start space-x-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-geek-light">Billetera Cashback 5%</h4>
              <p className="text-xs text-geek-muted mt-1">Recibe 5% de reembolso directo en tu monedero virtual en todas tus compras y canjéalo en tu próximo pedido.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
