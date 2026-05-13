export const cn = (...classes) => classes.filter(Boolean).join(' ')

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const MONTHS_SH = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

export const fmtLong  = (d) => { const dt = new Date(d + 'T00:00:00'); return `${dt.getDate()} ${MONTHS_ID[dt.getMonth()]} ${dt.getFullYear()}` }
export const fmtShort = (d) => { const dt = new Date(d + 'T00:00:00'); return `${dt.getDate()} ${MONTHS_SH[dt.getMonth()]}` }
