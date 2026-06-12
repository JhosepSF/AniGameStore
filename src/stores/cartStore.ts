import { create } from 'zustand'
import { Product, ProductVariant } from '../services/productService'
import { Coupon, couponService } from '../services/couponService'

export interface CartItem {
  id: string // unique combination key (prodId + variantId)
  product: Product
  variant?: ProductVariant
  quantity: number
}

interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  shippingCost: number
  shippingMethod: string
  walletUsed: number // currency amount
  pointsUsed: number // points amount
  
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  updateQuantity: (itemId: string, qty: number) => void
  removeItem: (itemId: string) => void
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
  setShipping: (method: string, cost: number) => void
  setWalletUsed: (amount: number, maxAvailable: number) => void
  setPointsUsed: (points: number, maxAvailable: number) => void
  clearCart: () => void
  
  getSubtotal: () => number
  getDiscount: () => number
  getTax: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('anigames_cart') || '[]'),
  coupon: null,
  shippingCost: 15.00, // Default shipping Olva cost
  shippingMethod: 'Olva Courier',
  walletUsed: 0.00,
  pointsUsed: 0,

  addItem: (product, quantity = 1, variant) => {
    const items = get().items
    const itemId = variant ? `${product.id}-${variant.id}` : product.id
    
    // Check stock limit
    const maxStock = variant ? variant.stock : product.stock
    const existingIndex = items.findIndex(it => it.id === itemId)
    
    let updatedItems = [...items]
    
    if (existingIndex !== -1) {
      const newQty = items[existingIndex].quantity + quantity
      if (newQty > maxStock) {
        throw new Error(`¡Ups! Solo hay ${maxStock} unidades disponibles en stock de este producto.`)
      }
      updatedItems[existingIndex].quantity = newQty
    } else {
      if (quantity > maxStock) {
        throw new Error(`¡Ups! Solo hay ${maxStock} unidades disponibles en stock de este producto.`)
      }
      updatedItems.push({
        id: itemId,
        product,
        variant,
        quantity
      })
    }

    set({ items: updatedItems })
    localStorage.setItem('anigames_cart', JSON.stringify(updatedItems))
  },

  updateQuantity: (itemId, qty) => {
    const items = get().items
    const item = items.find(it => it.id === itemId)
    if (!item) return

    const maxStock = item.variant ? item.variant.stock : item.product.stock
    if (qty > maxStock) {
      throw new Error(`¡Ups! Solo hay ${maxStock} unidades disponibles en stock de este producto.`)
    }
    
    const updatedItems = items.map(it => 
      it.id === itemId ? { ...it, quantity: Math.max(1, qty) } : it
    )
    
    set({ items: updatedItems })
    localStorage.setItem('anigames_cart', JSON.stringify(updatedItems))
  },

  removeItem: (itemId) => {
    const updatedItems = get().items.filter(it => it.id !== itemId)
    set({ items: updatedItems })
    localStorage.setItem('anigames_cart', JSON.stringify(updatedItems))
    
    // Reset points/wallet if cart is empty
    if (updatedItems.length === 0) {
      set({ coupon: null, walletUsed: 0, pointsUsed: 0 })
    }
  },

  applyCoupon: async (code) => {
    const subtotal = get().getSubtotal()
    try {
      const coupon = await couponService.validateCoupon(code, subtotal)
      set({ coupon })
    } catch (err) {
      set({ coupon: null })
      throw err
    }
  },

  removeCoupon: () => {
    set({ coupon: null })
  },

  setShipping: (method, cost) => {
    set({ shippingMethod: method, shippingCost: cost })
  },

  setWalletUsed: (amount, maxAvailable) => {
    // Cannot exceed purchase total before wallet discount
    const subtotal = get().getSubtotal()
    const discount = get().getDiscount()
    const currentTotalBeforeWallet = subtotal + get().shippingCost + (subtotal * 0.18) - discount
    const finalAmount = Math.min(amount, maxAvailable, currentTotalBeforeWallet)
    set({ walletUsed: finalAmount })
  },

  setPointsUsed: (points, maxAvailable) => {
    // 100 points = S/ 1.00 discount
    const subtotal = get().getSubtotal()
    const discount = get().getDiscount()
    const currentTotalBeforePoints = subtotal + get().shippingCost + (subtotal * 0.18) - discount - get().walletUsed
    const pointsValue = points / 100
    const finalValue = Math.min(pointsValue, currentTotalBeforePoints)
    const finalPointsUsed = Math.floor(finalValue * 100)

    set({ pointsUsed: Math.min(finalPointsUsed, maxAvailable) })
  },

  clearCart: () => {
    set({ items: [], coupon: null, walletUsed: 0, pointsUsed: 0 })
    localStorage.removeItem('anigames_cart')
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product.price_offer || item.product.price_normal
      const adjustment = item.variant ? item.variant.price_adjustment : 0
      return sum + (price + adjustment) * item.quantity
    }, 0)
  },

  getDiscount: () => {
    const subtotal = get().getSubtotal()
    const coupon = get().coupon
    if (!coupon) return 0

    if (coupon.discount_type === 'percentage') {
      const computed = (subtotal * coupon.discount_value) / 100
      return coupon.max_discount ? Math.min(computed, coupon.max_discount) : computed
    } else {
      return Math.min(coupon.discount_value, subtotal)
    }
  },

  getTax: () => {
    // 18% IGV Peru
    return get().getSubtotal() * 0.18
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    if (subtotal === 0) return 0
    const tax = get().getTax()
    const discount = get().getDiscount()
    const shipping = get().shippingCost
    const walletVal = get().walletUsed
    const pointsVal = get().pointsUsed / 100 // 100 points = S/ 1.00

    const final = subtotal + tax + shipping - discount - walletVal - pointsVal
    return Math.max(0, final)
  }
}))
