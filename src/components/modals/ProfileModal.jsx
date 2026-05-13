import { Check } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { ProgBarFull } from '../ui/ProgBar.jsx'
import { useDash } from '../../contexts/DashboardContext.jsx'
import { picHue, picInit } from '../../constants/colors.js'
import { cn } from '../../constants/helpers.js'

export default function ProfileModal({ open, onClose }) {
  const { teams, allPICs } = useDash()

  const totalActs = teams.reduce((s, t) => s + t.activities.length, 0)
  const totalDone = teams.reduce((s, t) => s + t.activities.filter(a => a.status === 'Done').length, 0)
  const totalP0   = teams.reduce((s, t) => s + t.activities.filter(a => a.priority === 'P0').length, 0)
  const teamsAct  = teams.filter(t => t.activities.length > 0).length
  const pct       = totalActs > 0 ? Math.round(totalDone / totalActs * 100) : 0

  const stats = [
    ['Total Aktivitas', totalActs, 'text-slate-100'],
    ['Selesai',         totalDone, 'text-emerald-400'],
    ['Prioritas P0',    totalP0,   'text-red-400'],
    ['Tim Aktif',       teamsAct,  'text-blue-400'],
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Profile"
      description="Informasi akun dan statistik aktivitas."
      size="md"
      footer={<Btn onClick={onClose}><Check size={14} />Tutup</Btn>}
    >
      <div className="flex flex-col gap-5">
        {/* Identity */}
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(37,99,235,.08)', border: '1px solid rgba(59,130,246,.2)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">SA</div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-100 font-black text-base">Superadmin</p>
            <p className="text-slate-400 text-sm mt-0.5">superadmin@company.com</p>
            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Administrator
            </span>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Statistik Keseluruhan</p>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(([lbl, val, vc]) => (
              <div key={lbl} className="card p-3">
                <p className={cn('text-2xl font-black tabular-nums', vc)}>{val}</p>
                <p className="text-xs text-slate-600 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Completion */}
        <div className="card p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300 font-semibold">Completion Rate Global</span>
            <span className="text-blue-400 font-black">{pct}%</span>
          </div>
          <ProgBarFull v={pct} />
        </div>

        {/* PIC list */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
            PIC Terdaftar ({allPICs.length})
          </p>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {allPICs.map(p => (
              <div key={p} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,.03)' }}>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ backgroundColor: picHue(p), fontSize: '9px' }}
                >
                  {picInit(p)}
                </div>
                <span className="text-slate-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
