import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ShoppingCart, Menu, X, Search, User, Store, LogOut } from 'lucide-react'

import { useState } from 'react'

import { useCart } from '../../context/CartContext'

import { useProducts } from '../../context/MarketplaceContext'
import { useAuth } from '../../context/AuthContext'

import Logo from './Logo'



export default function Header() {

  const { totalItems } = useCart()

  const { settings } = useProducts()
  const { isAuthenticated, profile, isSeller, signOut } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const location = useLocation()

  const navigate = useNavigate()



  const navLinks = [

    { to: '/', label: 'Início' },

    { to: '/produtos', label: 'Produtos' },

    { to: '/carrinho', label: 'Carrinho' },

  ]



  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault()

    if (searchQuery.trim()) {

      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`)

      setMobileOpen(false)

    }

  }



  return (

    <header className="sticky top-0 z-50 border-b border-surface-600/80 bg-surface-900/90 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-16 items-center justify-between gap-4">

          <Logo name={settings.storeName} />



          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">

            <div className="relative w-full">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input

                type="text"

                placeholder="Buscar jogos, consoles..."

                value={searchQuery}

                onChange={(e) => setSearchQuery(e.target.value)}

                className="input-field pl-10 py-2.5"

              />

            </div>

          </form>



          <nav className="hidden md:flex items-center gap-1">

            {navLinks.map((link) => (

              <Link

                key={link.to}

                to={link.to}

                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${

                  location.pathname === link.to

                    ? 'bg-brand-500/15 text-neon-cyan'

                    : 'text-gray-400 hover:bg-surface-700 hover:text-white'

                }`}

              >

                {link.label}

              </Link>

            ))}

            <Link
              to="/cadastro?tipo=vendedor"
              className="hidden sm:flex rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-neon-cyan transition-colors"
            >
              Vender
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/minha-conta" className="hidden sm:flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white">
                  <User className="h-4 w-4" /> {profile?.fullName?.split(' ')[0]}
                </Link>
                {isSeller && (
                  <Link to="/vendedor" className="hidden sm:flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-neon-cyan">
                    <Store className="h-4 w-4" /> Loja
                  </Link>
                )}
                <button onClick={() => signOut()} className="hidden sm:flex rounded-lg px-2 py-2 text-gray-500 hover:text-red-400" title="Sair">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/entrar" className="hidden sm:flex btn-secondary py-2 px-4 text-sm">Entrar</Link>
            )}

          </nav>



          <div className="flex items-center gap-3">

            <Link

              to="/carrinho"

              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface-700 text-gray-300 transition-colors hover:bg-brand-500/20 hover:text-neon-cyan"

            >

              <ShoppingCart className="h-5 w-5" />

              {totalItems > 0 && (

                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-neon-sm">

                  {totalItems > 9 ? '9+' : totalItems}

                </span>

              )}

            </Link>



            <button

              onClick={() => setMobileOpen(!mobileOpen)}

              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-surface-700 text-gray-300"

            >

              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

            </button>

          </div>

        </div>



        {mobileOpen && (

          <div className="md:hidden border-t border-surface-600 py-4 animate-fade-in">

            <form onSubmit={handleSearch} className="mb-4">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input

                  type="text"

                  placeholder="Buscar produtos..."

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  className="input-field pl-10 py-2.5"

                />

              </div>

            </form>

            <nav className="flex flex-col gap-1">

              {navLinks.map((link) => (

                <Link

                  key={link.to}

                  to={link.to}

                  onClick={() => setMobileOpen(false)}

                  className={`rounded-lg px-4 py-3 text-sm font-medium ${

                    location.pathname === link.to

                      ? 'bg-brand-500/15 text-neon-cyan'

                      : 'text-gray-400'

                  }`}

                >

                  {link.label}

                </Link>

              ))}

            </nav>

          </div>

        )}

      </div>

    </header>

  )

}

