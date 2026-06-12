import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface WalletMovement {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export interface RewardMovement {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export interface Referral {
  id: string
  referred_email: string
  status: string
  created_at: string
}

export const MOCK_WALLET_MOVEMENTS: WalletMovement[] = [
  { id: 'wm-1', amount: 15.00, type: 'cashback_credit', description: 'Cashback por compra AG-202606-8947', created_at: '2026-06-10T13:40:00Z' },
  { id: 'wm-2', amount: 20.00, type: 'referral_bonus', description: 'Bono por registro de referido (Invitación)', created_at: '2026-06-08T09:00:00Z' }
]

export const MOCK_REWARD_MOVEMENTS: RewardMovement[] = [
  { id: 'rm-1', amount: 250, type: 'purchase_earned', description: 'Puntos por compra AG-202606-8947', created_at: '2026-06-10T13:40:00Z' },
  { id: 'rm-2', amount: 500, type: 'referral_bonus', description: 'Bono por referido registrado completando compra', created_at: '2026-06-08T09:00:00Z' },
  { id: 'rm-3', amount: 100, type: 'signup_bonus', description: 'Bono de bienvenida AniGames Store', created_at: '2026-06-01T10:00:00Z' }
]

export const MOCK_REFERRALS: Referral[] = [
  { id: 'ref-1', referred_email: 'tanjiro.kamado@gmail.com', status: 'purchase_completed', created_at: '2026-06-07T11:00:00Z' },
  { id: 'ref-2', referred_email: 'zenitsu.a@gmail.com', status: 'registered', created_at: '2026-06-10T19:20:00Z' }
]

export const rewardsService = {
  async getWalletMovements(userId: string): Promise<WalletMovement[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('wallet_movements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          amount: Number(d.amount),
          type: d.type,
          description: d.description,
          created_at: d.created_at
        }))
      }
    }
    return MOCK_WALLET_MOVEMENTS
  },

  async getRewardMovements(userId: string): Promise<RewardMovement[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('reward_movements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) return data
    }
    return MOCK_REWARD_MOVEMENTS
  },

  async getReferrals(userId: string): Promise<Referral[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('referrals')
        .select(`
          id,
          status,
          created_at,
          referred_id(email)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          referred_email: (d.referred_id as any)?.email || 'Compañero Otaku',
          status: d.status,
          created_at: d.created_at
        }))
      }
    }
    return MOCK_REFERRALS
  },

  async addReferral(referrerId: string, referredEmail: string): Promise<void> {
    if (isSupabaseConfigured) {
      // In real system, this would insert a referral record link between registered user IDs.
      // We simulate checking if this exists or just insert:
      const { data: user } = await supabase.from('profiles').select('id').eq('email', referredEmail).single()
      if (user) {
        await supabase.from('referrals').insert({
          referrer_id: referrerId,
          referred_id: user.id,
          status: 'registered'
        })
      }
      return
    }

    // Mock
    MOCK_REFERRALS.unshift({
      id: Math.random().toString(),
      referred_email: referredEmail,
      status: 'registered',
      created_at: new Date().toISOString()
    })
  }
}
