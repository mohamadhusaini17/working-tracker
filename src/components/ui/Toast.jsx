import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div className="toast-bg fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 max-w-xs">
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
      <span>{msg}</span>
    </div>
  )
}
