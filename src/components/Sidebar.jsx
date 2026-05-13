/**
 * Sidebar.jsx — 4-Level Hierarchical Navigation
 *
 * Level 1  Team Category   accordion + mini progress bar
 * Level 2  Month           month list + sparkline trend
 * Level 3  Date            active dates + status dot (red=urgent / green=safe)
 * Level 4  PIC             list of person-in-charge names
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  BarChart3, Plus, MoreHorizontal, Pencil, Trash2,
  ChevronRight, Settings, X, Users, TrendingUp,
  Calendar, AlertCircle,
} from 'lucide-react'
import { useDash } from '../contexts/DashboardContext.jsx'
import { getIcon } from './ui/IconPicker.jsx'
import { AddFolderModal, EditFolderModal, DeleteFolderDialog } from './modals/FolderModal.jsx'
import Drop from './ui/Drop.jsx'
import Tip from './ui/Tip.jsx'
import { cn } from '../constants/helpers.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { picHue, picInit } from '../constants/colors.js'

// ─── MONTH HELPERS ────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
const MONTH_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

/** Group activities by month → date → PIC */
function buildHierarchy(activities) {
  const months = new Map()

  activities.forEach(a => {
    const [year, mo, day] = a.date.split('-')
    const mKey = `${year}-${mo}`
    const mIdx = parseInt(mo, 10) - 1

    if (!months.has(mKey)) {
      months.set(mKey, { key: mKey, year, monthIdx: mIdx, dates: new Map() })
    }
    const month = months.get(mKey)

    if (!month.dates.has(a.date)) {
      month.dates.set(a.date, { date: a.date, day: parseInt(day, 10), activities: [] })
    }
    month.dates.get(a.date).activities.push(a)
  })

  // Sort months descending, dates descending inside
  return [...months.values()]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map(m => ({
      ...m,
      dates: [...m.dates.values()].sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

/** Determine date urgency: P0 or any Not Progress → urgent */
function dateUrgency(dateNode) {
  const acts = dateNode.activities
  if (acts.some(a => a.priority === 'P0' || a.status === 'Not Progress')) return 'urgent'
  return 'safe'
}

/** Mini sparkline SVG — activity count per date within a month */
function Sparkline({ dates, w = 36, h = 14 }) {
  if (!dates || dates.length < 2) {
    return (
      <svg width={w} height={h} style={{ opacity: 0.3 }}>
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#3b82f6" strokeWidth="1" />
      </svg>
    )
  }

  const counts = dates.map(d => d.activities.length)
  const max = Math.max(...counts, 1)
  const step = w / (counts.length - 1)

  const pts = counts
    .map((c, i) => `${Math.round(i * step)},${Math.round(h - (c / max) * (h - 2) - 1)}`)
    .join(' ')

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* last dot */}
      {counts.length > 0 && (() => {
        const lx = Math.round((counts.length - 1) * step)
        const ly = Math.round(h - (counts[counts.length - 1] / max) * (h - 2) - 1)
        return <circle cx={lx} cy={ly} r="2" fill="#3b82f6" />
      })()}
    </svg>
  )
}

/** Mini progress bar inside Level-1 team row */
function TeamProgress({ activities }) {
  const total  = activities.length
  const done   = activities.filter(a => a.status === 'Done').length
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0
  const color  = pct === 100 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#6b7280'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
      <div style={{ width: '28px', height: '4px', borderRadius: '2px', background: '#1e2d4a', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width .4s ease' }} />
      </div>
      <span style={{ fontSize: '9px', color, fontWeight: 700, minWidth: '22px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {pct}%
      </span>
    </div>
  )
}

/** Status dot for Level-3 dates */
function StatusDot({ urgency }) {
  return (
    <span style={{
      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
      background: urgency === 'urgent' ? '#ef4444' : '#10b981',
      boxShadow: urgency === 'urgent' ? '0 0 4px #ef444488' : '0 0 4px #10b98188',
    }} />
  )
}

/** Smooth accordion wrapper — uses max-height transition */
function Accordion({ open, children }) {
  const ref = useRef(null)
  const [maxH, setMaxH] = useState(open ? 'none' : '0px')
  const [vis,  setVis]  = useState(open)

  useEffect(() => {
    if (open) {
      setVis(true)
      // next tick so element is rendered before measuring
      requestAnimationFrame(() => {
        const h = ref.current?.scrollHeight ?? 0
        setMaxH(`${h}px`)
        // after transition, remove constraint so children can grow
        setTimeout(() => setMaxH('none'), 280)
      })
    } else {
      const h = ref.current?.scrollHeight ?? 0
      setMaxH(`${h}px`)
      requestAnimationFrame(() => {
        setMaxH('0px')
      })
      setTimeout(() => setVis(false), 280)
    }
  }, [open])

  return (
    <div
      ref={ref}
      style={{
        maxHeight: maxH,
        overflow: 'hidden',
        transition: 'max-height 0.26s cubic-bezier(0.4,0,0.2,1)',
        visibility: vis ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  )
}

// ─── LEVEL 4 — PIC ROW ───────────────────────────────────────────
function PICRow({ pic, isActive, onClick }) {
  const name = pic.split('@')[0]
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 6px 4px 4px', borderRadius: '8px', border: 'none',
        background: isActive ? 'rgba(59,130,246,.15)' : 'transparent',
        cursor: 'pointer', transition: 'background .15s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
        background: picHue(pic), display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'white', fontSize: '7px', fontWeight: 900,
      }}>
        {picInit(pic)}
      </div>
      <span style={{
        fontSize: '11px', color: isActive ? 'rgb(147,197,253)' : 'rgb(148,163,184)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left',
        fontWeight: isActive ? 600 : 400,
      }}>
        {name}
      </span>
    </button>
  )
}

// ─── LEVEL 3 — DATE ROW ──────────────────────────────────────────
function DateRow({ dateNode, teamId, isTeamActive, currentSelDate, currentSelPIC, onSelectDate, onSelectPIC }) {
  const urgency   = dateNode.urgency
  const isDateAct = isTeamActive && currentSelDate === dateNode.date

  // Collect unique PICs for this date
  const pics = useMemo(() => {
    const seen = new Set()
    return dateNode.activities.filter(a => { if (seen.has(a.pic)) return false; seen.add(a.pic); return true }).map(a => a.pic)
  }, [dateNode])

  const [picsOpen, setPicsOpen] = useState(false)

  const dayLabel = String(dateNode.day).padStart(2, '0')
  const count    = dateNode.activities.length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Date button */}
        <button
          onClick={() => { onSelectDate(dateNode.date); setPicsOpen(v => !v) }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: isDateAct ? 'rgba(37,99,235,.2)' : 'transparent',
            transition: 'background .15s',
          }}
          onMouseEnter={e => { if (!isDateAct) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
          onMouseLeave={e => { if (!isDateAct) e.currentTarget.style.background = isDateAct ? 'rgba(37,99,235,.2)' : 'transparent' }}
        >
          <StatusDot urgency={urgency} />
          <span style={{
            fontSize: '11px', fontWeight: isDateAct ? 700 : 400, flex: 1, textAlign: 'left',
            color: isDateAct ? 'rgb(147,197,253)' : 'rgb(148,163,184)',
          }}>
            {dayLabel}
          </span>
          <span style={{
            fontSize: '9px', fontWeight: 700, minWidth: '16px', textAlign: 'center',
            padding: '1px 4px', borderRadius: '4px',
            background: isDateAct ? 'rgba(59,130,246,.3)' : 'rgba(255,255,255,.06)',
            color: isDateAct ? 'rgb(96,165,250)' : 'rgb(100,116,139)',
          }}>
            {count}
          </span>
        </button>
        {/* PIC toggle */}
        <button
          onClick={() => setPicsOpen(v => !v)}
          style={{
            padding: '2px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'rgb(71,85,105)', borderRadius: '4px', display: 'flex', alignItems: 'center',
            transition: 'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgb(148,163,184)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgb(71,85,105)'}
        >
          <Users size={10} />
        </button>
      </div>

      {/* Level 4 — PICs */}
      <Accordion open={picsOpen && isDateAct}>
        <div style={{ marginLeft: '10px', paddingLeft: '8px', borderLeft: '1px solid #1e2d4a', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {pics.map(pic => (
            <PICRow
              key={pic}
              pic={pic}
              isActive={isTeamActive && currentSelDate === dateNode.date && currentSelPIC === pic}
              onClick={() => { onSelectDate(dateNode.date); onSelectPIC(pic) }}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}

// ─── LEVEL 2 — MONTH ROW ─────────────────────────────────────────
function MonthRow({ month, teamId, isTeamActive, currentSelDate, currentSelPIC, onSelectDate, onSelectPIC }) {
  const [open, setOpen] = useState(
    // auto-open month that contains selDate
    currentSelDate ? month.dates.some(d => d.date === currentSelDate) : false
  )
  const totalActs = month.dates.reduce((s, d) => s + d.activities.length, 0)
  const label     = MONTH_NAMES[month.monthIdx]

  return (
    <div>
      {/* Month header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: open ? 'rgba(255,255,255,.04)' : 'transparent',
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'rgba(255,255,255,.04)' : 'transparent'}
      >
        {/* chevron */}
        <ChevronRight
          size={10}
          style={{
            color: 'rgb(71,85,105)', flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform .22s ease',
          }}
        />
        {/* label */}
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(148,163,184)', flex: 1, textAlign: 'left' }}>
          {label}
        </span>
        {/* sparkline */}
        <Sparkline dates={month.dates} />
        {/* count badge */}
        <span style={{
          fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '4px',
          background: 'rgba(255,255,255,.06)', color: 'rgb(100,116,139)', marginLeft: '2px',
        }}>
          {totalActs}
        </span>
      </button>

      {/* Level 3 — Dates */}
      <Accordion open={open}>
        <div style={{ marginLeft: '10px', paddingLeft: '8px', borderLeft: '1px solid #1e2d4a', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {month.dates.map(dn => (
            <DateRow
              key={dn.date}
              dateNode={{ ...dn, urgency: dateUrgency(dn) }}
              teamId={teamId}
              isTeamActive={isTeamActive}
              currentSelDate={currentSelDate}
              currentSelPIC={currentSelPIC}
              onSelectDate={onSelectDate}
              onSelectPIC={onSelectPIC}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}

// ─── LEVEL 1 — TEAM ROW ──────────────────────────────────────────
function TeamRow({ team, isActive, selDate, selPIC, onSelectTeam, onSelectDate, onSelectPIC, onEdit, onDelete }) {
  const [open, setOpen] = useState(isActive)
  const Icon    = getIcon(team.iconName)
  const months  = useMemo(() => buildHierarchy(team.activities), [team.activities])
  const hasData = months.length > 0

  // Keep open when team becomes active
  useEffect(() => { if (isActive) setOpen(true) }, [isActive])

  const handleTeamClick = () => {
    onSelectTeam(team.id)
    setOpen(v => !v)
  }

  return (
    <div style={{ marginBottom: '2px' }}>
      {/* Team header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 6px 6px 8px', borderRadius: '10px',
          border: isActive && !selDate ? '1px solid rgba(59,130,246,.25)' : '1px solid transparent',
          background: isActive && !selDate ? 'rgba(37,99,235,.12)' : 'transparent',
          transition: 'background .15s, border-color .15s',
        }}
      >
        {/* chevron toggle */}
        {hasData ? (
          <button
            onClick={() => setOpen(v => !v)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <ChevronRight
              size={12}
              style={{
                color: isActive ? 'rgb(96,165,250)' : 'rgb(71,85,105)',
                transform: open ? 'rotate(90deg)' : 'none',
                transition: 'transform .22s ease',
              }}
            />
          </button>
        ) : (
          <span style={{ width: '14px', flexShrink: 0 }} />
        )}

        {/* Icon + Name (clickable) */}
        <button
          onClick={handleTeamClick}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0,
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          }}
        >
          <Icon size={14} style={{ color: isActive ? 'rgb(147,197,253)' : 'rgb(100,116,139)', flexShrink: 0 }} />
          <span style={{
            fontSize: '12px', fontWeight: isActive ? 700 : 500,
            color: isActive ? 'rgb(226,232,240)' : 'rgb(148,163,184)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left',
            transition: 'color .15s',
          }}>
            {team.name}
          </span>
        </button>

        {/* Mini progress bar */}
        {team.activities.length > 0 && (
          <TeamProgress activities={team.activities} />
        )}

        {/* Context menu */}
        <Drop
          trigger={
            <button
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'inline-flex', color: 'rgb(55,65,81)', borderRadius: '4px' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgb(148,163,184)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgb(55,65,81)'; e.currentTarget.style.background = 'transparent' }}
            >
              <MoreHorizontal size={12} />
            </button>
          }
          items={[
            { label: 'Edit Folder', icon: <Pencil size={13} />, onClick: onEdit },
            'sep',
            { label: 'Hapus', icon: <Trash2 size={13} />, danger: true, onClick: onDelete },
          ]}
        />
      </div>

      {/* Level 2 — Months */}
      <Accordion open={open && hasData}>
        <div style={{ marginLeft: '12px', paddingLeft: '8px', borderLeft: '1px solid #1a2d4a', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {months.map(m => (
            <MonthRow
              key={m.key}
              month={m}
              teamId={team.id}
              isTeamActive={isActive}
              currentSelDate={selDate}
              currentSelPIC={selPIC}
              onSelectDate={(d) => onSelectDate(team.id, d)}
              onSelectPIC={onSelectPIC}
            />
          ))}
          {months.length === 0 && (
            <p style={{ fontSize: '11px', color: 'rgb(55,65,81)', fontStyle: 'italic', padding: '4px 6px', margin: 0 }}>
              Belum ada aktivitas
            </p>
          )}
        </div>
      </Accordion>
    </div>
  )
}

// ─── LEGEND ───────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ padding: '6px 10px 8px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #0f1629' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 4px #ef444488', display: 'inline-block' }} />
        <span style={{ fontSize: '9px', color: 'rgb(71,85,105)' }}>Urgent</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b98188', display: 'inline-block' }} />
        <span style={{ fontSize: '9px', color: 'rgb(71,85,105)' }}>Aman</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
        <TrendingUp size={9} style={{ color: 'rgb(59,130,246)' }} />
        <span style={{ fontSize: '9px', color: 'rgb(71,85,105)' }}>Tren</span>
      </div>
    </div>
  )
}

// ─── SIDEBAR ROOT ─────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  const {
    teams, activeTeam, selDate, selPIC,
    selectTeam, selectDate, setSelPIC,
    addTeam, editTeam, deleteTeam,
  } = useDash()

  const isMobile = useIsMobile()

  // Folder modal state (unified add/edit)
  const [folderModal, setFolderModal] = useState({ open: false, team: null })
  const [delState,    setDelState]    = useState({ open: false, team: null })

  const handleSelectTeam = (id) => selectTeam(id)
  const handleSelectDate = (teamId, date) => {
    if (activeTeam !== teamId) selectTeam(teamId)
    selectDate(date)
  }
  const handleSelectPIC = (pic) => setSelPIC(pic)

  const inner = (
    <div className="sidebar-bg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 12px 12px', borderBottom: '1px solid #0f1629' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '9px',
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59,130,246,.35)', flexShrink: 0,
        }}>
          <BarChart3 size={15} style={{ color: 'white' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'rgb(241,245,249)', margin: 0, lineHeight: 1.2 }}>Working Tracker</p>
          <p style={{ fontSize: '10px', color: 'rgb(71,85,105)', margin: 0 }}>IA &amp; RM</p>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgb(71,85,105)', padding: '4px', display: 'flex', borderRadius: '6px' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
        <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgb(71,85,105)' }}>
          Team Folders
        </span>
        <Tip label="Tambah folder">
          <button
            onClick={() => setFolderModal({ open: true, team: null })}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgb(71,85,105)', padding: '3px', display: 'flex', borderRadius: '5px', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgb(148,163,184)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgb(71,85,105)'}
          >
            <Plus size={13} />
          </button>
        </Tip>
      </div>

      {/* ── Level 1 Teams ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 8px' }}>
        {teams.map(team => (
          <TeamRow
            key={team.id}
            team={team}
            isActive={team.id === activeTeam}
            selDate={team.id === activeTeam ? selDate : null}
            selPIC={team.id === activeTeam ? selPIC : null}
            onSelectTeam={handleSelectTeam}
            onSelectDate={handleSelectDate}
            onSelectPIC={handleSelectPIC}
            onEdit={() => setFolderModal({ open: true, team })}
            onDelete={() => setDelState({ open: true, team })}
          />
        ))}
      </div>

      {/* ── Legend ── */}
      <Legend />

      {/* ── Footer ── */}
      <div style={{ padding: '4px 6px 8px', borderTop: '1px solid #0f1629' }}>
        <button
          className="sb-footer-btn"
          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <Settings size={14} style={{ flexShrink: 0 }} />
          <span>Manage Access (Admin)</span>
        </button>
      </div>

      {/* ── Modals ── */}
      <AddFolderModal
        open={folderModal.open && !folderModal.team}
        onClose={() => setFolderModal({ open: false, team: null })}
        onAdd={addTeam}
      />
      <EditFolderModal
        open={folderModal.open && !!folderModal.team}
        onClose={() => setFolderModal({ open: false, team: null })}
        team={folderModal.team}
        onEdit={editTeam}
      />
      <DeleteFolderDialog
        open={delState.open}
        onClose={() => setDelState({ open: false, team: null })}
        team={delState.team}
        onDelete={deleteTeam}
      />
    </div>
  )

  // Mobile overlay
  if (isMobile) {
    return isOpen ? (
      <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <div style={{ position: 'relative', width: '17rem', height: '100%', zIndex: 10, boxShadow: '0 25px 50px rgba(0,0,0,.6)' }}>
          {inner}
        </div>
      </div>
    ) : null
  }

  // Desktop sticky sidebar
  return (
    <div style={{ width: '16rem', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
      {inner}
    </div>
  )
}