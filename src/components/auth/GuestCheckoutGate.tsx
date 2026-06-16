import { Link } from 'react-router-dom'
import { LogIn, UserPlus, Shield, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../types'

interface GuestCheckoutGateProps {
  redirectPath?: string
}

/** Tela amigável quando visitante tenta finalizar compra sem login */
export default function GuestCheckoutGate({ redirectPath = '/checkout' }: GuestCheckoutGateProps) {
  const { items, subtotal } = useCart()
  const loginUrl = `/entrar?redirect=${encodeURIComponent(redirectPath)}`
  const registerUrl = `/cadastro?redirect=${encodeURIComponent(redirectPath)}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card p-8 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-neon-cyan mb-4" />
        <h1 className="font-display text-2xl font-bold text-white mb-2">Quase lá!</h1>
        <p className="text-gray-400 mb-6">
          Para finalizar sua compra com pagamento seguro em escrow, faça login ou crie uma conta gratuita.
        </p>

        {items.length > 0 && (
          <div className="rounded-xl bg-surface-700/50 px-4 py-3 mb-6 text-sm">
            <span className="text-gray-400">{items.length} item(ns) no carrinho · </span>
            <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          <Link to={loginUrl} className="btn-primary justify-center py-3">
            <LogIn className="h-4 w-4" /> Já tenho conta
          </Link>
          <Link to={registerUrl} className="btn-secondary justify-center py-3 border-brand-500/40 text-neon-cyan">
            <UserPlus className="h-4 w-4" /> Criar conta grátis
          </Link>
        </div>

        <div className="text-left space-y-3 border-t border-surface-600 pt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Por que cadastrar?</p>
          {[
            'Pagamento protegido em escrow até você receber',
            'Acompanhe pedidos em Minha Conta',
            'Confirme recebimento e libere repasse ao vendedor',
          ].map((t) => (
            <p key={t} className="text-sm text-gray-400 flex items-start gap-2">
              <Shield className="h-4 w-4 text-neon-cyan shrink-0 mt-0.5" /> {t}
            </p>
          ))}
        </div>

        <Link to="/produtos" className="inline-block mt-6 text-sm text-gray-500 hover:text-neon-cyan">
          ← Continuar navegando sem cadastro
        </Link>
      </div>
    </div>
  )
}
