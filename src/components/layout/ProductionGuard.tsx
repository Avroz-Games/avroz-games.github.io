import { isSupabaseConfigured } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { CloudOff, Settings } from 'lucide-react'

/** Bloqueia uso do modo demo local em build de produção sem Supabase */
export default function ProductionGuard({ children }: { children: React.ReactNode }) {
  const isProd = import.meta.env.PROD
  const missingBackend = isProd && !isSupabaseConfigured

  if (!missingBackend) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-900 px-4">
      <div className="card max-w-lg p-8 text-center">
        <CloudOff className="mx-auto h-12 w-12 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Configuração de produção pendente</h1>
        <p className="text-gray-400 text-sm mb-6">
          O site foi publicado sem as variáveis <code className="text-neon-cyan">VITE_SUPABASE_URL</code> e{' '}
          <code className="text-neon-cyan">VITE_SUPABASE_ANON_KEY</code> no GitHub Actions.
        </p>
        <ol className="text-left text-sm text-gray-400 space-y-2 mb-6 list-decimal list-inside">
          <li>Crie um projeto em supabase.com</li>
          <li>Execute supabase/schema.sql, storage.sql e seed.sql</li>
          <li>Adicione os secrets no repositório GitHub</li>
          <li>Faça um novo deploy (push na main)</li>
        </ol>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Settings className="h-3 w-3" /> Veja docs/DEPLOY.md no repositório
        </p>
        <Link to="/admin" className="btn-secondary mt-6 inline-flex text-sm">Painel admin</Link>
      </div>
    </div>
  )
}
