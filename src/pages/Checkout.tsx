import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { orderService } from '../services/orderService'
import Swal from 'sweetalert2'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, addresses, addAddress } = useAuthStore()
  const {
    items,
    coupon,
    shippingCost,
    shippingMethod,
    walletUsed,
    pointsUsed,
    setShipping,
    clearCart,
    getSubtotal,
    getDiscount,
    getTax,
    getTotal
  } = useCartStore()

  const [step, setStep] = useState(1)

  // Step 1: Address selection
  const [selectedAddrId, setSelectedAddrId] = useState(addresses[0]?.id || '')
  
  // New Address form
  const [showNewAddrForm, setShowNewAddrForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('Lima')
  const [phone, setPhone] = useState('')

  // Step 2: Courier
  const handleCourierSelect = (method: string, cost: number) => {
    setShipping(method, cost)
  }

  // Step 3: Payment
  const [paymentGateway, setPaymentGateway] = useState('Stripe')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !addressLine || !phone) return
    try {
      await addAddress({
        full_name: fullName,
        address_line_1: addressLine,
        city,
        state_province: city,
        postal_code: '15000',
        phone,
        is_default: false
      })
      setShowNewAddrForm(false)
      // Reset inputs
      setFullName('')
      setAddressLine('')
      setPhone('')
      Swal.fire({ title: 'Dirección Guardada', text: 'Se ha agregado a tus direcciones.', icon: 'success', background: '#121422', color: '#f1f3f9' })
    } catch (err: any) {
      console.error(err)
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) return
    
    // Choose active address snapshot
    const activeAddress = addresses.find(a => a.id === selectedAddrId) || {
      full_name: user.first_name + ' ' + user.last_name,
      address_line_1: 'Dirección por Defecto',
      city: 'Lima',
      phone: user.phone || '999999999'
    }

    const orderPayload = {
      user_id: user.id,
      status: 'Paid' as const, // Automatically process payment success in mock
      subtotal: getSubtotal(),
      shipping_cost: shippingCost,
      tax: getTax(),
      discount: getDiscount(),
      total: getTotal(),
      coupon_id: coupon?.id,
      shipping_address: activeAddress,
      shipping_method: shippingMethod,
      wallet_amount_used: walletUsed,
      points_amount_used: pointsUsed
    }

    const orderItemsPayload = items.map(it => {
      const price = it.product.price_offer || it.product.price_normal
      const adj = it.variant ? it.variant.price_adjustment : 0
      return {
        product_id: it.product.id,
        variant_id: it.variant?.id,
        name: it.product.name,
        sku: it.product.sku,
        price: price + adj,
        quantity: it.quantity,
        total: (price + adj) * it.quantity
      }
    })

    try {
      Swal.fire({
        title: 'Procesando Pago...',
        text: `Transacción segura con ${paymentGateway} en curso.`,
        allowOutsideClick: false,
        background: '#121422',
        color: '#f1f3f9',
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Simulate a small network delay for Stripe/Yape verification
      await new Promise(r => setTimeout(r, 2000))

      const created = await orderService.createOrder(orderPayload, orderItemsPayload)

      // Deduct wallet balance locally in useAuthStore for mock visual
      if (walletUsed > 0 && useAuthStore.getState().user) {
        const current = useAuthStore.getState().user!
        useAuthStore.setState({
          user: {
            ...current,
            wallet_balance: Math.max(0, current.wallet_balance - walletUsed)
          }
        })
      }

      // Add points to mock user balance
      if (useAuthStore.getState().user) {
        const current = useAuthStore.getState().user!
        const pointsEarned = Math.floor(getSubtotal())
        const pointsDeducted = pointsUsed
        useAuthStore.setState({
          user: {
            ...current,
            points_balance: current.points_balance - pointsDeducted + pointsEarned
          }
        })
      }

      clearCart()

      Swal.fire({
        title: '¡Pedido Confirmado!',
        text: `Tu compra con número ${created.order_number} ha sido procesada con éxito.`,
        icon: 'success',
        confirmButtonText: 'Ver Pedido',
        background: '#121422',
        color: '#f1f3f9',
        confirmButtonColor: '#ff007f'
      }).then(() => {
        navigate('/panelcliente')
      })
    } catch (err: any) {
      Swal.fire({
        title: 'Error en Pago',
        text: err.message || 'No se pudo autorizar el cobro.',
        icon: 'error',
        background: '#121422',
        color: '#f1f3f9'
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-geek-light">
      
      {/* 4 Steps Visual Indicators */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-12">
        {[
          { label: 'Envío', stepNum: 1, icon: MapPin },
          { label: 'Courier', stepNum: 2, icon: Truck },
          { label: 'Pago', stepNum: 3, icon: CreditCard },
          { label: 'Revisión', stepNum: 4, icon: CheckCircle }
        ].map((itemStep) => (
          <div key={itemStep.stepNum} className="flex items-center space-x-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                step >= itemStep.stepNum
                  ? 'bg-primary border-primary text-white shadow-neon-pink'
                  : 'bg-[#121422] border-white/5 text-geek-muted'
              }`}
            >
              <itemStep.icon className="w-4 h-4" />
            </div>
            <span className={`hidden sm:inline text-xs font-semibold ${step >= itemStep.stepNum ? 'text-white font-bold' : 'text-geek-muted'}`}>
              {itemStep.label}
            </span>
            {itemStep.stepNum < 4 && <div className="w-6 sm:w-12 border-t border-white/5"></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* STEP-BY-STEP FORM PANEL */}
        <div className="lg:col-span-2 bg-[#121422] p-8 rounded-3xl border border-white/5 space-y-6">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <MapPin className="w-5 h-5 text-primary mr-2" />
                Dirección de Envío
              </h2>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddrId(addr.id)}
                    className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition ${
                      selectedAddrId === addr.id
                        ? 'border-primary bg-primary/5 text-geek-light'
                        : 'border-white/5 bg-[#1b1c2b] text-geek-muted hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-geek-light">{addr.title}</p>
                      <p className="text-xs mt-1">{addr.full_name} - {addr.phone}</p>
                      <p className="text-[10px] text-geek-muted mt-0.5">{addr.address_line_1}, {addr.city}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddrId === addr.id ? 'border-primary' : 'border-white/10'}`}>
                      {selectedAddrId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                    </div>
                  </div>
                ))}
              </div>

              {!showNewAddrForm ? (
                <button
                  onClick={() => setShowNewAddrForm(true)}
                  className="w-full py-3 bg-[#1b1c2b] hover:bg-white/5 border border-dashed border-white/10 rounded-xl text-xs font-bold transition"
                >
                  + Agregar Nueva Dirección
                </button>
              ) : (
                <form onSubmit={handleAddNewAddress} className="p-5 bg-[#1b1c2b] rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-geek-light">Detalle de Dirección</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jhosep San Martin"
                        className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">Celular</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="987654321"
                        className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">Dirección Completa</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Av. Universitaria 1234 Dpto 402"
                      className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-neon-pink"
                    >
                      Guardar Dirección
                    </button>
                    <button
                      onClick={() => setShowNewAddrForm(false)}
                      className="px-4 py-2 bg-white/5 text-geek-light text-xs font-bold rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <button
                disabled={!selectedAddrId}
                onClick={() => setStep(2)}
                className="w-full py-3.5 glow-btn-pink text-white font-extrabold rounded-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>Continuar a Courier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: COURIER METHODS */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <Truck className="w-5 h-5 text-secondary mr-2" />
                Método de Envío
              </h2>

              <div className="space-y-4">
                {[
                  { name: 'Olva Courier', cost: 15.00, desc: 'Entrega nacional a domicilio asegurada con burbujas dobles.', time: '24-48 horas' },
                  { name: 'Shalom', cost: 12.00, desc: 'Recojo en agencia local Shalom. Ideal para provincias remotas.', time: '24-72 horas' },
                  { name: 'Envío Express (Lima)', cost: 25.00, desc: 'Motorizado directo a tu ubicación el mismo día.', time: 'En menos de 12 horas' }
                ].map((c) => (
                  <div
                    key={c.name}
                    onClick={() => handleCourierSelect(c.name, c.cost)}
                    className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition ${
                      shippingMethod === c.name
                        ? 'border-secondary bg-secondary/5 text-geek-light'
                        : 'border-white/5 bg-[#1b1c2b] text-geek-muted hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-geek-light">{c.name}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-white/5 text-geek-muted border border-white/5 rounded-full">{c.time}</span>
                      </div>
                      <p className="text-xs text-geek-muted mt-1">{c.desc}</p>
                    </div>
                    <span className="text-sm font-extrabold text-geek-light">S/ {c.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-[#1b1c2b] text-geek-light font-bold rounded-xl flex items-center justify-center space-x-1 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 glow-btn-cyan text-background font-extrabold rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <span>Continuar a Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MOCK PAYMENT GATEWAY */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <CreditCard className="w-5 h-5 text-accent mr-2" />
                Método de Pago
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {['Stripe', 'PayPal', 'Yape/Plin', 'Mercado Pago', 'Transferencia'].map((gateway) => (
                  <button
                    key={gateway}
                    onClick={() => setPaymentGateway(gateway)}
                    className={`py-3 text-xs font-bold border rounded-xl transition ${
                      paymentGateway === gateway
                        ? 'border-accent bg-accent/10 text-accent shadow-neon-green'
                        : 'border-white/5 bg-[#1b1c2b] text-geek-muted hover:text-white'
                    }`}
                  >
                    {gateway}
                  </button>
                ))}
              </div>

              {/* Dynamic Gateway fields */}
              <div className="p-6 bg-[#1b1c2b] rounded-2xl border border-white/5 space-y-4">
                {paymentGateway === 'Stripe' || paymentGateway === 'Mercado Pago' ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-geek-light">Pago con Tarjeta</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">Número de Tarjeta</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substr(0, 16))}
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">Vencimiento</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.substr(0, 5))}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-geek-muted mb-1.5 uppercase">CVC</label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substr(0, 3))}
                          placeholder="321"
                          className="w-full px-3 py-2 bg-[#121422] border border-white/5 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : paymentGateway === 'Yape/Plin' ? (
                  <div className="text-center space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-geek-light">Pago Seguro con Código QR</h3>
                    <div className="w-40 h-40 bg-white rounded-xl mx-auto flex items-center justify-center border-4 border-accent shadow-neon-green">
                      <span className="text-background text-xs font-bold">QR Yape / Plin</span>
                    </div>
                    <p className="text-[10px] text-geek-muted leading-relaxed">
                      Escanea el código con tu billetera bancaria preferida. Se confirmará de forma automática al generar tu orden.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-geek-light">Instrucciones de Transferencia</h3>
                    <p className="text-geek-muted">Realiza tu depósito en las siguientes cuentas bancarias oficiales:</p>
                    <div className="p-3 bg-[#121422] rounded-xl border border-white/5">
                      <p><b className="text-geek-light">BCP Soles:</b> 193-98234827-0-45</p>
                      <p className="text-[10px] text-geek-muted mt-0.5">Titular: AniGames Store S.A.C.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 bg-[#1b1c2b] text-geek-light font-bold rounded-xl flex items-center justify-center space-x-1 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  disabled={paymentGateway === 'Stripe' && (!cardNumber || !cardExpiry || !cardCvc)}
                  onClick={() => setStep(4)}
                  className="flex-1 py-3.5 glow-btn-green text-background font-extrabold rounded-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <span>Revisar Detalles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INVOICE CONFIRM ORDER */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <CheckCircle className="w-5 h-5 text-accent mr-2" />
                Confirmación de Compra
              </h2>

              <div className="p-5 bg-[#1b1c2b] rounded-2xl border border-white/5 text-xs space-y-4">
                <div>
                  <span className="font-bold text-geek-muted">Dirección de Despacho:</span>
                  <p className="text-geek-light mt-1">
                    {addresses.find(a => a.id === selectedAddrId)?.address_line_1 || 'Mi Domicilio'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-geek-muted">Courier Asignado:</span>
                    <p className="text-geek-light mt-0.5">{shippingMethod}</p>
                  </div>
                  <div>
                    <span className="font-bold text-geek-muted">Método de Cobro:</span>
                    <p className="text-geek-light mt-0.5">{paymentGateway}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-3 bg-[#1b1c2b] text-geek-light font-bold rounded-xl flex items-center justify-center space-x-1 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3.5 glow-btn-pink text-white font-extrabold rounded-xl flex items-center justify-center space-x-2 transition shadow-neon-pink"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Autorizar & Pagar</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ORDER SUMMARY CART COLUMN */}
        <div className="space-y-4">
          <div className="p-6 bg-[#121422] border border-white/5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white">Detalle de Compra</h3>

            {/* List items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map(it => {
                const price = it.product.price_offer || it.product.price_normal
                const adj = it.variant ? it.variant.price_adjustment : 0
                return (
                  <div key={it.id} className="flex justify-between items-center text-xs">
                    <div className="truncate max-w-[150px]">
                      <span className="font-bold text-geek-light">{it.product.name}</span>
                      <span className="block text-[10px] text-geek-muted">Cant. {it.quantity}</span>
                    </div>
                    <span className="font-extrabold text-geek-light">S/ {((price + adj) * it.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-geek-muted">Subtotal:</span>
                <span>S/ {getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-muted">IGV (18%):</span>
                <span>S/ {getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-geek-muted">Costo Envío:</span>
                <span>S/ {shippingCost.toFixed(2)}</span>
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
                  <span>Descuento puntos:</span>
                  <span>-S/ {(pointsUsed / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
              <span className="text-xs font-bold text-white">Total:</span>
              <span className="text-xl font-extrabold text-white">S/ {getTotal().toFixed(2)}</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
