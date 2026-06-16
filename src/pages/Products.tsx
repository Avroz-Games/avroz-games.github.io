import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { useProducts } from '../context/MarketplaceContext'
import { CATEGORIES } from '../types'

export default function Products() {
  const { products } = useProducts()
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const searchQuery = searchParams.get('q') || ''

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.active)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.salePrice - b.salePrice)
        break
      case 'price-desc':
        result.sort((a, b) => b.salePrice - a.salePrice)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [products, searchQuery, selectedCategory, sortBy])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Produtos</h1>
        {searchQuery && (
          <p className="mt-2 text-gray-500">
            Resultados para &quot;{searchQuery}&quot; — {filtered.length} produto(s)
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Filtros</h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  !selectedCategory ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Todas as categorias
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === cat ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-secondary py-2 px-4 text-sm"
            >
              {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              Filtros
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto py-2 text-sm ml-auto"
            >
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
