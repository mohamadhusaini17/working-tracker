import { Trash2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'

export default function DelDialog({ open, onClose, onConfirm, title, desc }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={desc}
      size="sm"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn variant="danger" onClick={() => { onConfirm(); onClose() }}>
            <Trash2 size={14} />Hapus
          </Btn>
        </>
      }
    />
  )
}
