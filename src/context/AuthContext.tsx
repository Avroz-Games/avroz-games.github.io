import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { signInAdmin, signOutAdmin, getAdminSession, getBackendMode } from '../services/api'

interface AuthContextType {
  isAdmin: boolean
  loading: boolean
  backendMode: 'supabase' | 'local'
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const backendMode = getBackendMode()

  useEffect(() => {
    getAdminSession().then((session) => {
      setIsAdmin(session)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const success = await signInAdmin(username, password)
    setIsAdmin(success)
    return success
  }, [])

  const logout = useCallback(async () => {
    await signOutAdmin()
    setIsAdmin(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAdmin, loading, backendMode, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
