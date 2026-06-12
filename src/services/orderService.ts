import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface OrderItem {
  id?: string
  product_id: string
  variant_id?: string
  name: string
  sku: string
  price: number
  quantity: number
  total: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: 'Pending' | 'Paid' | 'Preparing' | 'Sent' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Returned'
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total: number
  coupon_id?: string
  shipping_address: any
  shipping_method?: string
  tracking_code?: string
  notes?: string
  cashback_earned?: number
  points_earned?: number
  wallet_amount_used?: number
  points_amount_used?: number
  created_at: string
  items?: OrderItem[]
  payments?: any[]
}

export interface ShipmentTracking {
  location: string
  status_description: string
  checkpoint_time: string
}

// ----------------------------------------------------
// Mock Data (Fallback if Supabase not configured)
// ----------------------------------------------------
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_number: 'AG-202606-8947',
    user_id: 'usr-mock-123',
    status: 'Delivered',
    subtotal: 249.90,
    shipping_cost: 15.00,
    tax: 44.98,
    discount: 50.00, // WELCOMETOKYO coupon
    total: 259.88,
    shipping_address: {
      full_name: 'Jhosep San Martin',
      address_line_1: 'Av. Universitaria 1234',
      city: 'Lima',
      postal_code: '15082',
      phone: '987654321'
    },
    shipping_method: 'Olva Courier',
    tracking_code: 'OLV-982348',
    cashback_earned: 12.50,
    points_earned: 250,
    created_at: '2026-06-08T11:00:00Z',
    items: [
      { product_id: 'p-1', name: 'Figura Luffy Gear 5 - Ichiban Kojo (Joy Boy Edition)', sku: 'FIG-OP-LUFFY-G5', price: 249.90, quantity: 1, total: 249.90 }
    ],
    payments: [
      { gateway: 'Stripe', transaction_id: 'card_mock8947', amount: 259.88, status: 'completed' }
    ]
  },
  {
    id: 'ord-2',
    order_number: 'AG-202606-9321',
    user_id: 'usr-mock-123',
    status: 'Sent',
    subtotal: 89.00,
    shipping_cost: 0.00, // free shipping
    tax: 16.02,
    discount: 0.00,
    total: 105.02,
    shipping_address: {
      full_name: 'Jhosep San Martin',
      address_line_1: 'Av. Universitaria 1234',
      city: 'Lima',
      postal_code: '15082',
      phone: '987654321'
    },
    shipping_method: 'Shalom',
    tracking_code: 'SH-9837482',
    created_at: '2026-06-10T15:30:00Z',
    items: [
      { product_id: 'p-4', name: 'Mousepad Gigante Demon Slayer - Tanjiro & Nezuko (900x400)', sku: 'PAD-DS-TANJIRO-XL', price: 89.00, quantity: 1, total: 89.00 }
    ],
    payments: [
      { gateway: 'Yape/Plin', transaction_id: '12837492', amount: 105.02, status: 'completed' }
    ]
  }
]

export const MOCK_TRACKINGS: Record<string, ShipmentTracking[]> = {
  'OLV-982348': [
    { location: 'Almacén Central (Lima)', status_description: 'Pedido verificado y empaquetado.', checkpoint_time: '2026-06-08T14:00:00Z' },
    { location: 'Centro de Clasificación Olva', status_description: 'Envío recibido en sucursal principal.', checkpoint_time: '2026-06-09T08:30:00Z' },
    { location: 'En ruta de entrega', status_description: 'Repartidor asignado en camino al domicilio.', checkpoint_time: '2026-06-10T10:15:00Z' },
    { location: 'Entregado', status_description: 'Pedido recibido por Jhosep San Martin.', checkpoint_time: '2026-06-10T13:40:00Z' }
  ],
  'SH-9837482': [
    { location: 'Almacén Central (Lima)', status_description: 'Pedido verificado y preparado para despacho.', checkpoint_time: '2026-06-10T16:00:00Z' },
    { location: 'Terminal Terrestre Lima', status_description: 'Despachado en camión rumbo a destino.', checkpoint_time: '2026-06-11T05:00:00Z' },
    { location: 'Oficina Shalom Destino', status_description: 'Arribo a terminal. Listo para recojo o reparto en camino.', checkpoint_time: '2026-06-11T12:00:00Z' }
  ]
}

// ----------------------------------------------------
// Service Methods
// ----------------------------------------------------
export const orderService = {
  async getOrders(userId: string): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select(`
        *,
        order_items(*),
        payments(*)
      `).eq('user_id', userId)
      
      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          items: item.order_items || [],
          payments: item.payments || []
        }))
      }
    }
    return MOCK_ORDERS.filter(o => o.user_id === userId)
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select(`
        *,
        order_items(*),
        payments(*)
      `).order('created_at', { ascending: false })

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          items: item.order_items || [],
          payments: item.payments || []
        }))
      }
    }
    return MOCK_ORDERS
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select(`
        *,
        order_items(*),
        payments(*)
      `).eq('id', id).single()

      if (!error && data) {
        return {
          ...data,
          items: data.order_items || [],
          payments: data.payments || []
        }
      }
    }
    const found = MOCK_ORDERS.find(o => o.id === id || o.order_number === id)
    return found || null
  },

  async createOrder(
    order: Omit<Order, 'id' | 'order_number' | 'created_at'>,
    items: OrderItem[],
    paymentDetails?: { gateway: string; transactionId?: string }
  ): Promise<Order> {
    const orderNum = 'AG-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(1000 + Math.random() * 9000)
    
    if (isSupabaseConfigured) {
      try {
        const { data: newOrder, error: oErr } = await supabase.from('orders').insert({
          order_number: orderNum,
          user_id: order.user_id,
          status: order.status,
          subtotal: order.subtotal,
          shipping_cost: order.shipping_cost,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          shipping_address: order.shipping_address,
          shipping_method: order.shipping_method,
          wallet_amount_used: order.wallet_amount_used || 0,
          points_amount_used: order.points_amount_used || 0
        }).select().single()

        if (oErr) throw new Error(oErr.message)

        // Add items
        const itemsToInsert = items.map(it => ({
          order_id: newOrder.id,
          product_id: it.product_id,
          variant_id: it.variant_id || null,
          name: it.name,
          sku: it.sku,
          price: it.price,
          quantity: it.quantity,
          total: it.total
        }))

        const { error: itErr } = await supabase.from('order_items').insert(itemsToInsert)
        if (itErr) throw new Error(itErr.message)

        // Insert payment if provided
        let createdPayment = null
        if (paymentDetails) {
          const { data: payData, error: payErr } = await supabase.from('payments').insert({
            order_id: newOrder.id,
            gateway: paymentDetails.gateway,
            transaction_id: paymentDetails.transactionId || null,
            amount: order.total,
            status: order.status === 'Paid' ? 'completed' : 'pending'
          }).select().single()
          
          if (!payErr && payData) {
            createdPayment = payData
          }
        }

        return {
          ...newOrder,
          items: itemsToInsert,
          payments: createdPayment ? [createdPayment] : []
        }
      } catch (err: any) {
        console.error('Order creation failed on Supabase, fallback to Mock.', err)
        throw err
      }
    }

    const mockPayment = paymentDetails ? [{
      gateway: paymentDetails.gateway,
      transaction_id: paymentDetails.transactionId || null,
      amount: order.total,
      status: order.status === 'Paid' ? 'completed' : 'pending'
    }] : []

    const newOrd: Order = {
      id: 'ord-' + Math.random().toString(36).substr(2, 9),
      order_number: orderNum,
      ...order,
      created_at: new Date().toISOString(),
      items: items,
      payments: mockPayment
    }
    MOCK_ORDERS.unshift(newOrd)
    return newOrd
  },

  async updateOrderStatus(id: string, status: Order['status'], trackingCode?: string): Promise<Order> {
    if (isSupabaseConfigured) {
      const updatePayload: any = { status }
      if (trackingCode) updatePayload.tracking_code = trackingCode

      const { data, error } = await supabase.from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)

      if (status === 'Paid') {
        await supabase.from('payments')
          .update({ status: 'completed' })
          .eq('order_id', id)
      }

      return data
    }

    const index = MOCK_ORDERS.findIndex(o => o.id === id)
    if (index !== -1) {
      MOCK_ORDERS[index].status = status
      if (status === 'Paid' && MOCK_ORDERS[index].payments) {
        MOCK_ORDERS[index].payments = MOCK_ORDERS[index].payments.map((p: any) => ({
          ...p,
          status: 'completed'
        }))
      }
      if (trackingCode) {
        MOCK_ORDERS[index].tracking_code = trackingCode
        // Seed tracking history
        MOCK_TRACKINGS[trackingCode] = [
          { location: 'Almacén Central (Lima)', status_description: 'Pedido despachado y código de tracking asignado.', checkpoint_time: new Date().toISOString() }
        ]
      }
      return MOCK_ORDERS[index]
    }
    throw new Error('Orden no encontrada')
  },

  async getShipmentTracking(code: string): Promise<ShipmentTracking[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('shipments')
        .select('*, shipment_tracking(*)')
        .eq('tracking_code', code)
        .single()

      if (!error && data && data.shipment_tracking) {
        return data.shipment_tracking.map((item: any) => ({
          location: item.location,
          status_description: item.status_description,
          checkpoint_time: item.checkpoint_time
        }))
      }
    }

    return MOCK_TRACKINGS[code] || [
      { location: 'En tránsito', status_description: 'No hay detalles de seguimiento cargados todavía para este courier.', checkpoint_time: new Date().toISOString() }
    ]
  }
}
