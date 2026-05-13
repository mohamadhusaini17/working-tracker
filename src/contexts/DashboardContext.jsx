import { createContext, useContext, useState, useMemo } from 'react'
import { SEED_TEAMS } from '../constants/data.js'

const DashCtx = createContext(null)

export function DashboardProvider({ children }) {
  const [teams,       setTeams]      = useState(SEED_TEAMS)
  const [activeTeam,  setActiveTeam] = useState('1')
  const [selDate,     setSelDate]    = useState('2026-04-14')
  const [selPIC,      setSelPIC]     = useState(null)

  const selectDate = (d)  => { setSelDate(d); setSelPIC(null) }
  const selectTeam = (id) => { setActiveTeam(id); setSelDate(null); setSelPIC(null) }

  /** All known PICs — auto-updates when new activities are added */
  const allPICs = useMemo(() => {
    const s = new Set()
    teams.forEach(t => t.activities.forEach(a => s.add(a.pic)))
    return [...s].sort()
  }, [teams])

  // ── Team CRUD ──────────────────────────────────────────────────
  const addTeam    = (name, iconName) => setTeams(p => [...p, { id: Date.now().toString(), name, iconName, activities: [] }])
  const editTeam   = (id, name, iconName) => setTeams(p => p.map(t => t.id === id ? { ...t, name, iconName } : t))
  const deleteTeam = (id) => setTeams(p => {
    const r = p.filter(t => t.id !== id)
    if (activeTeam === id && r.length) setActiveTeam(r[0].id)
    return r
  })

  // ── Activity CRUD ──────────────────────────────────────────────
  const addAct    = (tid, a)      => setTeams(p => p.map(t => t.id === tid ? { ...t, activities: [...t.activities, { ...a, id: Date.now().toString() }] } : t))
  const editAct   = (tid, aid, a) => setTeams(p => p.map(t => t.id === tid ? { ...t, activities: t.activities.map(x => x.id === aid ? { ...a, id: aid } : x) } : t))
  const deleteAct = (tid, aid)    => setTeams(p => p.map(t => t.id === tid ? { ...t, activities: t.activities.filter(x => x.id !== aid) } : t))
  const updateDoc = (tid, aid, dt, data) => setTeams(p => p.map(t => t.id === tid ? { ...t, activities: t.activities.map(x => x.id === aid ? { ...x, documents: { ...x.documents, [dt]: data } } : x) } : t))

  // ── Computed helpers ───────────────────────────────────────────
  const getTeam        = ()         => teams.find(t => t.id === activeTeam)
  const getActsByDate  = (tid, date) => { const t = teams.find(t => t.id === tid); return t ? t.activities.filter(a => a.date === date) : [] }
  const getDateFolders = (tid) => {
    const t = teams.find(t => t.id === tid); if (!t) return []
    const m = new Map()
    t.activities.forEach(a => m.set(a.date, (m.get(a.date) || 0) + 1))
    return [...m.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date))
  }
  const getPICs = (tid, date) => {
    const acts = getActsByDate(tid, date)
    const m = new Map()
    acts.forEach(a => { if (!m.has(a.pic)) m.set(a.pic, { pic: a.pic, acts: [] }); m.get(a.pic).acts.push(a) })
    return [...m.values()]
  }
  const getStats = (tid, date, pic) => {
    const t = teams.find(t => t.id === tid); if (!t) return { total: 0, done: 0, inProg: 0, p0: 0 }
    let acts = date ? t.activities.filter(a => a.date === date) : t.activities
    if (pic) acts = acts.filter(a => a.pic === pic)
    return { total: acts.length, done: acts.filter(a => a.status === 'Done').length, inProg: acts.filter(a => a.status === 'On Progress').length, p0: acts.filter(a => a.priority === 'P0').length }
  }

  return (
    <DashCtx.Provider value={{ teams, activeTeam, selDate, selPIC, allPICs, selectTeam, selectDate, setSelPIC, addTeam, editTeam, deleteTeam, addAct, editAct, deleteAct, updateDoc, getTeam, getActsByDate, getDateFolders, getPICs, getStats }}>
      {children}
    </DashCtx.Provider>
  )
}

export const useDash = () => {
  const ctx = useContext(DashCtx)
  if (!ctx) throw new Error('useDash must be used inside DashboardProvider')
  return ctx
}
