import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''

// Export a flag to check if Supabase is fully configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'AniGames Store running in MOCK mode. To connect to a live Supabase backend, populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any) // Safe type assertion for mock mode fallback
