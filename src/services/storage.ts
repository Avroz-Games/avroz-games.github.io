import type { Product, StoreSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const PRODUCTS_KEY = 'avroz_products'
const SETTINGS_KEY = 'avroz_settings'
const ORDERS_KEY = 'avroz_orders'
const AUTH_KEY = 'avroz_auth'

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'avroz2024',
}

export function calculateSalePrice(costPrice: number, marginPercent = 45): number {
  return Math.round(costPrice * (1 + marginPercent / 100) * 100) / 100
}

export function calculatePixPrice(salePrice: number, discountPercent = 10): number {
  return Math.round(salePrice * (1 - discountPercent / 100) * 100) / 100
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY)
    if (data) return JSON.parse(data)
  } catch {
    /* ignore */
  }
  return getDefaultProducts()
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function getSettings(): StoreSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: StoreSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getOrders() {
  try {
    const data = localStorage.getItem(ORDERS_KEY)
    if (data) return JSON.parse(data)
  } catch {
    /* ignore */
  }
  return []
}

export function saveOrder(order: unknown) {
  const orders = getOrders()
  orders.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function updateOrderStatus(orderId: string, status: string) {
  const orders = getOrders()
  const updated = orders.map((o: { id: string; status: string }) =>
    o.id === orderId ? { ...o, status } : o
  )
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}

export function login(username: string, password: string): boolean {
  if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
    localStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getDefaultProducts(): Product[] {
  const now = new Date().toISOString()
  const products: Omit<Product, 'salePrice'>[] = [
    {
      id: 'demo-1',
      name: 'God of War Ragnarök - PS5',
      description:
        'Embarque numa jornada épica com Kratos e Atreus. Ação cinematográfica, combates intensos e uma história emocionante que redefine a franquia.',
      category: 'Jogos',
      costPrice: 179.9,
      images: [
        'https://images.unsplash.com/photo-1612287230202-1ff1d85c1ef7?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'Plataforma', value: 'PlayStation 5' },
        { label: 'Gênero', value: 'Ação/Aventura' },
        { label: 'Classificação', value: '18 anos' },
        { label: 'Idioma', value: 'Português (BR)' },
      ],
      weight: 0.15,
      length: 17,
      height: 1.5,
      width: 13.5,
      stock: 25,
      featured: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-2',
      name: 'Controle DualSense - Midnight Black',
      description:
        'Controle oficial PlayStation 5 com feedback háptico, gatilhos adaptativos e microfone integrado. Conforto premium para longas sessões.',
      category: 'Acessórios',
      costPrice: 289.9,
      images: [
        'https://images.unsplash.com/photo-1606148013644-e571c4d5b5c5?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'Compatibilidade', value: 'PS5 / PC' },
        { label: 'Conexão', value: 'USB-C / Bluetooth' },
        { label: 'Cor', value: 'Midnight Black' },
        { label: 'Garantia', value: '12 meses' },
      ],
      weight: 0.28,
      length: 16,
      height: 6.5,
      width: 10.6,
      stock: 40,
      featured: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-3',
      name: 'The Legend of Zelda: Tears of the Kingdom',
      description:
        'Explore Hyrule como nunca antes. Construa, voe e mergulhe num mundo vasto cheio de mistérios, puzzles e aventuras inesquecíveis.',
      category: 'Jogos',
      costPrice: 249.9,
      images: [
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'Plataforma', value: 'Nintendo Switch' },
        { label: 'Gênero', value: 'Ação/Aventura' },
        { label: 'Classificação', value: '12 anos' },
        { label: 'Idioma', value: 'Português (BR)' },
      ],
      weight: 0.05,
      length: 10.4,
      height: 0.7,
      width: 17,
      stock: 18,
      featured: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-4',
      name: 'Headset Gamer RGB Pro',
      description:
        'Som surround 7.1, microfone com cancelamento de ruído e almofadas memory foam. Ideal para competições e streaming.',
      category: 'Acessórios',
      costPrice: 149.9,
      images: [
        'https://images.unsplash.com/photo-1599669454699-248893623440?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'Conexão', value: 'USB / P2' },
        { label: 'Drivers', value: '50mm' },
        { label: 'Iluminação', value: 'RGB' },
        { label: 'Compatibilidade', value: 'Multi-plataforma' },
      ],
      weight: 0.35,
      length: 20,
      height: 10,
      width: 18,
      stock: 30,
      featured: false,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-5',
      name: 'Elden Ring - Edição de Colecionador',
      description:
        'A obra-prima de FromSoftware em parceria com George R.R. Martin. Mundo aberto imersivo com combates desafiadores.',
      category: 'Colecionáveis',
      costPrice: 399.9,
      images: [
        'https://images.unsplash.com/photo-1538488886555-98f798d929bf?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'Plataforma', value: 'PS5 / Xbox / PC' },
        { label: 'Edição', value: 'Colecionador' },
        { label: 'Conteúdo Extra', value: 'Steelbook + Artbook' },
        { label: 'Classificação', value: '16 anos' },
      ],
      weight: 0.8,
      length: 25,
      height: 5,
      width: 20,
      stock: 8,
      featured: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-6',
      name: 'Mouse Gamer Wireless 16000 DPI',
      description:
        'Precisão extrema com sensor óptico de 16000 DPI, 8 botões programáveis e bateria de longa duração. Leve e ergonômico.',
      category: 'PC Gaming',
      costPrice: 89.9,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
      ],
      characteristics: [
        { label: 'DPI', value: '16000' },
        { label: 'Conexão', value: '2.4GHz Wireless' },
        { label: 'Peso', value: '75g' },
        { label: 'Botões', value: '8 programáveis' },
      ],
      weight: 0.12,
      length: 12.5,
      height: 4,
      width: 6.5,
      stock: 55,
      featured: false,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]

  return products.map((p) => ({
    ...p,
    salePrice: calculateSalePrice(p.costPrice),
  }))
}

export function initializeStorage(): void {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    saveProducts(getDefaultProducts())
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    saveSettings(DEFAULT_SETTINGS)
  }
}
