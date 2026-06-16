import { useState } from 'react'
import { Save } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useProducts } from '../../context/ProductContext'
import { formatCep } from '../../services/viacep'
import type { StoreSettings } from '../../types'

export default function AdminSettings() {
  const { settings, updateSettings } = useProducts()
  const [form, setForm] = useState<StoreSettings>(settings)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-gray-500">Configure sua loja, margens e pagamentos</p>

        <form onSubmit={handleSave} className="mt-8 max-w-2xl space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informações da Loja</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} className="input-field h-20 resize-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field" placeholder="5511999999999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Preços & Margens</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Margem de Venda (%)</label>
                <input type="number" min="0" max="200" value={form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: parseFloat(e.target.value) || 0 })} className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Preço de venda = custo + {form.marginPercent}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto PIX (%)</label>
                <input type="number" min="0" max="50" value={form.pixDiscountPercent} onChange={(e) => setForm({ ...form, pixDiscountPercent: parseFloat(e.target.value) || 0 })} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pagamento PIX</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                <input type="text" value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo da Chave</label>
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
            <h2 className="font-semibold text-gray-900 mb-4">Frete (Correios)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP de Origem</label>
              <input
                type="text"
                value={form.originCep}
                onChange={(e) => setForm({ ...form, originCep: formatCep(e.target.value) })}
                className="input-field"
                placeholder="00000-000"
              />
              <p className="text-xs text-gray-400 mt-1">CEP de onde os produtos serão enviados</p>
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
