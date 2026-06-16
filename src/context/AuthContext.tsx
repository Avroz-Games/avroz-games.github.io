import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Profile, Seller } from '../types'
import * as mp from '../services/marketplace'

interface AuthContextType {
  profile: Profile | null
  seller: Seller | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSeller: boolean
  isCustomer: boolean
  backendMode: 'supabase' | 'local'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'seller') => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  /** Compat admin login */
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const p = await mp.getProfile()
    setProfile(p)
    if (p?.role === 'seller' || p?.role === 'admin') {
      setSeller(await mp.getSellerByUser())
    } else {
      setSeller(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const signIn = async (email: string, password: string) => {
    await mp.signIn(email, password)
    await refresh()
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'seller') => {
    await mp.signUp(email, password, fullName, role)
    await refresh()
  }

  const signOut = async () => {
    await mp.signOut()
    setProfile(null)
    setSeller(null)
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    const email = username.includes('@')
      ? username
      : username === 'admin'
        ? 'admin@avrozgames.com.br'
        : username
    try {
      await mp.signIn(email, password)
      const p = await mp.getProfile()
      if (p?.role !== 'admin') {
        await mp.signOut()
        setProfile(null)
        setSeller(null)
        return false
      }
      setProfile(p)
      setSeller(await mp.getSellerByUser())
      return true
    } catch {
      return false
    }
  }

  const logout = signOut

  return (
    <AuthContext.Provider value={{
      profile, seller, loading,
      isAuthenticated: !!profile,
      isAdmin: profile?.role === 'admin',
      isSeller: profile?.role === 'seller' && seller?.status === 'approved',
      isCustomer: profile?.role === 'customer',
      backendMode: mp.isOnline() ? 'supabase' : 'local',
      signIn, signUp, signOut, refresh, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

