import { supabase } from '../lib/supabase'

export async function testSupabaseConnection(): Promise<{
  configured: boolean
  connected: boolean
  productsCount?: number
  error?: string
}> {
  if (!supabase) {
    return { configured: false, connected: false }
  }

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return { configured: true, connected: false, error: error.message }
  }

  return { configured: true, connected: true, productsCount: count ?? 0 }
}
