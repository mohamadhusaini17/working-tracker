import { useState } from 'react'
import { ChevronDown, Edit3, Check, Menu, User, Settings, Mail, LogOut } from 'lucide-react'
import Btn from './ui/Btn.jsx'
import Drop from './ui/Drop.jsx'
import ProfileModal      from './modals/ProfileModal.jsx'
import SettingsModal     from './modals/SettingsModal.jsx'
import ConnectEmailModal from './modals/ConnectEmailModal.jsx'
import { useIsMobile }   from '../hooks/useIsMobile.js'

export default function Header({ editMode, onEditMode, onMenu }) {
  const isMobile = useIsMobile()

  const [profileOpen,  setProfileOpen]  = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [emailOpen,    setEmailOpen]    = useState(false)

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
          {editMode && (
            <span className="text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full font-black border border-blue-500/25">
              Edit Mode
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <Btn
            variant={editMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onEditMode(!editMode)}
            className="hidden sm:flex gap-1.5"
          >
            {editMode ? <><Check size={14} />Done</> : <><Edit3 size={14} />Edit</>}
          </Btn>

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
              { label: 'Profile',          icon: <User     size={14} />, onClick: () => setProfileOpen(true)  },
              { label: 'Settings',         icon: <Settings size={14} />, onClick: () => setSettingsOpen(true) },
              { label: 'Connect by Email', icon: <Mail     size={14} />, onClick: () => setEmailOpen(true)    },
              'sep',
              { label: 'Logout', icon: <LogOut size={14} />, danger: true },
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
