/**
 * services/googleCalendar.js — VERSI FINAL FIX RECURRING (WEEKLY/MONTHLY)
 */

export const fetchGoogleEvents = async (accessToken, targetDate) => {
  try {
    // JIKA targetDate TIDAK DIKIRIM, BARU DEFAULT KE HARI INI
    const baseDate = targetDate ? new Date(targetDate) : new Date()
    
    // Set rentang waktu awal hari (00:00:00) dari tanggal yang dipilih
    const startOfDay = new Date(baseDate.setHours(0, 0, 0, 0)).toISOString()
    // Set rentang waktu akhir hari (23:59:59) dari tanggal yang dipilih
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

  // 🛠️ AMAN RECURRING: Ambil ID unik instance dari Google jika ini event mingguan/bulanan
  // Menghilangkan karakter ilegal string seperti underscore (_) atau titik (.) agar ramah di Supabase
  const rawEventId = event.id.replace(/[^a-zA-Z0-9]/g, '')
  const recurringPrefix = event.recurringEventId ? 'rec-' : 'single-'
  
  // Kombinasi ID yang dijamin 100% berbeda total antara Weekly dan Monthly
  const cleanTime = formatTime(startTime).replace(':', '')
  const uniqueId = `goo-${recurringPrefix}${rawEventId.substring(0, 30)}-${cleanTime}`

  return {
    id: uniqueId,
    team_id: teamId,
    pic: userEmail || 'system.google', 
    status: 'In Progress',
    jamMulai: formatTime(startTime),
    jamSelesai: formatTime(endTime),
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