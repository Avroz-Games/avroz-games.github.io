export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!response.ok) return null
    const data: ViaCepResponse = await response.json()
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}

export function formatCep(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  if (clean.length <= 5) return clean
  return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`
}

export function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length <= 2) return clean.length ? `(${clean}` : ''
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 11) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
}
