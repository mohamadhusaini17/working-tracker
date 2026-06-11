/**
 * App.jsx — GERBANG UTAMA AUTENTIKASI SUPABASE AUTH & REALTIME DASHBOARD
 */
import React, { useState, useMemo, useEffect } from 'react'
import { ChevronRight, Users, GripVertical, FolderArchive } from 'lucide-react'
import { supabase } from './lib/supabase' // 🛡️ Import instance supabase Anda
import { DashboardProvider, useDash } from './contexts/DashboardContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import StatCards from './components/StatCards.jsx'
import DashboardCharts from './components/DashboardCharts.jsx'
import ActivityTable from './components/ActivityTable.jsx'
import PICCard from './components/PICCard.jsx'
import Card from './components/ui/Card.jsx'
import Login from './components/Auth.jsx' // 🛡️ Diarahkan langsung ke folder src/components/Auth.jsx
import { cn, fmtLong } from './constants/helpers.js'

function DashboardContent({ onMenu, userSession }) {
  // 1. Mengambil preferensi tampilan default 'prefDefView' dari DashboardContext
  const {
    activeTeam, selDate, selPIC,
    setSelPIC, selectDate,
    getTeam, getActsByDate, getPICs, getStats,
    loading, prefDefView
  } = useDash()

  const [editMode, setEditMode] = useState(false)
  const team = getTeam()

  const pics = useMemo(() => {
    if (!activeTeam) return []
    return getPICs(activeTeam, selDate || null) || []
  }, [selDate, activeTeam, getPICs])

  // 2. Filter data secara dinamis berdasarkan preferensi 'prefDefView' dari modal settings
  const tableActs = useMemo(() => {
    if (!team) return []
    
    // Ambil data dasar berdasarkan tanggal terpilih jika ada
    let baseActs = getActsByDate(activeTeam, selDate || null) || []
    
    // Jika user menyaring berdasarkan PIC tertentu (melalui klik Personnel Breakdown)
    if (selPIC) {
      return baseActs.filter(a => a?.pic === selPIC)
    }

    // Tanggal hari ini untuk pembanding filter 'Per Tanggal'
    const hariIni = new Date().toISOString().split('T')[0]
    
    switch (prefDefView) {
      case 'date':
        // Hanya tampilkan aktivitas yang dijadwalkan hari ini
        return baseActs.filter(a => a?.date === hariIni)
      case 'pic':
        // Hanya tampilkan aktivitas yang memiliki penugasan PIC (email valid)
        return baseActs.filter(a => a?.pic && a.pic.includes('@'))
      case 'all':
      default:
        // Tampilkan semua aktivitas dari tim tanpa filter tambahan
        return baseActs
    }
  }, [team, selDate, selPIC, activeTeam, getActsByDate, prefDefView]) // prefDefView masuk ke dependency array

  if (loading) {
    return (
      <div className="flex flex-1 h-screen w-full items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Menghubungkan ke Supabase…</p>
        </div>
      </div>
    )
  }

  const stats = getStats(activeTeam, selDate || null, selPIC || null) || {
    total: 0, done: 0, onProg: 0, p0: 0, p1: 0, p2: 0, p3: 0,
  }

  const showPICs  = !!activeTeam && !selPIC && pics.length > 0
  const showTable = !!activeTeam
  const picName   = selPIC ? selPIC.split('@')[0] : null

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-[#0f172a] text-slate-200">
      <Header editMode={editMode} onEditMode={setEditMode} onMenu={onMenu} />

      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* BREADCRUMBS NAVIGATION */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selPIC ? (
              <span className="capitalize">{picName}</span>
            ) : (
              team?.name || 'Global Overview'
            )}
          </h1>
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <button
              type="button"
              onClick={() => { selectDate(null); setSelPIC(null) }}
              className="hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer p-0 text-slate-500 uppercase font-black text-[10px] tracking-widest focus:outline-none"
            >
              Dashboard
            </button>
            <ChevronRight size={10} />
            <span className={cn(selDate ? 'text-blue-400' : 'text-slate-300')}>
              {team?.name || 'All Teams'}
            </span>
            {selDate && (
              <>
                <ChevronRight size={10} />
                {selPIC ? (
                  <button
                    type="button"
                    onClick={() => setSelPIC(null)}
                    className="hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer p-0 text-slate-500 uppercase font-black text-[10px] tracking-widest focus:outline-none"
                  >
                    {fmtLong(selDate)}
                  </button>
                ) : (
                  <span className="text-slate-300">{fmtLong(selDate)}</span>
                )}
              </>
            )}
            {selPIC && (
              <>
                <ChevronRight size={10} />
                <span className="text-white">{picName}</span>
              </>
            )}
          </nav>
        </div>

        {/* STAT CARDS */}
        <StatCards stats={stats} selPIC={selPIC} selDate={selDate} editMode={editMode} />

        {/* CHARTS */}
        {showTable && <DashboardCharts activities={tableActs} stats={stats} />}

        {/* PERSONNEL BREAKDOWN */}
        {showPICs && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Team Personnel Breakdown
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pics.map(pd => (
                <PICCard key={pd.pic} picData={pd} onClick={() => setSelPIC(pd.pic)} />
              ))}
            </div>
          </div>
        )}

        {/* TIM BELUM DIPILIH */}
        {!team && (
          <div className="flex flex-col items-center py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[#0f1629] border border-[#1e2d4a]">
              <FolderArchive size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-semibold">Folder Tim Belum Terpilih</p>
            <p className="text-slate-600 text-sm mt-1">Silakan pilih folder tim di sidebar terlebih dahulu.</p>
          </div>
        )}

        {/* TABEL AKTIVITAS */}
        {team && showTable && (
          <Card className={cn('p-5 relative border border-slate-800', editMode && 'ring-2 ring-blue-500/30 ring-dashed')}>
            {editMode && (
              <div className="absolute -top-2 -left-2 bg-blue-600 rounded-full p-1 shadow-md">
                <GripVertical size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {selPIC
                  ? `Aktivitas — ${picName}`
                  : selDate
                    ? `Aktivitas Harian — ${team.name}`
                    : `Semua Aktivitas — ${team.name}`}
              </h2>
            </div>
            <ActivityTable activities={tableActs} teamId={activeTeam} userSession={userSession} />
          </Card>
        )}

        {/* FLOATING EDIT BADGE */}
        {editMode && (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border border-blue-500 select-none"
            style={{ zIndex: 9997 }}
          >
            <GripVertical size={16} />Mode Edit Aktif
          </div>
        )}
      </main>
    </div>
  )
}

function AppShell({ userSession }) {
  const [sbOpen, setSbOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar isOpen={sbOpen} onClose={() => setSbOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        <DashboardContent onMenu={() => setSbOpen(true)} userSession={userSession} />
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Ambil sesi aktif saat pertama kali aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitializing(false)
    })

    // Dengarkan perubahan status login/logout secara realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  // Jika tidak ada sesi login, tampilkan halaman Login bawaan (Auth.jsx)
  if (!session) {
    return <Login />
  }

  // Jika sudah login, tampilkan seluruh Dashboard Provider utama Anda
  return (
    <DashboardProvider>
      <AppShell userSession={session} />
    </DashboardProvider>
  )
}