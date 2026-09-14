import { api } from '@/lib/api'
import type { LoginPayload, LoginResponse, RegisterPayload, Usuario } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login/', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/api/auth/register/', payload)
    return data
  },

  async getMe(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/api/auth/me/')
    return data
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem('coursehub_refresh_token')
    if (refresh) {
      try {
        await api.post('/api/auth/logout/', { refresh })
      } catch {
        // Ignore logout errors
      }
    }
  },

  async updateProfile(data: Partial<Usuario>): Promise<Usuario> {
    const { data: updated } = await api.patch<Usuario>('/api/auth/me/', data)
    return updated
  },
}
