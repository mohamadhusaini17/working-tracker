import { ExternalLink, FileText, File, FileSpreadsheet, FileIcon } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { cn } from '../../constants/helpers.js'
import { DOC_META, FAKE_PREVIEW } from '../../constants/colors.js'

const DOC_ICONS = { doc: FileText, pdf: File, excel: FileSpreadsheet, csv: FileIcon }

export default function DocPreviewModal({ open, onClose, docType, fileName }) {
  const m  = DOC_META[docType] || DOC_META.doc
  const DI = DOC_ICONS[docType] || FileText

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preview Dokumen"
      description={fileName}
      size="md"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Tutup</Btn>
          <Btn onClick={onClose}><ExternalLink size={14} />Buka di Aplikasi</Btn>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* File header */}
        <div className={cn('flex items-center gap-4 p-4 rounded-xl', m.bg)}>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', m.bg)}>
            <DI size={24} className={m.color} />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-100">{fileName}</p>
            <p className={cn('text-xs mt-0.5', m.color)}>{m.label}</p>
          </div>
        </div>

        {/* Fake content */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: '#0a0e1a', border: '1px solid #1e2d4a' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Konten Preview</p>
          {(FAKE_PREVIEW[docType] || FAKE_PREVIEW.doc).map((line, i) => (
            <p key={i} className="text-xs font-mono text-slate-500">{line}</p>
          ))}
        </div>

        <p className="text-xs text-center text-slate-600">
          Pratinjau simulasi — file asli tersimpan di server.
        </p>
      </div>
    </Modal>
  )
}
