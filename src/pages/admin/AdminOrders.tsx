import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as mp from '../../services/marketplace'
import type { Order } from '../../types'
import { formatCurrency } from '../../types'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mp.fetchAllOrders().then((o) => { setOrders(o); setLoading(false) })
  }, [])

  const escrowLabel: Record<string, string> = {
    held: 'Retido',
    released: 'Liberado',
    pending: 'Pendente',
    refunded: 'Reembolsado',
    disputed: 'Em disputa',
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-white">Pedidos & Escrow</h1>
      <p className="text-gray-400 mt-1">{orders.length} pedido(s)</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Carregando...</p>
      ) : orders.length === 0 ? (
        <div className="card mt-8 p-8 text-center text-gray-500">Nenhum pedido</div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div>
                  <span className="font-semibold text-white">#{order.id.slice(-8).toUpperCase()}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.shippingAddress.name} · {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-lg font-bold text-neon-cyan">{formatCurrency(order.total)}</span>
              </div>
              {order.subOrders.map((sub) => (
                <div key={sub.id} className="border-t border-surface-600 pt-4 mt-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-gray-300">Vendedor: {sub.sellerName || sub.sellerId}</span>
                    <span className="badge bg-brand-500/15 text-neon-cyan">Escrow: {escrowLabel[sub.escrowStatus] || sub.escrowStatus}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Repasse vendedor: {formatCurrency(sub.sellerPayout)}</span>
                    <span>Comissão (25%): {formatCurrency(sub.platformFee)}</span>
                    <span>Status: {sub.status}</span>
                    {sub.trackingCode && <span>Rastreio: {sub.trackingCode}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
