import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Star } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useProducts } from '../../context/ProductContext'
import { formatCurrency, calculateSalePrice } from '../../services/storage'
import { uploadProductImage } from '../../services/api'
import { CATEGORIES } from '../../types'
import type { Product, ProductCharacteristic } from '../../types'

const emptyProduct = {
  name: '',
  description: '',
  category: 'Jogos',
  costPrice: 0,
  images: [] as string[],
  characteristics: [] as ProductCharacteristic[],
  weight: 0.3,
  length: 20,
  height: 10,
  width: 15,
  stock: 0,
  featured: false,
  active: true,
}

export default function AdminProducts() {
  const { products, settings, addProduct, updateProduct, deleteProduct } = useProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [newChar, setNewChar] = useState({ label: '', value: '' })

  const openCreate = () => {
    setForm(emptyProduct)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      costPrice: product.costPrice,
      images: [...product.images],
      characteristics: [...product.characteristics],
      weight: product.weight,
      length: product.length,
      height: product.height,
      width: product.width,
      stock: product.stock,
      featured: product.featured,
      active: product.active,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) continue
      const url = await uploadProductImage(file)
      newImages.push(url)
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }))
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addCharacteristic = () => {
    if (!newChar.label || !newChar.value) return
    setForm((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, { ...newChar }],
    }))
    setNewChar({ label: '', value: '' })
  }

  const removeCharacteristic = (index: number) => {
    setForm((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateProduct(editingId, form)
    } else {
      await addProduct(form)
    }
    setShowForm(false)
    setForm(emptyProduct)
    setEditingId(null)
  }

  const salePrice = calculateSalePrice(form.costPrice, settings.marginPercent)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-gray-500">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {/* Product list */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Produto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Custo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Venda</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Estoque</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        {product.featured && (
                          <span className="text-xs text-amber-600 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" /> Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{product.category}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatCurrency(product.costPrice)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(product.salePrice)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`badge ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (confirm('Excluir produto?')) deleteProduct(product.id) }} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-24 resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (auto +{settings.marginPercent}%)</label>
                  <input type="text" value={formatCurrency(salePrice)} readOnly className="input-field bg-green-50 text-green-700 font-semibold" />
                </div>
              </div>

              {/* Dimensions for shipping */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Dimensões para Frete (Correios)</h3>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                    <input type="number" min="0.01" step="0.01" value={form.weight} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Comp. (cm)</label>
                    <input type="number" min="1" value={form.length} onChange={(e) => setForm({ ...form, length: parseFloat(e.target.value) || 0 })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Alt. (cm)</label>
                    <input type="number" min="1" value={form.height} onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) || 0 })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Larg. (cm)</label>
                    <input type="number" min="1" value={form.width} onChange={(e) => setForm({ ...form, width: parseFloat(e.target.value) || 0 })} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden group">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="btn-secondary cursor-pointer inline-flex">
                  <Upload className="h-4 w-4" /> Upload Fotos
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Characteristics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                {form.characteristics.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="text-sm flex-1"><strong>{c.label}:</strong> {c.value}</span>
                    <button type="button" onClick={() => removeCharacteristic(i)} className="text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input type="text" placeholder="Label" value={newChar.label} onChange={(e) => setNewChar({ ...newChar, label: e.target.value })} className="input-field flex-1" />
                  <input type="text" placeholder="Valor" value={newChar.value} onChange={(e) => setNewChar({ ...newChar, value: e.target.value })} className="input-field flex-1" />
                  <button type="button" onClick={addCharacteristic} className="btn-secondary px-4">+</button>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded text-brand-600" />
                  <span className="text-sm">Destaque</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded text-brand-600" />
                  <span className="text-sm">Ativo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
