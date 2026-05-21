import React, { useState } from 'react'
import { supabase } from '../lib/supabase' // Disesuaikan dengan posisi root src

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. FUNGSI LOGIN UTAMA DENGAN GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.readonly',
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setErrorMsg('Gagal memicu Google Login: ' + err.message)
    }
  }

  // 2. Fungsi Login Manual
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    // Validasi domain internal astronauts.id
    if (!email.endsWith('@astronauts.id')) {
      setErrorMsg('Error: Hanya untuk email @astronauts.id')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setErrorMsg(err.message || 'Gagal terhubung ke server auth.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Fungsi Buat Akun Baru
  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMsg('Isi email dan password terlebih dahulu.')
      return
    }
    if (!email.endsWith('@astronauts.id')) {
      setErrorMsg('Error: Pendaftaran hanya untuk domain @astronauts.id')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      alert('Akun berhasil didaftarkan! Silakan coba login manual atau cek email verifikasi Anda.')
    } catch (err) {
      setErrorMsg('Gagal mendaftar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        
        {/* HEADER BRAND */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Working Tracker</h1>
          <p className="text-xs text-slate-400 mt-0.5">Astronauts.id Internal Access</p>
        </div>

        {/* NOTIFIKASI ERROR */}
        {errorMsg && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        {/* 🌟 TOMBOL LOGIN GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm py-2.5 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md mb-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 1.114 15.433 0 12.24 0 5.582 0 0 5.37 0 12s5.582 12 12.24 12c6.96 0 11.57-4.832 11.57-11.74 0-.79-.085-1.393-.188-1.975H12.24z"/>
          </svg>
          Masuk dengan Google Account
        </button>

        {/* SEPARATOR */}
        <div className="relative flex items-center my-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-600 text-[9px] font-black uppercase tracking-widest">Atau via Email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* FORM MANUAL */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
            <input 
              type="email" 
              placeholder="nama@astronauts.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2 rounded-lg transition-colors"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
            
            <button 
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700 text-xs py-2 rounded-lg transition-colors"
            >
              Buat Akun Baru
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}