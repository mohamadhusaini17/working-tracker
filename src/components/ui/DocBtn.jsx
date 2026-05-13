import { useRef, useState } from 'react'
import { Upload, CheckCircle2 } from 'lucide-react'
import { cn } from '../../constants/helpers.js'
import Tip from './Tip.jsx'

export default function DocBtn({ docType, docData, onUpload, onPreview }) {
  const [prog, setProg] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const timer   = useRef(null)

  const uploaded = docData?.uploaded
  const fileName = docData?.name

  const handleFile = (e) => {
    if (!e.target.files?.length) return
    const fname = e.target.files[0].name
    setUploading(true)
    setProg(0)
    let p = 0
    timer.current = setInterval(() => {
      p += Math.random() * 25 + 15
      if (p >= 100) {
        clearInterval(timer.current)
        setProg(100)
        setUploading(false)
        onUpload(docType, { name: fname, uploaded: true })
      } else {
        setProg(Math.min(p, 92))
      }
    }, 180)
  }

  const handleClick = () => {
    if (uploaded) { onPreview(docType, fileName); return }
    fileRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        accept={docType === 'pdf' ? '.pdf' : docType === 'excel' ? '.xlsx,.xls' : docType === 'doc' ? '.doc,.docx' : '.csv'}
      />
      <Tip label={uploaded ? `Preview: ${fileName}` : `Upload ${docType.toUpperCase()}`}>
        <button
          onClick={handleClick}
          className={cn('doc-btn', uploaded && 'uploaded', uploading && !uploaded && 'uploading')}
        >
          {uploading && (
            <div className="doc-prog" style={{ width: `${prog}%` }} />
          )}
          <span className="relative flex items-center gap-1.5">
            {uploaded ? <CheckCircle2 size={14} /> : <Upload size={14} />}
            {docType.toUpperCase()}
          </span>
        </button>
      </Tip>
    </div>
  )
}
