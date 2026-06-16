import type { ShippingOption } from '../types'

interface PackageDimensions {
  weight: number
  length: number
  height: number
  width: number
}

const CORREIOS_SERVICES = [
  { code: '04014', name: 'SEDEX', description: 'Entrega expressa', baseDays: 3 },
  { code: '04510', name: 'PAC', description: 'Entrega econômica', baseDays: 8 },
  { code: '04782', name: 'SEDEX 12', description: 'Entrega até 12h', baseDays: 1 },
] as const

function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

function getCepRegion(cep: string): number {
  const prefix = parseInt(cleanCep(cep).slice(0, 2), 10)
  if (prefix >= 1 && prefix <= 19) return 1
  if (prefix >= 20 && prefix <= 28) return 2
  if (prefix >= 29 && prefix <= 39) return 3
  if (prefix >= 40 && prefix <= 49) return 4
  if (prefix >= 50 && prefix <= 59) return 5
  if (prefix >= 60 && prefix <= 63) return 6
  if (prefix >= 64 && prefix <= 69) return 7
  if (prefix >= 70 && prefix <= 73) return 8
  if (prefix >= 74 && prefix <= 76) return 9
  if (prefix >= 77 && prefix <= 79) return 10
  if (prefix >= 80 && prefix <= 87) return 11
  if (prefix >= 88 && prefix <= 89) return 12
  if (prefix >= 90 && prefix <= 99) return 13
  return 1
}

function calculateDistanceFactor(originCep: string, destCep: string): number {
  const originRegion = getCepRegion(originCep)
  const destRegion = getCepRegion(destCep)
  const diff = Math.abs(originRegion - destRegion)
  return 1 + diff * 0.15
}

function aggregatePackages(packages: PackageDimensions[]) {
  const weight = packages.reduce((sum, p) => sum + p.weight, 0)
  return {
    weight: Math.max(weight, 0.3),
    length: Math.max(...packages.map((p) => p.length), 16),
    height: Math.max(...packages.map((p) => p.height), 2),
    width: Math.max(...packages.map((p) => p.width), 11),
  }
}

async function fetchCorreiosPrice(
  originCep: string,
  destCep: string,
  dimensions: PackageDimensions,
  serviceCode: string
): Promise<number | null> {
  const params = new URLSearchParams({
    nCdEmpresa: '',
    sDsSenha: '',
    nCdServico: serviceCode,
    sCepOrigem: cleanCep(originCep),
    sCepDestino: cleanCep(destCep),
    nVlPeso: dimensions.weight.toFixed(2),
    nCdFormato: '1',
    nVlComprimento: Math.min(dimensions.length, 100).toFixed(0),
    nVlAltura: Math.min(dimensions.height, 100).toFixed(0),
    nVlLargura: Math.min(dimensions.width, 100).toFixed(0),
    nVlDiametro: '0',
    sCdMaoPropria: 'N',
    nVlValorDeclarado: '0',
    sCdAvisoRecebimento: 'N',
  })

  try {
    const response = await fetch(
      `https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params}`,
      { mode: 'cors' }
    )
    if (!response.ok) return null
    const text = await response.text()
    const priceMatch = text.match(/<Valor>([\d,]+)<\/Valor>/)
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'))
    }
    return null
  } catch {
    return null
  }
}

function calculateFallbackPrice(
  weight: number,
  distanceFactor: number,
  serviceIndex: number
): number {
  const basePrices = [32.5, 18.9, 45.0]
  const weightFactor = Math.max(weight, 0.3) * 8
  const price = (basePrices[serviceIndex] + weightFactor) * distanceFactor
  return Math.round(price * 100) / 100
}

function calculateFallbackDays(
  distanceFactor: number,
  baseDays: number
): number {
  return Math.ceil(baseDays * distanceFactor)
}

export async function calculateShipping(
  originCep: string,
  destCep: string,
  packages: PackageDimensions[]
): Promise<ShippingOption[]> {
  const dimensions = aggregatePackages(packages)
  const distanceFactor = calculateDistanceFactor(originCep, destCep)
  const options: ShippingOption[] = []

  for (let i = 0; i < CORREIOS_SERVICES.length; i++) {
    const service = CORREIOS_SERVICES[i]
    let price = await fetchCorreiosPrice(originCep, destCep, dimensions, service.code)

    if (price === null || price <= 0) {
      price = calculateFallbackPrice(dimensions.weight, distanceFactor, i)
    }

    options.push({
      service: service.name,
      code: service.code,
      price,
      deliveryDays: calculateFallbackDays(distanceFactor, service.baseDays),
      description: service.description,
    })
  }

  return options.sort((a, b) => a.price - b.price)
}

export function generatePixCode(
  pixKey: string,
  amount: number,
  merchantName: string,
  city: string,
  txId: string
): string {
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0')
    return `${id}${len}${value}`
  }

  const payload = [
    formatField('00', '01'),
    formatField('26', formatField('00', 'BR.GOV.BCB.PIX') + formatField('01', pixKey)),
    formatField('52', '0000'),
    formatField('53', '986'),
    formatField('54', amount.toFixed(2)),
    formatField('58', 'BR'),
    formatField('59', merchantName.slice(0, 25)),
    formatField('60', city.slice(0, 15)),
    formatField('62', formatField('05', txId.slice(0, 25))),
  ].join('')

  const fullPayload = payload + '6304'
  const crc = calculateCRC16(fullPayload)
  return fullPayload + crc
}

function calculateCRC16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}
