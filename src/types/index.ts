export interface ProductCharacteristic {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  costPrice: number
  salePrice: number
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

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  cpf: string
  address: Address
}

export interface Order {
  id: string
  items: CartItem[]
  customer: CustomerInfo
  shipping: ShippingOption
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  paymentMethod: 'pix' | 'card'
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  pixCode?: string
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  storeDescription: string
  marginPercent: number
  pixDiscountPercent: number
  originCep: string
  pixKey: string
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  whatsapp: string
  email: string
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Avroz Games',
  storeDescription: 'Os melhores jogos, consoles e acessórios com entrega rápida e pagamento PIX com desconto.',
  marginPercent: 45,
  pixDiscountPercent: 10,
  originCep: '01310100',
  pixKey: 'contato@avrozgames.com.br',
  pixKeyType: 'email',
  whatsapp: '5511999999999',
  email: 'contato@avrozgames.com.br',
}

export const CATEGORIES = [
  'Jogos',
  'Consoles',
  'Acessórios',
  'PC Gaming',
  'Periféricos',
  'Cadeiras Gamer',
  'Monitores',
  'Headsets',
  'Teclados & Mouses',
  'Colecionáveis',
  'Funko Pop',
  'Action Figures',
  'Cartas & TCG',
  'Retro Gaming',
  'Nintendo',
  'PlayStation',
  'Xbox',
  'Promoções',
  'Lançamentos',
  'Pré-venda',
] as const

export type Category = (typeof CATEGORIES)[number]
