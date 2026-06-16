import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Product, PlatformSettings } from '../types'
import { DEFAULT_PLATFORM_SETTINGS } from '../types'
import * as mp from '../services/marketplace'

interface MarketplaceContextType {
  products: Product[]
  settings: PlatformSettings
  loading: boolean
  backendMode: 'supabase' | 'local'
  refresh: () => Promise<void>
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [prods, sett] = await Promise.all([mp.fetchProducts(), mp.fetchSettings()])
    setProducts(prods)
    setSettings(sett)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const updateSettings = useCallback(async (updates: Partial<PlatformSettings>) => {
    const next = { ...settings, ...updates }
    await mp.saveSettings(next)
    setSettings(next)
  }, [settings])

  return (
    <MarketplaceContext.Provider value={{
      products, settings, loading,
      backendMode: mp.isOnline() ? 'supabase' : 'local',
      refresh, updateSettings,
    }}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return ctx
}

/** Compat layer for existing components */
export function useProducts() {
  const { products, settings, loading, backendMode, refresh, updateSettings } = useMarketplace()
  return {
    products,
    settings: {
      storeName: settings.platformName,
      storeDescription: settings.platformDescription,
      marginPercent: settings.platformFeePercent,
      pixDiscountPercent: settings.pixDiscountPercent,
      originCep: settings.originCep,
      pixKey: settings.platformPixKey,
      pixKeyType: settings.platformPixKeyType as 'email',
      whatsapp: settings.supportWhatsapp,
      email: settings.supportEmail,
      platformName: settings.platformName,
      platformDescription: settings.platformDescription,
      platformFeePercent: settings.platformFeePercent,
      escrowDaysAutoRelease: settings.escrowDaysAutoRelease,
      platformPixKey: settings.platformPixKey,
      platformPixKeyType: settings.platformPixKeyType,
      supportEmail: settings.supportEmail,
      supportWhatsapp: settings.supportWhatsapp,
    },
    loading,
    backendMode,
    refreshProducts: refresh,
    updateSettings,
    addProduct: async () => { throw new Error('Use o painel do vendedor') },
    updateProduct: async () => { throw new Error('Use o painel do vendedor') },
    deleteProduct: async () => { throw new Error('Use o painel do vendedor') },
  }
}
