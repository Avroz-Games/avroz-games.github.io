import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<'customer' | 'seller'>(params.get('tipo') === 'vendedor' ? 'seller' : 'customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terms) { setError('Aceite os termos para continuar'); return }
    setLoading(true)
    try {
      await signUp(email, password, fullName, role)
      navigate(role === 'seller' ? '/vendedor/cadastro' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-white text-center mb-2">Criar conta</h1>
      <p className="text-center text-gray-400 text-sm mb-8">Compre ou venda no marketplace</p>

      <div className="flex gap-2 mb-6">
        {(['customer', 'seller'] as const).map((r) => (
          <button key={r} type="button" onClick={() => setRole(r)}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${role === r ? 'bg-brand-500/20 text-neon-cyan border border-brand-500/50' : 'bg-surface-800 text-gray-400 border border-surface-600'}`}>
            {r === 'customer' ? 'Comprador' : 'Vendedor'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nome completo</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Senha (mín. 8 caracteres)</label>
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
        </div>
        <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 rounded" />
          <span>
            Li e aceito os{' '}
            <Link to="/legal/termos" className="text-neon-cyan">Termos de Uso</Link>,{' '}
            <Link to={role === 'seller' ? '/legal/contrato-vendedor' : '/legal/contrato-comprador'} className="text-neon-cyan">
              {role === 'seller' ? 'Contrato do Vendedor' : 'Contrato do Comprador'}
            </Link>{' '}
            e a <Link to="/legal/privacidade" className="text-neon-cyan">Política de Privacidade</Link>.
          </span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Já tem conta? <Link to="/entrar" className="text-neon-cyan">Entrar</Link>
        </p>
      </form>
    </div>
  )
}
