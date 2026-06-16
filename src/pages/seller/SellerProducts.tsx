import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMarketplace } from '../../context/MarketplaceContext'
import * as mp from '../../services/marketplace'
import type { Product } from '../../types'
import { CATEGORIES, calcSalePrice, formatCurrency } from '../../types'

const emptyForm = {
  name: '', description: '', category: 'Jogos' as string, sellerPrice: 0,
  images: ['https://images.unsplash.com/photo-1538488886555-98f798d929bf?w=600&h=600&fit=crop'],
  characteristics: [{ label: 'Condição', value: 'Novo' }],
  weight: 0.3, length: 20, height: 10, width: 15, stock: 1, featured: false, active: true,
}

export default function SellerProducts() {
  const { seller, isSeller, loading: authLoading } = useAuth()
  const { settings, refresh } = useMarketplace()
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (seller) mp.fetchSellerProducts(seller.id).then(setProducts)
  }, [seller])

  if (authLoading) return null
  if (!isSeller || !seller) return <Navigate to="/vendedor" replace />

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, category: p.category,
      sellerPrice: p.sellerPrice, images: p.images, characteristics: p.characteristics,
      weight: p.weight, length: p.length, height: p.height, width: p.width,
      stock: p.stock, featured: p.featured, active: p.active,
    })
    setModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await mp.updateProduct(editing.id, form, settings.platformFeePercent)
    } else {
      await mp.createProduct(seller.id, { ...form, sellerId: seller.id }, settings.platformFeePercent)
    }
    setProducts(await mp.fetchSellerProducts(seller.id))
    await refresh()
    setModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir produto?')) return
    await mp.deleteProduct(id)
    setProducts(await mp.fetchSellerProducts(seller.id))
    await refresh()
  }

  const salePreview = calcSalePrice(form.sellerPrice, settings.platformFeePercent)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/vendedor" className="text-sm text-gray-500 hover:text-neon-cyan">← Painel</Link>
          <h1 className="section-title mt-2">Meus Produtos</h1>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Novo produto</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-700 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Seu preço</th>
              <th className="px-4 py-3 text-left">Preço venda</th>
              <th className="px-4 py-3 text-left">Estoque</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-surface-600">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="text-white font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{formatCurrency(p.sellerPrice)}</td>
                <td className="px-4 py-3 text-neon-cyan">{formatCurrency(p.salePrice)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-neon-cyan"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-gray-500">Nenhum produto cadastrado</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-white">{editing ? 'Editar' : 'Novo'} produto</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Nome</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-sm text-gray-300">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Seu preço (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.sellerPrice} onChange={(e) => setForm({ ...form, sellerPrice: parseFloat(e.target.value) || 0 })} className="input-field" required />
                  <p className="text-xs text-gray-500 mt-1">Preço na loja: {formatCurrency(salePreview)} (comissão 25%)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Estoque</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">URL da imagem</label>
                  <input value={form.images[0]} onChange={(e) => setForm({ ...form, images: [e.target.value] })} className="input-field" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
