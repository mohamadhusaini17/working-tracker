/**
 * FolderModal.jsx — UPDATED WITH CUSTOM FILE ICON UPLOADER
 */
import { useState, useEffect, useRef } from 'react'
import { Check, Upload, Image as ImageIcon } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { Inp, Lbl } from '../ui/Inp.jsx'
import IconPicker from '../ui/IconPicker.jsx'
import DelDialog from './DelDialog.jsx'

// Mengizinkan string Base64 lolos dari sterilisasi penamaan komponen Lucide
function ensureString(iconVal) {
  if (!iconVal) return 'FolderPlus'
  if (typeof iconVal === 'string') return iconVal // Jika base64 atau teks nama icon, biarkan lewat
  if (typeof iconVal === 'function' && iconVal.name) return iconVal.name
  if (typeof iconVal === 'object') {
    return iconVal.name || iconVal.displayName || []?.iconName || 'FolderPlus'
  }
  return 'FolderPlus'
}

// ─── Add Folder ───
export function AddFolderModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open) { 
      setName('')
      setIcon('FolderPlus') 
    }
  }, [open])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal batas file adalah 500KB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setIcon(reader.result) // Menyimpan string murni base64 data URL
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    
    const safeIconString = ensureString(icon)
    onAdd(trimmed, safeIconString)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const safePickerValue = typeof icon === 'string' && !icon.startsWith('data:image/') ? icon : 'FolderPlus'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Team Folder"
      description="Buat folder tim baru untuk mengorganisir aktivitas."
      size="sm"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn onClick={handleAdd} disabled={!name.trim()}>
            <Check size={14} />Tambah
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Lbl>Nama Folder</Lbl>
          <Inp
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Fraud Analyst, Internal Audit…"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Lbl>Icon Preset / Custom Upload</Lbl>
          
          {/* Komponen Preset Pilihan Utama */}
          <IconPicker 
            value={safePickerValue} 
            onChange={(val) => setIcon(ensureString(val))} 
          />

          {/* Fitur Tambahan Browser File Uploader */}
          <div className="pt-1 flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/svg+xml, image/png, image/jpeg" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload size={12} className="text-slate-400" />
              <span>Upload Gambar/SVG</span>
            </button>

            {icon.startsWith('data:image/') && (
              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-[11px] text-blue-400">
                <ImageIcon size={12} />
                <span className="max-w-[100px] truncate">Kustom File Aktif</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit Folder ───
export function EditFolderModal({ open, onClose, team, onEdit }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open && team) {
      setName(team.name || '')
      setIcon(ensureString(team.icon || team.iconName || 'FolderPlus'))
    }
  }, [open, team])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal batas file adalah 500KB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setIcon(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleEdit = () => {
    const trimmed = name.trim()
    if (!trimmed || !team) return

    const safeIconString = ensureString(icon)
    onEdit(team.id, trimmed, safeIconString)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEdit()
  }

  const safePickerValue = typeof icon === 'string' && !icon.startsWith('data:image/') ? icon : 'FolderPlus'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Team Folder"
      description="Ubah nama dan ikon folder tim."
      size="sm"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn onClick={handleEdit} disabled={!name.trim()}>
            <Check size={14} />Simpan
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Lbl>Nama Folder</Lbl>
          <Inp
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama folder…"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Lbl>Icon Preset / Custom Upload</Lbl>
          <IconPicker 
            value={safePickerValue} 
            onChange={(val) => setIcon(ensureString(val))} 
          />

          <div className="pt-1 flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/svg+xml, image/png, image/jpeg" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload size={12} className="text-slate-400" />
              <span>Ganti Gambar/SVG</span>
            </button>

            {icon.startsWith('data:image/') && (
              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-[11px] text-blue-400">
                <ImageIcon size={12} />
                <span className="max-w-[100px] truncate">Kustom File Aktif</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Delete Folder ───
export function DeleteFolderDialog({ open, onClose, team, onDelete }) {
  return (
    <DelDialog
      open={open}
      onClose={onClose}
      onConfirm={() => team && onDelete(team.id)}
      title="Hapus Team Folder"
      desc={
        team
          ? `Apakah Anda yakin ingin menghapus folder "${team.name}"? Folder ini kosong dan tindakan ini tidak dapat dibatalkan.`
          : 'Yakin ingin menghapus folder ini?'
      }
    />
  )
}