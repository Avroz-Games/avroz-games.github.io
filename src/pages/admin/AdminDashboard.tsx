import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useProducts } from '../../context/ProductContext'
import { getOrders, formatCurrency } from '../../services/storage'

export default function AdminDashboard() {
  const { products } = useProducts()
  const orders = getOrders()

  const activeProducts = products.filter((p) => p.active).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalRevenue = orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0)
  const pendingOrders = orders.filter((o: { status: string }) => o.status === 'pending').length

  const stats = [
    { label: 'Produtos Ativos', value: activeProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Total em Estoque', value: totalStock, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Pedidos', value: orders.length, icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-amber-500' },
  ]

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Visão geral da loja</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingOrders > 0 && (
          <div className="mt-6 card p-4 border-l-4 border-l-amber-500">
            <p className="text-sm font-medium text-amber-800">
              {pendingOrders} pedido(s) aguardando pagamento
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Produtos Recentes</h2>
            <div className="space-y-3">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">Estoque: {p.stock}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(p.salePrice)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pedidos Recentes</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum pedido ainda</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o: { id: string; customer: { name: string }; total: number; status: string; createdAt: string }) => (
                  <div key={o.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.customer.name}</p>
                      <p className="text-xs text-gray-500">
                        #{o.id.slice(-8).toUpperCase()} — {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(o.total)}</p>
                      <span className={`text-xs badge ${
                        o.status === 'paid' ? 'bg-green-100 text-green-700' :
                        o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {o.status === 'pending' ? 'Pendente' : o.status === 'paid' ? 'Pago' : o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
