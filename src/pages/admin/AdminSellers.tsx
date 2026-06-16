import { useEffect, useState } from 'react'
import { Check, X, Store } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as mp from '../../services/marketplace'
import type { Seller } from '../../types'

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setSellers(await mp.fetchAllSellers())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: Seller['status'], reason?: string) => {
    await mp.updateSellerStatus(id, status, reason)
    await load()
  }

  const statusBadge = (s: Seller['status']) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-500/15 text-amber-400',
      approved: 'bg-green-500/15 text-green-400',
      rejected: 'bg-red-500/15 text-red-400',
      suspended: 'bg-gray-500/15 text-gray-400',
    }
    return map[s] || map.pending
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-white">Vendedores</h1>
      <p className="text-gray-400 mt-1">{sellers.length} cadastro(s)</p>

      {loading ? (
        <p className="mt-8 text-gray-500">Carregando...</p>
      ) : (
        <div className="mt-8 space-y-4">
          {sellers.map((s) => (
            <div key={s.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Store className="h-8 w-8 text-neon-cyan" />
                  <div>
                    <h3 className="font-semibold text-white">{s.storeName}</h3>
                    <p className="text-sm text-gray-500">{s.documentType.toUpperCase()}: {s.documentNumber}</p>
                    <p className="text-xs text-gray-500">PIX: {s.pixKey}</p>
                  </div>
                </div>
                <span className={`badge ${statusBadge(s.status)}`}>{s.status}</span>
              </div>
              {s.description && <p className="text-sm text-gray-400 mt-3">{s.description}</p>}
              {s.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleStatus(s.id, 'approved')} className="btn-primary py-2 text-xs">
                    <Check className="h-4 w-4" /> Aprovar
                  </button>
                  <button onClick={() => handleStatus(s.id, 'rejected', 'Documentação incompleta')} className="btn-secondary py-2 text-xs text-red-400">
                    <X className="h-4 w-4" /> Rejeitar
                  </button>
                </div>
              )}
              {s.status === 'approved' && (
                <button onClick={() => handleStatus(s.id, 'suspended', 'Suspensão administrativa')} className="mt-4 text-xs text-red-400 hover:underline">
                  Suspender vendedor
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
