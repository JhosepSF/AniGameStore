import { create } from 'zustand'
import { authService, UserProfile } from '../services/authService'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  addresses: any[]
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  loadAddresses: () => Promise<void>
  addAddress: (address: any) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  addresses: [],

  checkAuth: async () => {
    set({ loading: true })
    try {
      const user = await authService.getCurrentUser()
      set({ user })
      if (user) {
        await get().loadAddresses()
      }
    } catch (err) {
      console.error('Check auth failed', err)
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const user = await authService.login(email, password)
      set({ user })
      await get().loadAddresses()
    } catch (err) {
      set({ user: null })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true })
    try {
      await authService.loginWithGoogle()
      // If mock mode, load the user instantly
      const user = await authService.getCurrentUser()
      set({ user })
      if (user) {
        await get().loadAddresses()
      }
    } catch (err) {
      set({ user: null })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  register: async (email, password, firstName, lastName, phone) => {
    set({ loading: true })
    try {
      const user = await authService.register(email, password, firstName, lastName, phone)
      set({ user })
      await get().loadAddresses()
    } catch (err) {
      set({ user: null })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await authService.logout()
      set({ user: null, addresses: [] })
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (profile) => {
    try {
      const updated = await authService.updateProfile(profile)
      set({ user: updated })
    } catch (err) {
      console.error('Update profile error', err)
      throw err
    }
  },

  loadAddresses: async () => {
    const user = get().user
    if (!user) return
    try {
      const addresses = await authService.getAddresses(user.id)
      set({ addresses })
    } catch (err) {
      console.error('Load addresses error', err)
    }
  },

  addAddress: async (address) => {
    const user = get().user
    if (!user) return
    try {
      const newAddr = await authService.addAddress({ ...address, user_id: user.id })
      set(state => ({ addresses: [...state.addresses, newAddr] }))
    } catch (err) {
      console.error('Add address error', err)
      throw err
    }
  }
}))
