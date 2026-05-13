import { useState } from 'react'

export default function Tip({ children, label }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && label && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-navy-500 border border-navy-300 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap text-slate-200 shadow-xl">
            {label}
          </div>
          <div className="mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent" style={{ borderTopColor: '#1a2540' }} />
        </div>
      )}
    </div>
  )
}
