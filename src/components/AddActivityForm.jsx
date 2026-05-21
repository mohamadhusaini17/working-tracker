import React, { useState } from 'react'
import { useDash } from '../contexts/DashboardContext.jsx'
import { Plus } from 'lucide-react'

export default function AddActivityForm() {
  const { activeTeam, addAct } = useDash()
  const [kegiatan, setKegiatan] = useState('')
  const [pic, setPic] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!kegiatan.trim() || !pic.trim()) {
      alert('Mohon isi Nama Kegiatan dan Email PIC!')
      return
    }

    if (!activeTeam) {
      alert('Pilih folder tim terlebih dahulu di sidebar sebelum menambah aktivitas!')
      return
    }

    setLoading(true)
    try {
      // Susun data objek payload untuk dilempar ke database relasional
      const activityPayload = {
        pic: pic.trim(),
        status: 'On Progress',
        jamMulai: '08:00',
        jamSelesai: '17:00',
        kegiatan: kegiatan.trim(),
        priority: 'P2 — Menengah',
        progress: 0,
        kategoriKerja: 'General',
        date: new Date().toISOString().split('T')[0]
      }

      // Panggil fungsi core relasional
      await addAct(activeTeam, activityPayload)
      
      setKegiatan('')
      setPic('')
      alert('Aktivitas tim berhasil masuk secara relasional ke Supabase!')
    } catch (err) {
      console.error("Gagal menyimpan:", err.message)
      alert(`Gagal menyimpan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl mb-6 flex flex-col md:flex-row gap-3 items-end">
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Kegiatan</label>
        <input 
          value={kegiatan} 
          onChange={e => setKegiatan(e.target.value)} 
          type="text" 
          placeholder="Contoh: Setup database tracker produksi" 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
      </div>
      <div className="w-full md:w-64 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email PIC</label>
        <input 
          value={pic} 
          onChange={e => setPic(e.target.value)} 
          type="email" 
          placeholder="nama@astronauts.id" 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors h-[38px] flex items-center justify-center gap-2"
        disabled={loading}
      >
        <Plus size={16} />
        {loading ? 'Menyimpan...' : 'Tambah Kegiatan'}
      </button>
    </form>
  )
}