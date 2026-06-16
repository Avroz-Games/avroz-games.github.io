import { Link } from 'react-router-dom'
import { Eye, UserPlus, LogIn, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/** Barra para visitantes não cadastrados — visível em todas as páginas da loja */
export default function GuestBar() {
  const { isAuthenticated, loading } = useAuth()

  if (loading || isAuthenticated) return null

  return (
    <div className="bg-surface-800 border-b border-surface-600">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <Eye className="h-4 w-4 text-neon-cyan shrink-0" />
          <span>
            Você está <strong className="text-white font-medium">navegando como visitante</strong>
            — explore produtos livremente. Cadastro só na hora de comprar.
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/produtos" className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 hover:text-neon-cyan px-2 py-1">
            <ShoppingBag className="h-3.5 w-3.5" /> Ver produtos
          </Link>
          <Link to="/entrar" className="inline-flex items-center gap-1 rounded-lg border border-surface-600 px-3 py-1.5 text-xs text-gray-300 hover:border-brand-500/50 hover:text-white">
            <LogIn className="h-3.5 w-3.5" /> Entrar
          </Link>
          <Link to="/cadastro" className="inline-flex items-center gap-1 rounded-lg bg-brand-500/20 border border-brand-500/40 px-3 py-1.5 text-xs text-neon-cyan hover:bg-brand-500/30">
            <UserPlus className="h-3.5 w-3.5" /> Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}
