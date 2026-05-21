/**
 * Sidebar.jsx — RE-FIXED ANTI-CRASH (COMPLIANT WITH REACT HOOK RULES)
 */
import React, { useState, useMemo } from 'react'
import { Folder, Plus, ChevronRight, Settings, Users, ShieldAlert, BarChart3, LayoutDashboard, FolderPlus, Calendar } from 'lucide-react'
import { useDash } from '../contexts/DashboardContext.jsx'
import * as Modals from './modals/FolderModal.jsx' 
import { cn } from '../constants/helpers.js'

const AddFolderModal = Modals.AddFolderModal;

// Fungsi Render Ikon Berlapis - Menjamin proteksi crash 100%
function renderFolderIcon(iconTarget) {
  if (!iconTarget) return <Folder size={16} />

  if (React.isValidElement(iconTarget)) {
    return iconTarget
  }

  if (typeof iconTarget === 'function' || (typeof iconTarget === 'object' && iconTarget.$$typeof)) {
    try {
      const Component = iconTarget;
      return <Component size={16} />
    } catch {
      return <Folder size={16} />
    }
  }

  const name = typeof iconTarget === 'string' 
    ? iconTarget 
    : String(iconTarget.name || iconTarget.displayName || iconTarget.iconName || 'Folder');

  switch (name) {
    case 'Users': 
      return <Users size={16} />
    case 'BarChart3': 
      return <BarChart3 size={16} />
    case 'ShieldAlert': 
      return <ShieldAlert size={16} />
    case 'FolderPlus': 
      return <FolderPlus size={16} />
    case 'Folder': 
      return <Folder size={16} />
    default: 
      return <Folder size={16} />
  }
}

export default function Sidebar() {
  // Ambil state dari context global Anda
  const { 
    teams, 
    activeTeam, 
    setActiveTeam, 
    addTeam,
    activities, // Menarik seluruh daftar aktivitas global untuk pelacakan tanggal
    selDate,
    selectDate,
    setSelPIC
  } = useDash()

  const [modalOpen, setModalOpen] = useState(false)

  // Fungsi pembantu konversi nama bulan Indonesia
  const getMonthName = (monthStr) => {
    const months = {
      '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    }
    return months[monthStr] || monthStr
  }

  // 🔥 SOLUSI UTAMA: Kelompokkan data tanggal AKTIVITAS GLOBAL di sini (DI LUAR LOOP .MAP)
  // Ini mencegah error "Rendered more hooks than during the previous render" 
  const allStructuredDates = useMemo(() => {
    const sourceActs = activities || []
    if (!Array.isArray(sourceActs)) return {}

    // Kerangka grup: { [teamId]: { [monthKey]: Set(dates) } }
    const groupsByTeam = {}

    sourceActs.forEach(act => {
      const actTeamId = act.team_id || act.teamId
      if (!actTeamId || !act?.date) return

      const parts = act.date.split('-') // Mengurai 'YYYY-MM-DD'
      if (parts.length < 2) return

      const year = parts[0]
      const month = parts[1]
      const monthKey = `${year}-${month}`
      const tIdStr = String(actTeamId)

      if (!groupsByTeam[tIdStr]) {
        groupsByTeam[tIdStr] = {}
      }
      if (!groupsByTeam[tIdStr][monthKey]) {
        groupsByTeam[tIdStr][monthKey] = new Set()
      }
      groupsByTeam[tIdStr][monthKey].add(act.date)
    })

    // Lakukan sorting urutan terbaru (descending) untuk setiap tim
    const finalSortedGroups = {}
    Object.keys(groupsByTeam).forEach(tId => {
      finalSortedGroups[tId] = {}
      Object.keys(groupsByTeam[tId]).sort().reverse().forEach(mKey => {
        finalSortedGroups[tId][mKey] = Array.from(groupsByTeam[tId][mKey]).sort().reverse()
      })
    })

    return finalSortedGroups
  }, [activities])

  const handleCreateFolder = async (name, icon) => {
    try {
      await addTeam(name, icon)
      setModalOpen(false)
    } catch (err) {
      console.error("Gagal menambahkan folder baru:", err)
    }
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
          <LayoutDashboard size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">Working Tracker</h1>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">IA & RM Platform</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Team Folders</span>
            <button 
              type="button"
              onClick={() => setModalOpen(true)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {(!teams || teams.length === 0) ? (
              <p className="text-xs text-slate-600 px-2 italic py-2">Belum ada folder tim</p>
            ) : (
              teams.map((t) => {
                const isActive = t.id === activeTeam
                const targetedIcon = t.icon || t.iconName || 'Folder'
                
                // Ambil data tanggal terstruktur khusus untuk ID tim ini saja
                const teamDates = allStructuredDates[String(t.id)] || {}

                return (
                  <div key={t.id} className="space-y-1">
                    {/* BUTTON UTAMA FOLDER TIM */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTeam(t.id)
                        if (typeof selectDate === 'function') selectDate(null)
                        if (typeof setSelPIC === 'function') setSelPIC(null)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border-none text-left cursor-pointer",
                        isActive 
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm" 
                          : "bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? "text-blue-400" : "text-slate-500"}>
                          {renderFolderIcon(targetedIcon)}
                        </span>
                        <span className="truncate">{t.name}</span>
                      </div>
                      <ChevronRight size={12} className={cn("transition-transform text-slate-600", isActive && "transform rotate-90 text-blue-400")} />
                    </button>

                    {/* DROPDOWN SUB-MENU: BULAN -> TANGGAL */}
                    {isActive && Object.keys(teamDates).length > 0 && (
                      <div className="pl-6 ml-2 border-l border-slate-800 space-y-2.5 pt-1 pb-2">
                        {Object.keys(teamDates).map(monthKey => {
                          const [year, month] = monthKey.split('-')
                          return (
                            <div key={monthKey} className="space-y-1">
                              {/* Label Bulan */}
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5">
                                {getMonthName(month)} {year}
                              </div>

                              {/* Daftar Tanggal */}
                              <div className="space-y-0.5">
                                {teamDates[monthKey].map(dateStr => {
                                  const isDateActive = selDate === dateStr
                                  const dayNum = dateStr.split('-')[2] || dateStr

                                  return (
                                    <button
                                      key={dateStr}
                                      type="button"
                                      onClick={() => {
                                        if (typeof selectDate === 'function') selectDate(dateStr)
                                        if (typeof setSelPIC === 'function') setSelPIC(null)
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors border-none text-left cursor-pointer",
                                        isDateActive 
                                          ? "bg-slate-800 text-white font-bold" 
                                          : "bg-transparent text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
                                      )}
                                    >
                                      <Calendar size={11} className={isDateActive ? "text-blue-400" : "text-slate-600"} />
                                      <span>Tanggal {dayNum}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors bg-transparent border-none text-left cursor-pointer">
          <Settings size={14} />
          <span>Manage Access (Admin)</span>
        </button>
      </div>

      {AddFolderModal && (
        <AddFolderModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onAdd={handleCreateFolder} 
        />
      )}
    </aside>
  )
}