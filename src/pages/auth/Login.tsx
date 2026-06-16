import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Shield, Store, User, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirect.startsWith('/') ? redirect : '/')
    } catch {
      setError('E-mail ou senha incorretos')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-white text-center mb-2">Entrar</h1>
      {params.get('redirect') && (
        <p className="text-center text-sm text-gray-400 mb-6">Faça login para continuar sua compra</p>
      )}
      {!params.get('redirect') && <div className="mb-8" />}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">{error}</div>}
        <div>
          <label className="block text-sm text-gray-300 mb-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Não tem conta? <Link to="/cadastro" className="text-neon-cyan hover:underline">Cadastre-se</Link>
        </p>
      </form>

      <div className="mt-8 grid gap-3">
        <p className="text-xs text-gray-500 text-center">Contas demo (modo local)</p>
        {[
          { icon: User, label: 'Cliente', email: 'cliente@demo.com', pass: 'demo1234' },
          { icon: Store, label: 'Vendedor', email: 'vendedor1@demo.com', pass: 'demo1234' },
          { icon: Shield, label: 'Admin', email: 'admin@avrozgames.com.br', pass: 'avroz2024' },
        ].map((d) => (
          <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword(d.pass) }}
            className="flex items-center gap-3 rounded-xl border border-surface-600 bg-surface-800 px-4 py-3 text-sm text-gray-300 hover:border-brand-500/50">
            <d.icon className="h-4 w-4 text-neon-cyan" /> {d.label}: {d.email}
          </button>
        ))}
      </div>
    </div>
  )
}
