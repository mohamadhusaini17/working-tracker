import { cn } from '../../constants/helpers.js'

export function Inp({ value, onChange, placeholder, type = 'text', className, rows, list, ...rest }) {
  if (rows) return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={cn('inp-ta', className)} {...rest} />
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} list={list} className={cn('inp', className)} {...rest} />
}

export function Sel({ value, onChange, options, placeholder, className }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={cn('sel', className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  )
}

export function Lbl({ children }) {
  return <div className="mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{children}</div>
}
