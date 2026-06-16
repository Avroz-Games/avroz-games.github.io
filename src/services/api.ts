import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Product, StoreSettings, Order, ProductCharacteristic } from '../types'
import {
  getProducts as getLocalProducts,
  saveProducts as saveLocalProducts,
  getSettings as getLocalSettings,
  saveSettings as saveLocalSettings,
  getOrders as getLocalOrders,
  saveOrder as saveLocalOrder,
  updateOrderStatus as updateLocalOrderStatus,
  calculateSalePrice,
  generateId,
  initializeStorage,
} from './storage'

interface DbProduct {
  id: string
  name: string
  description: string
  category: string
  cost_price: number
  sale_price: number
  images: string[]
  characteristics: ProductCharacteristic[]
  weight: number
  length: number
  height: number
  width: number
  stock: number
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
}

interface DbSettings {
  store_name: string
  store_description: string
  margin_percent: number
  pix_discount_percent: number
  origin_cep: string
  pix_key: string
  pix_key_type: string
  whatsapp: string
  email: string
}

interface DbOrder {
  id: string
  items: Order['items']
  customer: Order['customer']
  shipping: Order['shipping']
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  payment_method: string
  status: string
  pix_code: string | null
  created_at: string
}

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    costPrice: Number(row.cost_price),
    salePrice: Number(row.sale_price),
    images: row.images || [],
    characteristics: row.characteristics || [],
    weight: Number(row.weight),
    length: Number(row.length),
    height: Number(row.height),
    width: Number(row.width),
    stock: row.stock,
    featured: row.featured,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapProductToDb(
  product: Omit<Product, 'id' | 'salePrice' | 'createdAt' | 'updatedAt'> & Partial<Pick<Product, 'id'>>,
  salePrice: number
) {
  return {
    ...(product.id ? { id: product.id } : {}),
    name: product.name,
    description: product.description,
    category: product.category,
    cost_price: product.costPrice,
    sale_price: salePrice,
    images: product.images,
    characteristics: product.characteristics,
    weight: product.weight,
    length: product.length,
    height: product.height,
    width: product.width,
    stock: product.stock,
    featured: product.featured,
    active: product.active,
    updated_at: new Date().toISOString(),
  }
}

function mapSettings(row: DbSettings): StoreSettings {
  return {
    storeName: row.store_name,
    storeDescription: row.store_description,
    marginPercent: Number(row.margin_percent),
    pixDiscountPercent: Number(row.pix_discount_percent),
    originCep: row.origin_cep,
    pixKey: row.pix_key,
    pixKeyType: row.pix_key_type as StoreSettings['pixKeyType'],
    whatsapp: row.whatsapp,
    email: row.email,
  }
}

function mapSettingsToDb(settings: StoreSettings) {
  return {
    id: 'main',
    store_name: settings.storeName,
    store_description: settings.storeDescription,
    margin_percent: settings.marginPercent,
    pix_discount_percent: settings.pixDiscountPercent,
    origin_cep: settings.originCep,
    pix_key: settings.pixKey,
    pix_key_type: settings.pixKeyType,
    whatsapp: settings.whatsapp,
    email: settings.email,
    updated_at: new Date().toISOString(),
  }
}

function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    items: row.items,
    customer: row.customer,
    shipping: row.shipping,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.payment_method as Order['paymentMethod'],
    status: row.status as Order['status'],
    pixCode: row.pix_code || undefined,
    createdAt: row.created_at,
  }
}

export function getBackendMode(): 'supabase' | 'local' {
  return isSupabaseConfigured ? 'supabase' : 'local'
}

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) {
    initializeStorage()
    return getLocalProducts()
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data?.length) {
    initializeStorage()
    return getLocalProducts()
  }

  return (data as DbProduct[]).map(mapProduct)
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  if (!supabase) return getLocalProducts()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return getLocalProducts()
  return (data as DbProduct[]).map(mapProduct)
}

export async function createProduct(
  product: Omit<Product, 'id' | 'salePrice' | 'createdAt' | 'updatedAt'>,
  marginPercent: number
): Promise<Product> {
  const salePrice = calculateSalePrice(product.costPrice, marginPercent)

  if (!supabase) {
    const now = new Date().toISOString()
    const newProduct: Product = {
      ...product,
      id: generateId(),
      salePrice,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...getLocalProducts(), newProduct]
    saveLocalProducts(updated)
    return newProduct
  }

  const { data, error } = await supabase
    .from('products')
    .insert(mapProductToDb(product, salePrice))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapProduct(data as DbProduct)
}

export async function updateProductApi(
  id: string,
  updates: Partial<Product>,
  marginPercent: number,
  current?: Product
): Promise<void> {
  if (!supabase) {
    const updated = getLocalProducts().map((p) => {
      if (p.id !== id) return p
      const merged = { ...p, ...updates, updatedAt: new Date().toISOString() }
      if (updates.costPrice !== undefined) {
        merged.salePrice = calculateSalePrice(updates.costPrice, marginPercent)
      }
      return merged
    })
    saveLocalProducts(updated)
    return
  }

  let base = current
  if (!base) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) base = mapProduct(data as DbProduct)
  }
  if (!base) throw new Error('Produto não encontrado')

  const merged = { ...base, ...updates }
  const salePrice =
    updates.costPrice !== undefined
      ? calculateSalePrice(updates.costPrice, marginPercent)
      : merged.salePrice

  const { error } = await supabase
    .from('products')
    .update(mapProductToDb(merged, salePrice))
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteProductApi(id: string): Promise<void> {
  if (!supabase) {
    saveLocalProducts(getLocalProducts().filter((p) => p.id !== id))
    return
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchSettings(): Promise<StoreSettings> {
  if (!supabase) return getLocalSettings()

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'main')
    .single()

  if (error || !data) return getLocalSettings()
  return mapSettings(data as DbSettings)
}

export async function saveSettingsApi(settings: StoreSettings): Promise<void> {
  if (!supabase) {
    saveLocalSettings(settings)
    return
  }

  const { error } = await supabase
    .from('store_settings')
    .upsert(mapSettingsToDb(settings))

  if (error) throw new Error(error.message)
}

export async function fetchOrders(): Promise<Order[]> {
  if (!supabase) return getLocalOrders()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return getLocalOrders()
  return (data as DbOrder[]).map(mapOrder)
}

export async function createOrder(order: Order): Promise<void> {
  if (!supabase) {
    saveLocalOrder(order)
    return
  }

  const { error } = await supabase.from('orders').insert({
    id: order.id,
    items: order.items,
    customer: order.customer,
    shipping: order.shipping,
    subtotal: order.subtotal,
    shipping_cost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    payment_method: order.paymentMethod,
    status: order.status,
    pix_code: order.pixCode || null,
  })

  if (error) {
    saveLocalOrder(order)
  }
}

export async function updateOrderStatusApi(
  orderId: string,
  status: Order['status']
): Promise<void> {
  if (!supabase) {
    updateLocalOrderStatus(orderId, status)
    return
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) updateLocalOrderStatus(orderId, status)
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) {
    const { fileToBase64 } = await import('./storage')
    return fileToBase64(file)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) {
    const { fileToBase64 } = await import('./storage')
    return fileToBase64(file)
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function signInAdmin(email: string, password: string): Promise<boolean> {
  if (!supabase) {
    const { login } = await import('./storage')
    return login(email, password)
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return !error
}

export async function signOutAdmin(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
  const { logout } = await import('./storage')
  logout()
}

export async function getAdminSession(): Promise<boolean> {
  if (!supabase) {
    const { isAuthenticated } = await import('./storage')
    return isAuthenticated()
  }

  const { data } = await supabase.auth.getSession()
  return Boolean(data.session)
}
