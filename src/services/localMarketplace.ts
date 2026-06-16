import type { Profile, Seller, Product, Order, SubOrder, PlatformSettings, UserRole, SellerStatus } from '../types'
import { DEFAULT_PLATFORM_SETTINGS, calcSalePrice, calcPlatformFee, generateId } from '../types'

const KEYS = {
  users: 'avroz_users',
  session: 'avroz_session',
  sellers: 'avroz_sellers',
  products: 'avroz_products',
  orders: 'avroz_orders',
  subOrders: 'avroz_sub_orders',
  settings: 'avroz_platform_settings',
}

interface LocalUser {
  id: string
  email: string
  password: string
  profile: Profile
}

function load<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key)
    return d ? JSON.parse(d) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

function initDemo() {
  if (localStorage.getItem(KEYS.products)) return

  const adminId = 'admin-user'
  const seller1Id = 'seller-1'
  const seller2Id = 'seller-2'

  const users: LocalUser[] = [
    {
      id: adminId, email: 'admin@avrozgames.com.br', password: 'avroz2024',
      profile: { id: adminId, email: 'admin@avrozgames.com.br', fullName: 'Administrador', phone: '', cpf: '', role: 'admin', createdAt: new Date().toISOString() },
    },
    {
      id: 'customer-demo', email: 'cliente@demo.com', password: 'demo1234',
      profile: { id: 'customer-demo', email: 'cliente@demo.com', fullName: 'Cliente Demo', phone: '', cpf: '', role: 'customer', createdAt: new Date().toISOString() },
    },
    {
      id: seller1Id, email: 'vendedor1@demo.com', password: 'demo1234',
      profile: { id: seller1Id, email: 'vendedor1@demo.com', fullName: 'GameStore BH', phone: '', cpf: '', role: 'seller', createdAt: new Date().toISOString() },
    },
    {
      id: seller2Id, email: 'vendedor2@demo.com', password: 'demo1234',
      profile: { id: seller2Id, email: 'vendedor2@demo.com', fullName: 'Retro Games SP', phone: '', cpf: '', role: 'seller', createdAt: new Date().toISOString() },
    },
  ]

  const sellers: Seller[] = [
    { id: 's-1', userId: seller1Id, storeName: 'GameStore BH', storeSlug: 'gamestore-bh', description: 'Jogos e acessórios', documentType: 'cpf', documentNumber: '98765432100', pixKey: 'vendedor1@demo.com', pixKeyType: 'email', status: 'approved', rating: 4.8, totalSales: 120, createdAt: new Date().toISOString() },
    { id: 's-2', userId: seller2Id, storeName: 'Retro Games SP', storeSlug: 'retro-games-sp', description: 'Colecionáveis e retro', documentType: 'cpf', documentNumber: '11122233344', pixKey: 'vendedor2@demo.com', pixKeyType: 'email', status: 'approved', rating: 4.9, totalSales: 85, createdAt: new Date().toISOString() },
  ]

  const fee = 25
  const mk = (id: string, sellerId: string, sn: string, ss: string, name: string, cat: string, sp: number, img: string, feat = false): Product => {
    const salePrice = calcSalePrice(sp, fee)
    return {
      id, sellerId, sellerName: sn, sellerSlug: ss, name, description: `${name} — ${sn}`, category: cat,
      sellerPrice: sp, salePrice, platformFee: calcPlatformFee(salePrice, fee),
      images: [img], characteristics: [{ label: 'Vendedor', value: sn }],
      weight: 0.3, length: 20, height: 10, width: 15, stock: 20, featured: feat, active: true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
  }

  const products = [
    mk('p1', 's-1', 'GameStore BH', 'gamestore-bh', 'God of War Ragnarök PS5', 'PlayStation', 187.5, 'https://images.unsplash.com/photo-1612287230202-1ff1d85c1ef7?w=600&h=600&fit=crop', true),
    mk('p2', 's-1', 'GameStore BH', 'gamestore-bh', 'Controle DualSense', 'Acessórios', 262.5, 'https://images.unsplash.com/photo-1606148013644-e571c4d5b5c5?w=600&h=600&fit=crop', true),
    mk('p3', 's-2', 'Retro Games SP', 'retro-games-sp', 'Neo Geo AES Mini', 'Retro Gaming', 750, 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=600&fit=crop', true),
    mk('p4', 's-2', 'Retro Games SP', 'retro-games-sp', 'Metal Slug Anthology', 'Jogos', 112.5, 'https://images.unsplash.com/photo-1538488886555-98f798d929bf?w=600&h=600&fit=crop'),
  ]

  save(KEYS.users, users)
  save(KEYS.sellers, sellers)
  save(KEYS.products, products)
  save(KEYS.settings, DEFAULT_PLATFORM_SETTINGS)
  save(KEYS.orders, [])
  save(KEYS.subOrders, [])
}

initDemo()

export function signUpLocal(email: string, password: string, fullName: string, role: UserRole) {
  const users = load<LocalUser[]>(KEYS.users, [])
  if (users.find((u) => u.email === email)) throw new Error('E-mail já cadastrado')
  const id = generateId()
  users.push({ id, email, password, profile: { id, email, fullName, phone: '', cpf: '', role, createdAt: new Date().toISOString() } })
  save(KEYS.users, users)
  save(KEYS.session, id)
}

export function signInLocal(email: string, password: string) {
  const user = load<LocalUser[]>(KEYS.users, []).find((u) => u.email === email && u.password === password)
  if (!user) return false
  save(KEYS.session, user.id)
  return true
}

export function signOutLocal() { localStorage.removeItem(KEYS.session) }

export function getLocalSession() {
  const id = localStorage.getItem(KEYS.session)
  return id ? { user: { id } } : null
}

export function getLocalProfile(): Profile | null {
  const id = localStorage.getItem(KEYS.session)
  if (!id) return null
  return load<LocalUser[]>(KEYS.users, []).find((u) => u.id === id)?.profile || null
}

export function getLocalSeller(): Seller | null {
  const profile = getLocalProfile()
  if (!profile || profile.role !== 'seller') return null
  return load<Seller[]>(KEYS.sellers, []).find((s) => s.userId === profile.id) || null
}

export function registerSellerLocal(payload: {
  storeName: string; storeSlug: string; description: string
  documentType: 'cpf' | 'cnpj'; documentNumber: string; pixKey: string; pixKeyType: string; contractAccepted: boolean
}) {
  const profile = getLocalProfile()
  if (!profile) throw new Error('Faça login')
  const users = load<LocalUser[]>(KEYS.users, [])
  const idx = users.findIndex((u) => u.id === profile.id)
  if (idx >= 0) users[idx].profile.role = 'seller'
  save(KEYS.users, users)
  const sellers = load<Seller[]>(KEYS.sellers, [])
  sellers.push({
    id: generateId(), userId: profile.id, storeName: payload.storeName, storeSlug: payload.storeSlug,
    description: payload.description, documentType: payload.documentType, documentNumber: payload.documentNumber,
    pixKey: payload.pixKey, pixKeyType: payload.pixKeyType, status: 'pending',
    sellerContractAcceptedAt: payload.contractAccepted ? new Date().toISOString() : undefined,
    rating: 0, totalSales: 0, createdAt: new Date().toISOString(),
  })
  save(KEYS.sellers, sellers)
}

export function getProducts() { return load<Product[]>(KEYS.products, []).filter((p) => p.active) }
export function getAllProducts() { return load<Product[]>(KEYS.products, []) }
export function createProduct(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const products = load<Product[]>(KEYS.products, [])
  const product = { ...p, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  products.unshift(product)
  save(KEYS.products, products)
  return product
}
export function updateProduct(id: string, updates: Partial<Product>, feePercent: number) {
  save(KEYS.products, load<Product[]>(KEYS.products, []).map((p) => {
    if (p.id !== id) return p
    const m = { ...p, ...updates, updatedAt: new Date().toISOString() }
    if (updates.sellerPrice !== undefined) {
      m.salePrice = calcSalePrice(updates.sellerPrice, feePercent)
      m.platformFee = calcPlatformFee(m.salePrice, feePercent)
    }
    return m
  }))
}
export function deleteProduct(id: string) { save(KEYS.products, load<Product[]>(KEYS.products, []).filter((p) => p.id !== id)) }
export function createOrder(order: Order) {
  save(KEYS.orders, [order, ...load<Order[]>(KEYS.orders, [])])
  save(KEYS.subOrders, [...load<SubOrder[]>(KEYS.subOrders, []), ...order.subOrders])
  return order
}
export function getOrders() { return load<Order[]>(KEYS.orders, []) }
export function getSubOrders() { return load<SubOrder[]>(KEYS.subOrders, []) }
export function getSellers() { return load<Seller[]>(KEYS.sellers, []) }
export function getSettings() { return load<PlatformSettings>(KEYS.settings, DEFAULT_PLATFORM_SETTINGS) }
export function saveSettings(s: PlatformSettings) { save(KEYS.settings, s) }
export function confirmReceipt(subOrderId: string) {
  save(KEYS.subOrders, load<SubOrder[]>(KEYS.subOrders, []).map((s) =>
    s.id === subOrderId ? { ...s, status: 'buyer_confirmed' as const, escrowStatus: 'released' as const, buyerConfirmedAt: new Date().toISOString(), payoutReleasedAt: new Date().toISOString() } : s))
}
export function updateSubOrderStatus(subOrderId: string, status: string, trackingCode?: string) {
  save(KEYS.subOrders, load<SubOrder[]>(KEYS.subOrders, []).map((s) =>
    s.id === subOrderId ? { ...s, status: status as SubOrder['status'], trackingCode: trackingCode || s.trackingCode } : s))
}
export function updateSellerStatus(sellerId: string, status: SellerStatus, reason?: string) {
  save(KEYS.sellers, load<Seller[]>(KEYS.sellers, []).map((s) => s.id === sellerId ? { ...s, status, rejectionReason: reason } : s))
}
