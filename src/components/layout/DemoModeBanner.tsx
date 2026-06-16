import { isSupabaseConfigured } from '../../lib/supabase'
import { useProducts } from '../../context/MarketplaceContext'

/** Aviso discreto quando o site roda em modo demo (localStorage) */
export default function DemoModeBanner() {
  const { backendMode } = useProducts()

  if (isSupabaseConfigured || backendMode === 'supabase') return null

  return (
    <div className="bg-brand-500/10 border-b border-brand-500/30 px-4 py-2 text-center text-xs text-gray-300">
      Modo demonstração — dados salvos no seu navegador. Integração Supabase em breve.
    </div>
  )
}
