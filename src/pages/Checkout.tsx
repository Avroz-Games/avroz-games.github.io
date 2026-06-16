import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck, CreditCard, Copy, Check, Loader2, MapPin } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency, calculatePixPrice, generateId } from '../services/storage'
import { createOrder } from '../services/api'
import { fetchAddressByCep, formatCep, formatCpf, formatPhone } from '../services/viacep'
import { calculateShipping, generatePixCode } from '../services/shipping'
import type { ShippingOption, CustomerInfo, Order } from '../types'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { settings } = useProducts()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [orderComplete, setOrderComplete] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [orderId, setOrderId] = useState('')

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  const pixSubtotal = items.reduce(
    (sum, i) => sum + calculatePixPrice(i.product.salePrice, settings.pixDiscountPercent) * i.quantity,
    0
  )
  const discount = paymentMethod === 'pix' ? subtotal - pixSubtotal : 0
  const finalSubtotal = paymentMethod === 'pix' ? pixSubtotal : subtotal
  const shippingCost = selectedShipping?.price || 0
  const total = finalSubtotal + shippingCost

  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/carrinho')
    }
  }, [items, navigate, orderComplete])

  const handleCepChange = async (cep: string) => {
    const formatted = formatCep(cep)
    setCustomer((prev) => ({
      ...prev,
      address: { ...prev.address, cep: formatted },
    }))

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
    const packages = items.map((i) => ({
      weight: i.product.weight * i.quantity,
      length: i.product.length,
      height: i.product.height,
      width: i.product.width,
    }))

    const options = await calculateShipping(settings.originCep, cleanCep, packages)
    setShippingOptions(options)
    setSelectedShipping(options[0] || null)
    setLoadingShipping(false)
  }

  const handleSubmitOrder = async () => {
    const id = generateId()
    const txId = id.slice(0, 25)
    const code =
      paymentMethod === 'pix'
        ? generatePixCode(settings.pixKey, total, settings.storeName, customer.address.city, txId)
        : undefined

    const order: Order = {
      id,
      items,
      customer,
      shipping: selectedShipping!,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      status: 'pending',
      pixCode: code,
      createdAt: new Date().toISOString(),
    }

    await createOrder(order)
    setOrderId(id)
    setPixCode(code || '')
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Pedido Realizado!</h1>
        <p className="mt-2 text-gray-500">Pedido #{orderId.slice(-8).toUpperCase()}</p>

        {paymentMethod === 'pix' && pixCode && (
          <div className="card mt-8 p-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-2">Pague com PIX</h2>
            <p className="text-sm text-gray-500 mb-4">
              Escaneie o QR Code ou copie o código abaixo. Total: {formatCurrency(total)}
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code PIX"
                className="rounded-xl border border-gray-100"
                width={200}
                height={200}
              />
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={pixCode}
                className="input-field text-xs font-mono h-24 resize-none"
              />
              <button
                onClick={copyPixCode}
                className="absolute right-2 top-2 btn-primary py-2 px-3 text-xs"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Chave PIX: {settings.pixKey}
            </p>
          </div>
        )}

        <Link to="/" className="btn-primary mt-8 inline-flex">
          Voltar à Loja
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Dados', 'Frete', 'Pagamento'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step > i + 1
                  ? 'bg-green-500 text-white'
                  : step === i + 1
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${step === i + 1 ? 'font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
            {i < 2 && <div className="h-px w-8 sm:w-16 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Customer data */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-gray-900 mb-6">Dados Pessoais</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={customer.cpf}
                    onChange={(e) => setCustomer({ ...customer, cpf: formatCpf(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customer.address.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="input-field"
                      placeholder="00000-000"
                      required
                    />
                    {loadingCep && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-600" />
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                  <input
                    type="text"
                    value={customer.address.street}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: { ...customer.address, street: e.target.value } })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={customer.address.number}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: { ...customer.address, number: e.target.value } })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={customer.address.complement}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: { ...customer.address, complement: e.target.value } })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={customer.address.neighborhood}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: { ...customer.address, neighborhood: e.target.value } })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={`${customer.address.city}${customer.address.state ? ` - ${customer.address.state}` : ''}`}
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(2)
                  handleCalculateShipping()
                }}
                disabled={!customer.name || !customer.email || !customer.address.cep}
                className="btn-primary mt-6"
              >
                Continuar para Frete
              </button>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="h-5 w-5 text-brand-600" />
                <h2 className="font-semibold text-gray-900">Frete via Correios</h2>
              </div>

              <div className="flex items-start gap-2 p-4 rounded-xl bg-gray-50 mb-6">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-gray-500">
                    {customer.address.street}, {customer.address.number}
                    {customer.address.complement && ` - ${customer.address.complement}`}
                  </p>
                  <p className="text-gray-500">
                    {customer.address.neighborhood} - {customer.address.city}/{customer.address.state} - CEP{' '}
                    {customer.address.cep}
                  </p>
                </div>
              </div>

              {loadingShipping ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                  <span className="ml-3 text-gray-500">Calculando frete...</span>
                </div>
              ) : shippingOptions.length > 0 ? (
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.code}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedShipping?.code === option.code
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.code === option.code}
                        onChange={() => setSelectedShipping(option)}
                        className="text-brand-600"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{option.service}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(option.price)}</p>
                        <p className="text-xs text-gray-500">
                          {option.deliveryDays} dia(s) úteis
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Não foi possível calcular o frete.</p>
                  <button onClick={handleCalculateShipping} className="btn-secondary mt-4">
                    Tentar novamente
                  </button>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedShipping}
                  className="btn-primary"
                >
                  Continuar para Pagamento
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-brand-600" />
                <h2 className="font-semibold text-gray-900">Forma de Pagamento</h2>
              </div>

              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">PIX</p>
                    <p className="text-sm text-green-600 font-medium">
                      10% de desconto — Economize {formatCurrency(discount)}
                    </p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">Recomendado</span>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-brand-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                    <p className="text-sm text-gray-500">Em breve — use PIX por enquanto</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Voltar
                </button>
                <button onClick={handleSubmitOrder} className="btn-primary flex-1">
                  {paymentMethod === 'pix' ? 'Gerar PIX e Finalizar' : 'Finalizar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.product.salePrice * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {paymentMethod === 'pix' && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto PIX</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Frete</span>
                <span>{selectedShipping ? formatCurrency(shippingCost) : '—'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
