import { useState, useEffect } from 'react'
import { Save, Cloud, HardDrive, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useProducts } from '../../context/ProductContext'
import { useAuth } from '../../context/AuthContext'
import { formatCep } from '../../services/viacep'
import { testSupabaseConnection } from '../../services/api'
import type { StoreSettings } from '../../types'

export default function AdminSettings() {
  const { settings, updateSettings, backendMode } = useProducts()
  const { isAdmin } = useAuth()
  const [form, setForm] = useState<StoreSettings>(settings)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connection, setConnection] = useState<Awaited<ReturnType<typeof testSupabaseConnection>> | null>(null)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const runConnectionTest = async () => {
    setTesting(true)
    setConnection(await testSupabaseConnection())
    setTesting(false)
  }

  useEffect(() => {
    runConnectionTest()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Configurações</h1>
        <p className="mt-1 text-gray-400">Configure sua loja, margens e pagamentos</p>

        {/* Status do backend */}
        <div className="mt-8 card p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              {backendMode === 'supabase' ? <Cloud className="h-5 w-5 text-neon-cyan" /> : <HardDrive className="h-5 w-5 text-gray-400" />}
              Status do Backend
            </h2>
            <button type="button" onClick={runConnectionTest} disabled={testing} className="btn-secondary py-2 px-3 text-xs">
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Testar
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-surface-700/50 px-4 py-3">
              <span className="text-gray-400">Modo</span>
              <span className="font-medium text-white">
                {backendMode === 'supabase' ? 'Supabase (nuvem)' : 'Local (localStorage)'}
              </span>
            </div>

            {connection && backendMode === 'supabase' && (
              <>
                <div className="flex items-center justify-between rounded-xl bg-surface-700/50 px-4 py-3">
                  <span className="text-gray-400">Conexão</span>
                  <span className={`flex items-center gap-1 font-medium ${connection.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {connection.connected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {connection.connected ? 'Conectado' : 'Erro'}
                  </span>
                </div>
                {connection.connected && (
                  <div className="flex items-center justify-between rounded-xl bg-surface-700/50 px-4 py-3">
                    <span className="text-gray-400">Produtos no banco</span>
                    <span className="font-medium text-white">{connection.productsCount}</span>
                  </div>
                )}
                {connection.error && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{connection.error}</p>
                )}
              </>
            )}

            {backendMode === 'local' && (
              <p className="text-xs text-gray-500">
                Para ativar Supabase, crie um arquivo <code className="text-neon-cyan">.env</code> com{' '}
                <code className="text-neon-cyan">VITE_SUPABASE_URL</code> e{' '}
                <code className="text-neon-cyan">VITE_SUPABASE_ANON_KEY</code>, depois reinicie o servidor.
              </p>
            )}

            {backendMode === 'supabase' && isAdmin && (
              <p className="text-xs text-gray-500">
                Login admin via e-mail/senha do Supabase Auth. Produtos e pedidos são salvos na nuvem.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 max-w-2xl space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Informações da Loja</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Loja</label>
                <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                <textarea value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} className="input-field h-20 resize-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                  <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field" placeholder="5511999999999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Preços & Margens</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Margem de Venda (%)</label>
                <input type="number" min="0" max="200" value={form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: parseFloat(e.target.value) || 0 })} className="input-field" />
                <p className="text-xs text-gray-500 mt-1">Preço de venda = custo + {form.marginPercent}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Desconto PIX (%)</label>
                <input type="number" min="0" max="50" value={form.pixDiscountPercent} onChange={(e) => setForm({ ...form, pixDiscountPercent: parseFloat(e.target.value) || 0 })} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Pagamento PIX</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chave PIX</label>
                <input type="text" value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo da Chave</label>
                <select value={form.pixKeyType} onChange={(e) => setForm({ ...form, pixKeyType: e.target.value as StoreSettings['pixKeyType'] })} className="input-field">
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-white mb-4">Frete (Correios)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CEP de Origem</label>
              <input
                type="text"
                value={form.originCep}
                onChange={(e) => setForm({ ...form, originCep: formatCep(e.target.value) })}
                className="input-field"
                placeholder="00000-000"
              />
              <p className="text-xs text-gray-500 mt-1">CEP de onde os produtos serão enviados</p>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" />
            {saved ? 'Salvo!' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
