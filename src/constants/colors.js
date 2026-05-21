export const PIC_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

// 🛡️ AMAN: Jika email kosong/bukan string, beri warna index 0 (tidak crash charCodeAt)
export const picHue = (email) => {
  if (!email || typeof email !== 'string') return PIC_PALETTE[0];
  return PIC_PALETTE[email.charCodeAt(0) % PIC_PALETTE.length];
}

// 🛡️ AMAN: Mencegah crash split() jika email undefined saat klik "Add New" di form detil
export const picInit = (email) => {
  if (!email || typeof email !== 'string') return '??';
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export const PRIORITY_CLS = {
  P0: 'bg-red-500/15 text-red-400 border border-red-500/30',
  P1: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  P2: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  P3: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
}

export const STATUS_CLS = {
  'Done':         'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'On Progress':  'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  'Not Progress': 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
}

export const DOC_META = {
  doc:   { color: 'text-sky-400',     bg: 'bg-sky-500/10 border border-sky-500/20',      label: 'Word Document'    },
  pdf:   { color: 'text-red-400',     bg: 'bg-red-500/10 border border-red-500/20',      label: 'PDF Document'     },
  excel: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20',  label: 'Excel Spreadsheet'},
  csv:   { color: 'text-slate-400',   bg: 'bg-slate-500/10 border border-slate-500/20',  label: 'CSV File'         },
}

export const FAKE_PREVIEW = {
  doc:   ['Laporan investigasi fraud internal.','Temuan: 3 anomali terdeteksi.','Rekomendasi: Eskalasi ke audit.','Status: CONFIDENTIAL'],
  pdf:   ['Laporan resmi diarsipkan.','Halaman 1 dari 12 — Ringkasan Eksekutif.','Kerugian potensial: Rp 2.4 Miliar.','Disetujui: Kepala Divisi IA'],
  excel:['Sheet 1: Data Transaksi (2.847 baris)','Sheet 2: Analisis Anomali','Sheet 3: Summary Dashboard','Diubah: 14 Apr 2026, 15:23'],
  csv:   ['id,tanggal,nominal,status,pic','001,2026-04-14,5000000,flagged,mohamad','002,2026-04-13,12000000,clear,sarah'],
}