/**
 * ActivityTable.jsx — KODE FINAL LENGKAP & DINAMIS (OTOMATIS MEMBACA EMAIL USER GOOGLE)
 */
import React, { useState, useMemo } from 'react'
import { Search, Plus, ArrowUpDown, Pencil, Trash2, FileText, File, FileSpreadsheet, FileIcon, Activity, Calendar, RefreshCw } from 'lucide-react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { useDash } from '../contexts/DashboardContext.jsx' 
import { ProgBar } from './ui/ProgBar.jsx'
import Btn from './ui/Btn.jsx'
import Tip from './ui/Tip.jsx'
import Toast from './ui/Toast.jsx'
import DocBtn from './ui/DocBtn.jsx'
import ActivityForm from './modals/ActivityForm.jsx'
import DelDialog from './modals/DelDialog.jsx'
import DocPreviewModal from './modals/DocPreviewModal.jsx'
import { cn } from '../constants/helpers.js'
import { PRIORITY_CLS, STATUS_CLS, DOC_META, picHue, picInit } from '../constants/colors.js'

// 🧪 CLIENT ID GOOGLE CLOUD ANDA
const GOOGLE_CLIENT_ID = "48800530140-o45vh4t1t0n9ih3u5c5mj5ckr2omruv0.apps.googleusercontent.com"

function RenderDocIcon({ docType }) {
  switch (docType) {
    case 'doc': return <FileText size={16} className={DOC_META.doc?.color || 'text-blue-400'} />
    case 'pdf': return <File size={16} className={DOC_META.pdf?.color || 'text-red-400'} />
    case 'excel': return <FileSpreadsheet size={16} className={DOC_META.excel?.color || 'text-emerald-400'} />
    case 'csv': return <FileIcon size={16} className={DOC_META.csv?.color || 'text-teal-400'} />
    default: return <File size={16} className="text-slate-400" />
  }
}

function SortBtn({ col, label, sortCol, sortDir, onSort }) {
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 bg-transparent border-none cursor-pointer p-0"
    >
      {label}<ArrowUpDown size={12} />
    </button>
  )
}

// 🔄 KOMPONEN INTI TOMBOL SINKRONISASI GOOGLE CALENDAR (DINAMIS EMAIL)
function GoogleSyncButton({ teamId, setToast }) {
  const { syncGoogleCalendar, loading } = useDash()

  const handleGoogleLogin = useGoogleLogin({
    // Menambahkan scope userinfo.email agar diizinkan mengambil email profil pengguna
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email',
    onSuccess: async (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        console.log('🔑 Google Access Token Berhasil Didapat:', tokenResponse.access_token)
        
        try {
          // 📡 Ambil data profil (email) dari Google API berdasarkan access_token
          const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          const profileData = await profileResponse.json()
          
          if (!profileData || !profileData.email) {
            throw new Error('Email tidak ditemukan dari profil Google')
          }

          const dynamicUserEmail = profileData.email
          console.log('📧 Sinkronisasi sukses menggunakan email akun:', dynamicUserEmail)
          
          // Mengirimkan email asli pemilik akun ke fungsi Supabase
          const result = await syncGoogleCalendar(teamId, tokenResponse.access_token, dynamicUserEmail)
          setToast(result.message)
        } catch (apiErr) {
          console.error('Gagal mengambil profil user:', apiErr)
          setToast('❌ Gagal membaca profil email akun Google Anda')
        }
      } else {
        setToast('❌ Gagal mendapatkan izin akses dari Google.')
      }
    },
    onError: (error) => {
      console.error('OAuth Login Error:', error)
      setToast('❌ Gagal menyambungkan hak akses Google API')
    }
  })

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-700 shadow-md h-[38px]"
    >
      <RefreshCw size={14} className={cn(loading && "animate-spin text-blue-400")} />
      <span>{loading ? 'Mengambil Data...' : 'Sync Google Calendar'}</span>
    </button>
  )
}

export default function ActivityTable({ activities = [], teamId }) {
  const { addAct, editAct, deleteAct, updateDoc, selDate } = useDash()

  const [q,        setQ]        = useState('')
  const [sortCol,  setSortCol]  = useState(null)
  const [sortDir,  setSortDir]  = useState('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [delOpen,  setDelOpen]  = useState(false)
  const [preview,  setPreview]  = useState(null)
  const [selAct,   setSelAct]   = useState(null)
  const [mode,     setMode]     = useState('add')
  const [toast,    setToast]    = useState(null)

  const [inlineKegiatan, setInlineKegiatan] = useState('')
  const [inlinePic,      setInlinePic]      = useState('')
  const [inlineLoading,  setInlineLoading]  = useState(false)

  const filtered = useMemo(() => {
    if (!activities || !Array.isArray(activities)) return []
    return activities.filter(a => {
      if (!a) return false
      const ket = (a.kegiatan || '').toLowerCase()
      const p   = (a.pic || '').toLowerCase()
      const kat = (a.kategoriKerja || '').toLowerCase()
      const tgl = (a.date || '').toLowerCase()
      const query = q.toLowerCase()
      return ket.includes(query) || p.includes(query) || kat.includes(query) || tgl.includes(query)
    })
  }, [activities, q])

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      return typeof av === 'string'
        ? sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        : sortDir === 'asc' ? av - bv : bv - av
    })
  }, [filtered, sortCol, sortDir])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const openAdd  = () => { setSelAct(null); setMode('add');  setFormOpen(true) }
  const openEdit = (a) => { setSelAct(a);    setMode('edit'); setFormOpen(true) }
  const openDel  = (a) => { setSelAct(a);    setDelOpen(true) }
  
  const save = async (formData) => {
    try {
      if (mode === 'edit' && selAct) {
        await editAct(teamId, selAct.id, formData)
        setToast('Aktivitas berhasil diperbarui ✓')
      } else {
        await addAct(teamId, formData)
        setToast('Aktivitas berhasil ditambahkan ✓')
      }
    } catch (err) {
      console.error(err)
      setToast('❌ Gagal menyimpan data')
    }
  }

  const handleInlineSubmit = async (e) => {
    e.preventDefault()
    if (!inlineKegiatan.trim() || !inlinePic.trim()) {
      setToast('⚠️ Mohon isi nama kegiatan & email PIC!')
      return
    }

    setInlineLoading(true)
    try {
      const newActivity = {
        pic: inlinePic.trim(),
        status: 'On Progress',
        jamMulai: '08:00',
        jamSelesai: '09:00',
        kegiatan: inlineKegiatan.trim(),
        priority: 'P2',
        progress: 0,
        kategoriKerja: 'General',
        date: selDate || new Date().toISOString().split('T')[0],
        documents: {
          csv: { name: '', uploaded: false },
          doc: { name: '', uploaded: false },
          pdf: { name: '', uploaded: false },
          excel: { name: '', uploaded: false }
        }
      }

      await addAct(teamId, newActivity)
      setInlineKegiatan('')
      setInlinePic('')
      setToast('Aktivitas instan berhasil ditambahkan ✓')
    } catch (err) {
      console.error(err)
      setToast('❌ Gagal menambahkan aktivitas')
    } finally {
      setInlineLoading(false)
    }
  }

  const handlePreview = (dt, fn) => {
    if (fn) setPreview({ docType: dt, fileName: fn })
    else    setToast(`Dokumen ${dt.toUpperCase()} belum diupload`)
  }

  const handleUpload = (aid, dt, data) => {
    updateDoc(teamId, aid, dt, data)
    setToast(`${data.name} berhasil diupload ✓`)
  }

  const TH_COLS = [
    ['jamMulai','Mulai'], ['jamSelesai','Selesai'], ['date','Tanggal'], ['pic','PIC'], ['priority','Prior.'],
    ['kegiatan','Kegiatan'], ['kategoriKerja','Kategori'], ['status','Status'], ['progress','Progress'],
  ]

  const renderInlineForm = () => (
    <form onSubmit={handleInlineSubmit} className="p-4 rounded-xl flex flex-col md:flex-row gap-3 items-end mb-2 bg-slate-800/40 border border-slate-700/30">
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Kegiatan Baru</label>
        <input 
          value={inlineKegiatan}
          onChange={e => setInlineKegiatan(e.target.value)}
          type="text" 
          placeholder="Tulis tugas instan di sini..."
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          disabled={inlineLoading}
        />
      </div>
      <div className="w-full md:w-56 flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email PIC</label>
        <input 
          value={inlinePic}
          onChange={e => setInlinePic(e.target.value)}
          type="email" 
          placeholder="developer@company.com" 
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          disabled={inlineLoading}
        />
      </div>
      <button 
        type="submit"
        disabled={inlineLoading}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 h-[34px] cursor-pointer border-none"
      >
        <Plus size={14} />
        {inlineLoading ? 'Saving...' : 'Tambah Cepat'}
      </button>
    </form>
  )

  if (!activities || activities.length === 0) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="flex flex-col gap-4">
          {renderInlineForm()}
          <div className="flex flex-col items-center py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Activity size={22} className="text-blue-500" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">Belum ada aktivitas di folder ini</p>
            <p className="text-slate-600 text-xs mt-1 max-w-xs">Ambil dari Google Calendar atau klik tombol di bawah untuk opsi lengkap.</p>
            <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
              <GoogleSyncButton teamId={teamId} setToast={setToast} />
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer border-none shadow-lg shadow-blue-600/10 h-[38px]"
              >
                <Plus size={14} />
                <span>Form Detil (Opsi Lanjutan)</span>
              </button>
            </div>
          </div>
          <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} activity={null} onSave={save} mode="add" defaultDate={selDate} />
          {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
        </div>
      </GoogleOAuthProvider>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col gap-4">
        {renderInlineForm()}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari aktivitas..." className="srch sm:w-72" />
          </div>
          <div className="flex items-center gap-2.5">
            <GoogleSyncButton teamId={teamId} setToast={setToast} />
            <Btn onClick={openAdd} variant="secondary"><Plus size={16} />Form Detil (Opsi Lanjutan)</Btn>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="tbl-header">
                  {TH_COLS.map(([col, lbl]) => (
                    <th key={col} className="px-4 py-3 text-left" style={col === 'kegiatan' ? { minWidth: '200px' } : {}}>
                      <SortBtn col={col} label={lbl} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Dok.</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-14 text-center text-slate-600">Tidak ada aktivitas ditemukan.</td>
                  </tr>
                ) : sorted.map((a) => {
                  const formattedDate = a.date ? new Date(a.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : '-'

                  return (
                    <tr key={a.id} className="tbl-row group">
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{a.jamMulai || '-'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{a.jamSelesai || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                          <Calendar size={12} className="text-slate-600" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black" style={{ backgroundColor: picHue(a.pic || 'A'), fontSize: '9px' }}>{picInit(a.pic || 'A')}</div>
                          <span className="text-xs text-slate-400 truncate max-w-24">{(a.pic || '').split('@')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', PRIORITY_CLS[a.priority])}>{a.priority}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-slate-200 text-xs block max-w-56 line-clamp-2">{a.kegiatan}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{a.kategoriKerja}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', STATUS_CLS[a.status])}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3"><ProgBar v={a.progress} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {a.documents && Object.entries(a.documents).map(([dt, doc]) => (
                            <Tip key={dt} label={doc?.uploaded ? `Preview: ${doc.name}` : `Upload ${dt.toUpperCase()}`}>
                              {doc?.uploaded ? (
                                <button type="button" onClick={() => handlePreview(dt, doc.name)} className="btn-ghost p-1.5 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer">
                                  <RenderDocIcon docType={dt} />
                                </button>
                              ) : (
                                <DocBtn docType={dt} docData={doc || {}} onUpload={(_, data) => handleUpload(a.id, dt, data)} onPreview={handlePreview} />
                              )}
                            </Tip>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tip label="Edit"><Btn variant="ghost" size="icon-sm" onClick={() => openEdit(a)}><Pencil size={14} /></Btn></Tip>
                          <Tip label="Hapus"><Btn variant="ghost" size="icon-sm" onClick={() => openDel(a)}><Trash2 size={14} /></Btn></Tip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} activity={selAct} onSave={save} mode={mode} defaultDate={selDate} />
        <DelDialog open={delOpen} onClose={() => setDelOpen(false)} onConfirm={() => selAct && deleteAct(teamId, selAct.id)} title="Hapus Aktivitas" desc={selAct ? `Yakin hapus "${selAct.kegiatan}"?` : ''} />
        {preview && <DocPreviewModal open={!!preview} onClose={() => setPreview(null)} docType={preview.docType} fileName={preview.fileName} />}
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      </div>
    </GoogleOAuthProvider>
  )
}