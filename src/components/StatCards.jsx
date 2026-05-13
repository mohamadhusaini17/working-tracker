import { Activity, CheckCircle2, Clock, AlertCircle, GripVertical } from 'lucide-react'
import Card from './ui/Card.jsx'
import { cn } from '../constants/helpers.js'

function StatCard({ icon: Icon, label, value, sub, valueClass, iconClass, editMode }) {
  return (
    <Card className={cn('p-5 relative', editMode && 'ring-2 ring-blue-500/30 ring-dashed')}>
      {editMode && (
        <div className="absolute -top-2 -left-2 bg-blue-600 rounded-full p-1">
          <GripVertical size={12} className="text-white" />
        </div>
      )}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', iconClass)}>
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</p>
      <p className={cn('text-3xl font-black mt-1 tabular-nums', valueClass)}>{value}</p>
      <p className="text-xs text-slate-700 mt-0.5">{sub}</p>
    </Card>
  )
}

export default function StatCards({ stats, selPIC, selDate, editMode }) {
  const pct = stats.total > 0 ? Math.round(stats.done / stats.total * 100) : 0

  const cards = [
    {
      icon:       Activity,
      label:      'Total',
      value:      stats.total,
      sub:        selPIC ? 'aktivitas PIC' : selDate ? 'hari ini' : 'semua waktu',
      valueClass: 'text-slate-100',
      iconClass:  'ic-slate',
    },
    {
      icon:       CheckCircle2,
      label:      'Selesai',
      value:      stats.done,
      sub:        `${pct}% rate`,
      valueClass: 'text-emerald-400',
      iconClass:  'ic-em',
    },
    {
      icon:       Clock,
      label:      'Dalam Proses',
      value:      stats.inProg,
      sub:        'Tugas aktif',
      valueClass: 'text-blue-400',
      iconClass:  'ic-bl',
    },
    {
      icon:       AlertCircle,
      label:      'Prioritas P0',
      value:      stats.p0,
      sub:        'Kritis',
      valueClass: stats.p0 > 0 ? 'text-red-400' : 'text-slate-700',
      iconClass:  stats.p0 > 0 ? 'ic-rd' : 'ic-dim',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => (
        <StatCard key={c.label} {...c} editMode={editMode} />
      ))}
    </div>
  )
}
