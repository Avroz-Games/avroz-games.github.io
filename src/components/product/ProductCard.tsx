import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Store } from 'lucide-react'
import type { Product } from '../../types'
import { formatCurrency, calcPixPrice } from '../../types'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/MarketplaceContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { settings } = useProducts()
  const pixPrice = calcPixPrice(product.salePrice, settings.pixDiscountPercent)

  return (
    <div className="card group overflow-hidden animate-fade-in bg-card-glow">
      <Link to={`/produto/${product.id}`} className="block relative aspect-square overflow-hidden bg-surface-700">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 badge bg-accent-500 text-surface-900">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Destaque
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute right-3 top-3 badge bg-red-500/90 text-white">Últimas unidades</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="badge bg-surface-900 text-white text-sm px-4 py-2">Esgotado</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-neon-cyan uppercase tracking-wide">{product.category}</span>
          {product.sellerName && (
            <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[50%]">
              <Store className="h-3 w-3 shrink-0" /> {product.sellerName}
            </span>
          )}
        </div>
        <Link to={`/produto/${product.id}`}>
          <h3 className="mt-1 font-semibold text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <p className="text-lg font-bold text-white">{formatCurrency(product.salePrice)}</p>
          <p className="text-xs text-brand-400 font-medium">
            PIX: {formatCurrency(pixPrice)} (-{settings.pixDiscountPercent}%)
          </p>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="btn-primary w-full mt-4 py-2.5 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </button>
      </div>
    </div>
  )
}
