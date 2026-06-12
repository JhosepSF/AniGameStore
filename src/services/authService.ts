import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  points_balance: number
  wallet_balance: number
  role: 'Superadmin' | 'Administrador' | 'Vendedor' | 'Soporte' | 'Cliente'
}

// Keep a simple in-memory session when running in Mock mode
let mockSessionUser: UserProfile | null = null

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Fetch additional profile fields
          const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // Fetch user role mapping
          const { data: rMapping } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', session.user.id)
            .single()

          const roleName = (rMapping as any)?.roles?.name || 'Cliente'

          if (!pError && profile) {
            return {
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              points_balance: profile.points_balance || 0,
              wallet_balance: Number(profile.wallet_balance) || 0.00,
              role: roleName
            }
          }
        }
      } catch (err) {
        console.error('Supabase get session failed, using mock profile.', err)
      }
    }
    return mockSessionUser
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      const user = await this.getCurrentUser()
      if (user) return user
      throw new Error('No se pudo recuperar el perfil de usuario.')
    }

    // Mock Login matching
    if (email === 'admin@anigames.com' && password === 'admin123') {
      mockSessionUser = {
        id: 'usr-mock-123',
        email: 'admin@anigames.com',
        first_name: 'Jhosep',
        last_name: 'San Martin',
        phone: '+51 987 654 321',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
        points_balance: 1250,
        wallet_balance: 45.50,
        role: 'Superadmin'
      }
    } else {
      // General client mock login
      mockSessionUser = {
        id: 'usr-client-456',
        email: email,
        first_name: email.split('@')[0],
        last_name: 'Usuario',
        points_balance: 100, // 100 welcome points
        wallet_balance: 0.00,
        role: 'Cliente'
      }
    }
    return mockSessionUser
  },

  async loginWithGoogle(): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw new Error(error.message)
    } else {
      // Mock OAuth login
      mockSessionUser = {
        id: 'usr-google-mock',
        email: 'otakugoogle@anigames.com',
        first_name: 'Google',
        last_name: 'User',
        points_balance: 100,
        wallet_balance: 0.00,
        role: 'Cliente'
      }
    }
  },

  async register(email: string, password: string, firstName: string, lastName: string, phone?: string): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone
          }
        }
      })
      if (error) throw new Error(error.message)
      if (data.user) {
        // Wait a small buffer to let profiles DB trigger finish
        await new Promise(r => setTimeout(r, 800))
        const profile = await this.getCurrentUser()
        if (profile) return profile
      }
      throw new Error('Usuario registrado pero no se pudo cargar la sesión.')
    }

    // Mock register
    mockSessionUser = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      points_balance: 100, // welcome bonus points
      wallet_balance: 0.00,
      role: 'Cliente'
    }
    return mockSessionUser
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    mockSessionUser = null
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const uId = (await supabase.auth.getUser()).data.user?.id
      if (!uId) throw new Error('No autorizado')

      const { data, error } = await supabase.from('profiles').update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url
      }).eq('id', uId).select().single()

      if (error) throw new Error(error.message)
      const updatedUser = await this.getCurrentUser()
      if (updatedUser) return updatedUser
    }

    if (mockSessionUser) {
      mockSessionUser = { ...mockSessionUser, ...profile } as UserProfile
      return mockSessionUser
    }
    throw new Error('No hay sesión activa')
  },

  async getAddresses(userId: string): Promise<any[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId)
      if (!error && data) return data
    }
    return [
      {
        id: 'addr-1',
        title: 'Mi Casa',
        full_name: 'Jhosep San Martin',
        address_line_1: 'Av. Universitaria 1234',
        address_line_2: 'Dpto 402',
        city: 'Lima',
        state_province: 'Lima',
        postal_code: '15082',
        phone: '987654321',
        is_default: true
      }
    ]
  },

  async addAddress(address: any): Promise<any> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('addresses').insert(address).select().single()
      if (error) throw new Error(error.message)
      return data
    }
    return {
      id: Math.random().toString(),
      ...address
    }
  }
}
