import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Heart, ShoppingCart, Truck, ShieldAlert, Award, Send, MessageSquare } from 'lucide-react'
import { productService, Product, ProductVariant, Review, Question } from '../services/productService'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import Swal from 'sweetalert2'

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()

  // State details
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined)
  const [quantity, setQuantity] = useState(1)

  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  
  // Submit inputs
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [questionText, setQuestionText] = useState('')

  // Zoom position
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' })

  const navigate = useNavigate()
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (product && user) {
      const favs = JSON.parse(localStorage.getItem(`favs_${user.id}`) || '[]')
      setIsFavorited(favs.includes(product.id))
    } else {
      setIsFavorited(false)
    }
  }, [product, user])

  const handleFavoriteToggle = () => {
    if (!product) return
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

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productService.getProductBySlug(slug).then((prod) => {
      setProduct(prod)
      if (prod) {
        setActiveImage(prod.images[0])
        setSelectedVariant(prod.variants?.[0])
        
        // Fetch comments
        productService.getReviews(prod.id).then(setReviews)
        productService.getQuestions(prod.id).then(setQuestions)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <span className="w-10 h-10 border-4 border-t-primary border-white/10 rounded-full animate-spin"></span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center bg-background text-geek-light">
        <p className="text-sm text-geek-muted">El producto que buscas no existe en nuestra tienda.</p>
        <Link to="/catalogo" className="mt-4 px-6 py-2.5 bg-primary rounded-xl font-bold">Volver al catálogo</Link>
      </div>
    )
  }

  const finalBasePrice = product.price_offer || product.price_normal
  const adjustment = selectedVariant ? selectedVariant.price_adjustment : 0
  const totalPrice = finalBasePrice + adjustment

  // Handle magnifying zoom coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.pageX - left - window.scrollX) / width) * 100
    const y = ((e.pageY - top - window.scrollY) / height) * 100
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' })
  }

  const handleAddToCart = () => {
    try {
      addItem(product, quantity, selectedVariant)
      Swal.fire({
        title: '¡Producto Agregado!',
        text: `${product.name} fue añadido a tu carrito.`,
        icon: 'success',
        confirmButtonText: 'Seguir Comprando',
        showDenyButton: true,
        denyButtonText: 'Ir al Carrito',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#1e2035',
        denyButtonColor: '#ff007f'
      }).then((result) => {
        if (result.isDenied) {
          window.location.href = '/carrito'
        }
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Stock Excedido',
        text: err.message,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        background: '#121422',
        color: '#f1f3f9'
      })
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) return
    const name = user ? `${user.first_name} ${user.last_name}`.trim() : 'Cliente Invitado'
    try {
      const added = await productService.addReview({
        product_id: product.id,
        user_name: name,
        rating: reviewRating,
        comment: reviewComment,
        is_verified_purchase: true
      })
      setReviews(prev => [added, ...prev])
      setReviewComment('')
      Swal.fire({ title: 'Reseña enviada', text: 'Gracias por tu valoración.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return
    const name = user ? user.first_name : 'Invitado'
    try {
      const added = await productService.addQuestion(product.id, questionText, name)
      setQuestions(prev => [added, ...prev])
      setQuestionText('')
      
      Swal.fire({
        title: 'Pregunta Recibida',
        text: 'Tu pregunta ha sido publicada. Un agente la responderá en breve.',
        icon: 'info',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#00f0ff'
      })

      // Simulated auto-answer from support agent after 3s
      setTimeout(() => {
        setQuestions(prev => prev.map(q => 
          q.id === added.id 
            ? { ...q, answer: '¡Hola! Claro, contamos con unidades listas para despacho inmediato en tienda y envíos express.' } 
            : q
        ))
      }, 3000)

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-geek-light">
      
      {/* Route map path */}
      <div className="text-xs text-geek-muted mb-8 flex space-x-2">
        <Link to="/" className="hover:text-primary transition">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-primary transition">Catálogo</Link>
        <span>/</span>
        <span className="text-geek-light truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* LEFT COLUMN: IMAGES GALLERY & ZOOM */}
        <div className="space-y-4">
          <div
            className="relative rounded-2xl border border-white/5 bg-[#121422] aspect-square overflow-hidden cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            {/* Magnifying Zoom Glass layer */}
            <div
              className="absolute inset-0 pointer-events-none bg-no-repeat transition-opacity duration-200"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${activeImage})`,
                backgroundSize: '200%'
              }}
            ></div>
          </div>

          {/* Gallery Subimages slider */}
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border bg-[#121422] transition-all ${
                  activeImage === img ? 'border-primary shadow-neon-pink' : 'border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATOR INFO */}
        <div className="space-y-6">
          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md">
              {product.franchise}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3 text-white leading-tight">
              {product.name}
            </h1>
            
            {/* Stars rating */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold text-geek-light">{product.rating_avg.toFixed(2)}</span>
              <span className="text-xs text-geek-muted">({reviews.length} valoraciones de compradores)</span>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="p-5 bg-[#121422] rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-geek-muted">Precio regular</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-geek-light">S/ {totalPrice.toFixed(2)}</span>
                {product.price_offer && (
                  <span className="text-sm text-geek-muted line-through">S/ {product.price_normal.toFixed(2)}</span>
                )}
              </div>
            </div>
            {product.discount_percentage > 0 && (
              <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-xl text-xs font-extrabold text-accent">
                {product.discount_percentage}% DESCUENTO
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-geek-muted leading-relaxed">
            {product.short_description}
          </p>

          {/* Variants Selectors */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider">
                Selecciona {product.variants[0].variant_type}:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-secondary bg-secondary/10 text-secondary shadow-neon-cyan'
                        : 'border-white/5 bg-[#121422] text-geek-muted hover:text-white'
                    }`}
                  >
                    {v.variant_value} {v.price_adjustment !== 0 && `(S/ ${v.price_adjustment > 0 ? '+' : ''}${v.price_adjustment})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector & Add buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t border-white/5">
            <div className="flex items-center bg-[#121422] border border-white/5 rounded-xl">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3.5 py-2 hover:bg-white/5 transition rounded-l-xl text-geek-muted font-bold"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3.5 py-2 hover:bg-white/5 transition rounded-r-xl text-geek-muted font-bold"
              >
                +
              </button>
            </div>

             <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 glow-btn-pink text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Agregar al Carrito</span>
            </button>

            <button
              onClick={handleFavoriteToggle}
              className={`p-3.5 bg-white/5 border rounded-xl transition-all duration-300 ${
                isFavorited ? 'text-primary border-primary bg-primary/10 shadow-neon-pink' : 'border-white/10 text-geek-muted hover:text-white'
              }`}
              title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-primary' : ''}`} />
            </button>
          </div>

          {/* Platform guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 text-center text-[10px] text-geek-muted">
            <div className="space-y-1">
              <Truck className="w-4 h-4 mx-auto text-secondary" />
              <p className="font-bold text-geek-light">Envíos Rápidos</p>
              <p>Olva / Shalom</p>
            </div>
            <div className="space-y-1">
              <ShieldAlert className="w-4 h-4 mx-auto text-primary" />
              <p className="font-bold text-geek-light">Garantía Real</p>
              <p>Sello Original</p>
            </div>
            <div className="space-y-1">
              <Award className="w-4 h-4 mx-auto text-accent" />
              <p className="font-bold text-geek-light">Recompensas</p>
              <p>5% Cashback</p>
            </div>
          </div>

        </div>

      </div>

      {/* Long Description and Features Details Tab */}
      <div className="mb-16 border-t border-white/5 pt-12">
        <h3 className="text-lg font-bold mb-4 text-white">Detalle de Producto</h3>
        <div className="p-6 bg-[#121422] rounded-2xl border border-white/5 text-sm text-geek-muted leading-relaxed space-y-4">
          <p>{product.long_description}</p>
          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
            <div>
              <span className="font-bold text-geek-light">SKU:</span> {product.sku}
            </div>
            <div>
              <span className="font-bold text-geek-light">Código interno:</span> {product.internal_code}
            </div>
            <div>
              <span className="font-bold text-geek-light">Disponibilidad:</span> {product.stock > 0 ? `${product.stock} unidades en stock` : 'Agotado'}
            </div>
            <div>
              <span className="font-bold text-geek-light">Franquicia:</span> {product.franchise}
            </div>
          </div>
        </div>
      </div>

      {/* QUESTIONS AND ANSWERS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-white/5 pt-12">
        
        {/* Reviews */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Star className="w-5 h-5 text-amber-400 mr-2" />
            Valoraciones de Clientes ({reviews.length})
          </h3>

          {/* Reviews list */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-[#121422] rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-geek-light">{r.user_name}</span>
                  <span className="text-[10px] text-geek-muted">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-geek-muted leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-5 bg-[#121422] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-geek-light">Escribe tu valoración</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-geek-muted">Puntuación:</span>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="px-2 py-1 bg-[#1b1c2b] border border-white/5 rounded text-xs"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="¿Qué opinas sobre los acabados de esta figura?"
              className="w-full p-3 bg-[#1b1c2b] text-xs text-geek-light border border-white/5 rounded-xl focus:outline-none"
            ></textarea>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-neon-pink"
            >
              Publicar Comentario
            </button>
          </form>
        </div>

        {/* Q&As */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 text-secondary mr-2" />
            Preguntas y Respuestas ({questions.length})
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {questions.map((q) => (
              <div key={q.id} className="p-4 bg-[#121422] rounded-xl border border-white/5 space-y-3">
                <div>
                  <p className="text-xs font-bold text-geek-light">Q: {q.question}</p>
                  <span className="text-[9px] text-geek-muted">Preguntado por {q.user_name}</span>
                </div>
                {q.answer ? (
                  <div className="pl-4 border-l border-secondary bg-secondary/5 p-2 rounded-r-lg">
                    <p className="text-xs text-geek-muted">
                      <b className="text-secondary">Soporte AniGames:</b> {q.answer}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-accent animate-pulse font-semibold">Esperando respuesta de soporte...</p>
                )}
              </div>
            ))}
          </div>

          {/* Add Question Form */}
          <form onSubmit={handleQuestionSubmit} className="p-5 bg-[#121422] rounded-xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-geek-light">Consulta con la tienda</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="¿Tienen envíos para Cusco el día de hoy?"
                className="flex-1 px-3.5 py-2.5 bg-[#1b1c2b] text-xs text-geek-light border border-white/5 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-xl shadow-neon-cyan transition flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  )
}
