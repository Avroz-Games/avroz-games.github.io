import { Link } from 'react-router-dom'
import { Search, ShoppingCart, UserPlus, ShieldCheck } from 'lucide-react'

/** Seção explicativa para visitantes na home */
export default function GuestVisitorSection() {
  const steps = [
    { icon: Search, title: 'Explore à vontade', desc: 'Veja produtos, preços, vendedores e simule frete — sem login.' },
    { icon: ShoppingCart, title: 'Monte seu carrinho', desc: 'Adicione itens de vários vendedores enquanto visitante.' },
    { icon: UserPlus, title: 'Cadastre-se na compra', desc: 'Conta gratuita só quando for finalizar o pedido.' },
    { icon: ShieldCheck, title: 'Compra protegida', desc: 'Pagamento em escrow até você confirmar o recebimento.' },
  ]

  return (
    <section className="py-16 bg-surface-900 border-t border-surface-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="badge bg-brand-500/15 text-neon-cyan mb-3">Para visitantes</span>
          <h2 className="section-title">Navegue sem cadastro</h2>
          <p className="mt-2 text-gray-400 max-w-xl mx-auto">
            Não precisa criar conta para conhecer o marketplace. Cadastro rápido e gratuito apenas na hora de comprar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {steps.map((s) => (
            <div key={s.title} className="card p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-neon-cyan mb-4">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/produtos" className="btn-primary">
            Explorar produtos agora
          </Link>
          <Link to="/cadastro" className="btn-secondary">
            Criar conta grátis
          </Link>
        </div>
      </div>
    </section>
  )
}
