export type UserRole = 'customer' | 'seller' | 'admin'

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed'

export type SubOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'buyer_confirmed'
  | 'payout_released'
  | 'cancelled'
  | 'disputed'
  | 'refunded'

export interface ProductCharacteristic {
  label: string
  value: string
}

export interface Profile {
  id: string
  email: string
  fullName: string
  phone: string
  cpf: string
  role: UserRole
  termsAcceptedAt?: string
  privacyAcceptedAt?: string
  createdAt: string
}

export interface Seller {
  id: string
  userId: string
  storeName: string
  storeSlug: string
  description: string
  documentType: 'cpf' | 'cnpj'
  documentNumber: string
  pixKey: string
  pixKeyType: string
  status: SellerStatus
  rejectionReason?: string
  sellerContractAcceptedAt?: string
  rating: number
  totalSales: number
  createdAt: string
}

export interface Product {
  id: string
  sellerId: string
  sellerName?: string
  sellerSlug?: string
  name: string
  description: string
  category: string
  sellerPrice: number
  salePrice: number
  platformFee: number
  images: string[]
  characteristics: ProductCharacteristic[]
  weight: number
  length: number
  height: number
  width: number
  stock: number
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ShippingOption {
  service: string
  code: string
  price: number
  deliveryDays: number
  description: string
}

export interface Address {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface PlatformSettings {
  platformName: string
  platformDescription: string
  platformFeePercent: number
  pixDiscountPercent: number
  escrowDaysAutoRelease: number
  originCep: string
  platformPixKey: string
  platformPixKeyType: string
  supportEmail: string
  supportWhatsapp: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitSalePrice: number
  unitSellerPayout: number
  unitPlatformFee: number
}

export interface SubOrder {
  id: string
  orderId: string
  sellerId: string
  sellerName?: string
  subtotal: number
  sellerPayout: number
  platformFee: number
  shippingCost: number
  shipping?: ShippingOption
  status: SubOrderStatus
  escrowStatus: EscrowStatus
  trackingCode?: string
  shippedAt?: string
  buyerConfirmedAt?: string
  payoutReleasedAt?: string
  items: OrderItem[]
  createdAt: string
}

export interface Order {
  id: string
  buyerId: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  paymentMethod: 'pix' | 'card'
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  pixCode?: string
  shippingAddress: Address & { name: string; email: string; phone: string; cpf: string }
  subOrders: SubOrder[]
  createdAt: string
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'Avroz Games Marketplace',
  platformDescription: 'Marketplace gamer com vendedores verificados, pagamento seguro em escrow e entrega via Correios.',
  platformFeePercent: 25,
  pixDiscountPercent: 10,
  escrowDaysAutoRelease: 7,
  originCep: '01310100',
  platformPixKey: 'contato@avrozgames.com.br',
  platformPixKeyType: 'email',
  supportEmail: 'contato@avrozgames.com.br',
  supportWhatsapp: '5511999999999',
}

export const CATEGORIES = [
  'Jogos', 'Consoles', 'Acessórios', 'PC Gaming', 'Periféricos',
  'Cadeiras Gamer', 'Monitores', 'Headsets', 'Teclados & Mouses',
  'Colecionáveis', 'Funko Pop', 'Action Figures', 'Cartas & TCG',
  'Retro Gaming', 'Nintendo', 'PlayStation', 'Xbox',
  'Promoções', 'Lançamentos', 'Pré-venda',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Preço de venda = preço do vendedor + margem da plataforma */
export function calcSalePrice(sellerPrice: number, feePercent = 25): number {
  return Math.round((sellerPrice / (1 - feePercent / 100)) * 100) / 100
}

export function calcPlatformFee(salePrice: number, feePercent = 25): number {
  return Math.round(salePrice * (feePercent / 100) * 100) / 100
}

export function calcSellerPayout(salePrice: number, feePercent = 25): number {
  return Math.round(salePrice * (1 - feePercent / 100) * 100) / 100
}

export function calcPixPrice(salePrice: number, discountPercent = 10): number {
  return Math.round(salePrice * (1 - discountPercent / 100) * 100) / 100
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Compat legacy
export type StoreSettings = PlatformSettings & { storeName: string; storeDescription: string; marginPercent: number; pixKey: string; pixKeyType: string; whatsapp: string; email: string }
export const DEFAULT_SETTINGS = {
  ...DEFAULT_PLATFORM_SETTINGS,
  storeName: DEFAULT_PLATFORM_SETTINGS.platformName,
  storeDescription: DEFAULT_PLATFORM_SETTINGS.platformDescription,
  marginPercent: DEFAULT_PLATFORM_SETTINGS.platformFeePercent,
  pixKey: DEFAULT_PLATFORM_SETTINGS.platformPixKey,
  pixKeyType: DEFAULT_PLATFORM_SETTINGS.platformPixKeyType as 'email',
  whatsapp: DEFAULT_PLATFORM_SETTINGS.supportWhatsapp,
  email: DEFAULT_PLATFORM_SETTINGS.supportEmail,
}
