/**
 * FolderModal.jsx — FINAL NAMED EXPORTS (ANTI-CRASH)
 */
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { Inp, Lbl } from '../ui/Inp.jsx'
import IconPicker from '../ui/IconPicker.jsx'
import DelDialog from './DelDialog.jsx'

// Helper super aman untuk memaksa objek/fungsi ikon menjadi string nama ikonnya saja
function ensureString(iconVal) {
  if (!iconVal) return 'FolderPlus'
  if (typeof iconVal === 'string') return iconVal
  if (typeof iconVal === 'function' && iconVal.name) return iconVal.name
  if (typeof iconVal === 'object') {
    // Jika objek Lucide React atau objek kustom picker, cari properti stringnya
    return iconVal.name || iconVal.displayName || iconVal.iconName || 'FolderPlus'
  }
  return 'FolderPlus'
}

// ─── Add Folder ───
export function AddFolderModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')

  useEffect(() => {
    if (open) { 
      setName('')
      setIcon('FolderPlus') 
    }
  }, [open])

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    
    // Sterilisasi total menjadi string murni sebelum dilempar ke Context
    const safeIconString = ensureString(icon)
    onAdd(trimmed, safeIconString)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  // Amankan value yang dioper ke IconPicker agar komponen internal <getIcon> tidak crash
  const safePickerValue = typeof icon === 'string' ? icon : ensureString(icon)

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
        <div>
          <Lbl>Icon</Lbl>
          <IconPicker 
            value={safePickerValue} 
            onChange={(val) => setIcon(ensureString(val))} 
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit Folder ───
export function EditFolderModal({ open, onClose, team, onEdit }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')

  useEffect(() => {
    if (open && team) {
      setName(team.name || '')
      setIcon(ensureString(team.icon || team.iconName || 'FolderPlus'))
    }
  }, [open, team])

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

  const safePickerValue = typeof icon === 'string' ? icon : ensureString(icon)

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
        <div>
          <Lbl>Icon</Lbl>
          <IconPicker 
            value={safePickerValue} 
            onChange={(val) => setIcon(ensureString(val))} 
          />
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
          ? `Yakin ingin menghapus "${team.name}"? Semua aktivitas di folder ini akan ikut terhapus.`
          : 'Yakin ingin menghapus folder ini?'
      }
    />
  )
}