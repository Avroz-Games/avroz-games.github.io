import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchOrders, updateOrderStatusApi } from '../../services/api'
import { formatCurrency } from '../../services/storage'
import type { Order } from '../../types'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    setLoading(true)
    setOrders(await fetchOrders())
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatusApi(orderId, status)
    setOrders(await fetchOrders())
  }

  const statusLabels: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pendente', class: 'bg-amber-500/15 text-amber-400' },
    paid: { label: 'Pago', class: 'bg-green-500/15 text-green-400' },
    shipped: { label: 'Enviado', class: 'bg-blue-500/15 text-blue-400' },
    delivered: { label: 'Entregue', class: 'bg-green-500/15 text-green-400' },
    cancelled: { label: 'Cancelado', class: 'bg-red-500/15 text-red-400' },
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Pedidos</h1>
        <p className="mt-1 text-gray-400">{orders.length} pedido(s)</p>

        {loading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <p className="text-gray-400">Nenhum pedido registrado ainda.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className={`badge border-0 cursor-pointer ${statusLabels[order.status]?.class || 'bg-gray-500/15 text-gray-400'}`}
                  >
                    {Object.entries(statusLabels).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Cliente</p>
                    <p className="text-sm font-medium text-white">{order.customer.name}</p>
                    <p className="text-sm text-gray-400">{order.customer.email}</p>
                    <p className="text-sm text-gray-400">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Entrega</p>
                    <p className="text-sm text-gray-300">
                      {order.customer.address.street}, {order.customer.address.number}
                    </p>
                    <p className="text-sm text-gray-400">
                      {order.customer.address.city}/{order.customer.address.state} — CEP {order.customer.address.cep}
                    </p>
                    <p className="text-sm mt-1 text-gray-300">
                      {order.shipping.service} — {order.shipping.deliveryDays} dia(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Pagamento</p>
                    <p className="text-sm font-medium uppercase text-white">{order.paymentMethod}</p>
                    <p className="text-lg font-bold text-neon-cyan mt-1">{formatCurrency(order.total)}</p>
                    {order.discount > 0 && (
                      <p className="text-xs text-brand-400">Desconto PIX: -{formatCurrency(order.discount)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-surface-600 pt-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Itens</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 text-sm">
                        <img src={item.product.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                        <span className="flex-1 text-gray-300">{item.product.name} x{item.quantity}</span>
                        <span className="font-medium text-white">{formatCurrency(item.product.salePrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
