/**
 * services/googleCalendar.js — VERSI SOLUSI MUTLAK DATABASE UPSERT
 */

export const fetchGoogleEvents = async (accessToken, targetDate) => {
  try {
    const baseDate = targetDate ? new Date(targetDate) : new Date()
    
    const startOfDay = new Date(baseDate.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(baseDate.setHours(23, 59, 59, 999)).toISOString()

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) throw new Error('Gagal mengambil data dari Google API')

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Fetch Google Events Error:', error)
    throw error
  }
}

export const mapGoogleEventToActivity = (event, userEmail, teamId) => {
  const startTime = event.start?.dateTime || event.start?.date || ''
  const endTime = event.end?.dateTime || event.end?.date || ''

  if (!startTime) return null

  const formatTime = (isoString) => {
    if (!isoString.includes('T')) return '09:00' 
    return isoString.substring(11, 16) 
  }

  const formatDate = (isoString) => {
    return isoString.split('T')[0] 
  }

  const jamMulaiStr = formatTime(startTime) 
  const jamSelesaiStr = formatTime(endTime) 
  const eventDate = formatDate(startTime)

  // LOGIKA FILTER JAM KERJA (09:00 - 18:00)
  if (jamMulaiStr < '09:00' || jamMulaiStr > '18:00') {
    return null 
  }

  // 🛠️ FIX UTAMA SUPABASE: Buat ID Unik Absolut Gabungan Google ID + Tanggal Event
  // Menghilangkan semua karakter aneh agar aman dibaca sebagai primary key string di Supabase
  const cleanGoogleId = (event.id || '').replace(/[^a-zA-Z0-9]/g, '')
  const uniqueId = `google-${cleanGoogleId.substring(0, 30)}-${eventDate}`

  return {
    id: uniqueId, // ID ini dijamin unik per hari, mencegah isu skip upsert di Supabase
    team_id: teamId,
    pic: userEmail || 'system.google', 
    status: 'In Progress',
    jamMulai: jamMulaiStr,
    jamSelesai: jamSelesaiStr,
    kegiatan: event.summary || 'Meeting Tanpa Judul',
    priority: 'P2', 
    progress: 0,
    kategoriKerja: 'Meeting', 
    date: eventDate,
    documents: {
      csv: { name: '', uploaded: false },
      doc: { name: '', uploaded: false },
      pdf: { name: '', uploaded: false },
      excel: { name: '', uploaded: false },
    },
  }
}