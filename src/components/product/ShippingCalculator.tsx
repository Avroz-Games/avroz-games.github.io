import { useState } from 'react'
import { Truck, Loader2, MapPin } from 'lucide-react'
import { calculateShipping } from '../../services/shipping'
import { formatCurrency } from '../../services/storage'
import { formatCep } from '../../services/viacep'
import type { Product, ShippingOption } from '../../types'

interface ShippingCalculatorProps {
  product: Product
  quantity?: number
  originCep: string
}

export default function ShippingCalculator({
  product,
  quantity = 1,
  originCep,
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [calculated, setCalculated] = useState(false)

  const handleCalculate = async () => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return

    setLoading(true)
    setCalculated(false)
    const packages = [{
      weight: product.weight * quantity,
      length: product.length,
      height: product.height,
      width: product.width,
    }]
    const result = await calculateShipping(originCep, clean, packages)
    setOptions(result)
    setCalculated(true)
    setLoading(false)
  }

  return (
    <div className="mt-6 rounded-2xl border border-surface-600 bg-surface-700/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-neon-cyan" />
        <h3 className="font-semibold text-white">Simular Frete (Correios)</h3>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            placeholder="Digite seu CEP"
            className="input-field pl-10"
            maxLength={9}
          />
        </div>
        <button
          onClick={handleCalculate}
          disabled={cep.replace(/\D/g, '').length !== 8 || loading}
          className="btn-primary px-5 shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
        </button>
      </div>

      {calculated && options.length > 0 && (
        <div className="mt-4 space-y-2 animate-fade-in">
          {options.map((opt) => (
            <div
              key={opt.code}
              className="flex items-center justify-between rounded-xl bg-surface-800 px-4 py-3 ring-1 ring-surface-600"
            >
              <div>
                <p className="text-sm font-semibold text-white">{opt.service}</p>
                <p className="text-xs text-gray-400">{opt.deliveryDays} dia(s) úteis</p>
              </div>
              <p className="font-bold text-neon-cyan">{formatCurrency(opt.price)}</p>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-2">
            Valores estimados via Correios. Frete final confirmado no checkout.
          </p>
        </div>
      )}

      {calculated && options.length === 0 && (
        <p className="mt-3 text-sm text-amber-400">Não foi possível calcular. Tente novamente.</p>
      )}
    </div>
  )
}
