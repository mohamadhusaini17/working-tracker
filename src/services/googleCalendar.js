/**
 * services/googleCalendar.js — VERSI FINAL FILTER WAKTU (09:00 - 18:00) & ANTI-DUPLIKASI
 */

export const fetchGoogleEvents = async (accessToken, targetDate) => {
  try {
    const baseDate = targetDate ? new Date(targetDate) : new Date()
    
    // Set rentang waktu awal hari (00:00:00) dan akhir hari (23:59:59)
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

  // Memperbaiki format pembacaan jam (antisipasi format all-day event tanpa format waktu)
  const formatTime = (isoString) => {
    if (!isoString || !isoString.includes('T')) return '08:00'
    return isoString.substring(11, 16) 
  }

  // Memastikan ekstraksi tanggal murni (YYYY-MM-DD)
  const formatDate = (isoString) => {
    if (!isoString) return new Date().toISOString().split('T')[0]
    return isoString.split('T')[0] 
  }

  const jamMulaiStr = formatTime(startTime) // Format: "HH:MM"
  const jamSelesaiStr = formatTime(endTime) // Format: "HH:MM"

  // 🛠️ TRIGGER FILTER WAKTU: Abaikan meeting di luar jam 09:00 - 18:00
  if (jamMulaiStr < '09:00' || jamSelesaiStr > '18:00') {
    return null // Mengembalikan null agar bisa disaring keluar di backend/loop frontend
  }

  // Membuat ID acak murni yang ramah bagi Supabase untuk menghindari konflik balapan data (race condition)
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  const uniqueId = `goo-${jamMulaiStr.replace(':', '')}-${randomSuffix}`

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
    date: formatDate(startTime),
    documents: {
      csv: { name: '', uploaded: false },
      doc: { name: '', uploaded: false },
      pdf: { name: '', uploaded: false },
      excel: { name: '', uploaded: false },
    },
  }
}