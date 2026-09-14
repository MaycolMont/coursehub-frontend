import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/auth.service'
import type { AuthTokens, Usuario } from '@/types'

export interface AuthContextType {
  user: Usuario | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (correo: string, password: string) => Promise<void>
  register: (correo: string, pseudonimo: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Usuario>) => Promise<void>
  refreshProfile: () => Promise<Usuario>
}

// React context is a non-component export; Fast Refresh only applies to the component
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('coursehub_access_token')
      const refreshToken = localStorage.getItem('coursehub_refresh_token')

      if (accessToken && refreshToken) {
        setTokens({ access: accessToken, refresh: refreshToken })
        try {
          const me = await authService.getMe()
          setUser(me)
        } catch {
          localStorage.removeItem('coursehub_access_token')
          localStorage.removeItem('coursehub_refresh_token')
          setTokens(null)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (correo: string, password: string) => {
    const res = await authService.login({ correo, password })
    localStorage.setItem('coursehub_access_token', res.access)
    localStorage.setItem('coursehub_refresh_token', res.refresh)
    setTokens({ access: res.access, refresh: res.refresh })
    setUser(res.usuario)
  }

  const register = async (correo: string, pseudonimo: string, password: string) => {
    await authService.register({ correo, pseudonimo, password })
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('coursehub_access_token')
    localStorage.removeItem('coursehub_refresh_token')
    setTokens(null)
    setUser(null)
  }

  const updateProfile = async (data: Partial<Usuario>) => {
    const updated = await authService.updateProfile(data)
    setUser(updated)
  }

  const refreshProfile = async () => {
    const me = await authService.getMe()
    setUser(me)
    return me
  }

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
