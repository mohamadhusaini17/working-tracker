import React, { useState } from 'react'
import { supabase } from '../lib/supabase' 
import { Rocket, Mail, Lock, Loader2 } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // 1. FUNGSI LOGIN MANUAL
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) throw error
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. FUNGSI DAFTAR AKUN BARU
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })
      if (error) throw error
      setMessage('Sukses: Akun berhasil dibuat! Silakan langsung klik tombol Login Manual.')
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-slate-800 shadow-2xl">
        
        {/* LOGO & BRANDING */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full mb-4">
            <Rocket className="text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Working Tracker</h1>
          <p className="text-slate-400 text-sm">Astronauts.id Internal Access</p>
        </div>

        {/* BOX NOTIFIKASI */}
        {message && (
          <div className={`text-xs p-3 rounded-lg mb-4 ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {message}
          </div>
        )}

        {/* FORM UTAMA */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="nama@email.com" 
                required
                value={email}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login Manual'}
            </button>
            
            <button 
              type="button" 
              onClick={handleSignUp} 
              disabled={loading}
              className="w-full bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold py-2.5 rounded-lg transition-all"
            >
              Buat Akun Baru
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}