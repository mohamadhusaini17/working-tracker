import { useState, useMemo } from 'react'
import { ChevronRight, Calendar, ArrowLeft, Users, GripVertical } from 'lucide-react'
import { DashboardProvider, useDash } from './contexts/DashboardContext.jsx'
import Sidebar     from './components/Sidebar.jsx'
import Header      from './components/Header.jsx'
import StatCards   from './components/StatCards.jsx'
import ActivityTable from './components/ActivityTable.jsx'
import PICCard     from './components/PICCard.jsx'
import Card        from './components/ui/Card.jsx'
import { cn, fmtLong } from './constants/helpers.js'
import { picHue, picInit } from './constants/colors.js'

/* ── Dashboard content (uses context) ────────────────────────────── */
function DashboardContent({ onMenu }) {
  const {
    activeTeam, selDate, selPIC,
    setSelPIC, selectDate,
    getTeam, getActsByDate, getPICs, getStats,
  } = useDash()

  const [editMode, setEditMode] = useState(false)

  const team  = getTeam()
  const stats = getStats(activeTeam, selDate || undefined, selPIC || undefined)
  const pct   = stats.total > 0 ? Math.round(stats.done / stats.total * 100) : 0

  // Which activities to show in the table
  const tableActs = useMemo(() => {
    if (!team) return []
    if (selDate && selPIC) return getActsByDate(activeTeam, selDate).filter(a => a.pic === selPIC)
    if (!selDate)          return team.activities
    return [] // date selected but no PIC → show PIC cards instead
  }, [team, selDate, selPIC, activeTeam])

  const pics     = selDate && !selPIC ? getPICs(activeTeam, selDate) : []
  const showPICs = !!selDate && !selPIC
  const showTable= !!selPIC  || !selDate
  const picName  = selPIC ? selPIC.split('@')[0] : null

  return (
    <div className="flex flex-1 flex-col min-h-screen" style={{ background: '#080d1a' }}>
      <Header editMode={editMode} onEditMode={setEditMode} onMenu={onMenu} />

      <main className="flex-1 p-4 sm:p-6 flex flex-col gap-5" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-slate-600">Dashboard</span>
          <ChevronRight size={14} className="text-slate-700" />

          {selDate ? (
            <button
              onClick={() => { selectDate(null); setSelPIC(null) }}
              className="text-slate-600 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {team?.name || 'Team'}
            </button>
          ) : (
            <span className="text-slate-200 font-bold">{team?.name || 'Team'}</span>
          )}

          {selDate && (
            <>
              <ChevronRight size={14} className="text-slate-700" />
              {selPIC ? (
                <button
                  onClick={() => setSelPIC(null)}
                  className="text-slate-600 hover:text-blue-400 transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
                >
                  <Calendar size={14} />{fmtLong(selDate)}
                </button>
              ) : (
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-500" />
                  {fmtLong(selDate)}
                </span>
              )}
            </>
          )}

          {selPIC && (
            <>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center text-white font-black"
                  style={{ backgroundColor: picHue(selPIC), fontSize: '9px' }}
                >
                  {picInit(selPIC)}
                </div>
                {picName}
              </span>
            </>
          )}
        </nav>

        {/* ── Page title ── */}
        <div className="flex items-center gap-3">
          {selPIC && (
            <button
              onClick={() => setSelPIC(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              <ArrowLeft size={16} />Semua PIC
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-100">
              {selPIC
                ? <span className="capitalize">{picName}</span>
                : selDate ? fmtLong(selDate)
                : team?.name || 'Working Tracker'}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {selPIC   ? `Aktivitas: ${selPIC}`
               : selDate ? `${pics.length} PIC aktif`
               : 'Semua aktivitas tim'}
            </p>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <StatCards stats={stats} selPIC={selPIC} selDate={selDate} editMode={editMode} />

        {/* ── PIC grid (when date selected, no PIC yet) ── */}
        {showPICs && (
          pics.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="empty-box mb-4">
                <Users size={36} className="text-slate-700" />
              </div>
              <p className="text-slate-400 font-bold text-lg">Tidak ada PIC</p>
              <p className="text-slate-600 text-sm mt-1.5">Belum ada aktivitas untuk tanggal ini.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-600" />
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Pilih PIC untuk lihat aktivitas
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pics.map(pd => (
                  <PICCard key={pd.pic} picData={pd} onClick={() => setSelPIC(pd.pic)} />
                ))}
              </div>
            </>
          )
        )}

        {/* ── Activity table ── */}
        {showTable && (
          <Card className={cn('p-5 relative', editMode && 'ring-2 ring-blue-500/30 ring-dashed')}>
            {editMode && (
              <div className="absolute -top-2 -left-2 bg-blue-600 rounded-full p-1">
                <GripVertical size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                {selPIC ? `Aktivitas — ${picName}` : 'Semua Aktivitas Tim'}
              </h2>
            </div>
            <ActivityTable activities={tableActs} teamId={activeTeam} />
          </Card>
        )}

        {/* ── Edit mode banner ── */}
        {editMode && (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border border-blue-500"
            style={{ zIndex: 9997 }}
          >
            <GripVertical size={16} />Mode Edit Aktif
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Root shell (sidebar + content) ─────────────────────────────── */
function AppShell() {
  const [sbOpen, setSbOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080d1a' }}>
      <Sidebar isOpen={sbOpen} onClose={() => setSbOpen(false)} />
      <div className="flex-1 overflow-y-auto">
        <DashboardContent onMenu={() => setSbOpen(true)} />
      </div>
    </div>
  )
}

/* ── App entry point ─────────────────────────────────────────────── */
export default function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  )
}
