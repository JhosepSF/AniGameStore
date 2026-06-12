import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Gift, Users, ShoppingBag, Eye, Search, AlertCircle, Copy, Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { orderService, Order, ShipmentTracking } from '../services/orderService'
import { rewardsService, WalletMovement, RewardMovement, Referral } from '../services/rewardsService'
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

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()

  const [activeTab, setActiveTab] = useState('orders')

  // Data lists
  const [orders, setOrders] = useState<Order[]>([])
  const [walletMovements, setWalletMovements] = useState<WalletMovement[]>([])
  const [rewardMovements, setRewardMovements] = useState<RewardMovement[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])

  // Profile Edit fields
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  // Tracking tracker states
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingLogs, setTrackingLogs] = useState<ShipmentTracking[]>([])
  const [trackingError, setTrackingError] = useState(false)

  // Refer friend email
  const [referEmail, setReferEmail] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Fetch logs
    orderService.getOrders(user.id).then(setOrders)
    rewardsService.getWalletMovements(user.id).then(setWalletMovements)
    rewardsService.getRewardMovements(user.id).then(setRewardMovements)
    rewardsService.getReferrals(user.id).then(setReferrals)
  }, [user, navigate])

  if (!user) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ first_name: firstName, last_name: lastName, phone })
      Swal.fire({ title: 'Perfil Actualizado', text: 'Tus datos se guardaron con éxito.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err) {
      console.error(err)
    }
  }

  const handleTrackCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setTrackingError(false)
    if (!trackingCode.trim()) return
    try {
      const logs = await orderService.getShipmentTracking(trackingCode.trim())
      setTrackingLogs(logs)
      if (logs.length === 0) setTrackingError(true)
    } catch (err) {
      setTrackingError(true)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referEmail.trim()) return
    try {
      await rewardsService.addReferral(user.id, referEmail.trim())
      const updated = await rewardsService.getReferrals(user.id)
      setReferrals(updated)
      setReferEmail('')
      Swal.fire({
        title: '¡Invitación Enviada!',
        text: 'Le enviamos un correo a tu amigo con tu enlace.',
        icon: 'success',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#ff007f'
      })
    } catch (err) {
      console.error(err)
    }
  }

  const copyReferralLink = () => {
    const link = `https://anigames.com/register?ref=${user.id}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    Swal.fire({ title: 'Enlace Copiado', text: 'Compártelo con tus amigos geek.', icon: 'info', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#121422', color: '#f1f3f9' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-geek-light">
      
      {/* Dashboard Top Header user overview */}
      <div className="p-8 bg-gradient-to-r from-[#121422] to-[#1e1a38] rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-glass">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'}
            alt=""
            className="w-16 h-16 rounded-full border-2 border-primary shadow-neon-pink"
          />
          <div>
            <h1 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h1>
            <p className="text-xs text-geek-muted mt-0.5">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30 rounded">
              {user.role}
            </span>
          </div>
        </div>

        {/* Currency balances indicators */}
        <div className="flex gap-4">
          <div className="px-5 py-3.5 bg-background/50 rounded-2xl border border-white/5 flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-accent" />
            <div>
              <span className="text-[10px] text-geek-muted uppercase tracking-wider block">Billetera</span>
              <span className="text-base font-extrabold text-accent">S/ {user.wallet_balance.toFixed(2)}</span>
            </div>
          </div>
          <div className="px-5 py-3.5 bg-background/50 rounded-2xl border border-white/5 flex items-center space-x-3">
            <Gift className="w-5 h-5 text-secondary" />
            <div>
              <span className="text-[10px] text-geek-muted uppercase tracking-wider block">Puntos</span>
              <span className="text-base font-extrabold text-secondary">{user.points_balance} pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation tabs column */}
        <div className="lg:col-span-1 space-y-2.5">
          {[
            { id: 'orders', label: 'Mis Pedidos', icon: ShoppingBag },
            { id: 'wallet', label: 'Monedero & Cashback', icon: Wallet },
            { id: 'referrals', label: 'Referidos & Puntos', icon: Users },
            { id: 'profile', label: 'Editar Datos', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl border transition ${
                activeTab === tab.id
                  ? 'bg-primary/10 border-primary text-primary shadow-neon-pink'
                  : 'bg-[#121422] border-white/5 text-geek-muted hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Quick Shipments Tracking tool */}
          <div className="p-5 bg-[#121422] border border-white/5 rounded-2xl mt-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-geek-light flex items-center">
              <Search className="w-4 h-4 mr-2 text-secondary" />
              Seguimiento Courier
            </h4>
            <form onSubmit={handleTrackCode} className="space-y-3">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="E.g., SH-9837482"
                className="w-full px-3 py-2 bg-[#1b1c2b] text-xs text-geek-light border border-white/5 rounded-xl uppercase placeholder:normal-case focus:outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="w-full py-2 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-xl shadow-neon-cyan transition"
              >
                Rastrear Envío
              </button>
            </form>
          </div>
        </div>

        {/* DETAILS PANEL SHOWCASE COLUMN */}
        <div className="lg:col-span-3 bg-[#121422] p-8 rounded-3xl border border-white/5 min-h-[400px]">
          
          {/* TRACKING SECTION OVERLAY */}
          {trackingLogs.length > 0 && (
            <div className="mb-8 p-5 bg-[#1b1c2b] rounded-2xl border border-secondary/20 relative">
              <button onClick={() => setTrackingLogs([])} className="absolute top-4 right-4 text-xs text-geek-muted hover:text-white">Cerrar Rastro</button>
              <h3 className="text-sm font-bold text-secondary mb-4 uppercase">Seguimiento de Código: {trackingCode}</h3>
              <div className="relative border-l-2 border-secondary/20 ml-3 space-y-5">
                {trackingLogs.map((log, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-secondary rounded-full border-2 border-background shadow-neon-cyan"></div>
                    <span className="text-[10px] text-geek-muted block">{new Date(log.checkpoint_time).toLocaleString()}</span>
                    <span className="text-xs font-bold text-geek-light">{log.location}</span>
                    <p className="text-xs text-geek-muted mt-0.5">{log.status_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Mis Compras</h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-5 bg-[#1b1c2b] rounded-2xl border border-white/5 space-y-4">
                      
                      {/* Order Header Summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3.5 gap-2">
                        <div>
                          <span className="text-xs font-bold text-geek-light">{ord.order_number}</span>
                          <span className="block text-[10px] text-geek-muted mt-0.5">Fecha: {new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-geek-light">S/ {ord.total.toFixed(2)}</span>
                          <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded border ${
                            ord.status === 'Delivered'
                              ? 'bg-accent/15 text-accent border-accent/25'
                              : ord.status === 'Sent' || ord.status === 'In Transit'
                              ? 'bg-secondary/15 text-secondary border-secondary/25'
                              : 'bg-amber-500/15 text-amber-500 border-amber-500/25'
                          }`}>
                            {statusTranslations[ord.status] || ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Status Visual */}
                      <div className="flex items-center justify-between max-w-md mx-auto text-center pt-2">
                        {[
                          { label: 'Pago', key: 'Paid' },
                          { label: 'Preparando', key: 'Preparing' },
                          { label: 'Enviado', key: 'Sent' },
                          { label: 'Entregado', key: 'Delivered' }
                        ].map((stepMap, sIdx, stepsArr) => {
                          const statusOrder = ['Pending', 'Paid', 'Preparing', 'Sent', 'In Transit', 'Delivered']
                          const currentIdx = statusOrder.indexOf(ord.status)
                          const stepMapIdx = statusOrder.indexOf(stepMap.key)
                          const isActive = currentIdx >= stepMapIdx

                          return (
                            <React.Fragment key={stepMap.key}>
                              <div className="space-y-1">
                                <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold border ${isActive ? 'bg-primary border-primary text-white shadow-neon-pink' : 'bg-background border-white/5 text-geek-muted'}`}>
                                  {isActive ? '✓' : sIdx + 1}
                                </div>
                                <span className={`block text-[9px] font-semibold ${isActive ? 'text-white' : 'text-geek-muted'}`}>{stepMap.label}</span>
                              </div>
                              {sIdx < stepsArr.length - 1 && <div className={`flex-1 h-0.5 border-t ${isActive ? 'border-primary' : 'border-white/5'}`}></div>}
                            </React.Fragment>
                          )
                        })}
                      </div>

                      {/* Payment info & Courier Tracking Details */}
                      <div className="pt-2 border-t border-white/5 space-y-1.5 text-[10px] text-geek-muted">
                        {ord.payments && ord.payments.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Método Pago: <b className="text-geek-light">{ord.payments[0].gateway}</b> ({ord.payments[0].status === 'completed' ? 'Verificado' : 'Pendiente Verificación'})</span>
                            {ord.payments[0].transaction_id && (
                              <span>
                                {['Yape/Plin', 'Transferencia'].includes(ord.payments[0].gateway) ? 'N° Operación' : 'Transacción'}:{' '}
                                <b className="text-accent select-all font-mono">{ord.payments[0].transaction_id}</b>
                              </span>
                            )}
                          </div>
                        )}
                        {ord.tracking_code && (
                          <div className="flex justify-between items-center">
                            <span>Courier: <b>{ord.shipping_method}</b></span>
                            <span>Código Rastro: <b className="text-secondary select-all">{ord.tracking_code}</b></span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-geek-muted text-xs">No has realizado compras todavía.</div>
              )}
            </div>
          )}

          {/* TAB 2: WALLET & CASHBACK */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Monedero Virtual</h2>
                <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl flex items-center space-x-2 text-accent font-bold text-sm">
                  <Wallet className="w-4 h-4" />
                  <span>S/ {user.wallet_balance.toFixed(2)} Saldo</span>
                </div>
              </div>

              <p className="text-xs text-geek-muted leading-relaxed">
                El saldo de tu monedero virtual se compone de los cashbacks ganados (5% en todas las compras) y los bonos de invitaciones. Puedes aplicarlo de manera inmediata al pasar por el Checkout sin límites.
              </p>

              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2 text-white">Historial de Movimientos</h3>
              <div className="space-y-3">
                {walletMovements.map((wm) => (
                  <div key={wm.id} className="p-4 bg-[#1b1c2b] rounded-xl border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-geek-light">{wm.description}</span>
                      <span className="block text-[10px] text-geek-muted mt-0.5">{new Date(wm.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="font-extrabold text-accent">+S/ {wm.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REFERRALS */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Programa de Referidos</h2>
              <p className="text-xs text-geek-muted">
                Invita a tus amigos otakus y gamers. Cuando tu amigo se registre y complete su primer pedido, <b>él recibirá un bono de bienvenida de S/ 20</b> y <b>tú ganarás 500 puntos de regalo</b>.
              </p>

              {/* Share box links */}
              <div className="p-5 bg-[#1b1c2b] rounded-2xl border border-white/5 space-y-3">
                <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider">Tu Enlace de Invitado</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://anigames.com/register?ref=${user.id}`}
                    className="flex-1 px-3 py-2 bg-[#121422] text-xs text-geek-muted rounded-xl border border-white/5 focus:outline-none"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-2 bg-secondary text-background hover:bg-secondary/95 text-xs font-bold rounded-xl shadow-neon-cyan flex items-center space-x-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>Copiar</span>
                  </button>
                </div>
              </div>

              {/* Direct invitation email form */}
              <form onSubmit={handleSendInvite} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={referEmail}
                  onChange={(e) => setReferEmail(e.target.value)}
                  placeholder="Ingresa correo de tu amigo"
                  className="flex-1 px-3.5 py-2.5 bg-[#1b1c2b] text-xs text-geek-light border border-white/5 rounded-xl focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-neon-pink transition"
                >
                  Enviar Enlace
                </button>
              </form>

              {/* Invited friends grid */}
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2 text-white">Amigos Invitados ({referrals.length})</h3>
              <div className="space-y-3">
                {referrals.map((r) => (
                  <div key={r.id} className="p-4 bg-[#1b1c2b] rounded-xl border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-geek-light">{r.referred_email}</span>
                      <span className="block text-[10px] text-geek-muted mt-0.5">Invitado el {new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                      r.status === 'purchase_completed' ? 'bg-accent/15 text-accent border border-accent/25' : 'bg-white/5 text-geek-muted'
                    }`}>
                      {r.status === 'purchase_completed' ? 'Completado' : 'Registrado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Editar Perfil</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider mb-2">Apellido</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-neon-pink transition"
                >
                  Guardar Perfil
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
