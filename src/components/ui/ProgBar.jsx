import { cn } from '../../constants/helpers.js'

export function ProgBar({ v }) {
  const bar = v === 100 ? 'bg-emerald-500' : v >= 50 ? 'bg-blue-500' : v > 0 ? 'bg-amber-500' : 'bg-navy-400'
  const txt = v === 100 ? 'text-emerald-400' : v >= 50 ? 'text-blue-400' : v > 0 ? 'text-amber-400' : 'text-slate-700'
  return (
    <div className="flex items-center gap-2 min-w-24">
      <div className="prog-track">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${v}%` }} />
      </div>
      <span className={cn('text-[11px] font-bold tabular-nums min-w-7 text-right', txt)}>{v}%</span>
    </div>
  )
}

export function ProgBarFull({ v }) {
  const bar = v === 100 ? 'bg-emerald-500' : v >= 50 ? 'bg-blue-500' : v > 0 ? 'bg-amber-500' : 'bg-slate-700'
  return (
    <div className="prog-track" style={{ flex: 'unset' }}>
      <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${v}%` }} />
    </div>
  )
}
