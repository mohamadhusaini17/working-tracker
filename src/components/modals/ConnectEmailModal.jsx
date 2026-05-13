import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { Inp, Lbl } from '../ui/Inp.jsx'

export default function ConnectEmailModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [step,  setStep]  = useState('input')

  const close = () => { setEmail(''); setStep('input'); onClose() }
  const valid = email.includes('@') && email.includes('.')

  return (
    <Modal
      open={open}
      onClose={close}
      title="Connect by Email"
      description="Hubungkan akun untuk notifikasi & akses tim."
      size="sm"
      footer={
        step === 'input'
          ? <>
              <Btn variant="outline" onClick={close}>Batal</Btn>
              <Btn onClick={() => { if (valid) setStep('sent') }} disabled={!valid}>
                <Mail size={14} />Kirim Link
              </Btn>
            </>
          : <Btn onClick={close}><Check size={14} />Selesai</Btn>
      }
    >
      {step === 'input' ? (
        <div className="flex flex-col gap-4">
          <div>
            <Lbl>Alamat Email</Lbl>
            <Inp type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@company.com" />
          </div>
          <p className="text-xs text-slate-600">Link verifikasi dikirim ke inbox Anda.</p>
        </div>
      ) : (
        <div className="text-center py-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Mail size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">Email terkirim!</p>
            <p className="text-sm text-slate-400 mt-1">
              Cek inbox <span className="text-blue-400">{email}</span>
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
