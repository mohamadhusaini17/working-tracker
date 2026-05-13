import { X } from 'lucide-react'
import { cn } from '../../constants/helpers.js'

const W = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('modal-bg relative w-full flex flex-col', W[size])} style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-navy-400">
          <div>
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost ml-4 p-1.5 rounded-lg flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-navy-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
