import { useEffect, useState } from 'react'
import { Package, ShoppingBag, DollarSign, Users, Shield } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useMarketplace } from '../../context/MarketplaceContext'
import * as mp from '../../services/marketplace'
import { formatCurrency } from '../../types'

export default function AdminDashboard() {
  const { products } = useMarketplace()
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof mp.fetchAllOrders>>>([])
  const [sellers, setSellers] = useState<Awaited<ReturnType<typeof mp.fetchAllSellers>>>([])

  useEffect(() => {
    Promise.all([mp.fetchAllOrders(), mp.fetchAllSellers()]).then(([o, s]) => {
      setOrders(o)
      setSellers(s)
    })
  }, [])

  const escrowHeld = orders.flatMap((o) => o.subOrders).filter((s) => s.escrowStatus === 'held').reduce((sum, s) => sum + s.sellerPayout + s.platformFee, 0)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingSellers = sellers.filter((s) => s.status === 'pending').length

  const stats = [
    { label: 'Produtos', value: products.length, icon: Package },
    { label: 'Pedidos', value: orders.length, icon: ShoppingBag },
    { label: 'Vendedores', value: sellers.length, icon: Users },
    { label: 'Em Escrow', value: formatCurrency(escrowHeld), icon: Shield },
    { label: 'Volume Total', value: formatCurrency(totalRevenue), icon: DollarSign },
  ]

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-white">Dashboard Marketplace</h1>
      <p className="text-gray-400 mt-1">Visão geral da intermediação</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <stat.icon className="h-6 w-6 text-neon-cyan mb-2" />
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {pendingSellers > 0 && (
        <div className="mt-6 card p-4 border-l-4 border-l-amber-500">
          <p className="text-sm text-amber-400">{pendingSellers} vendedor(es) aguardando aprovação</p>
        </div>
      )}

      <div className="mt-8 card p-6">
        <h2 className="font-semibold text-white mb-4">Pedidos recentes</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum pedido</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <span className="text-gray-300">#{o.id.slice(-8).toUpperCase()} · {o.subOrders.length} vendedor(es)</span>
                <span className="text-neon-cyan font-semibold">{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
