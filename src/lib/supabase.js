import { createClient } from '@supabase/supabase-js'

// Mengambil URL dan API Key dari file .env lokal Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Menyimpan sesi login di browser
    autoRefreshToken: true, // Memperbarui token masuk secara otomatis
  }
})