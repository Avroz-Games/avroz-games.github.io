import { useState } from 'react'

import { useParams, Link } from 'react-router-dom'

import { ArrowLeft, ShoppingCart, Minus, Plus, CreditCard, Check } from 'lucide-react'

import { useProducts } from '../context/MarketplaceContext'

import { useCart } from '../context/CartContext'

import { formatCurrency, calcPixPrice } from '../types'

import ShippingCalculator from '../components/product/ShippingCalculator'



export default function ProductDetail() {

  const { id } = useParams()

  const { products, settings } = useProducts()

  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)

  const [selectedImage, setSelectedImage] = useState(0)

  const [added, setAdded] = useState(false)



  const product = products.find((p) => p.id === id)



  if (!product || !product.active) {

    return (

      <div className="mx-auto max-w-7xl px-4 py-16 text-center">

        <h1 className="text-2xl font-bold text-white">Produto não encontrado</h1>

        <Link to="/produtos" className="btn-primary mt-6 inline-flex">

          <ArrowLeft className="h-4 w-4" /> Voltar aos produtos

        </Link>

      </div>

    )

  }



  const pixPrice = calcPixPrice(product.salePrice, settings.pixDiscountPercent)

  const related = products.filter((p) => p.active && p.category === product.category && p.id !== product.id).slice(0, 4)



  const handleAddToCart = () => {

    addToCart(product, quantity)

    setAdded(true)

    setTimeout(() => setAdded(false), 2000)

  }



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-neon-cyan mb-6">

        <ArrowLeft className="h-4 w-4" /> Voltar

      </Link>



      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

        <div>

          <div className="card overflow-hidden aspect-square ring-brand-500/20">

            <img

              src={product.images[selectedImage] || '/placeholder.svg'}

              alt={product.name}

              className="h-full w-full object-cover"

            />

          </div>

          {product.images.length > 1 && (

            <div className="mt-4 flex gap-3 overflow-x-auto">

              {product.images.map((img, i) => (

                <button

                  key={i}

                  onClick={() => setSelectedImage(i)}

                  className={`shrink-0 h-20 w-20 rounded-xl overflow-hidden ring-2 transition-all ${

                    selectedImage === i ? 'ring-neon-cyan' : 'ring-transparent opacity-70 hover:opacity-100'

                  }`}

                >

                  <img src={img} alt="" className="h-full w-full object-cover" />

                </button>

              ))}

            </div>

          )}

        </div>



        <div className="animate-slide-up">

          <span className="badge bg-brand-500/15 text-neon-cyan">{product.category}</span>

          <h1 className="mt-3 font-display text-3xl font-bold text-white">{product.name}</h1>

          <p className="mt-4 text-gray-400 leading-relaxed">{product.description}</p>



          <div className="mt-6 p-6 rounded-2xl bg-surface-700/50 ring-1 ring-surface-600">

            <div className="flex items-baseline gap-3">

              <span className="text-3xl font-bold text-white">{formatCurrency(product.salePrice)}</span>

              <span className="text-sm text-gray-500">ou 3x de {formatCurrency(product.salePrice / 3)}</span>

            </div>

            <div className="mt-2 flex items-center gap-2">

              <CreditCard className="h-4 w-4 text-brand-400" />

              <span className="text-brand-400 font-semibold">

                PIX: {formatCurrency(pixPrice)} ({settings.pixDiscountPercent}% OFF)

              </span>

            </div>

          </div>



          {product.stock > 0 ? (

            <p className="mt-3 text-sm text-brand-400 font-medium">

              {product.stock} unidade(s) em estoque

            </p>

          ) : (

            <p className="mt-3 text-sm text-red-400 font-medium">Produto esgotado</p>

          )}



          <div className="mt-6 flex items-center gap-4">

            <div className="flex items-center rounded-xl border border-surface-600 bg-surface-800">

              <button

                onClick={() => setQuantity(Math.max(1, quantity - 1))}

                className="flex h-12 w-12 items-center justify-center text-gray-400 hover:bg-surface-700"

              >

                <Minus className="h-4 w-4" />

              </button>

              <span className="w-12 text-center font-semibold text-white">{quantity}</span>

              <button

                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}

                className="flex h-12 w-12 items-center justify-center text-gray-400 hover:bg-surface-700"

              >

                <Plus className="h-4 w-4" />

              </button>

            </div>



            <button

              onClick={handleAddToCart}

              disabled={product.stock === 0}

              className="btn-primary flex-1"

            >

              {added ? (

                <>

                  <Check className="h-5 w-5" /> Adicionado!

                </>

              ) : (

                <>

                  <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho

                </>

              )}

            </button>

          </div>



          <ShippingCalculator

            product={product}

            quantity={quantity}

            originCep={settings.originCep}

          />



          {product.characteristics.length > 0 && (

            <div className="mt-8">

              <h3 className="font-semibold text-white mb-4">Características</h3>

              <dl className="grid gap-3 sm:grid-cols-2">

                {product.characteristics.map((c) => (

                  <div key={c.label} className="rounded-xl bg-surface-700/50 px-4 py-3 ring-1 ring-surface-600">

                    <dt className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</dt>

                    <dd className="mt-1 font-medium text-white">{c.value}</dd>

                  </div>

                ))}

              </dl>

            </div>

          )}

        </div>

      </div>



      {related.length > 0 && (

        <section className="mt-16">

          <h2 className="section-title mb-6">Produtos Relacionados</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {related.map((p) => (

              <Link key={p.id} to={`/produto/${p.id}`} className="card overflow-hidden group">

                <div className="aspect-square overflow-hidden bg-surface-700">

                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />

                </div>

                <div className="p-4">

                  <h3 className="font-medium text-white line-clamp-1">{p.name}</h3>

                  <p className="mt-1 font-bold text-neon-cyan">{formatCurrency(p.salePrice)}</p>

                </div>

              </Link>

            ))}

          </div>

        </section>

      )}

    </div>

  )

}

