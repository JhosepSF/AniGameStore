import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Check, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { productService, Product, Category } from '../services/productService'
import { orderService, Order } from '../services/orderService'
import Swal from 'sweetalert2'

const statusTranslations: Record<string, string> = {
  Pending: 'Pendiente de Pago',
  Paid: 'Pagado',
  Preparing: 'Preparando Envío',
  Sent: 'Enviado',
  'In Transit': 'En Tránsito',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
  Returned: 'Devuelto'
}

export interface AuditLog {
  id: string
  action: string
  details: string
  created_at: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState('products')

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [audits, setAudits] = useState<AuditLog[]>([
    { id: '1', action: 'UPDATE_PRODUCT_STOCK', details: 'Stock de Luffy Gear 5 actualizado a 15 por Superadmin.', created_at: new Date().toISOString() },
    { id: '2', action: 'APPLY_PROMO_COUPON', details: 'Cupón FLASHANIME creado con 25% de descuento.', created_at: new Date(Date.now() - 3600000).toISOString() }
  ])

  // Create Product form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(1)
  const [franchise, setFranchise] = useState('One Piece')
  const [catId, setCatId] = useState('')

  useEffect(() => {
    if (!user || (user.role !== 'Superadmin' && user.role !== 'Administrador' && user.role !== 'Vendedor')) {
      Swal.fire({ title: 'Acceso Denegado', text: 'Módulo reservado para administradores.', icon: 'error', background: '#121422', color: '#f1f3f9' })
      navigate('/')
      return
    }

    productService.getProducts({ sortBy: 'newest' }).then(setProducts)
    productService.getCategories().then(cats => {
      setCategories(cats)
      if (cats.length > 0) setCatId(cats[0].id)
    })
    orderService.getAllOrdersAdmin().then(setOrders)
  }, [user, navigate])

  if (!user) return null

  // CRUD handlers
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !sku || price <= 0) return
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const newProd = await productService.createProduct({
        name,
        sku,
        slug,
        price_normal: price,
        stock,
        franchise,
        category_id: catId
      })
      setProducts(prev => [newProd, ...prev])
      setShowAddModal(false)
      // reset
      setName('')
      setSku('')
      setPrice(0)
      setStock(1)
      
      // Log audit
      setAudits(prev => [
        { id: Math.random().toString(), action: 'CREATE_PRODUCT', details: `Producto ${name} (SKU: ${sku}) creado con éxito.`, created_at: new Date().toISOString() },
        ...prev
      ])

      Swal.fire({ title: 'Producto Creado', text: 'El artículo ha sido publicado en el catálogo.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProduct = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar Producto?',
      text: `¿Estás seguro de que quieres quitar del catálogo "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#121422',
      color: '#f1f3f9',
      confirmButtonColor: '#d33'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await productService.deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
        
        setAudits(prev => [
          { id: Math.random().toString(), action: 'DELETE_PRODUCT', details: `Producto ${name} removido del catálogo.`, created_at: new Date().toISOString() },
          ...prev
        ])

        Swal.fire({ title: 'Producto Borrado', text: 'El catálogo ha sido actualizado.', icon: 'success', background: '#121422', color: '#f1f3f9' })
      }
    })
  }

  const handleShipOrder = async (orderId: string, orderNumber: string) => {
    const trackCode = 'SH-' + Math.floor(1000000 + Math.random() * 9000000)
    try {
      await orderService.updateOrderStatus(orderId, 'Sent', trackCode)
      // Refresh list
      const list = await orderService.getAllOrdersAdmin()
      setOrders(list)

      setAudits(prev => [
        { id: Math.random().toString(), action: 'SHIP_ORDER', details: `Pedido ${orderNumber} marcado como enviado con tracking ${trackCode}.`, created_at: new Date().toISOString() },
        ...prev
      ])

      Swal.fire({
        title: 'Pedido Despachado',
        text: `Se asignó el código de seguimiento: ${trackCode}`,
        icon: 'success',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#00f0ff'
      })
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleMarkDelivered = async (orderId: string, orderNumber: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'Delivered')
      const list = await orderService.getAllOrdersAdmin()
      setOrders(list)

      setAudits(prev => [
        { id: Math.random().toString(), action: 'DELIVER_ORDER', details: `Pedido ${orderNumber} marcado como entregado (Cashback asignado).`, created_at: new Date().toISOString() },
        ...prev
      ])

      Swal.fire({ title: 'Pedido Completado', text: 'El estado se actualizó a Entregado.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleConfirmPayment = async (orderId: string, orderNumber: string) => {
    try {
      await orderService.updateOrderStatus(orderId, 'Paid')
      const list = await orderService.getAllOrdersAdmin()
      setOrders(list)

      setAudits(prev => [
        { id: Math.random().toString(), action: 'CONFIRM_PAYMENT', details: `Pago del pedido ${orderNumber} confirmado manualmente por el administrador.`, created_at: new Date().toISOString() },
        ...prev
      ])

      Swal.fire({ title: 'Pago Confirmado', text: 'El estado del pedido se actualizó a Pagado.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err: any) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-geek-light">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Consola de Administración</h1>

      {/* Top dashboard summary counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-geek-muted uppercase tracking-wider font-bold">Ventas Totales</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">S/ 48,294.00</h3>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-geek-muted uppercase tracking-wider font-bold">Pedidos Registrados</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{orders.length}</h3>
          </div>
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div className="p-6 bg-[#121422] border border-white/5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-geek-muted uppercase tracking-wider font-bold">Artículos Catálogo</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{products.length}</h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Admin menu tabs */}
        <div className="lg:col-span-1 space-y-2.5">
          {[
            { id: 'products', label: 'Gestión Catálogo' },
            { id: 'orders', label: 'Despacho Pedidos' },
            { id: 'audits', label: 'Logs Auditoría' }
          ].map(itemTab => (
            <button
              key={itemTab.id}
              onClick={() => setActiveTab(itemTab.id)}
              className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl border transition ${
                activeTab === itemTab.id
                  ? 'bg-primary/10 border-primary text-primary shadow-neon-pink'
                  : 'bg-[#121422] border-white/5 text-geek-muted hover:text-white'
              }`}
            >
              {itemTab.label}
            </button>
          ))}
        </div>

        {/* DETAILS TABLE SHOWCASE */}
        <div className="lg:col-span-3 bg-[#121422] p-8 rounded-3xl border border-white/5 min-h-[400px]">
          
          {/* TAB 1: PRODUCT MANAGEMENT CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold">Administración de Inventario</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-xl shadow-neon-cyan flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Producto</span>
                </button>
              </div>

              {/* Products table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-geek-muted uppercase tracking-wider font-bold">
                      <th className="pb-3">Nombre</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Precio</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 font-bold text-white max-w-[200px] truncate">{p.name}</td>
                        <td className="py-4 text-geek-muted">{p.sku}</td>
                        <td className="py-4 font-semibold text-geek-light">S/ {p.price_normal.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded font-bold ${p.stock <= 5 ? 'bg-red-500/10 text-red-500 border border-red-500/25' : 'bg-[#1b1c2b] text-geek-muted'}`}>
                            {p.stock} unid
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/5 pb-4">Gestión de Envíos y Pedidos</h2>
              
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="p-5 bg-[#1b1c2b] rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-bold text-geek-light">{o.order_number}</span>
                        <span className="block text-[10px] text-geek-muted mt-0.5">Destino: {o.shipping_address?.full_name} - {o.shipping_address?.city}</span>
                        {o.payments && o.payments.length > 0 && (
                          <span className="block text-[10px] text-geek-muted mt-0.5">
                            Pago: <b className="text-geek-light">{o.payments[0].gateway}</b> 
                            {o.payments[0].transaction_id && ` | N° Operación: `}
                            {o.payments[0].transaction_id && <b className="text-accent font-mono select-all">{o.payments[0].transaction_id}</b>}
                            {` (${o.payments[0].status === 'completed' ? 'Completado' : 'Pendiente'})`}
                          </span>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border ${
                        o.status === 'Delivered' ? 'bg-accent/15 text-accent border-accent/25' : 'bg-amber-500/15 text-amber-500 border-amber-500/25'
                      }`}>
                        {statusTranslations[o.status] || o.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-geek-muted">
                        Total Pedido: <b className="text-geek-light">S/ {o.total.toFixed(2)}</b>
                      </div>
                      
                      <div className="flex gap-2">
                        {o.status === 'Pending' && (
                          <button
                            onClick={() => handleConfirmPayment(o.id, o.order_number)}
                            className="px-3 py-1.5 bg-accent text-background hover:bg-accent/95 text-xs font-bold rounded-lg transition"
                          >
                            Confirmar Pago
                          </button>
                        )}
                        {o.status === 'Paid' && (
                          <button
                            onClick={() => handleShipOrder(o.id, o.order_number)}
                            className="px-3 py-1.5 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-lg transition"
                          >
                            Marcar Enviado
                          </button>
                        )}
                        {o.status === 'Sent' && (
                          <button
                            onClick={() => handleMarkDelivered(o.id, o.order_number)}
                            className="px-3 py-1.5 bg-accent text-background hover:bg-accent/95 text-xs font-bold rounded-lg transition"
                          >
                            Marcar Entregado
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/5 pb-4">Registros de Seguridad y Auditoría</h2>
              
              <div className="space-y-3">
                {audits.map(log => (
                  <div key={log.id} className="p-4 bg-[#1b1c2b] rounded-xl border border-white/5 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-primary uppercase tracking-widest text-[9px]">{log.action}</span>
                      <span className="text-[10px] text-geek-muted">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-geek-light leading-relaxed">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CREATE PRODUCT MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#121422] rounded-3xl border border-white/5 p-8 shadow-2xl space-y-6 animate-slide-up">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Nuevo Producto en Catálogo</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">Nombre Producto</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Figma Tanjiro"
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">SKU Código</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="FIG-DS-TANJIRO"
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">Precio de Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="120.00"
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">Franquicia Anime</label>
                  <input
                    type="text"
                    required
                    value={franchise}
                    onChange={(e) => setFranchise(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase mb-1.5">Categoría Asignada</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1c2b] border border-white/5 rounded-xl text-xs text-geek-muted"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-xl shadow-neon-cyan transition"
                >
                  Guardar Publicación
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-white/5 text-geek-light text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
