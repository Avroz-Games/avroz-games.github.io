import { Link, useLocation, Navigate } from 'react-router-dom'

import { LayoutDashboard, Package, Settings, LogOut, ShoppingBag, Users } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

import { useProducts } from '../../context/MarketplaceContext'

import Logo from '../layout/Logo'



interface AdminLayoutProps {

  children: React.ReactNode

}



export default function AdminLayout({ children }: AdminLayoutProps) {

  const { isAdmin, logout, backendMode } = useAuth()

  const { settings } = useProducts()

  const location = useLocation()



  if (!isAdmin) {

    return <Navigate to="/admin" replace />

  }



  const navItems = [

    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },

    { to: '/admin/produtos', icon: Package, label: 'Produtos' },

    { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos & Escrow' },

    { to: '/admin/vendedores', icon: Users, label: 'Vendedores' },

    { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },

  ]



  return (

    <div className="flex min-h-screen bg-surface-900">

      <aside className="hidden lg:flex lg:w-64 flex-col bg-surface-800 border-r border-surface-600 text-white">

        <div className="px-6 py-5 border-b border-surface-600">

          <Logo name={settings.storeName} size="sm" />

          <p className="mt-2 text-xs text-gray-500">

            {backendMode === 'supabase' ? '☁ Supabase' : '💾 Local'}

          </p>

        </div>



        <nav className="flex-1 px-3 py-4 space-y-1">

          {navItems.map((item) => (

            <Link

              key={item.to}

              to={item.to}

              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${

                location.pathname === item.to

                  ? 'bg-brand-500/15 text-neon-cyan'

                  : 'text-gray-400 hover:bg-surface-700 hover:text-white'

              }`}

            >

              <item.icon className="h-5 w-5" />

              {item.label}

            </Link>

          ))}

        </nav>



        <div className="px-3 py-4 border-t border-surface-600">

          <Link

            to="/"

            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-surface-700 hover:text-white transition-colors"

          >

            Ver Loja

          </Link>

          <button

            onClick={() => logout()}

            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-surface-700 transition-colors"

          >

            <LogOut className="h-5 w-5" />

            Sair

          </button>

        </div>

      </aside>



      <div className="flex-1 flex flex-col">

        <header className="lg:hidden flex items-center justify-between bg-surface-800 border-b border-surface-600 text-white px-4 py-3">

          <span className="font-display font-bold">Admin</span>

          <div className="flex items-center gap-2">

            <Link to="/" className="text-sm text-gray-400 hover:text-white">Loja</Link>

            <button onClick={() => logout()} className="text-sm text-red-400">Sair</button>

          </div>

        </header>



        <nav className="lg:hidden flex gap-1 overflow-x-auto bg-surface-800 border-b border-surface-600 px-4 py-2">

          {navItems.map((item) => (

            <Link

              key={item.to}

              to={item.to}

              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${

                location.pathname === item.to

                  ? 'bg-brand-500/15 text-neon-cyan'

                  : 'text-gray-400'

              }`}

            >

              <item.icon className="h-4 w-4" />

              {item.label}

            </Link>

          ))}

        </nav>



        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

      </div>

    </div>

  )

}

