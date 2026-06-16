import { Link, Navigate } from 'react-router-dom'
import { Package, ShoppingBag, DollarSign, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import * as mp from '../../services/marketplace'
import type { SubOrder, Product } from '../../types'
import { formatCurrency } from '../../types'

export default function SellerDashboard() {
  const { profile, seller, loading } = useAuth()
  const [orders, setOrders] = useState<SubOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (seller) {
      mp.fetchSellerSubOrders(seller.id).then(setOrders)
      mp.fetchSellerProducts(seller.id).then(setProducts)
    }
  }, [seller])

  if (loading) return null
  if (!profile) return <Navigate to="/entrar" replace />
  if (!seller) return <Navigate to="/vendedor/cadastro" replace />
  if (seller.status !== 'approved') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Store className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white">Aguardando aprovação</h1>
        <p className="text-gray-400 mt-2">Sua loja "{seller.storeName}" está em análise pela equipe Avroz Games.</p>
      </div>
    )
  }

  const heldEscrow = orders.filter((o) => o.escrowStatus === 'held').reduce((s, o) => s + o.sellerPayout, 0)
  const released = orders.filter((o) => o.escrowStatus === 'released').reduce((s, o) => s + o.sellerPayout, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">{seller.storeName}</h1>
          <p className="text-gray-400">Painel do vendedor</p>
        </div>
        <div className="flex gap-2">
          <Link to="/vendedor/produtos" className="btn-primary py-2 text-sm">Produtos</Link>
          <Link to="/vendedor/pedidos" className="btn-secondary py-2 text-sm">Pedidos</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { icon: Package, label: 'Produtos', value: products.length },
          { icon: ShoppingBag, label: 'Pedidos', value: orders.length },
          { icon: DollarSign, label: 'Em escrow', value: formatCurrency(heldEscrow) },
          { icon: DollarSign, label: 'Liberado', value: formatCurrency(released) },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <s.icon className="h-8 w-8 text-neon-cyan" />
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="font-bold text-white">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Como funciona o escrow</h2>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>O comprador paga pela plataforma Avroz Games</li>
          <li>O valor fica retido até a confirmação de recebimento</li>
          <li>Após confirmação, repassamos seu valor (menos 25% de comissão) via PIX</li>
          <li>Liberação automática após 7 dias se o comprador não contestar</li>
        </ol>
      </div>
    </div>
  )
}
