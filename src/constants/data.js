export const KATEGORI = [
  'Data Analysis','Investigation','Meeting','Documentation',
  'Training','Audit','Review','Report','Reporting','Monitoring','Interview',
]

export const TRANSCRIPTS = [
  'Melakukan analisis mendalam terhadap pola transaksi mencurigakan periode Januari–Maret 2026.',
  'Review dan validasi laporan investigasi fraud kasus nomor 2847 bersama tim investigasi senior.',
  'Koordinasi dengan Risk Assessment terkait temuan anomali di sistem pembayaran digital.',
  'Monitoring CCTV dan sistem keamanan seluruh cabang wilayah Jakarta Selatan dan Bekasi.',
  'Update dokumentasi SOP penanganan kasus fraud berdasarkan regulasi OJK terbaru 2026.',
  'Pembuatan laporan mingguan aktivitas tim terkait temuan fraud Q1 dan rekomendasi mitigasi.',
]

export const SEED_TEAMS = () => [
  {
    id: '1', name: 'Fraud & Data Analyst', iconName: 'BarChart3',
    activities: [
      { id:'a1', date:'2026-04-14', jamMulai:'08:30', jamSelesai:'10:00', pic:'mohamad@company.com', priority:'P0', kegiatan:'Analisis data fraud Q1 2026', kategoriKerja:'Data Analysis', status:'Done', progress:100, documents:{ doc:{name:'laporan-fraud-q1.doc',uploaded:true}, pdf:{name:'analisis-q1.pdf',uploaded:true} } },
      { id:'a2', date:'2026-04-14', jamMulai:'10:15', jamSelesai:'12:00', pic:'sarah@company.com', priority:'P1', kegiatan:'Review laporan investigasi kasus #2847', kategoriKerja:'Investigation', status:'On Progress', progress:65, documents:{ pdf:{name:'kasus-2847.pdf',uploaded:true} } },
      { id:'a3', date:'2026-04-14', jamMulai:'13:00', jamSelesai:'14:30', pic:'ahmad@company.com', priority:'P2', kegiatan:'Meeting dengan tim Risk Assessment', kategoriKerja:'Meeting', status:'Done', progress:100, documents:{ doc:{name:'notulen-meeting.doc',uploaded:true} } },
      { id:'a4', date:'2026-04-14', jamMulai:'15:00', jamSelesai:'17:00', pic:'mohamad@company.com', priority:'P1', kegiatan:'Validasi model deteksi anomali transaksi digital', kategoriKerja:'Data Analysis', status:'On Progress', progress:40, documents:{ excel:{name:'model-anomali.xlsx',uploaded:false} } },
      { id:'a5', date:'2026-04-13', jamMulai:'09:00', jamSelesai:'11:00', pic:'mohamad@company.com', priority:'P1', kegiatan:'Pembuatan report mingguan fraud detection', kategoriKerja:'Reporting', status:'Done', progress:100, documents:{ excel:{name:'report-weekly.xlsx',uploaded:true}, pdf:{name:'summary.pdf',uploaded:true} } },
      { id:'a6', date:'2026-04-13', jamMulai:'14:00', jamSelesai:'16:00', pic:'sarah@company.com', priority:'P2', kegiatan:'Training tools baru untuk analisis data', kategoriKerja:'Training', status:'Done', progress:100, documents:{ pdf:{name:'training-deck.pdf',uploaded:true} } },
      { id:'a7', date:'2026-04-12', jamMulai:'08:00', jamSelesai:'12:00', pic:'ahmad@company.com', priority:'P0', kegiatan:'Investigasi kasus transaksi mencurigakan batch 3', kategoriKerja:'Investigation', status:'Done', progress:100, documents:{ doc:{name:'investigasi-batch3.doc',uploaded:true}, pdf:{name:'evidence.pdf',uploaded:true} } },
    ],
  },
  {
    id: '2', name: 'Anti Fraud Investigator', iconName: 'ShieldAlert',
    activities: [
      { id:'b1', date:'2026-04-14', jamMulai:'09:00', jamSelesai:'11:30', pic:'budi@company.com', priority:'P0', kegiatan:'Investigasi kasus fraud internal #3421', kategoriKerja:'Investigation', status:'On Progress', progress:45, documents:{ doc:{name:'inv-3421.doc',uploaded:true}, pdf:{name:'timeline.pdf',uploaded:false} } },
      { id:'b2', date:'2026-04-14', jamMulai:'13:00', jamSelesai:'15:00', pic:'dewi@company.com', priority:'P1', kegiatan:'Interview saksi kasus pencurian data sistem', kategoriKerja:'Interview', status:'Not Progress', progress:0, documents:{ doc:{name:'transkrip.doc',uploaded:false} } },
      { id:'b3', date:'2026-04-14', jamMulai:'15:30', jamSelesai:'17:00', pic:'budi@company.com', priority:'P2', kegiatan:'Dokumentasi temuan investigasi lapangan', kategoriKerja:'Documentation', status:'Done', progress:100, documents:{ pdf:{name:'temuan.pdf',uploaded:true} } },
    ],
  },
  {
    id: '3', name: 'Internal Audit', iconName: 'ClipboardCheck',
    activities: [
      { id:'c1', date:'2026-04-14', jamMulai:'08:00', jamSelesai:'12:00', pic:'rina@company.com', priority:'P1', kegiatan:'Audit proses procurement Q1 2026', kategoriKerja:'Audit', status:'On Progress', progress:30, documents:{ excel:{name:'audit.xlsx',uploaded:true}, pdf:{name:'temuan-audit.pdf',uploaded:false} } },
      { id:'c2', date:'2026-04-14', jamMulai:'13:00', jamSelesai:'15:00', pic:'rina@company.com', priority:'P2', kegiatan:'Review temuan audit dengan manajemen senior', kategoriKerja:'Review', status:'On Progress', progress:50, documents:{ doc:{name:'review-mgmt.doc',uploaded:true} } },
    ],
  },
  { id: '4', name: 'Stock Count Auditor', iconName: 'PackageSearch', activities: [] },
  {
    id: '5', name: 'Loss Prevention', iconName: 'ShieldCheck',
    activities: [
      { id:'d1', date:'2026-04-14', jamMulai:'07:00', jamSelesai:'09:00', pic:'joko@company.com', priority:'P2', kegiatan:'Review CCTV gudang cabang Jakarta Selatan', kategoriKerja:'Monitoring', status:'Done', progress:100, documents:{ doc:{name:'laporan-cctv.doc',uploaded:true} } },
    ],
  },
  { id: '6', name: 'Risk Assessment', iconName: 'FileWarning', activities: [] },
  {
    id: '7', name: 'SOP', iconName: 'FileText',
    activities: [
      { id:'e1', date:'2026-04-14', jamMulai:'10:00', jamSelesai:'12:00', pic:'lisa@company.com', priority:'P3', kegiatan:'Update SOP penanganan fraud berdasarkan regulasi OJK', kategoriKerja:'Documentation', status:'On Progress', progress:75, documents:{ doc:{name:'sop-v3.doc',uploaded:true}, pdf:{name:'sop-final.pdf',uploaded:false} } },
    ],
  },
]
