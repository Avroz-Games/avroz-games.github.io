import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type {
  Profile,
  Seller,
  Product,
  Order,
  SubOrder,
  PlatformSettings,
  UserRole,
  SellerStatus,
} from '../types'
import {
  DEFAULT_PLATFORM_SETTINGS,
  calcSalePrice,
  calcPlatformFee,
} from '../types'
import * as local from './localMarketplace'

export function isOnline(): boolean {
  return isSupabaseConfigured && supabase !== null
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  extra?: Record<string, string>
) {
  if (!supabase) return local.signUpLocal(email, password, fullName, role)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, ...extra },
    },
  })
  if (error) throw new Error(error.message)
  return data.user
}

export async function signIn(email: string, password: string) {
  if (!supabase) return local.signInLocal(email, password)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
  local.signOutLocal()
}

export async function getSession() {
  if (!supabase) return local.getLocalSession()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getProfile(): Promise<Profile | null> {
  if (!supabase) return local.getLocalProfile()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!data) return null
  return mapProfile(data)
}

export async function getSellerByUser(): Promise<Seller | null> {
  if (!supabase) return local.getLocalSeller()
  const profile = await getProfile()
  if (!profile) return null
  const { data } = await supabase.from('sellers').select('*').eq('user_id', profile.id).single()
  return data ? mapSeller(data) : null
}

export async function registerSeller(payload: {
  storeName: string
  storeSlug: string
  description: string
  documentType: 'cpf' | 'cnpj'
  documentNumber: string
  pixKey: string
  pixKeyType: string
  contractAccepted: boolean
}) {
  if (!supabase) return local.registerSellerLocal(payload)
  const profile = await getProfile()
  if (!profile) throw new Error('Faça login primeiro')

  await supabase.from('profiles').update({ role: 'seller' }).eq('id', profile.id)

  const { error } = await supabase.from('sellers').insert({
    user_id: profile.id,
    store_name: payload.storeName,
    store_slug: payload.storeSlug,
    description: payload.description,
    document_type: payload.documentType,
    document_number: payload.documentNumber,
    pix_key: payload.pixKey,
    pix_key_type: payload.pixKeyType,
    status: 'pending',
    seller_contract_accepted_at: payload.contractAccepted ? new Date().toISOString() : null,
  })
  if (error) throw new Error(error.message)
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return local.getProducts()
  const { data, error } = await supabase
    .from('products')
    .select('*, sellers(store_name, store_slug, status)')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error || !data) return local.getProducts()
  return data
    .filter((p: { sellers: { status: string } }) => p.sellers?.status === 'approved')
    .map(mapProduct)
}

export async function fetchSellerProducts(sellerId: string): Promise<Product[]> {
  if (!supabase) return local.getProducts().filter((p) => p.sellerId === sellerId)
  const { data } = await supabase.from('products').select('*').eq('seller_id', sellerId)
  return (data || []).map(mapProduct)
}

export async function createProduct(
  sellerId: string,
  product: Omit<Product, 'id' | 'salePrice' | 'platformFee' | 'createdAt' | 'updatedAt' | 'sellerName' | 'sellerSlug'>,
  feePercent: number
) {
  const salePrice = calcSalePrice(product.sellerPrice, feePercent)
  const platformFee = calcPlatformFee(salePrice, feePercent)

  if (!supabase) return local.createProduct({ ...product, sellerId, salePrice, platformFee })

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: sellerId,
      name: product.name,
      description: product.description,
      category: product.category,
      seller_price: product.sellerPrice,
      sale_price: salePrice,
      platform_fee: platformFee,
      images: product.images,
      characteristics: product.characteristics,
      weight: product.weight,
      length: product.length,
      height: product.height,
      width: product.width,
      stock: product.stock,
      featured: product.featured,
      active: product.active,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapProduct(data)
}

export async function updateProduct(id: string, updates: Partial<Product>, feePercent: number) {
  if (!supabase) return local.updateProduct(id, updates, feePercent)

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name) payload.name = updates.name
  if (updates.description) payload.description = updates.description
  if (updates.category) payload.category = updates.category
  if (updates.sellerPrice !== undefined) {
    payload.seller_price = updates.sellerPrice
    payload.sale_price = calcSalePrice(updates.sellerPrice, feePercent)
    payload.platform_fee = calcPlatformFee(payload.sale_price as number, feePercent)
  }
  if (updates.images) payload.images = updates.images
  if (updates.characteristics) payload.characteristics = updates.characteristics
  if (updates.stock !== undefined) payload.stock = updates.stock
  if (updates.featured !== undefined) payload.featured = updates.featured
  if (updates.active !== undefined) payload.active = updates.active
  if (updates.weight) payload.weight = updates.weight
  if (updates.length) payload.length = updates.length
  if (updates.height) payload.height = updates.height
  if (updates.width) payload.width = updates.width

  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string) {
  if (!supabase) return local.deleteProduct(id)
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Orders & Escrow ────────────────────────────────────────────────────────

export async function createMarketplaceOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  if (!supabase) return local.createOrder(order as Order)

  const { data: orderData, error } = await supabase
    .from('orders')
    .insert({
      buyer_id: order.buyerId,
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      payment_method: order.paymentMethod,
      pix_code: order.pixCode,
      status: 'paid',
      shipping_address: order.shippingAddress,
      buyer_contract_accepted_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(error.message)

  for (const sub of order.subOrders) {
    const { data: subData } = await supabase
      .from('sub_orders')
      .insert({
        order_id: orderData.id,
        seller_id: sub.sellerId,
        subtotal: sub.subtotal,
        seller_payout: sub.sellerPayout,
        platform_fee: sub.platformFee,
        shipping_cost: sub.shippingCost,
        shipping_option: sub.shipping,
        status: 'paid',
        escrow_status: 'held',
        auto_release_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select()
      .single()

    if (subData && sub.items.length) {
      await supabase.from('order_items').insert(
        sub.items.map((i) => ({
          sub_order_id: subData.id,
          product_id: i.productId,
          product_name: i.productName,
          quantity: i.quantity,
          unit_sale_price: i.unitSalePrice,
          unit_seller_payout: i.unitSellerPayout,
          unit_platform_fee: i.unitPlatformFee,
        }))
      )
    }
  }

  return { ...order, id: orderData.id, createdAt: orderData.created_at }
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!supabase) return local.getAllProducts()
  const { data } = await supabase.from('products').select('*, sellers(store_name, store_slug, status)').order('created_at', { ascending: false })
  return (data || []).map(mapProduct)
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (!supabase) return local.getOrders()
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (!data) return []
  return Promise.all(data.map(mapOrderWithSubs))
}

export async function fetchBuyerOrders(buyerId: string): Promise<Order[]> {
  if (!supabase) return local.getOrders().filter((o) => o.buyerId === buyerId)
  const { data } = await supabase.from('orders').select('*').eq('buyer_id', buyerId).order('created_at', { ascending: false })
  if (!data) return []
  return Promise.all(data.map(async (o) => mapOrderWithSubs(o)))
}

export async function fetchSellerSubOrders(sellerId: string): Promise<SubOrder[]> {
  if (!supabase) return local.getSubOrders().filter((s) => s.sellerId === sellerId)
  const { data } = await supabase.from('sub_orders').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false })
  if (!data) return []
  return Promise.all(data.map(async (s) => mapSubOrder(s)))
}

export async function confirmReceipt(subOrderId: string) {
  if (!supabase) return local.confirmReceipt(subOrderId)
  const { error } = await supabase.rpc('confirm_sub_order_receipt', { p_sub_order_id: subOrderId })
  if (error) throw new Error(error.message)
}

export async function updateSubOrderStatus(
  subOrderId: string,
  status: string,
  trackingCode?: string
) {
  if (!supabase) return local.updateSubOrderStatus(subOrderId, status, trackingCode)
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (trackingCode) payload.tracking_code = trackingCode
  if (status === 'shipped') payload.shipped_at = new Date().toISOString()
  await supabase.from('sub_orders').update(payload).eq('id', subOrderId)
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export async function fetchAllSellers(): Promise<Seller[]> {
  if (!supabase) return local.getSellers()
  const { data } = await supabase.from('sellers').select('*').order('created_at', { ascending: false })
  return (data || []).map(mapSeller)
}

export async function updateSellerStatus(sellerId: string, status: SellerStatus, reason?: string) {
  if (!supabase) return local.updateSellerStatus(sellerId, status, reason)
  await supabase.from('sellers').update({
    status,
    rejection_reason: reason || null,
    updated_at: new Date().toISOString(),
  }).eq('id', sellerId)
}

export async function fetchSettings(): Promise<PlatformSettings> {
  if (!supabase) return local.getSettings()
  const { data } = await supabase.from('platform_settings').select('*').eq('id', 'main').single()
  return data ? mapSettings(data) : DEFAULT_PLATFORM_SETTINGS
}

export async function saveSettings(settings: PlatformSettings) {
  if (!supabase) return local.saveSettings(settings)
  await supabase.from('platform_settings').upsert({
    id: 'main',
    platform_name: settings.platformName,
    platform_description: settings.platformDescription,
    platform_fee_percent: settings.platformFeePercent,
    pix_discount_percent: settings.pixDiscountPercent,
    escrow_days_auto_release: settings.escrowDaysAutoRelease,
    origin_cep: settings.originCep,
    platform_pix_key: settings.platformPixKey,
    platform_pix_key_type: settings.platformPixKeyType,
    support_email: settings.supportEmail,
    support_whatsapp: settings.supportWhatsapp,
    updated_at: new Date().toISOString(),
  })
}

export async function uploadImage(file: File): Promise<string> {
  if (!supabase) {
    const { fileToBase64 } = await import('./storage')
    return fileToBase64(file)
  }
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) {
    const { fileToBase64 } = await import('./storage')
    return fileToBase64(file)
  }
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    phone: (row.phone as string) || '',
    cpf: (row.cpf as string) || '',
    role: row.role as Profile['role'],
    termsAcceptedAt: row.terms_accepted_at as string | undefined,
    privacyAcceptedAt: row.privacy_accepted_at as string | undefined,
    createdAt: row.created_at as string,
  }
}

function mapSeller(row: Record<string, unknown>): Seller {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    storeName: row.store_name as string,
    storeSlug: row.store_slug as string,
    description: (row.description as string) || '',
    documentType: row.document_type as 'cpf' | 'cnpj',
    documentNumber: row.document_number as string,
    pixKey: row.pix_key as string,
    pixKeyType: row.pix_key_type as string,
    status: row.status as Seller['status'],
    rejectionReason: row.rejection_reason as string | undefined,
    sellerContractAcceptedAt: row.seller_contract_accepted_at as string | undefined,
    rating: Number(row.rating) || 0,
    totalSales: Number(row.total_sales) || 0,
    createdAt: row.created_at as string,
  }
}

function mapProduct(row: Record<string, unknown>): Product {
  const sellers = row.sellers as { store_name: string; store_slug: string } | undefined
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    sellerName: sellers?.store_name,
    sellerSlug: sellers?.store_slug,
    name: row.name as string,
    description: row.description as string,
    category: row.category as string,
    sellerPrice: Number(row.seller_price),
    salePrice: Number(row.sale_price),
    platformFee: Number(row.platform_fee),
    images: (row.images as string[]) || [],
    characteristics: (row.characteristics as Product['characteristics']) || [],
    weight: Number(row.weight),
    length: Number(row.length),
    height: Number(row.height),
    width: Number(row.width),
    stock: row.stock as number,
    featured: row.featured as boolean,
    active: row.active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapSettings(row: Record<string, unknown>): PlatformSettings {
  return {
    platformName: row.platform_name as string,
    platformDescription: row.platform_description as string,
    platformFeePercent: Number(row.platform_fee_percent),
    pixDiscountPercent: Number(row.pix_discount_percent),
    escrowDaysAutoRelease: Number(row.escrow_days_auto_release),
    originCep: row.origin_cep as string,
    platformPixKey: row.platform_pix_key as string,
    platformPixKeyType: row.platform_pix_key_type as string,
    supportEmail: row.support_email as string,
    supportWhatsapp: row.support_whatsapp as string,
  }
}

async function mapSubOrder(row: Record<string, unknown>): Promise<SubOrder> {
  let items: SubOrder['items'] = []
  if (supabase) {
    const { data } = await supabase.from('order_items').select('*').eq('sub_order_id', row.id)
    items = (data || []).map((i: Record<string, unknown>) => ({
      id: i.id as string,
      productId: i.product_id as string,
      productName: i.product_name as string,
      quantity: i.quantity as number,
      unitSalePrice: Number(i.unit_sale_price),
      unitSellerPayout: Number(i.unit_seller_payout),
      unitPlatformFee: Number(i.unit_platform_fee),
    }))
  }
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    sellerId: row.seller_id as string,
    subtotal: Number(row.subtotal),
    sellerPayout: Number(row.seller_payout),
    platformFee: Number(row.platform_fee),
    shippingCost: Number(row.shipping_cost),
    shipping: row.shipping_option as SubOrder['shipping'],
    status: row.status as SubOrder['status'],
    escrowStatus: row.escrow_status as SubOrder['escrowStatus'],
    trackingCode: row.tracking_code as string | undefined,
    shippedAt: row.shipped_at as string | undefined,
    buyerConfirmedAt: row.buyer_confirmed_at as string | undefined,
    payoutReleasedAt: row.payout_released_at as string | undefined,
    items,
    createdAt: row.created_at as string,
  }
}

async function mapOrderWithSubs(row: Record<string, unknown>): Promise<Order> {
  let subOrders: SubOrder[] = []
  if (supabase) {
    const { data } = await supabase.from('sub_orders').select('*').eq('order_id', row.id)
    subOrders = await Promise.all((data || []).map(mapSubOrder))
  }
  const addr = row.shipping_address as Order['shippingAddress']
  return {
    id: row.id as string,
    buyerId: row.buyer_id as string,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.payment_method as Order['paymentMethod'],
    status: row.status as Order['status'],
    pixCode: row.pix_code as string | undefined,
    shippingAddress: addr,
    subOrders,
    createdAt: row.created_at as string,
  }
}

export { calcSalePrice, calcPlatformFee, calcSellerPayout, calcPixPrice, formatCurrency, generateId } from '../types'
