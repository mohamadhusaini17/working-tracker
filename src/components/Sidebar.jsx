/**
 * Sidebar.jsx — 4-Level Hierarchical Navigation (Final & Secure Version)
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

/** Group activities by month → date → PIC (Secured against null/undefined) */
function buildHierarchy(activities) {
  const safeActivities = Array.isArray(activities) ? activities : [];
  const months = new Map()

  safeActivities.forEach(a => {
    if (!a?.date) return;
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

  return [...months.values()]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map(m => ({
      ...m,
      dates: [...m.dates.values()].sort((a, b) => b.date.localeCompare(a.date)),
    }))
}

/** Determine date urgency: P0 or any Not Progress → urgent */
function dateUrgency(dateNode) {
  const acts = dateNode?.activities || []
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

  const counts = dates.map(d => d?.activities?.length || 0)
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
      {counts.length > 0 && (() => {
        const lx = Math.round((counts.length - 1) * step)
        const ly = Math.round(h - (counts[counts.length - 1] / max) * (h - 2) - 1)
        return <circle cx={lx} cy={ly} r="2" fill="#3b82f6" />
      })()}
    </svg>
  )
}

/** Mini progress bar inside Level-1 team row (Secured against null) */
function TeamProgress({ activities }) {
  const safeActivities = Array.isArray(activities) ? activities : [];
  const total  = safeActivities.length
  const done   = safeActivities.filter(a => a?.status === 'Done').length
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
      requestAnimationFrame(() => {
        const h = ref.current?.scrollHeight ?? 0
        setMaxH(`${h}px`)
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
  const name = pic ? pic.split('@')[0] : 'Unknown';
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
  const urgency   = dateNode?.urgency || 'safe'
  const isDateAct = isTeamActive && currentSelDate === dateNode?.date

  // Collect unique PICs for this date safely
  const pics = useMemo(() => {
    const seen = new Set()
    const acts = Array.isArray(dateNode?.activities) ? dateNode.activities : [];
    return acts.filter(a => { if (seen.has(a.pic)) return false; seen.add(a.pic); return true }).map(a => a.pic)
  }, [dateNode])

  const [picsOpen, setPicsOpen] = useState(false)

  const dayLabel = String(dateNode?.day || 0).padStart(2, '0')
  const count    = dateNode?.activities?.length || 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => { onSelectDate(dateNode?.date); setPicsOpen(v => !v) }}
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

      <Accordion open={picsOpen && isDateAct}>
        <div style={{ marginLeft: '10px', paddingLeft: '8px', borderLeft: '1px solid #1e2d4a', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {pics.map(pic => (
            <PICRow
              key={pic}
              pic={pic}
              isActive={isTeamActive && currentSelDate === dateNode?.date && currentSelPIC === pic}
              onClick={() => { onSelectDate(dateNode?.date); onSelectPIC(pic) }}
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
    currentSelDate && Array.isArray(month?.dates) ? month.dates.some(d => d.date === currentSelDate) : false
  )
  const safeDates = Array.isArray(month?.dates) ? month.dates : [];
  const totalActs = safeDates.reduce((s, d) => s + (d?.activities?.length || 0), 0)
  const label     = MONTH_NAMES[month?.monthIdx] || 'Unknown'

  return (
    <div>
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
        <ChevronRight
          size={10}
          style={{
            color: 'rgb(71,85,105)', flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform .22s ease',
          }}
        />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(148,163,184)', flex: 1, textAlign: 'left' }}>
          {label}
        </span>
        <Sparkline dates={safeDates} />
        <span style={{
          fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '4px',
          background: 'rgba(255,255,255,.06)', color: 'rgb(100,116,139)', marginLeft: '2px',
        }}>
          {totalActs}