import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { Inp, Lbl } from '../ui/Inp.jsx'
import IconPicker from '../ui/IconPicker.jsx'
import DelDialog from './DelDialog.jsx'

/* ── Add Folder ─────────────────────────────────────────────────── */
export function AddFolderModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')

  // Reset on open
  useEffect(() => {
    if (open) { setName(''); setIcon('FolderPlus') }
  }, [open])

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim(), icon)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Team Folder"
      description="Buat folder tim baru."
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
          <Inp value={name} onChange={e => setName(e.target.value)} placeholder="Nama folder…" />
        </div>
        <div>
          <Lbl>Icon</Lbl>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
      </div>
    </Modal>
  )
}

/* ── Edit Folder ─────────────────────────────────────────────────── */
export function EditFolderModal({ open, onClose, team, onEdit }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FolderPlus')

  // Sync form when team changes or modal opens
  useEffect(() => {
    if (open && team) {
      setName(team.name)
      setIcon(team.iconName)
    }
  }, [open, team])

  const handleEdit = () => {
    if (!name.trim() || !team) return
    onEdit(team.id, name.trim(), icon)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Team Folder"
      description="Ubah nama & ikon folder."
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
          <Inp value={name} onChange={e => setName(e.target.value)} placeholder="Nama folder…" />
        </div>
        <div>
          <Lbl>Icon</Lbl>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
      </div>
    </Modal>
  )
}

/* ── Delete Folder ───────────────────────────────────────────────── */
export function DeleteFolderDialog({ open, onClose, team, onDelete }) {
  return (
    <DelDialog
      open={open}
      onClose={onClose}
      onConfirm={() => team && onDelete(team.id)}
      title="Hapus Team Folder"
      desc={team ? `Yakin hapus "${team.name}"? Semua aktivitas akan terhapus.` : ''}
    />
  )
}
