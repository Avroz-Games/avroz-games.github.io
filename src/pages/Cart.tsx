import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency, calculatePixPrice } from '../services/storage'

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart()
  const { settings } = useProducts()

  const pixSubtotal = items.reduce(
    (sum, i) => sum + calculatePixPrice(i.product.salePrice, settings.pixDiscountPercent) * i.quantity,
    0
  )
  const pixDiscount = subtotal - pixSubtotal

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-white">Seu carrinho está vazio</h1>
        <p className="mt-2 text-gray-500">Adicione produtos para continuar</p>
        <Link to="/produtos" className="btn-primary mt-6 inline-flex">
          Ver Produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white mb-8">
        Carrinho ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="card flex gap-4 p-4 sm:p-6">
              <Link to={`/produto/${item.product.id}`} className="shrink-0">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                />
              </Link>

              <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <Link to={`/produto/${item.product.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-brand-600">{item.product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                  <p className="mt-2 font-bold text-gray-900">{formatCurrency(item.product.salePrice)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Resumo</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Desconto PIX (10%)</span>
                <span className="font-medium">-{formatCurrency(pixDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frete</span>
                <span className="text-gray-400">Calculado no checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total com PIX</span>
                <span className="text-xl font-bold text-brand-600">{formatCurrency(pixSubtotal)}</span>
              </div>
              <p className="text-xs text-gray-400">+ frete (calculado no checkout)</p>
            </div>

            <Link to="/checkout" className="btn-primary w-full mt-6">
              Finalizar Compra
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link to="/produtos" className="block text-center text-sm text-brand-600 hover:text-brand-700 mt-4">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
