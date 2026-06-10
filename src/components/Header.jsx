import { useState } from 'react'
import { ChevronDown, Menu, User, Settings, Mail, LogOut } from 'lucide-react'
import Drop from './ui/Drop.jsx'
import ProfileModal      from './modals/ProfileModal.jsx'
import SettingsModal     from './modals/SettingsModal.jsx'
import ConnectEmailModal from './modals/ConnectEmailModal.jsx'
import { useIsMobile }   from '../hooks/useIsMobile.js'
// Import Supabase
import { supabase } from '../lib/supabase'

// EditMode dan onEditMode bisa tetap dibiarkan di parameter agar tidak membuat error komponen Parent (App.jsx/Dashboard.jsx)
export default function Header({ editMode, onEditMode, onMenu }) {
  const isMobile = useIsMobile()

  const [profileOpen,  setProfileOpen]  = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [emailOpen,    setEmailOpen]    = useState(false)

  // --- FUNGSI LOGOUT FINAL (LIVE VERSION) ---
  const handleLogout = async () => {
    try {
      // 1. Hapus session di server Supabase
      await supabase.auth.signOut()
      
      // 2. Bersihkan storage browser secara paksa
      localStorage.clear()
      sessionStorage.clear()

      // 3. Paksa pindah halaman ke /login
      window.location.replace('/auth')

    } catch (error) {
      console.error('Error logging out:', error.message)
      window.location.replace('/auth')
    }
  }

  return (
    <>
      <header className="header-bg sticky top-0 z-30 flex h-14 items-center justify-between px-4">

        {/* Left */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onMenu} className="btn-ghost p-2 rounded-xl">
              <Menu size={20} />
            </button>
          )}
          <span className="text-sm font-black text-slate-200 hidden sm:block">
            Working Tracker{' '}
            <span className="font-normal text-slate-600">IA &amp; RM</span>
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Tombol <Btn> Edit sebelumnya di sini sudah DIHAPUS TOTAL 
            agar UI bersih dan fokus perubahan dialihkan ke SettingsModal
          */}

          <Drop
            align="right"
            trigger={
              <button
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl transition-colors bg-transparent border-none cursor-pointer hover:bg-navy-800"
                style={{ '--tw-bg-opacity': 1 }}
              >
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ fontSize: '11px' }}
                >
                  SA
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-slate-200 leading-tight">Superadmin</p>
                  <p className="text-[10px] text-slate-600">Administrator</p>
                </div>
                <ChevronDown size={14} className="text-slate-600 hidden md:block" />
              </button>
            }
            items={[
              { label: 'Profile',         icon: <User      size={14} />, onClick: () => setProfileOpen(true)  },
              { label: 'Settings',        icon: <Settings size={14} />, onClick: () => setSettingsOpen(true) },
              { label: 'Connect by Email', icon: <Mail      size={14} />, onClick: () => setEmailOpen(true)    },
              'sep',
              { 
                label: 'Logout', 
                icon: <LogOut size={14} />, 
                danger: true,
                onClick: handleLogout
              },
            ]}
          />
        </div>
      </header>

      <ProfileModal      open={profileOpen}  onClose={() => setProfileOpen(false)}  />
      <SettingsModal     open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ConnectEmailModal open={emailOpen}    onClose={() => setEmailOpen(false)}    />
    </>
  )
}