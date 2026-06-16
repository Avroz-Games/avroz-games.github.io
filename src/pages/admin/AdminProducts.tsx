import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as mp from '../../services/marketplace'
import type { Product } from '../../types'
import { formatCurrency } from '../../types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mp.fetchAllProducts().then((p) => { setProducts(p); setLoading(false) })
  }, [])

  const toggleActive = async (p: Product) => {
    const settings = await mp.fetchSettings()
    await mp.updateProduct(p.id, { active: !p.active }, settings.platformFeePercent)
    setProducts(await mp.fetchAllProducts())
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-white">Produtos do Marketplace</h1>
      <p className="text-gray-400 mt-1">Visualização e moderação — vendedores gerenciam seus próprios produtos</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Carregando...</p>
      ) : (
        <div className="mt-8 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-700 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Preço</th>
                <th className="px-4 py-3 text-left">Estoque</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-surface-600">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.sellerName || p.sellerId}</td>
                  <td className="px-4 py-3 text-neon-cyan">{formatCurrency(p.salePrice)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(p)} className="text-xs text-gray-400 hover:text-neon-cyan">
                      {p.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="p-8 text-center text-gray-500">Nenhum produto</p>}
        </div>
      )}
    </AdminLayout>
  )
}
