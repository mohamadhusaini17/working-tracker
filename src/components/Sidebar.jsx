import { useState } from 'react'
import {
  BarChart3, Plus, MoreHorizontal, Pencil, Trash2,
  ChevronRight, Calendar, Settings, X,
} from 'lucide-react'
import { useDash } from '../contexts/DashboardContext.jsx'
import { getIcon } from './ui/IconPicker.jsx'
import { AddFolderModal, EditFolderModal, DeleteFolderDialog } from './modals/FolderModal.jsx'
import Drop from './ui/Drop.jsx'
import Tip from './ui/Tip.jsx'
import { cn, fmtShort } from '../constants/helpers.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function Sidebar({ isOpen, onClose }) {
  const {
    teams, activeTeam, selDate,
    selectTeam, selectDate, setSelPIC,
    addTeam, editTeam, deleteTeam,
    getDateFolders,
  } = useDash()

  const isMobile = useIsMobile()
  const [expanded, setExpanded] = useState(new Set(['1']))
  const [addOpen,  setAddOpen]  = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [delOpen,  setDelOpen]  = useState(false)
  const [selTeam,  setSelTeam]  = useState(null)

  const toggleExp = (id) =>
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const pickTeam = (id) => {
    selectTeam(id)
    if (!expanded.has(id)) toggleExp(id)
    if (isMobile) onClose()
  }

  const pickDate = (id, d) => {
    if (activeTeam !== id) selectTeam(id)
    selectDate(d)
    setSelPIC(null)
    if (isMobile) onClose()
  }

  const inner = (
    <div className="sidebar-bg flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #0f1629' }}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-100">Working Tracker</p>
          <p className="text-xs text-slate-600">IA &amp; RM</p>
        </div>
        {isMobile && (
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-2 py-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            Team Folders
          </span>
          <Tip label="Tambah folder">
            <button onClick={() => setAddOpen(true)} className="btn-ghost p-1 rounded-lg">
              <Plus size={14} />
            </button>
          </Tip>
        </div>

        {teams.map(team => {
          const Icon  = getIcon(team.iconName)
          const dates = getDateFolders(team.id)
          const isAct = team.id === activeTeam
          const isExp = expanded.has(team.id)

          return (
            <div key={team.id}>
              <div className={cn('sb-item group', isAct && !selDate && 'active')}>
                <button
                  onClick={() => pickTeam(team.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-inherit bg-transparent border-none cursor-pointer p-0"
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate font-semibold">{team.name}</span>
                </button>

                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {dates.length > 0 && (
                    <button
                      onClick={() => toggleExp(team.id)}
                      className="p-1 rounded bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-300"
                    >
                      <ChevronRight
                        size={14}
                        style={{ transform: isExp ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                      />
                    </button>
                  )}
                  <Drop
                    trigger={
                      <button className="p-1 rounded bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-300 inline-flex">
                        <MoreHorizontal size={14} />
                      </button>
                    }
                    items={[
                      { label: 'Edit Folder', icon: <Pencil size={14} />, onClick: () => { setSelTeam(team); setEditOpen(true) } },
                      'sep',
                      { label: 'Hapus', icon: <Trash2 size={14} />, danger: true, onClick: () => { setSelTeam(team); setDelOpen(true) } },
                    ]}
                  />
                </div>
              </div>

              {isExp && (
                <div className="ml-3 pl-3 mt-0.5 mb-1 flex flex-col gap-0.5" style={{ borderLeft: '1px solid #1e2d4a' }}>
                  {dates.length === 0 ? (
                    <p className="text-[11px] text-slate-700 italic py-1.5 px-2">Belum ada aktivitas</p>
                  ) : dates.map(df => (
                    <button
                      key={df.date}
                      onClick={() => pickDate(team.id, df.date)}
                      className={cn('sb-date-btn', isAct && selDate === df.date && 'active')}
                    >
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />{fmtShort(df.date)}
                      </span>
                      <span className={cn('sb-count', isAct && selDate === df.date && 'active')}>
                        {df.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-2.5" style={{ borderTop: '1px solid #0f1629' }}>
        <button className="sb-footer-btn w-full text-left bg-transparent border-none cursor-pointer">
          <Settings size={16} /><span>Manage Access (Admin)</span>
        </button>
      </div>

      <AddFolderModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addTeam} />
      <EditFolderModal open={editOpen} onClose={() => setEditOpen(false)} team={selTeam} onEdit={editTeam} />
      <DeleteFolderDialog open={delOpen} onClose={() => setDelOpen(false)} team={selTeam} onDelete={deleteTeam} />
    </div>
  )

  if (isMobile) {
    return isOpen ? (
      <div className="fixed inset-0 z-40 flex">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative h-full z-10 shadow-2xl" style={{ width: '17rem' }}>{inner}</div>
      </div>
    ) : null
  }

  return (
    <div className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0" style={{ width: '16rem' }}>
      {inner}
    </div>
  )
}
