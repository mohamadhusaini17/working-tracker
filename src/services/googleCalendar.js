/**
 * services/googleCalendar.js — VERSI TOTAL FIX (RECURRING EXCEPTION BYPASS)
 */

export const fetchGoogleEvents = async (accessToken, targetDate) => {
  try {
    const baseDate = targetDate ? new Date(targetDate) : new Date()
    
    const startOfDay = new Date(baseDate.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(baseDate.setHours(23, 59, 59, 999)).toISOString()

    // Tetap gunakan singleEvents=true untuk memecah rentang tanggal secara murni
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
  // Ambil waktu murni dari instance event yang terjadi di tanggal tersebut
  const startTime = event.start?.dateTime || event.start?.date || ''
  const endTime = event.end?.dateTime || event.end?.date || ''

  if (!startTime) return null; // Abaikan jika benar-benar tidak ada data waktu

  const formatTime = (isoString) => {
    if (!isoString.includes('T')) return '09:00' // Default fallback aman
    return isoString.substring(11, 16) 
  }

  const formatDate = (isoString) => {
    return isoString.split('T')[0] 
  }

  const jamMulaiStr = formatTime(startTime) 
  const jamSelesaiStr = formatTime(endTime) 

  // Filter jam kerja (09:00 - 18:00)
  if (jamMulaiStr < '09:00' || jamMulaiStr > '18:00') {
    return null 
  }

  // FORCE ID UNIK: Gunakan ID gabungan antara ID Event dan Tanggal 
  // Ini memastikan Exception Event dari recurring meeting tidak tabrakan di Supabase
  const eventDate = formatDate(startTime)
  const cleanId = (event.id || '').replace(/[^a-zA-Z0-9]/g, '')
  const uniqueId = `goo-${cleanId.substring(0, 30)}-${eventDate}`

  return {
    id: uniqueId,
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