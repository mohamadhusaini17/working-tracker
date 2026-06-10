/**
 * Sidebar.jsx — FIXED WITH INTEGRATED CUSTOM BASE64 RENDERER
 */
import React, { useState, useMemo, useEffect } from 'react'
import { Folder, Plus, ChevronRight, Settings, Users, ShieldAlert, BarChart3, LayoutDashboard, FolderPlus, Calendar } from 'lucide-react'
import { useDash } from '../contexts/DashboardContext.jsx'
import * as Modals from './modals/FolderModal.jsx' 
import { cn } from '../constants/helpers.js'

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

  // ✨ DETEKSI UTAMA: Jika string diawali dengan format data gambar, render sebagai tag HTML img kustom
  if (name.startsWith('data:image/')) {
    return (
      <img 
        src={name} 
        alt="Team Icon" 
        className="w-4 h-4 object-contain rounded-sm"
      />
    )
  }

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
  const { 
    teams, 
    activeTeam, 
    setActiveTeam, 
    addTeam,
    activities, 
    selDate,
    selectDate,
    setSelPIC
  } = useDash()

  const [modalOpen, setModalOpen] = useState(false)
  const [openTeams, setOpenTeams] = useState({})
  const [openMonths, setOpenMonths] = useState({})

  useEffect(() => {
    if (activeTeam) {
      setOpenTeams(prev => ({
        ...prev,
        [String(activeTeam)]: true
      }))
    }
  }, [activeTeam])

  const getMonthName = (monthStr) => {
    const months = {
      '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    }
    return months[monthStr] || monthStr
  }

  const allStructuredDates = useMemo(() => {
    const sourceActs = activities || []
    if (!Array.isArray(sourceActs)) return {}

    const groupsByTeam = {}

    sourceActs.forEach(act => {
      const actTeamId = act.team_id || act.teamId
      if (!actTeamId || !act?.date) return

      const parts = act.date.split('-') 
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

    const finalSortedGroups = {}
    Object.keys(groupsByTeam).forEach(tId => {
      finalSortedGroups[tId] = {}
      Object.keys(groupsByTeam[tId]).sort().reverse().forEach(mKey => {
        finalSortedGroups[tId][mKey] = Array.from(groupsByTeam[tId][mKey]).sort().reverse()
      })
    })

    return finalSortedGroups
  }, [activities])

  const handleTeamClick = (teamId) => {
    const tIdStr = String(teamId)
    setActiveTeam(teamId)
    if (typeof selectDate === 'function') selectDate(null)
    if (typeof setSelPIC === 'function') setSelPIC(null)

    setOpenTeams(prev => ({
      ...prev,
      [tIdStr]: !prev[tIdStr]
    }))
  }

  const toggleMonth = (monthKey) => {
    setOpenMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }))
  }

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
                const tIdStr = String(t.id)
                const isActive = t.id === activeTeam
                const isTeamOpen = !!openTeams[tIdStr]
                
                const targetedIcon = t.icon || t.iconName || 'Folder'
                const teamDates = allStructuredDates[tIdStr] || {}

                return (
                  <div key={t.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleTeamClick(t.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border-none text-left cursor-pointer",
                        isActive 
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm" 
                          : "bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? "text-blue-400 flex items-center" : "text-slate-500 flex items-center"}>
                          {renderFolderIcon(targetedIcon)}
                        </span>
                        <span className="truncate">{t.name}</span>
                      </div>
                      <ChevronRight 
                        size={12} 
                        className={cn(
                          "transition-transform text-slate-600", 
                          isTeamOpen && "transform rotate-90",
                          isActive && "text-blue-400"
                        )} 
                      />
                    </button>

                    {isTeamOpen && Object.keys(teamDates).length > 0 && (
                      <div className="pl-4 ml-3 border-l border-slate-800/60 space-y-1 pt-1 pb-2">
                        {Object.keys(teamDates).map(monthKey => {
                          const [year, month] = monthKey.split('-')
                          const isMonthOpen = !!openMonths[monthKey]

                          return (
                            <div key={monthKey} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleMonth(monthKey)}
                                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider px-2 py-1 bg-transparent border-none cursor-pointer rounded transition-colors"
                              >
                                <span>{getMonthName(month)} {year}</span>
                                <ChevronRight 
                                  size={10} 
                                  className={cn("transition-transform text-slate-600", isMonthOpen && "transform rotate-90 text-slate-400")} 
                                />
                              </button>

                              {isMonthOpen && (
                                <div className="space-y-0.5 pl-1 transition-all">
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
                              )}
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

      {Modals.AddFolderModal && (
        <Modals.AddFolderModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onAdd={handleCreateFolder} 
        />
      )}
    </aside>
  )
}