import { Link, Navigate } from 'react-router-dom'
import { Package, ShoppingBag, CheckCircle, Truck, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import * as mp from '../../services/marketplace'
import type { Order } from '../../types'
import { formatCurrency } from '../../types'

const statusLabel: Record<string, string> = {
  paid: 'Pago', processing: 'Preparando', shipped: 'Enviado',
  delivered: 'Entregue', buyer_confirmed: 'Confirmado', payout_released: 'Finalizado',
}

export default function MyAccount() {
  const { profile, isAuthenticated, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (profile) mp.fetchBuyerOrders(profile.id).then(setOrders)
  }, [profile])

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/entrar" replace />

  const confirmReceipt = async (subOrderId: string) => {
    await mp.confirmReceipt(subOrderId)
    if (profile) setOrders(await mp.fetchBuyerOrders(profile.id))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="section-title mb-2">Minha Conta</h1>
      <p className="text-gray-400 mb-8">Olá, {profile?.fullName}</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { icon: ShoppingBag, label: 'Pedidos', value: orders.length },
          { icon: Shield, label: 'Escrow', value: 'Protegido' },
          { icon: Package, label: 'E-mail', value: profile?.email || '' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <s.icon className="h-8 w-8 text-neon-cyan" />
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="font-semibold text-white text-sm truncate">{s.value}</p></div>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-white mb-4">Meus Pedidos</h2>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <p>Nenhum pedido ainda.</p>
          <Link to="/produtos" className="btn-primary mt-4 inline-flex">Comprar agora</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between mb-4">
                <span className="font-semibold text-white">#{order.id.slice(-8).toUpperCase()}</span>
                <span className="font-bold text-neon-cyan">{formatCurrency(order.total)}</span>
              </div>
              {order.subOrders.map((sub) => (
                <div key={sub.id} className="border-t border-surface-600 pt-4 mt-4">
                  <div className="flex flex-wrap justify-between gap-2 mb-2">
                    <span className="text-sm text-gray-300">Vendedor: {sub.sellerName || sub.sellerId}</span>
                    <span className="badge bg-brand-500/15 text-neon-cyan">{statusLabel[sub.status] || sub.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Escrow: {sub.escrowStatus === 'held' ? '🔒 Valor retido até confirmação' : '✅ Repasse liberado'}
                  </p>
                  {sub.trackingCode && (
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Truck className="h-3 w-3" /> Rastreio: {sub.trackingCode}</p>
                  )}
                  {sub.status === 'shipped' && sub.escrowStatus === 'held' && (
                    <button onClick={() => confirmReceipt(sub.id)} className="btn-primary mt-3 py-2 text-xs">
                      <CheckCircle className="h-4 w-4" /> Confirmar recebimento
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
