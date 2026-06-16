import { Link } from 'react-router-dom'

import { ArrowRight, Truck, CreditCard, Shield, Star } from 'lucide-react'

import ProductCard from '../components/product/ProductCard'

import { useProducts } from '../context/MarketplaceContext'

import { CATEGORIES } from '../types'



export default function Home() {

  const { products, settings, loading } = useProducts()

  const featured = products.filter((p) => p.active && p.featured).slice(0, 4)

  const latest = products.filter((p) => p.active).slice(0, 8)

  const topCategories = CATEGORIES.slice(0, 8)



  if (loading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />

      </div>

    )

  }



  return (

    <div>

      {/* Hero */}

      <section className="relative overflow-hidden bg-surface-900 gaming-grid">

        <div className="absolute inset-0 bg-hero-glow" />

        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-neon-purple/10 blur-3xl" />

        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-neon-cyan/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">

          <div className="max-w-2xl animate-slide-up">

            <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-neon-cyan backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Marketplace · Escrow · Vendedores verificados
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Compre e venda como no{' '}
              <span className="text-gradient">Mercado Livre gamer</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed">
              {settings.storeDescription} Pagamento seguro em escrow — repasse ao vendedor só após confirmação.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link to="/produtos" className="btn-primary animate-pulse-glow">

                Ver Produtos

                <ArrowRight className="h-4 w-4" />

              </Link>

              <Link to="/produtos?categoria=Promoções" className="btn-secondary">

                Promoções

              </Link>

            </div>

          </div>

        </div>

      </section>



      {/* Categories strip */}

      <section className="border-y border-surface-600 bg-surface-800/50">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

            {topCategories.map((cat) => (

              <Link

                key={cat}

                to={`/produtos?categoria=${encodeURIComponent(cat)}`}

                className="shrink-0 rounded-full border border-surface-600 bg-surface-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-brand-500/50 hover:text-neon-cyan"

              >

                {cat}

              </Link>

            ))}

            <Link

              to="/produtos"

              className="shrink-0 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm text-neon-cyan"

            >

              Ver todas →

            </Link>

          </div>

        </div>

      </section>



      {/* Benefits */}

      <section className="border-b border-surface-600">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[

              { icon: CreditCard, title: `PIX com ${settings.pixDiscountPercent}% OFF`, desc: 'Desconto automático no checkout' },

              { icon: Truck, title: 'Frete Correios', desc: 'Simule antes de comprar' },

              { icon: Shield, title: 'Compra Segura', desc: 'Produtos 100% originais' },

              { icon: Star, title: 'Qualidade Premium', desc: 'Seleção curada de produtos' },

            ].map((item) => (

              <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-card-glow p-4 ring-1 ring-surface-600">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-neon-cyan">

                  <item.icon className="h-6 w-6" />

                </div>

                <div>

                  <h3 className="font-semibold text-white">{item.title}</h3>

                  <p className="mt-1 text-sm text-gray-400">{item.desc}</p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* Featured */}

      {featured.length > 0 && (

        <section className="py-16">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="section-title">Destaques</h2>

                <p className="mt-1 text-gray-400">Os produtos mais populares da loja</p>

              </div>

              <Link to="/produtos" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:text-brand-400">

                Ver todos <ArrowRight className="h-4 w-4" />

              </Link>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {featured.map((product) => (

                <ProductCard key={product.id} product={product} />

              ))}

            </div>

          </div>

        </section>

      )}



      {/* Latest */}

      <section className="bg-surface-800/30 py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="section-title">Catálogo Completo</h2>

              <p className="mt-1 text-gray-400">Explore nossa seleção de produtos</p>

            </div>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {latest.map((product) => (

              <ProductCard key={product.id} product={product} />

            ))}

          </div>

          {products.filter((p) => p.active).length > 8 && (

            <div className="mt-10 text-center">

              <Link to="/produtos" className="btn-primary">

                Ver Todos os Produtos

                <ArrowRight className="h-4 w-4" />

              </Link>

            </div>

          )}

        </div>

      </section>



      {/* CTA */}

      <section className="py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-neon-purple/80 px-8 py-12 sm:px-12 sm:py-16">

            <div className="absolute inset-0 gaming-grid opacity-30" />

            <div className="relative z-10 max-w-xl">

              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">

                Pague com PIX e economize {settings.pixDiscountPercent}%

              </h2>

              <p className="mt-3 text-brand-100">

                Finalize sua compra com PIX e ganhe desconto automático. Simule o frete na página do produto ou no checkout.

              </p>

              <Link to="/produtos" className="btn-primary mt-6 bg-white text-brand-800 hover:from-white hover:to-gray-100 shadow-none">

                Começar a Comprar

              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>

  )

}

