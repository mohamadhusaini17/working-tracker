import { useState, useRef, useEffect } from 'react'
import { cn } from '../../constants/helpers.js'

export default function Drop({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>{trigger}</div>
      {open && (
        <div
          className={cn('popup-bg absolute z-50 mt-1.5 min-w-44 py-1.5', align === 'right' ? 'right-0' : 'left-0')}
          style={{ zIndex: 9999 }}
        >
          {items.map((item, i) =>
            item === 'sep'
              ? <div key={i} style={{ background: '#1e2d4a', height: '1px', margin: '.375rem .5rem' }} />
              : <button
                  key={i}
                  onClick={e => { e.stopPropagation(); item.onClick?.(); setOpen(false) }}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left', item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-navy-500')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {item.icon && <span className="opacity-60 flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
          )}
        </div>
      )}
    </div>
  )
}
