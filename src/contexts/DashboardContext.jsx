/**
 * DashboardContext.jsx — SINKRONISASI DATABASE RELASIONAL
 */
import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchGoogleEvents, mapGoogleEventToActivity } from '../services/googleCalendar.js'

const DashCtx = createContext(null)

function cleanIconToString(rawIcon) {
  if (!rawIcon) return 'Folder'
  if (typeof rawIcon === 'string') return rawIcon
  if (typeof rawIcon === 'function' && rawIcon.name) return rawIcon.name
  if (typeof rawIcon === 'object') {
    return rawIcon.name || rawIcon.displayName || rawIcon.iconName || 'Folder'
  }
  return 'Folder'
}

export function DashboardProvider({ children }) {
  const [teams,      setTeams]     = useState([])
  const [activeTeam, setActiveTeam]= useState(null)
  const [selDate,    setSelDate]   = useState(new Date().toISOString().split('T')[0])
  const [selPIC,     setSelPIC]    = useState(null)
  const [loading,    setLoading]   = useState(true)

  // ── 1. FETCH AWAL (MENGGUNAKAN RELASI JOIN TABEL) ─────────────────
  useEffect(() => {
    const fetchTeamsAndActivities = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('team_folders')
          .select(`
            id,
            name: folder_name,
            icon: icon_name,
            activities (
              id,
              pic: pic_email,
              status,
              jamMulai: start_time,
              jamSelesai: end_time,
              kegiatan: description,
              priority,
              progress: progress_percentage,
              kategoriKerja: work_category,
              date: activity_date,
              document_url
            )
          `)
          .order('id', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          const sanitized = data.map(team => ({
            ...team,
            icon: cleanIconToString(team.icon),
            iconName: cleanIconToString(team.icon),
            activities: (team.activities || []).map(a => ({
              ...a,
              jamMulai: a.jamMulai ? a.jamMulai.substring(0, 5) : '08:00',
              jamSelesai: a.jamSelesai ? a.jamSelesai.substring(0, 5) : '17:00',
              documents: a.document_url ? {
                pdf: { name: 'Attached File', uploaded: true, url: a.document_url }
              } : {
                csv:  { name: '', uploaded: false },
                doc:  { name: '', uploaded: false },
                pdf:  { name: '', uploaded: false },
                excel:{ name: '', uploaded: false },
              }
            }))
          }))

          setTeams(sanitized)
          if (sanitized[0]) setActiveTeam(sanitized[0].id)
        } else {
          setTeams([])
        }
      } catch (err) {
        console.error('Error fetching data relasional:', err.message)
        setTeams([])
      } finally {
        setLoading(false)
      }
    }

    fetchTeamsAndActivities()
  }, [])

  const selectDate = (d) => setSelDate(d)
  const selectTeam = (id) => {
    setActiveTeam(id)
    setSelDate(new Date().toISOString().split('T')[0])
    setSelPIC(null)
  }

  // ── 3. TEAM CRUD ──────────────────────────────────────────────
  const addTeam = async (name, icon) => {
    const pureIconStr = cleanIconToString(icon)
    try {
      const { data, error } = await supabase
        .from('team_folders')
        .insert([{ folder_name: name, icon_name: pureIconStr }])
        .select()
        .single()

      if (error) throw error

      const inserted = { 
        id: data.id,
        name: data.folder_name, 
        icon: data.icon_name,
        iconName: data.icon_name,
        activities: [] 
      }
      setTeams(prev => [...prev, inserted])
      setActiveTeam(inserted.id)
    } catch (err) {
      console.error('addTeam database error:', err.message)
    }
  }

  const editTeam = async (id, name, icon) => {
    const pureIconStr = cleanIconToString(icon)
    try {
      const { error } = await supabase
        .from('team_folders')
        .update({ folder_name: name, icon_name: pureIconStr })
        .eq('id', id)

      if (error) throw error
      setTeams(prev => prev.map(t => t.id === id ? { ...t, name, icon: pureIconStr, iconName: pureIconStr } : t))
    } catch (err) { console.error('editTeam error:', err.message) }
  }

  const deleteTeam = async (id) => {
    try {
      const { error } = await supabase.from('team_folders').delete().eq('id', id)
      if (error) throw error
      setTeams(prev => {
        const remaining = prev.filter(t => t.id !== id)
        if (activeTeam === id) setActiveTeam(remaining[0]?.id || null)
        return remaining
      })
    } catch (err) { console.error('deleteTeam error:', err.message) }
  }

  // ── 4. GETTER ─────────────────────────────────────────────────
  const getTeam = () => teams.find(t => t.id === activeTeam) || null

  const getActsByDate = (teamId, date) => {
    const target = teams.find(t => t.id === teamId)
    if (!target || !Array.isArray(target.activities)) return []
    const targetDate = date === undefined ? selDate : date
    if (!targetDate) return target.activities 
    return target.activities.filter(a => a && a.date === targetDate)
  }

  const getPICs = (teamId, date) => {
    const acts    = getActsByDate(teamId, date)
    const summary = {}
    acts.forEach(a => {
      if (!a?.pic) return
      if (!summary[a.pic]) {
        summary[a.pic] = { pic: a.pic, total: 0, done: 0, progressSum: 0, acts: [] }
      }
      summary[a.pic].total       += 1
      summary[a.pic].progressSum += Number(a.progress) || 0
      summary[a.pic].acts.push(a)
      if (a.status === 'Done' || a.status === 'Selesai') summary[a.pic].done += 1
    })
    return Object.values(summary).map(p => ({
      pic:         p.pic,
      tasks:        p.total,
      done:         p.done,
      avgProgress: p.total > 0 ? Math.round(p.progressSum / p.total) : 0,
      acts:         p.acts,
    }))
  }

  const getStats = (teamId, date, pic) => {
    const target = teams.find(t => t.id === teamId)
    let acts     = target?.activities || []
    if (date) acts = acts.filter(a => a?.date === date)
    if (pic)  acts = acts.filter(a => a?.pic  === pic)
    return {
      total:  acts.length,
      done:   acts.filter(a => a?.status === 'Done' || a?.status === 'Selesai').length,
      onProg: acts.filter(a => a?.status === 'In Progress' || a?.status === 'On Progress').length,
      p0:     acts.filter(a => a?.priority === 'P0' || a?.priority?.includes('P0')).length,
      p1:     acts.filter(a => a?.priority === 'P1' || a?.priority?.includes('P1')).length,
      p2:     acts.filter(a => a?.priority === 'P2' || a?.priority?.includes('P2')).length,
      p3:     acts.filter(a => a?.priority === 'P3' || a?.priority?.includes('P3')).length,
    }
  }

  // ── 5. ACTIVITY CRUD ──────────────────────────────────────────
  const addAct = async (teamId, newAct) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          folder_id: teamId,
          activity_date: newAct.date,
          start_time: newAct.jamMulai.length === 5 ? `${newAct.jamMulai}:00` : newAct.jamMulai,
          end_time: newAct.jamSelesai.length === 5 ? `${newAct.jamSelesai}:00` : newAct.jamSelesai,
          pic_email: newAct.pic,
          priority: newAct.priority,
          description: newAct.kegiatan,
          work_category: newAct.kategoriKerja,
          status: newAct.status,
          progress_percentage: parseInt(newAct.progress) || 0
        }])
        .select()
        .single()

      if (error) throw error

      const synchronizedAct = {
        id: data.id,
        pic: data.pic_email,
        status: data.status,
        jamMulai: data.start_time.substring(0, 5),
        jamSelesai: data.end_time.substring(0, 5),
        kegiatan: data.description,
        priority: data.priority,
        progress: data.progress_percentage,
        kategoriKerja: data.work_category,
        date: data.activity_date,
        documents: { csv: { name: '', uploaded: false }, doc: { name: '', uploaded: false }, pdf: { name: '', uploaded: false }, excel: { name: '', uploaded: false } }
      }

      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: [...t.activities, synchronizedAct] } : t))
    } catch (err) { console.error('addAct error:', err.message) }
  }

  const editAct = async (teamId, actId, updatedData) => {
    try {
      const mappedUpdate = {}
      if (updatedData.pic) mappedUpdate.pic_email = updatedData.pic
      if (updatedData.status) mappedUpdate.status = updatedData.status
      if (updatedData.kegiatan) mappedUpdate.description = updatedData.kegiatan
      if (updatedData.priority) mappedUpdate.priority = updatedData.priority
      if (updatedData.progress !== undefined) mappedUpdate.progress_percentage = parseInt(updatedData.progress)

      const { error } = await supabase.from('activities').update(mappedUpdate).eq('id', actId)
      if (error) throw error

      setTeams(prev => prev.map(t => t.id === teamId ? {
        ...t,
        activities: t.activities.map(a => a.id === actId ? { ...a, ...updatedData } : a)
      } : t))
    } catch (err) { console.error('editAct error:', err.message) }
  }

  const deleteAct = async (teamId, actId) => {
    try {
      if (typeof actId === 'string' && actId.startsWith('act-')) {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: t.activities.filter(a => a.id !== actId) } : t))
        return
      }
      const { error } = await supabase.from('activities').delete().eq('id', actId)
      if (error) throw error
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, activities: t.activities.filter(a => a.id !== actId) } : t))
    } catch (err) { console.error('deleteAct error:', err.message) }
  }

  const updateDoc = async (teamId, actId, docType, docData) => {
    try {
      const { error } = await supabase.from('activities').update({ document_url: docData.url }).eq('id', actId)
      if (error) throw error
      setTeams(prev => prev.map(t => t.id === teamId ? {
        ...t,
        activities: t.activities.map(a => a.id === actId ? {
          ...a,
          documents: { ...(a.documents || {}), [docType]: { uploaded: true, name: docData.name, url: docData.url || '' } }
        } : a)
      } : t))
    } catch (err) { console.error('updateDoc error:', err.message) }
  }

  // ── 6. GOOGLE CALENDAR SINKRONISASI ───────────────────────────
  const syncGoogleCalendar = async (teamId, accessToken, userEmail) => {
    try {
      setLoading(true)
      const target = teams.find(t => t.id === teamId)
      if (!target) return { success: false, message: 'Tim pelacak tidak ditemukan.' }

      const googleEvents = await fetchGoogleEvents(accessToken, selDate)
      if (googleEvents.length === 0) {
        return { success: true, message: 'Tidak ada jadwal meeting pada tanggal ini di Google Calendar.' }
      }

      const currentActivities = Array.isArray(target.activities) ? target.activities : []
      const newMappedActivities = googleEvents.map(event => mapGoogleEventToActivity(event, userEmail, teamId))
      const filteredNewActivities = newMappedActivities.filter(newAct => {
        return !currentActivities.some(currAct => currAct.kegiatan === newAct.kegiatan && currAct.jamMulai === newAct.jamMulai)
      })

      if (filteredNewActivities.length === 0) {
        return { success: true, message: 'Semua jadwal meeting Anda sudah tersinkronisasi.' }
      }

      // Simpan satu-persatu ke baris database activities
      for (const act of filteredNewActivities) {
        await addAct(teamId, act)
      }

      return { success: true, message: `Berhasil menyelaraskan ${filteredNewActivities.length} meeting dari Google Calendar!` }
    } catch (err) {
      console.error('syncGoogleCalendar error:', err.message)
      return { success: false, message: err.message }
    } finally { setLoading(false) }
  }

  const allPICs = useMemo(() => {
    const s = new Set()
    teams.forEach(t => { if (Array.isArray(t?.activities)) { t.activities.forEach(a => { if (a?.pic) s.add(a.pic) }) } })
    return [...s].sort()
  }, [teams])

  const activities = useMemo(() => {
    const allActs = []
    teams.forEach(t => { if (Array.isArray(t.activities)) { t.activities.forEach(a => { allActs.push({ ...a, team_id: t.id }) }) } })
    return allActs
  }, [teams])

  const value = {
    teams, setTeams, activeTeam, setActiveTeam, selDate, setSelDate, selPIC, setSelPIC, loading, activities,
    selectDate, selectTeam, addTeam, editTeam, deleteTeam, allPICs, getTeam, getActsByDate, getPICs, getStats, addAct, editAct, deleteAct, updateDoc, syncGoogleCalendar, 
  }

  return <DashCtx.Provider value={value}>{children}</DashCtx.Provider>
}

export const useDash = () => {
  const ctx = useContext(DashCtx)
  if (!ctx) throw new Error('useDash must be used within DashboardProvider')
  return ctx
}