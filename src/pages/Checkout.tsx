import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Truck, CreditCard, Check, Loader2, Shield, Store } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useMarketplace } from '../context/MarketplaceContext'
import { useAuth } from '../context/AuthContext'
import { fetchAddressByCep, formatCep, formatCpf, formatPhone } from '../services/viacep'
import { calculateShipping, generatePixCode } from '../services/shipping'
import { createMarketplaceOrder } from '../services/marketplace'
import type { ShippingOption, Order, SubOrder, OrderItem, Address } from '../types'
import { calcPixPrice, calcSellerPayout, calcPlatformFee, formatCurrency, generateId } from '../types'

interface CustomerForm {
  name: string
  email: string
  phone: string
  cpf: string
  address: Address
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { settings } = useMarketplace()
  const { profile, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingBySeller, setShippingBySeller] = useState<Record<string, { options: ShippingOption[]; selected: ShippingOption | null }>>({})
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [orderComplete, setOrderComplete] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [total, setTotal] = useState(0)

  const [customer, setCustomer] = useState<CustomerForm>({
    name: profile?.fullName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
    address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
  })

  useEffect(() => {
    if (profile) {
      setCustomer((c) => ({
        ...c,
        name: profile.fullName || c.name,
        email: profile.email || c.email,
      }))
    }
  }, [profile])

  const sellerGroups = useMemo(() => {
    const map = new Map<string, typeof items>()
    items.forEach((item) => {
      const sid = item.product.sellerId
      if (!map.has(sid)) map.set(sid, [])
      map.get(sid)!.push(item)
    })
    return map
  }, [items])

  const pixSubtotal = items.reduce(
    (sum, i) => sum + calcPixPrice(i.product.salePrice, settings.pixDiscountPercent) * i.quantity,
    0
  )
  const discount = paymentMethod === 'pix' ? subtotal - pixSubtotal : 0
  const finalSubtotal = paymentMethod === 'pix' ? pixSubtotal : subtotal
  const shippingCost = Object.values(shippingBySeller).reduce((s, v) => s + (v.selected?.price || 0), 0)
  const orderTotal = finalSubtotal + shippingCost

  useEffect(() => {
    if (items.length === 0 && !orderComplete) navigate('/carrinho')
  }, [items, navigate, orderComplete])

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/entrar?redirect=/checkout" replace />
  }

  const handleCepChange = async (cep: string) => {
    const formatted = formatCep(cep)
    setCustomer((prev) => ({ ...prev, address: { ...prev.address, cep: formatted } }))
    const clean = cep.replace(/\D/g, '')
    if (clean.length === 8) {
      setLoadingCep(true)
      const address = await fetchAddressByCep(clean)
      setLoadingCep(false)
      if (address) {
        setCustomer((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            cep: formatted,
            street: address.logradouro,
            neighborhood: address.bairro,
            city: address.localidade,
            state: address.uf,
          },
        }))
      }
    }
  }

  const handleCalculateShipping = async () => {
    const cleanCep = customer.address.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return
    setLoadingShipping(true)
    const result: typeof shippingBySeller = {}

    for (const [sellerId, groupItems] of sellerGroups) {
      const packages = groupItems.map((i) => ({
        weight: i.product.weight * i.quantity,
        length: i.product.length,
        height: i.product.height,
        width: i.product.width,
      }))
      const options = await calculateShipping(settings.originCep, cleanCep, packages)
      result[sellerId] = { options, selected: options[0] || null }
    }
    setShippingBySeller(result)
    setLoadingShipping(false)
  }

  const buildSubOrders = (): SubOrder[] => {
    const subs: SubOrder[] = []
    for (const [sellerId, groupItems] of sellerGroups) {
      const orderItems: OrderItem[] = groupItems.map((i) => ({
        id: generateId(),
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitSalePrice: i.product.salePrice,
        unitSellerPayout: calcSellerPayout(i.product.salePrice, settings.platformFeePercent),
        unitPlatformFee: calcPlatformFee(i.product.salePrice, settings.platformFeePercent),
      }))
      const subSubtotal = groupItems.reduce((s, i) => s + i.product.salePrice * i.quantity, 0)
      const ship = shippingBySeller[sellerId]?.selected
      const shipCost = ship?.price || 0
      subs.push({
        id: generateId(),
        orderId: '',
        sellerId,
        sellerName: groupItems[0].product.sellerName,
        subtotal: subSubtotal,
        sellerPayout: orderItems.reduce((s, i) => s + i.unitSellerPayout * i.quantity, 0),
        platformFee: orderItems.reduce((s, i) => s + i.unitPlatformFee * i.quantity, 0),
        shippingCost: shipCost,
        shipping: ship || undefined,
        status: 'paid',
        escrowStatus: 'held',
        items: orderItems,
        createdAt: new Date().toISOString(),
      })
    }
    return subs
  }

  const handleSubmitOrder = async () => {
    if (!termsAccepted || !profile) return
    const id = generateId()
    const txId = id.slice(0, 25)
    const code =
      paymentMethod === 'pix'
        ? generatePixCode(settings.platformPixKey, orderTotal, settings.platformName, customer.address.city, txId)
        : undefined

    const subOrders = buildSubOrders()
    const order: Order = {
      id,
      buyerId: profile.id,
      subtotal,
      shippingCost,
      discount,
      total: orderTotal,
      paymentMethod,
      status: 'paid',
      pixCode: code,
      shippingAddress: { ...customer.address, name: customer.name, email: customer.email, phone: customer.phone, cpf: customer.cpf },
      subOrders: subOrders.map((s) => ({ ...s, orderId: id })),
      createdAt: new Date().toISOString(),
    }

    await createMarketplaceOrder(order)
    setOrderId(id)
    setPixCode(code || '')
    setTotal(orderTotal)
    setOrderComplete(true)
    clearCart()
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">Pedido Realizado!</h1>
        <p className="mt-2 text-gray-400">Pedido #{orderId.slice(-8).toUpperCase()}</p>
        <div className="card mt-6 p-4 text-left flex items-start gap-3">
          <Shield className="h-6 w-6 text-neon-cyan shrink-0" />
          <p className="text-sm text-gray-400">
            Pagamento em <strong className="text-white">escrow</strong>: o valor ficará retido até você confirmar o recebimento de cada vendedor em Minha Conta.
          </p>
        </div>

        {paymentMethod === 'pix' && pixCode && (
          <div className="card mt-6 p-6 text-left">
            <h2 className="font-semibold text-white mb-2">Pague com PIX</h2>
            <p className="text-sm text-gray-500 mb-4">Total: {formatCurrency(total)}</p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code PIX"
                className="rounded-xl border border-surface-600"
                width={200}
                height={200}
              />
            </div>
            <div className="relative">
              <textarea readOnly value={pixCode} className="input-field text-xs font-mono h-24 resize-none" />
              <button onClick={copyPixCode} className="absolute right-2 top-2 btn-primary py-2 px-3 text-xs">
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <Link to="/minha-conta" className="btn-primary mt-8 inline-flex">Acompanhar pedido</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Checkout Seguro</h1>
      <p className="text-gray-400 mb-8 flex items-center gap-2"><Shield className="h-4 w-4 text-neon-cyan" /> Pagamento protegido em escrow</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-white mb-6">Dados de entrega</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-300">Nome</label>
                  <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Telefone</label>
                  <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">CPF</label>
                  <input value={customer.cpf} onChange={(e) => setCustomer({ ...customer, cpf: formatCpf(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">CEP</label>
                  <div className="relative">
                    <input value={customer.address.cep} onChange={(e) => handleCepChange(e.target.value)} className="input-field" required />
                    {loadingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neon-cyan" />}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <input value={customer.address.street} onChange={(e) => setCustomer({ ...customer, address: { ...customer.address, street: e.target.value } })} className="input-field" placeholder="Rua" />
                </div>
                <div>
                  <input value={customer.address.number} onChange={(e) => setCustomer({ ...customer, address: { ...customer.address, number: e.target.value } })} className="input-field" placeholder="Número" />
                </div>
                <div>
                  <input value={customer.address.neighborhood} onChange={(e) => setCustomer({ ...customer, address: { ...customer.address, neighborhood: e.target.value } })} className="input-field" placeholder="Bairro" />
                </div>
              </div>
              <button onClick={() => { setStep(2); handleCalculateShipping() }} disabled={!customer.name || !customer.address.cep} className="btn-primary mt-6">
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6"><Truck className="h-5 w-5 text-neon-cyan" /><h2 className="font-semibold text-white">Frete por vendedor</h2></div>
              {loadingShipping ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-neon-cyan" /></div>
              ) : (
                Array.from(sellerGroups.entries()).map(([sellerId, groupItems]) => {
                  const sellerName = groupItems[0].product.sellerName || 'Vendedor'
                  const ship = shippingBySeller[sellerId]
                  return (
                    <div key={sellerId} className="mb-6 border-b border-surface-600 pb-6 last:border-0">
                      <p className="text-sm font-medium text-white flex items-center gap-2 mb-3"><Store className="h-4 w-4" /> {sellerName}</p>
                      {ship?.options.map((opt) => (
                        <label key={opt.code} className={`flex items-center gap-4 p-3 rounded-xl border mb-2 cursor-pointer ${ship.selected?.code === opt.code ? 'border-brand-500 bg-brand-500/10' : 'border-surface-600'}`}>
                          <input type="radio" checked={ship.selected?.code === opt.code} onChange={() => setShippingBySeller({ ...shippingBySeller, [sellerId]: { ...ship, selected: opt } })} />
                          <div className="flex-1"><p className="text-sm text-white">{opt.service}</p><p className="text-xs text-gray-500">{opt.deliveryDays} dias úteis</p></div>
                          <span className="font-bold text-white">{formatCurrency(opt.price)}</span>
                        </label>
                      ))}
                    </div>
                  )
                })
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary">Voltar</button>
                <button onClick={() => setStep(3)} disabled={Object.values(shippingBySeller).some((s) => !s.selected)} className="btn-primary">Pagamento</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6"><CreditCard className="h-5 w-5 text-neon-cyan" /><h2 className="font-semibold text-white">Pagamento</h2></div>
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer mb-4 ${paymentMethod === 'pix' ? 'border-green-500 bg-green-500/10' : 'border-surface-600'}`}>
                <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                <div><p className="font-semibold text-white">PIX (-{settings.pixDiscountPercent}%)</p><p className="text-sm text-green-400">Economize {formatCurrency(discount)}</p></div>
              </label>
              <label className="flex items-start gap-2 text-xs text-gray-400 mb-6">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
                <span>Aceito o <Link to="/legal/contrato-comprador" className="text-neon-cyan">Contrato do Comprador</Link> e entendo que o pagamento ficará em escrow até confirmação.</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">Voltar</button>
                <button onClick={handleSubmitOrder} disabled={!termsAccepted} className="btn-primary flex-1">Finalizar compra</button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-white mb-4">Resumo</h2>
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3 mb-3 text-sm">
              <img src={item.product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">{item.product.sellerName}</p>
              </div>
              <p>{formatCurrency(item.product.salePrice * item.quantity)}</p>
            </div>
          ))}
          <div className="border-t border-surface-600 pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatCurrency(finalSubtotal)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Frete</span><span>{formatCurrency(shippingCost)}</span></div>
            <div className="flex justify-between font-bold text-lg text-white pt-2"><span>Total</span><span className="text-neon-cyan">{formatCurrency(orderTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
