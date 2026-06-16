import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/layout/Logo'

export default function AdminLogin() {
  const { isAdmin, login, loading, backendMode } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-900">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const success = await login(username, password)
    setSubmitting(false)
    if (success) {
      navigate('/admin/dashboard')
    } else {
      setError('Usuário ou senha incorretos')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-900 gaming-grid px-4">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Painel Administrativo</h1>
          <p className="mt-2 text-gray-400">
            Backend: {backendMode === 'supabase' ? 'Supabase (nuvem)' : 'Local (demo)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-neon-cyan" />
            <h2 className="font-semibold text-white">Login</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {backendMode === 'supabase' ? 'E-mail' : 'Usuário'}
              </label>
              <input
                type={backendMode === 'supabase' ? 'email' : 'text'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder={backendMode === 'supabase' ? 'admin@avrozgames.com.br' : 'admin'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
          </button>

          {backendMode === 'local' && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Demo: admin / avroz2024
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
