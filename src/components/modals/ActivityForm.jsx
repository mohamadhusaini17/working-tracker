import { useState, useEffect, useRef } from 'react'
import { Check, Mic, Square } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { Inp, Sel, Lbl } from '../ui/Inp.jsx'
import DocBtn from '../ui/DocBtn.jsx'
import { ProgBarFull } from '../ui/ProgBar.jsx'
import { useDash } from '../../contexts/DashboardContext.jsx'
import { KATEGORI, TRANSCRIPTS } from '../../constants/data.js'

const EMPTY = { date: '', jamMulai: '08:00', jamSelesai: '09:00', pic: '', priority: 'P1', kegiatan: '', kategoriKerja: '', status: 'On Progress', progress: 0, documents: {} }

export default function ActivityForm({ open, onClose, activity, onSave, mode, defaultDate }) {
  const { allPICs } = useDash()
  const today = new Date().toISOString().split('T')[0]
  const [form,   setForm]   = useState(EMPTY)
  const [recOn,  setRecOn]  = useState(false)
  const [recSec, setRecSec] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (open) setForm(mode === 'edit' && activity ? { ...activity, documents: activity.documents || {} } : { ...EMPTY, date: defaultDate || today })
    setRecOn(false); setRecSec(0)
    return () => clearInterval(timer.current)
  }, [open])

  const startRec = () => {
    setRecOn(true); setRecSec(3)
    timer.current = setInterval(() => setRecSec(s => {
      if (s <= 1) {
        clearInterval(timer.current); setRecOn(false)
        setForm(f => ({ ...f, kegiatan: TRANSCRIPTS[Math.floor(Math.random() * TRANSCRIPTS.length)] }))
        return 0
      }
      return s - 1
    }), 1000)
  }
  const stopRec = () => { clearInterval(timer.current); setRecOn(false); setRecSec(0) }

  const f      = (k, v)      => setForm(p => ({ ...p, [k]: v }))
  const docUp  = (dt, data)  => setForm(p => ({ ...p, documents: { ...p.documents, [dt]: data } }))
  const save   = () => { if (!form.kegiatan.trim() || !form.pic.trim()) return; onSave({ ...form, progress: Number(form.progress) }); onClose() }

  return (
    <Modal open={open} onClose={onClose} size="lg"
      title={mode === 'edit' ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}
      description={mode === 'edit' ? 'Ubah detail aktivitas.' : 'Catat aktivitas baru untuk tim.'}
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn onClick={save} disabled={!form.kegiatan.trim() || !form.pic.trim()}>
            <Check size={14} />{mode === 'edit' ? 'Simpan' : 'Tambah'}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-3">
          <div><Lbl>Tanggal</Lbl><Inp type="date" value={form.date} onChange={e => f('date', e.target.value)} /></div>
          <div><Lbl>Jam Mulai</Lbl><Inp type="time" value={form.jamMulai} onChange={e => f('jamMulai', e.target.value)} /></div>
          <div><Lbl>Jam Selesai</Lbl><Inp type="time" value={form.jamSelesai} onChange={e => f('jamSelesai', e.target.value)} /></div>
        </div>

        {/* PIC + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Lbl>PIC</Lbl>
            <Inp value={form.pic} onChange={e => f('pic', e.target.value)} placeholder="Ketik atau pilih email…" list="pic-list" />
            <datalist id="pic-list">{allPICs.map(p => <option key={p} value={p} />)}</datalist>
            {allPICs.length > 0 && <p className="text-xs mt-1 text-slate-600">{allPICs.length} PIC tersedia</p>}
          </div>
          <div>
            <Lbl>Priority</Lbl>
            <Sel value={form.priority} onChange={v => f('priority', v)} options={[{ v: 'P0', l: 'P0 — Kritis' }, { v: 'P1', l: 'P1 — Tinggi' }, { v: 'P2', l: 'P2 — Sedang' }, { v: 'P3', l: 'P3 — Rendah' }]} />
          </div>
        </div>

        {/* Kegiatan + Voice Note */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Lbl>Kegiatan</Lbl>
            <div className="flex items-center gap-2">
              {recOn && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 block" />
                  Recording… {recSec}s
                </span>
              )}
              <Btn variant={recOn ? 'danger' : 'outline'} size="icon-sm" onClick={recOn ? stopRec : startRec}>
                {recOn ? <Square size={12} /> : <Mic size={14} />}
              </Btn>
            </div>
          </div>
          <Inp
            value={form.kegiatan}
            onChange={e => f('kegiatan', e.target.value)}
            rows={3}
            placeholder={recOn ? '🎙 Mendengarkan…' : 'Deskripsi kegiatan, atau tekan 🎙 untuk voice note'}
            className={recOn ? 'inp-rec' : ''}
          />
        </div>

        {/* Kategori + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Lbl>Kategori Kerja</Lbl>
            <Sel value={form.kategoriKerja} onChange={v => f('kategoriKerja', v)} placeholder="— Pilih Kategori —" options={KATEGORI} />
          </div>
          <div>
            <Lbl>Status</Lbl>
            <Sel value={form.status} onChange={v => { f('status', v); if (v === 'Done') f('progress', 100); if (v === 'Not Progress') f('progress', 0) }}
              options={[{ v: 'Done', l: 'Done' }, { v: 'On Progress', l: 'On Progress' }, { v: 'Not Progress', l: 'Not Progress' }]} />
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between mb-1.5">
            <Lbl>Progress</Lbl>
            <span className="text-xs font-black text-blue-400">{form.progress}%</span>
          </div>
          <input type="range" min="0" max="100" step="5" value={form.progress} onChange={e => f('progress', Number(e.target.value))} className="mb-2" />
          <ProgBarFull v={form.progress} />
        </div>

        {/* Documents */}
        <div>
          <Lbl>Upload Dokumen</Lbl>
          <p className="text-xs text-slate-600 mb-2">Klik untuk pilih file. Setelah upload, klik lagi untuk preview.</p>
          <div className="flex gap-2 flex-wrap">
            {['doc', 'pdf', 'excel', 'csv'].map(dt => (
              <DocBtn key={dt} docType={dt} docData={form.documents[dt]} onUpload={docUp} onPreview={() => {}} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
