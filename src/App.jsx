import { useState, useMemo } from 'react'
import { ChevronRight, Users, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react'
import { DashboardProvider, useDash } from './contexts/DashboardContext.jsx'
import Sidebar     from './components/Sidebar.jsx'
import Header      from './components/Header.jsx'
import StatCards   from './components/StatCards.jsx'
import ActivityTable from './components/ActivityTable.jsx'
import PICCard     from './components/PICCard.jsx'
import Card        from './components/ui/Card.jsx'
import { cn, fmtLong } from './constants/helpers.js'
import DashboardCharts from './components/DashboardCharts.jsx'

function DashboardContent({ onMenu }) {
  const {
    activeTeam, selDate, selPIC,
    setSelPIC, selectDate,
    getTeam, getActsByDate, getPICs, getStats,
    loading // <-- 1. Ambil state loading dari Context Anda
  } = useDash()

  const [editMode, setEditMode] = useState(false)

  // --- 2. PASANG LOADING GATE DI SINI (MENAHAN CRASH) ---
  if (loading) {
    return (
      <div className="flex flex-1 flex-col h-screen w-full items-center justify-center bg-[#0f172a] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Menghubungkan ke Supabase...</p>
        </div>
      </div>
    )
  }

  const team = getTeam()
  
  // Mengambil stats real-time berdasarkan filter yang aktif
  const stats = getStats(activeTeam, selDate || undefined, selPIC || undefined)
  
  const tableActs = useMemo(() => {
    if (!team) return []
    if (selDate && selPIC) {
      return getActsByDate(activeTeam, selDate).filter(a => a.pic === selPIC)
    }
    return !selDate ? (team.activities || []) : getActsByDate(activeTeam, selDate)
  }, [team, selDate, selPIC, activeTeam, getActsByDate])

  const pics = (selDate && !selPIC) ? getPICs(activeTeam, selDate) : []

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-[#0f172a] text-slate-200">
      <Header editMode={editMode} onEditMode={setEditMode} onMenu={onMenu} />

      <main className="flex-1 p-4 lg:p-8 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selPIC ? selPIC.split('@')[0] : team?.name || 'Global Overview'}
          </h1>
          <nav className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold tracking-widest">
            <span 
              className="cursor-pointer hover:text-blue-400 transition-colors" 
              onClick={() => { selectDate(null); setSelPIC(null) }}
            >
              Dashboard
            </span>
            <ChevronRight size={12} />
            <span className={cn(selDate && "text-blue-400")}>{team?.name || 'All Teams'}</span>
            {selDate && (
              <>
                <ChevronRight size={12} />
                <span className="text-slate-300">{fmtLong(selDate)}</span>
              </>
            )}
          </nav>
        </div>

        {/* 1. Stat Cards */}
        <StatCards stats={stats} selPIC={selPIC} selDate={selDate} editMode={editMode} />

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 p-6 bg-[#1e293b]/50 border-slate-800 shadow-xl backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Performance Analytics</h3>
             </div>
             <DashboardCharts stats={stats} viewType="bar" />
          </Card>

          <Card className="p-6 bg-[#1e293b]/50 border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
                <PieIcon size={18} className="text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Activity Composition</h3>
             </div>
            <DashboardCharts stats={stats} viewType="pie" />
          </Card>
        </div>

        {/* 3. Bottom Detail Section */}
        <div className="grid grid-cols-1 gap-6">
          {selPIC ? (
            <Card className="p-6 border-slate-800 bg-[#1e293b]/30">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-purple-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Detailed Task Logs</h2>
              </div>
              <ActivityTable activities={tableActs} teamId={activeTeam} />
            </Card>
          ) : selDate ? (
            <div className="flex flex-col gap-4">
               <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                <Users size={14} /> Team Personnel Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pics.map(pd => (
                  <PICCard key={pd.pic} picData={pd} onClick={() => setSelPIC(pd.pic)} />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-6 border-slate-800 bg-[#1e293b]/30">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6">Team Activity Overview</h2>
              <ActivityTable activities={tableActs} teamId={activeTeam} />
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [sbOpen, setSbOpen] = useState(false)
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-[#0f172a]">
        <Sidebar isOpen={sbOpen} onClose={() => setSbOpen(false)} />
        <div className="flex-1 overflow-y-auto">
          <DashboardContent onMenu={() => setSbOpen(true)} />
        </div>
      </div>
    </DashboardProvider>
  )
}