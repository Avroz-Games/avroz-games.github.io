import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Store, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import * as mp from '../../services/marketplace'

export default function SellerRegister() {
  const { profile, seller, refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    storeName: '',
    storeSlug: '',
    description: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    documentNumber: '',
    pixKey: '',
    pixKeyType: 'email',
    contractAccepted: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Faça login para cadastrar sua loja</p>
        <Link to="/entrar" className="btn-primary">Entrar</Link>
      </div>
    )
  }

  if (seller) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Store className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">{seller.storeName}</h1>
        <p className="text-gray-400 mb-4">
          Status: {seller.status === 'approved' ? '✅ Aprovado' : seller.status === 'pending' ? '⏳ Aguardando aprovação' : '❌ ' + seller.status}
        </p>
        {seller.status === 'approved' && (
          <Link to="/vendedor" className="btn-primary">Ir ao painel</Link>
        )}
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contractAccepted) { setError('Aceite o contrato do vendedor'); return }
    setLoading(true)
    try {
      const slug = form.storeSlug || form.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await mp.registerSeller({ ...form, storeSlug: slug })
      await refresh()
      navigate('/vendedor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="section-title mb-2">Cadastrar Loja</h1>
      <p className="text-gray-400 mb-8">Venda no marketplace com proteção de pagamento em escrow</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nome da loja</label>
          <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Descrição</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-24" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Documento</label>
            <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value as 'cpf' | 'cnpj' })} className="input-field">
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Número</label>
            <input value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Chave PIX para recebimentos</label>
          <input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} className="input-field" required />
        </div>
        <label className="flex items-start gap-2 text-xs text-gray-400">
          <input type="checkbox" checked={form.contractAccepted} onChange={(e) => setForm({ ...form, contractAccepted: e.target.checked })} className="mt-0.5" />
          <span>Aceito o <Link to="/legal/contrato-vendedor" className="text-neon-cyan">Contrato do Vendedor</Link> e autorizo a Avroz Games a reter 25% de comissão sobre vendas.</span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar cadastro'}
        </button>
      </form>
    </div>
  )
}
