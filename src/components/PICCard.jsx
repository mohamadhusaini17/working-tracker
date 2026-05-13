import { ChevronRight } from 'lucide-react'
import Card from './ui/Card.jsx'
import { ProgBarFull } from './ui/ProgBar.jsx'
import { picHue, picInit } from '../constants/colors.js'

export default function PICCard({ picData, onClick }) {
  const done  = picData.acts.filter(a => a.status === 'Done').length
  const inPg  = picData.acts.filter(a => a.status === 'On Progress').length
  const p0    = picData.acts.filter(a => a.priority === 'P0').length
  const pct   = picData.acts.length > 0 ? Math.round(done / picData.acts.length * 100) : 0
  const name  = picData.pic.split('@')[0]

  return (
    <Card onClick={onClick} className="p-5 group">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-lg"
          style={{ backgroundColor: picHue(picData.pic) }}
        >
          {picInit(picData.pic)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-100 capitalize group-hover:text-blue-300 transition-colors">{name}</p>
          <p className="text-xs text-slate-600 mt-0.5 truncate">{picData.pic}</p>
        </div>
        <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
      </div>

      {/* Mini stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[['Total', picData.acts.length, 'text-slate-100'], ['Selesai', done, 'text-emerald-400'], ['P0', p0, p0 > 0 ? 'text-red-400' : 'text-slate-700']].map(([lbl, val, vc]) => (
          <div key={lbl} className="pic-stat">
            <p className={`text-lg font-black tabular-nums ${vc}`}>{val}</p>
            <p className="text-[10px] text-slate-600">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1">
          <span>Completion</span>
          <span className="font-bold text-blue-400">{pct}%</span>
        </div>
        <ProgBarFull v={pct} />
      </div>

      {/* Active tasks indicator */}
      {inPg > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse block" />
          <span className="text-[11px] text-blue-400 font-medium">{inPg} tugas berjalan</span>
        </div>
      )}
    </Card>
  )
}
