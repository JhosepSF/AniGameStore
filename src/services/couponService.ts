import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number
  max_discount?: number
  is_active: boolean
}

export const MOCK_COUPONS: Coupon[] = [
  { id: 'c-1', code: 'NEONGEEK', discount_type: 'percentage', discount_value: 15, min_purchase: 50, max_discount: 100, is_active: true },
  { id: 'c-2', code: 'WELCOMETOKYO', discount_type: 'fixed', discount_value: 20, min_purchase: 100, is_active: true },
  { id: 'c-3', code: 'FLASHANIME', discount_type: 'percentage', discount_value: 25, min_purchase: 30, max_discount: 50, is_active: true }
]

export const couponService = {
  async validateCoupon(code: string, purchaseAmount: number): Promise<Coupon> {
    const cleanCode = code.trim().toUpperCase()

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        const coupon: Coupon = {
          id: data.id,
          code: data.code,
          discount_type: data.discount_type,
          discount_value: Number(data.discount_value),
          min_purchase: Number(data.min_purchase),
          max_discount: data.max_discount ? Number(data.max_discount) : undefined,
          is_active: data.is_active
        }

        if (purchaseAmount < coupon.min_purchase) {
          throw new Error(`Monto mínimo de compra para este cupón es S/ ${coupon.min_purchase.toFixed(2)}`)
        }
        return coupon
      }
    }

    const found = MOCK_COUPONS.find(c => c.code === cleanCode && c.is_active)
    if (!found) {
      throw new Error('El cupón ingresado no es válido o ya ha expirado.')
    }

    if (purchaseAmount < found.min_purchase) {
      throw new Error(`Monto mínimo de compra para este cupón es S/ ${found.min_purchase.toFixed(2)}`)
    }

    return found
  }
}
