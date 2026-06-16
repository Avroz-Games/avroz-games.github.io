import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import * as mp from '../../services/marketplace'
import type { SubOrder } from '../../types'
import { formatCurrency } from '../../types'

const statusOptions = [
  { value: 'processing', label: 'Preparando envio' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
]

export default function SellerOrders() {
  const { seller, isSeller, loading } = useAuth()
  const [orders, setOrders] = useState<SubOrder[]>([])
  const [tracking, setTracking] = useState<Record<string, string>>({})

  useEffect(() => {
    if (seller) mp.fetchSellerSubOrders(seller.id).then(setOrders)
  }, [seller])

  if (loading) return null
  if (!isSeller || !seller) return <Navigate to="/vendedor" replace />

  const updateStatus = async (id: string, status: string) => {
    await mp.updateSubOrderStatus(id, status, tracking[id])
    if (seller) setOrders(await mp.fetchSellerSubOrders(seller.id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/vendedor" className="text-sm text-gray-500 hover:text-neon-cyan">← Painel</Link>
      <h1 className="section-title mt-2 mb-8">Pedidos da loja</h1>

      {orders.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">Nenhum pedido ainda</div>
      ) : (
        <div className="space-y-4">
          {orders.map((sub) => (
            <div key={sub.id} className="card p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <span className="font-semibold text-white">#{sub.id.slice(-8).toUpperCase()}</span>
                <span className="text-neon-cyan font-bold">{formatCurrency(sub.sellerPayout)}</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Escrow: {sub.escrowStatus === 'held' ? '🔒 Retido' : '✅ Liberado'} · Status: {sub.status}
              </p>
              <ul className="text-sm text-gray-300 mb-4">
                {sub.items.map((i) => (
                  <li key={i.id}>{i.quantity}x {i.productName}</li>
                ))}
              </ul>
              {sub.status !== 'buyer_confirmed' && sub.status !== 'payout_released' && (
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-xs text-gray-500">Código de rastreio</label>
                    <input
                      value={tracking[sub.id] || sub.trackingCode || ''}
                      onChange={(e) => setTracking({ ...tracking, [sub.id]: e.target.value })}
                      className="input-field py-2 text-sm"
                      placeholder="BR123456789BR"
                    />
                  </div>
                  {statusOptions.map((opt) => (
                    <button key={opt.value} onClick={() => updateStatus(sub.id, opt.value)} className="btn-secondary py-2 text-xs">
                      <Truck className="h-3 w-3" /> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
