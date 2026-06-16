/** Utilitários legados — preferir imports de `../types` e `marketplace.ts` */

export { formatCurrency, calcPixPrice, calcSalePrice, generateId } from '../types'

export function calculatePixPrice(salePrice: number, discountPercent = 10): number {
  return Math.round(salePrice * (1 - discountPercent / 100) * 100) / 100
}

export function calculateSalePrice(sellerPrice: number, feePercent = 25): number {
  return Math.round((sellerPrice / (1 - feePercent / 100)) * 100) / 100
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
