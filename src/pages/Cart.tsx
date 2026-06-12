import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Ticket, Wallet, Gift } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import Swal from 'sweetalert2'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    items,
    coupon,
    walletUsed,
    pointsUsed,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    setWalletUsed,
    setPointsUsed,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [useWallet, setUseWallet] = useState(false)
  const [usePoints, setUsePoints] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput) return
    try {
      await applyCoupon(couponInput)
      Swal.fire({
        title: '¡Cupón Aplicado!',
        text: 'El descuento ha sido deducido del subtotal.',
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Cupón Inválido',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        background: '#121422',
        color: '#f1f3f9'
      })
    }
  }

  const handleToggleWallet = (checked: boolean) => {
    setUseWallet(checked)
    if (checked && user) {
      setWalletUsed(user.wallet_balance, user.wallet_balance)
    } else {
      setWalletUsed(0, 0)
    }
  }

  const handleTogglePoints = (checked: boolean) => {
    setUsePoints(checked)
    if (checked && user) {
      setPointsUsed(user.points_balance, user.points_balance)
    } else {
      setPointsUsed(0, 0)
    }
  }

  const handleCheckoutClick = () => {
    if (!user) {
      Swal.fire({
        title: 'Iniciar Sesión Requerido',
        text: 'Por favor, regístrate o inicia sesión para completar tu compra.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ir a Login',
        cancelButtonText: 'Cancelar',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#ff007f'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login')
        }
      })
    } else {
      navigate('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-geek-light space-y-6">
        <div className="p-6 bg-[#121422] rounded-full w-24 h-24 flex items-center justify-center mx-auto text-geek-muted border border-white/5 shadow-glass">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold">Tu Carrito está vacío</h2>
        <p className="text-sm text-geek-muted max-w-sm mx-auto">
          ¿Aún no has agregado tus figuras favoritas? Explora el catálogo para ver los lanzamientos anime más buscados.
        </p>
        <Link
          to="/catalogo"
          className="inline-block px-8 py-3 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl shadow-neon-pink transition"
        >
          Explorar Tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-geek-light">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ITEMS LIST COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.price_offer || item.product.price_normal
            const adj = item.variant ? item.variant.price_adjustment : 0
            const unitPrice = price + adj

            return (
              <div
                key={item.id}
                className="p-5 bg-[#121422] rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-secondary/20 transition-all duration-300"
              >
                {/* Image + Title */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-background flex-shrink-0">
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{item.product.franchise}</span>
                    <Link to={`/producto/${item.product.slug}`} className="block mt-0.5">
                      <h4 className="text-sm font-bold text-geek-light hover:text-secondary transition truncate max-w-[220px]">
                        {item.product.name}
                      </h4>
                    </Link>
                    {item.variant && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold bg-white/5 text-geek-muted border border-white/5 rounded">
                        {item.variant.variant_type}: {item.variant.variant_value}
                      </span>
                    )}
                  </div>
                </div>

                {/* Counter + Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center bg-[#1b1c2b] border border-white/5 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 hover:bg-white/5 text-geek-muted font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => {
                        try {
                          updateQuantity(item.id, item.quantity + 1)
                        } catch (err: any) {
                          Swal.fire({ title: 'Stock Límite', text: err.message, icon: 'warning', background: '#121422', color: '#f1f3f9' })
                        }
                      }}
                      className="px-2.5 py-1 hover:bg-white/5 text-geek-muted font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-extrabold text-geek-light">
                      S/ {(unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          })}
        </div>

        {/* SUMMARY DETAILS COLUMN */}
        <div className="space-y-6">
          
          {/* Coupon Code Input */}
          <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center">
              <Ticket className="w-4 h-4 mr-2 text-primary" />
              ¿Tienes un Cupón de Descuento?
            </h4>
            
            {coupon ? (
              <div className="flex justify-between items-center bg-primary/10 border border-primary/20 px-3.5 py-2.5 rounded-xl text-xs text-primary">
                <div>
                  <span className="font-extrabold">{coupon.code}</span>
                  <span className="block text-[9px] text-geek-muted">Descuento aplicado correctamente</span>
                </div>
                <button onClick={removeCoupon} className="font-bold hover:underline">Remover</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="E.g., NEONGEEK"
                  className="flex-1 px-3 py-2 bg-[#1b1c2b] text-xs text-geek-light border border-white/5 rounded-xl uppercase placeholder:normal-case focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-neon-pink"
                >
                  Aplicar
                </button>
              </form>
            )}
          </div>

          {/* Cashback & Points Redemption Widget */}
          {user && (
            <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white">Canjear Recompensas</h4>
              
              {/* Wallet Cashback Toggle */}
              {user.wallet_balance > 0 && (
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Wallet className="w-4 h-4 text-accent" />
                    <div>
                      <span className="text-xs font-bold text-geek-light">Usar saldo monedero</span>
                      <span className="block text-[10px] text-geek-muted">Saldo disponible: S/ {user.wallet_balance.toFixed(2)}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => handleToggleWallet(e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                  />
                </div>
              )}

              {/* Loyalty Points Toggle */}
              {user.points_balance > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Gift className="w-4 h-4 text-secondary" />
                    <div>
                      <span className="text-xs font-bold text-geek-light">Canjear Puntos de Recompensa</span>
                      <span className="block text-[10px] text-geek-muted">{user.points_balance} pts disponibles (100 pts = S/ 1)</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => handleTogglePoints(e.target.checked)}
                    className="w-4 h-4 accent-secondary rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* Subtotals breakdown */}
          <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl space-y-4 shadow-glass">
            <h4 className="text-sm font-bold text-white">Resumen de Compra</h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-geek-muted">Subtotal (sin imp.):</span>
                <span className="text-geek-light">S/ {getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-muted">Impuesto (IGV 18%):</span>
                <span className="text-geek-light">S/ {getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-muted">Costo de Envío:</span>
                <span className="text-geek-light">S/ {useCartStore().shippingCost.toFixed(2)}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Descuento cupón:</span>
                  <span>-S/ {getDiscount().toFixed(2)}</span>
                </div>
              )}
              {walletUsed > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span>Saldo monedero usado:</span>
                  <span>-S/ {walletUsed.toFixed(2)}</span>
                </div>
              )}
              {pointsUsed > 0 && (
                <div className="flex justify-between text-secondary font-bold">
                  <span>Descuento puntos ({pointsUsed} pts):</span>
                  <span>-S/ {(pointsUsed / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Total a pagar:</span>
              <span className="text-2xl font-extrabold text-white">
                S/ {getTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 glow-btn-pink text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <span>Proceder al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
