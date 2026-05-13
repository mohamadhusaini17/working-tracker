import { useState, useMemo } from 'react'
import { Search, Plus, ArrowUpDown, Pencil, Trash2, FileText, File, FileSpreadsheet, FileIcon, Activity } from 'lucide-react'
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

const DOC_ICONS = { doc: FileText, pdf: File, excel: FileSpreadsheet, csv: FileIcon }

function SortBtn({ col, label, sortCol, sortDir, onSort }) {
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      {label}<ArrowUpDown size={12} />
    </button>
  )
}

export default function ActivityTable({ activities, teamId }) {
  const { addAct, editAct, deleteAct, updateDoc, selDate } = useDash()

  const [q,        setQ]        = useState('')
  const [sortCol,  setSortCol]  = useState(null)
  const [sortDir,  setSortDir]  = useState('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [delOpen,  setDelOpen]  = useState(false)
  const [preview,  setPreview]  = useState(null)   // { docType, fileName }
  const [selAct,   setSelAct]   = useState(null)
  const [mode,     setMode]     = useState('add')
  const [toast,    setToast]    = useState(null)

  const filtered = activities.filter(a =>
    a.kegiatan.toLowerCase().includes(q.toLowerCase()) ||
    a.pic.toLowerCase().includes(q.toLowerCase()) ||
    a.kategoriKerja.toLowerCase().includes(q.toLowerCase())
  )

  const sorted = useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol]
      return typeof av === 'string'
        ? sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        : sortDir === 'asc' ? av - bv : bv - av
    })
  }, [filtered, sortCol, sortDir])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const openAdd  = ()  => { setSelAct(null); setMode('add');  setFormOpen(true) }
  const openEdit = (a) => { setSelAct(a);    setMode('edit'); setFormOpen(true) }
  const openDel  = (a) => { setSelAct(a);    setDelOpen(true) }
  const save     = (d) => mode === 'edit' && selAct ? editAct(teamId, selAct.id, d) : addAct(teamId, d)

  const handlePreview = (dt, fn) => {
    if (fn) setPreview({ docType: dt, fileName: fn })
    else    setToast(`Dokumen ${dt.toUpperCase()} belum diupload`)
  }
  const handleUpload = (aid, dt, data) => {
    updateDoc(teamId, aid, dt, data)
    setToast(`${data.name} berhasil diupload ✓`)
  }

  const TH_COLS = [
    ['jamMulai','Mulai'], ['jamSelesai','Selesai'], ['pic','PIC'], ['priority','Prior.'],
    ['kegiatan','Kegiatan'], ['kategoriKerja','Kategori'], ['status','Status'], ['progress','Progress'],
  ]

  // ── Empty state ─────────────────────────────────────────────────
  if (activities.length === 0) return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Btn onClick={openAdd}><Plus size={16} />Tambah Aktivitas</Btn>
      </div>
      <div className="flex flex-col items-center py-20 text-center">
        <div className="empty-box mb-4"><Activity size={36} className="text-slate-700" /></div>
        <p className="text-slate-400 font-semibold text-lg">Belum ada aktivitas</p>
        <p className="text-slate-600 text-sm mt-1.5">Tambahkan aktivitas pertama untuk tim ini.</p>
        <div className="mt-4"><Btn onClick={openAdd}><Plus size={16} />Mulai Tambah</Btn></div>
      </div>
      <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} activity={selAct} onSave={save} mode="add" defaultDate={selDate} />
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari aktivitas, PIC, kategori…"
            className="srch sm:w-72"
          />
        </div>
        <Btn onClick={openAdd}><Plus size={16} />Tambah Aktivitas</Btn>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e2d4a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="tbl-header">
                {TH_COLS.map(([col, lbl]) => (
                  <th key={col} className="px-4 py-3 text-left" style={col === 'kegiatan' ? { minWidth: '200px' } : {}}>
                    <SortBtn col={col} label={lbl} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dok.</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-600">
                    Tidak ada hasil untuk "<span className="text-slate-400">{q}</span>"
                  </td>
                </tr>
              ) : sorted.map(a => (
                <tr key={a.id} className="tbl-row group">
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{a.jamMulai}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{a.jamSelesai}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black flex-shrink-0"
                        style={{ backgroundColor: picHue(a.pic), fontSize: '9px' }}
                      >
                        {picInit(a.pic)}
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-24">{a.pic.split('@')[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', PRIORITY_CLS[a.priority])}>
                      {a.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-200 text-xs block max-w-56 line-clamp-2">{a.kegiatan}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{a.kategoriKerja}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', STATUS_CLS[a.status])}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3"><ProgBar v={a.progress} /></td>
                  {/* Documents */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(a.documents || {}).map(([dt, doc]) => {
                        const m  = DOC_META[dt];  if (!m) return null
                        const DI = DOC_ICONS[dt]
                        return doc.uploaded
                          ? (
                            <Tip key={dt} label={`Preview: ${doc.name}`}>
                              <button
                                onClick={() => handlePreview(dt, doc.name)}
                                className="btn-ghost p-1.5 rounded-lg"
                              >
                                <DI size={16} className={m.color} />
                              </button>
                            </Tip>
                          ) : (
                            <Tip key={dt} label={`Upload ${dt.toUpperCase()}`}>
                              <DocBtn
                                docType={dt}
                                docData={doc}
                                onUpload={(_, data) => handleUpload(a.id, dt, data)}
                                onPreview={handlePreview}
                              />
                            </Tip>
                          )
                      })}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tip label="Edit">
                        <Btn variant="ghost" size="icon-sm" onClick={() => openEdit(a)}><Pencil size={14} /></Btn>
                      </Tip>
                      <Tip label="Hapus">
                        <Btn variant="ghost" size="icon-sm" onClick={() => openDel(a)}><Trash2 size={14} /></Btn>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>{sorted.length} dari {activities.length} aktivitas</span>
        <div className="flex gap-3">
          <span>Selesai: <span className="text-emerald-400 font-semibold">{activities.filter(a => a.status === 'Done').length}</span></span>
          <span>On Prog: <span className="text-blue-400 font-semibold">{activities.filter(a => a.status === 'On Progress').length}</span></span>
        </div>
      </div>

      {/* Modals & overlays */}
      <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} activity={selAct} onSave={save} mode={mode} defaultDate={selDate} />
      <DelDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={() => selAct && deleteAct(teamId, selAct.id)}
        title="Hapus Aktivitas"
        desc={selAct ? `Yakin hapus "${selAct.kegiatan}"?` : ''}
      />
      {preview && (
        <DocPreviewModal
          open={!!preview}
          onClose={() => setPreview(null)}
          docType={preview.docType}
          fileName={preview.fileName}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
