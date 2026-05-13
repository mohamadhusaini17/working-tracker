import { useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { cn } from '../../constants/helpers.js'
import { useDash } from '../../contexts/DashboardContext.jsx'

function Toggle({ val, set }) {
  return (
    <button
      onClick={() => set(v => !v)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: val ? 'rgb(37,99,235)' : '#2a3a5c', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: val ? 'translateX(1.375rem)' : 'translateX(.25rem)' }}
      />
    </button>
  )
}

function Row({ label, desc, val, set }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-400">
      <div>
        <p className="text-sm text-slate-200 font-medium">{label}</p>
        {desc && <p className="text-xs text-slate-600 mt-0.5">{desc}</p>}
      </div>
      <Toggle val={val} set={set} />
    </div>
  )
}

export default function SettingsModal({ open, onClose }) {
  const { teams } = useDash()
  const [notif,   setNotif]   = useState(true)
  const [compact, setCompact] = useState(false)
  const [showP0,  setShowP0]  = useState(true)
  const [defView, setDefView] = useState('all')

  const totalPICs = [...new Set(teams.flatMap(t => t.activities.map(a => a.pic)))].length

  const infoRows = [
    ['Nama Aplikasi',    'Working Tracker IA & RM'],
    ['Versi',            'v3.0.0'],
    ['Total Team Folder',`${teams.length} folder`],
    ['Total PIC',        `${totalPICs} orang`],
    ['Total Aktivitas',  `${teams.reduce((s, t) => s + t.activities.length, 0)} kegiatan`],
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      description="Konfigurasi tampilan dan perilaku dashboard."
      size="md"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn onClick={onClose}><Check size={14} />Simpan</Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Info */}
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Info Dashboard</p>
          <div className="flex flex-col gap-2.5">
            {infoRows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-200 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Preferensi</p>
          <Row label="Notifikasi Aktivitas" desc="Tampilkan alert untuk aktivitas P0 baru" val={notif} set={setNotif} />
          <Row label="Mode Compact" desc="Kurangi padding & ukuran elemen" val={compact} set={setCompact} />
          <Row label="Highlight Prioritas P0" desc="Tandai baris P0 dengan aksen merah" val={showP0} set={setShowP0} />
        </div>

        {/* Default view */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Tampilan Default</p>
          <div className="grid grid-cols-3 gap-2">
            {[['all', 'Semua'], ['date', 'Per Tanggal'], ['pic', 'Per PIC']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setDefView(v)}
                className={cn(
                  'py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                  defView === v ? 'bg-blue-600 border-blue-500 text-white' : 'btn-outline'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Zona Berbahaya</p>
          <p className="text-xs text-slate-600 mb-3">Tindakan ini tidak dapat dibatalkan.</p>
          <Btn variant="danger" size="sm" onClick={onClose}>
            <AlertCircle size={14} />Reset Semua Data
          </Btn>
        </div>
      </div>
    </Modal>
  )
}
