import { useState, useEffect, useRef } from 'react'
import { Check, AlertCircle, Trash2, Folder, Upload, Image as ImageIcon } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Btn from '../ui/Btn.jsx'
import { cn } from '../../constants/helpers.js'
import { useDash } from '../../contexts/DashboardContext.jsx'
import { Inp, Lbl } from '../ui/Inp.jsx'
import IconPicker from '../ui/IconPicker.jsx'

function Toggle({ val, set }) {
  return (
    <button
      onClick={() => set(v => !v)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: val ? 'rgb(37,99,235)' : '#2a3a5c', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: val ? 'translateX(1.375rem)' : 'translateX(.25rem)' }}
      />
    </button>
  )
}

function Row({ label, desc, val, set }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-400">
      <div>
        <p className="text-sm text-slate-200 font-medium">{label}</p>
        {desc && <p className="text-xs text-slate-600 mt-0.5">{desc}</p>}
      </div>
      <Toggle val={val} set={set} />
    </div>
  )
}

// Helper sterilisasi nama icon agar aman dari object Lucide
function ensureString(iconVal) {
  if (!iconVal) return 'FolderPlus'
  if (typeof iconVal === 'string') return iconVal
  if (typeof iconVal === 'function' && iconVal.name) return iconVal.name
  if (typeof iconVal === 'object') {
    return iconVal.name || iconVal.displayName || 'FolderPlus'
  }
  return 'FolderPlus'
}

export default function SettingsModal({ open, onClose }) {
  const { 
    teams, 
    editTeam, 
    getPICs, 
    deleteAct,
    // Menggunakan state preferensi global dari DashboardContext
    prefNotif, setPrefNotif,
    prefCompact, setPrefCompact,
    prefHighlightP0, setPrefHighlightP0,
    prefDefView, setPrefDefView
  } = useDash()
  
  // State Baru untuk Kelola Folder Tim & Personel
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamIcon, setTeamIcon] = useState('FolderPlus')
  const fileInputRef = useRef(null)

  // Otomatis sinkronisasi form ketika admin memilih tim yang berbeda di dropdown
  useEffect(() => {
    if (open) {
      if (teams && teams.length > 0) {
        const firstTeam = teams[0]
        setSelectedTeamId(firstTeam.id)
        setTeamName(firstTeam.name || '')
        setTeamIcon(ensureString(firstTeam.icon || 'FolderPlus'))
      }
    }
  }, [open, teams])

  const handleTeamChange = (teamId) => {
    setSelectedTeamId(teamId)
    const target = teams.find(t => t.id === Number(teamId) || t.id === teamId)
    if (target) {
      setTeamName(target.name || '')
      setTeamIcon(ensureString(target.icon || 'FolderPlus'))
    }
  }

  // Handle upload kustom gambar via settings
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal batas file adalah 500KB.")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setTeamIcon(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Menyimpan perubahan nama & icon tim ke Supabase & Context global
  const handleSaveChanges = async () => {
    if (!selectedTeamId || !teamName.trim()) {
      onClose()
      return
    }
    await editTeam(selectedTeamId, teamName.trim(), teamIcon)
    onClose()
  }

  // Dapatkan daftar personil unik khusus untuk tim yang sedang dipilih
  const currentTeamPersonnel = selectedTeamId ? getPICs(selectedTeamId, null) : []
  const totalPICs = [...new Set(teams.flatMap(t => t.activities.map(a => a.pic)))].length

  const infoRows = [
    ['Nama Aplikasi',    'Working Tracker IA & RM'],
    ['Versi',            'v3.0.0'],
    ['Total Team Folder',`${teams.length} folder`],
    ['Total PIC',        `${totalPICs} orang`],
    ['Total Aktivitas',  `${teams.reduce((s, t) => s + t.activities.length, 0)} kegiatan`],
  ]

  const safePickerValue = typeof teamIcon === 'string' && !teamIcon.startsWith('data:image/') ? teamIcon : 'FolderPlus'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      description="Konfigurasi tampilan dan manajemen folder tim secara terpusat."
      size="md"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>Batal</Btn>
          <Btn onClick={handleSaveChanges}><Check size={14} />Simpan Perubahan</Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        
        {/* ─── MANAJEMEN UTAMA TEAM FOLDER & PERSONEL ─── */}
        <div className="card p-4 border border-blue-500/10 bg-slate-900/30 rounded-xl space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Manajemen Utama Team Folder</p>
            <Lbl>Pilih Folder Tim yang Ingin Dikelola</Lbl>
            <select
              value={selectedTeamId}
              onChange={e => handleTeamChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-sm rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {selectedTeamId && (
            <>
              <div className="grid grid-cols-1 gap-3 pt-1">
                <div>
                  <Lbl>Ubah Nama Folder Tim</Lbl>
                  <Inp
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="Nama folder baru..."
                  />
                </div>

                <div className="space-y-2">
                  <Lbl>Icon Preset / Custom Upload</Lbl>
                  <IconPicker 
                    value={safePickerValue} 
                    onChange={(val) => setTeamIcon(ensureString(val))} 
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

                    {teamIcon.startsWith('data:image/') && (
                      <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-[11px] text-blue-400">
                        <ImageIcon size={12} />
                        <span className="max-w-[120px] truncate">Kustom File Aktif</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── MANAJEMEN PERSONEL (Daftar PIC Terkait) ─── */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Manajemen Personel Tim</p>
                {currentTeamPersonnel.length === 0 ? (
                  <p className="text-xs text-slate-600 italic py-1">Belum ada personel yang ditugaskan ke tim ini.</p>
                ) : (
                  <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                    {currentTeamPersonnel.map(person => (
                      <div key={person.pic} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-900 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {person.pic.substring(0,2).toUpperCase()}
                          </div>
                          <span className="font-medium truncate max-w-[200px]">{person.pic}</span>
                          <span className="text-[10px] text-slate-600">({person.tasks} Tugas)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus seluruh penugasan aktivitas untuk PIC "${person.pic}" di tim ini?`)) {
                              person.acts.forEach(act => deleteAct(selectedTeamId, act.id));
                            }
                          }}
                          className="p-1 hover:bg-red-500/10 rounded text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Penugasan Personel"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Info Dashboard</p>
          <div className="flex flex-col gap-2.5">
            {infoRows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-200 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferensi Terhubung ke Context Global */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Preferensi</p>
          <Row 
            label="Notifikasi Aktivitas" 
            desc="Alert untuk prioritas P0 & aktivitas mendekati Due Date" 
            val={prefNotif} 
            set={setPrefNotif} 
          />
          <Row 
            label="Mode Compact" 
            desc="Kurangi padding & ukuran elemen" 
            val={prefCompact} 
            set={setPrefCompact} 
          />
          <Row 
            label="Highlight Prioritas P0" 
            desc="Tandai baris P0 dengan aksen merah" 
            val={prefHighlightP0} 
            set={setPrefHighlightP0} 
          />
        </div>

        {/* Tampilan Default Terhubung ke Context Global */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Tampilan Default</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['all', 'Semua'], 
              ['date', 'Per Tanggal'], 
              ['pic', 'Per PIC']
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setPrefDefView(v)}
                className={cn(
                  'py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                  prefDefView === v ? 'bg-blue-600 border-blue-500 text-white' : 'btn-outline'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Zona Berbahaya</p>
          <p className="text-xs text-slate-600 mb-3">Tindakan ini tidak dapat dibatalkan.</p>
          <Btn variant="danger" size="sm" onClick={onClose}>
            <AlertCircle size={14} />Reset Semua Data
          </Btn>
        </div>
      </div>
    </Modal>
  )
}