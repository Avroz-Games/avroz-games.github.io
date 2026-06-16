import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

import type { Product, StoreSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

import {

  fetchProducts,

  fetchAllProductsAdmin,

  createProduct,

  updateProductApi,

  deleteProductApi,

  fetchSettings,

  saveSettingsApi,

  getBackendMode,

} from '../services/api'

import { calculateSalePrice } from '../services/storage'



interface ProductContextType {

  products: Product[]

  settings: StoreSettings

  loading: boolean

  backendMode: 'supabase' | 'local'

  addProduct: (product: Omit<Product, 'id' | 'salePrice' | 'createdAt' | 'updatedAt'>) => Promise<void>

  updateProduct: (id: string, product: Partial<Product>) => Promise<void>

  deleteProduct: (id: string) => Promise<void>

  updateSettings: (settings: Partial<StoreSettings>) => Promise<void>

  refreshProducts: () => Promise<void>

}



const ProductContext = createContext<ProductContextType | null>(null)



export function ProductProvider({ children }: { children: ReactNode }) {

  const [products, setProducts] = useState<Product[]>([])

  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  const [loading, setLoading] = useState(true)

  const backendMode = getBackendMode()



  const refreshProducts = useCallback(async () => {

    setLoading(true)

    const [prods, sett] = await Promise.all([fetchProducts(), fetchSettings()])

    setProducts(prods)

    setSettings(sett)

    setLoading(false)

  }, [])



  useEffect(() => {

    refreshProducts()

  }, [refreshProducts])



  const addProduct = useCallback(

    async (product: Omit<Product, 'id' | 'salePrice' | 'createdAt' | 'updatedAt'>) => {

      const created = await createProduct(product, settings.marginPercent)

      setProducts((prev) => [created, ...prev])

    },

    [settings.marginPercent]

  )



  const updateProduct = useCallback(

    async (id: string, updates: Partial<Product>) => {

      const current = products.find((p) => p.id === id)

      await updateProductApi(id, updates, settings.marginPercent, current)

      setProducts((prev) =>

        prev.map((p) => {

          if (p.id !== id) return p

          const merged = { ...p, ...updates, updatedAt: new Date().toISOString() }

          if (updates.costPrice !== undefined) {

            merged.salePrice = calculateSalePrice(updates.costPrice, settings.marginPercent)

          }

          return merged

        })

      )

    },

    [settings.marginPercent, products]

  )



  const deleteProduct = useCallback(async (id: string) => {

    await deleteProductApi(id)

    setProducts((prev) => prev.filter((p) => p.id !== id))

  }, [])



  const updateSettings = useCallback(

    async (updates: Partial<StoreSettings>) => {

      const newSettings = { ...settings, ...updates }

      await saveSettingsApi(newSettings)

      setSettings(newSettings)



      if (updates.marginPercent !== undefined) {

        const adminProducts = await fetchAllProductsAdmin()

        const updatedProducts = adminProducts.map((p) => ({

          ...p,

          salePrice: calculateSalePrice(p.costPrice, newSettings.marginPercent),

        }))

        for (const p of updatedProducts) {

          await updateProductApi(p.id, { costPrice: p.costPrice }, newSettings.marginPercent, p)

        }

        setProducts(updatedProducts)

      }

    },

    [settings]

  )



  return (

    <ProductContext.Provider

      value={{

        products,

        settings,

        loading,

        backendMode,

        addProduct,

        updateProduct,

        deleteProduct,

        updateSettings,

        refreshProducts,

      }}

    >

      {children}

    </ProductContext.Provider>

  )

}



export function useProducts() {

  const ctx = useContext(ProductContext)

  if (!ctx) throw new Error('useProducts must be used within ProductProvider')

  return ctx

}

