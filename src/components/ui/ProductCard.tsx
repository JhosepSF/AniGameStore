import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { Product } from '../../services/productService'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import Swal from 'sweetalert2'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()

  const [isFavorited, setIsFavorited] = React.useState(() => {
    if (!user) return false
    const favs = JSON.parse(localStorage.getItem(`favs_${user.id}`) || '[]')
    return favs.includes(product.id)
  })

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      const favs = JSON.parse(localStorage.getItem(`favs_${user.id}`) || '[]')
      setIsFavorited(favs.includes(product.id))
    } else {
      setIsFavorited(false)
    }
  }, [user, product.id])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      Swal.fire({
        title: 'Iniciar Sesión',
        text: 'Debes iniciar sesión para agregar productos a tus favoritos.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ingresar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff007f',
        background: '#121422',
        color: '#f1f3f9'
      }).then((res) => {
        if (res.isConfirmed) {
          navigate('/login')
        }
      })
      return
    }

    const favs = JSON.parse(localStorage.getItem(`favs_${user.id}`) || '[]')
    let newFavs
    if (favs.includes(product.id)) {
      newFavs = favs.filter((id: string) => id !== product.id)
      setIsFavorited(false)
      Swal.fire({
        title: 'Favorito Eliminado',
        text: `${product.name} fue quitado de tus favoritos.`,
        icon: 'info',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
    } else {
      newFavs = [...favs, product.id]
      setIsFavorited(true)
      Swal.fire({
        title: '¡Agregado a Favoritos!',
        text: `${product.name} fue guardado.`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
    }
    localStorage.setItem(`favs_${user.id}`, JSON.stringify(newFavs))
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      addItem(product, 1)
      Swal.fire({
        title: '¡Producto Agregado!',
        text: `${product.name} fue añadido a tu carrito.`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Stock Excedido',
        text: err.message,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#ff007f'
      })
    }
  }

  const finalPrice = product.price_offer || product.price_normal
  const hasDiscount = product.discount_percentage > 0

  // Determine glow style based on product tags
  const cardGlowClass = product.tags.includes('Edición Limitada') || product.tags.includes('Premium')
    ? 'neon-border-pink hover:shadow-neon-pink'
    : 'neon-border-cyan hover:shadow-neon-cyan'

  return (
    <div className={`group relative flex flex-col w-full bg-[#121422] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 ${cardGlowClass}`}>
      
      {/* Favorite Button Overlay */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-background/60 hover:bg-background/80 transition ${
          isFavorited ? 'text-primary' : 'text-geek-light hover:text-primary'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-primary' : ''}`} />
      </button>

      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.tags.map(tag => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md border shadow-sm ${
              tag === 'Edición Limitada' || tag === 'Premium'
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-secondary/20 text-secondary border-secondary/30'
            }`}
          >
            {tag}
          </span>
        ))}
        {hasDiscount && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-accent/20 text-accent border border-accent/30 rounded-md">
            -{product.discount_percentage}% OFF
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link to={`/producto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-background">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        {/* Hover overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080910] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
      </Link>

      {/* Card Info Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Franchise tag */}
          <span className="text-[10px] font-bold text-geek-muted uppercase tracking-wider">
            {product.franchise}
          </span>
          
          {/* Title */}
          <Link to={`/producto/${product.slug}`} className="block mt-1">
            <h4 className="text-sm font-bold text-geek-light hover:text-secondary truncate transition-colors duration-200">
              {product.name}
            </h4>
          </Link>

          {/* Reviews Score */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs text-geek-light font-bold">{product.rating_avg.toFixed(2)}</span>
            <span className="text-[10px] text-geek-muted">({product.sales_count} vendidos)</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Pricing Info */}
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-geek-muted line-through">
                S/ {product.price_normal.toFixed(2)}
              </span>
            )}
            <span className="text-base font-extrabold text-geek-light">
              S/ {finalPrice.toFixed(2)}
            </span>
          </div>

          {/* Quick Cart Button */}
          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-white/5 hover:bg-secondary text-geek-muted hover:text-background rounded-xl border border-white/10 hover:border-transparent transition shadow-sm hover:shadow-neon-cyan duration-300"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  )
}
