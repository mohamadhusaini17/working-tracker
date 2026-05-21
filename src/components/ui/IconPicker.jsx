import React from 'react'
import * as LucideIcons from 'lucide-react'

// 1. INI INTINYA: Perbaikan fungsi getIcon agar merender komponen JSX, bukan Objek Mentah!
function getIcon(iconName) {
  if (!iconName) return <LucideIcons.Folder size={16} />

  // Jika yang dikirim ternyata string nama ikonnya
  if (typeof iconName === 'string') {
    const IconComponent = LucideIcons[iconName]
    if (IconComponent) {
      return <IconComponent size={16} />
    }
  }

  // Jika yang dikirim tidak sengaja berupa objek komponen utuh
  if (typeof iconName === 'function' || (typeof iconName === 'object' && iconName.$$typeof)) {
    try {
      const Component = iconName
      return <Component size={16} />
    } catch {
      return <LucideIcons.Folder size={16} />
    }
  }

  // Fallback jika tidak ditemukan
  return <LucideIcons.Folder size={16} />
}

// Daftar string nama ikon yang ingin Anda sediakan di dalam picker modal
const AVAILABLE_ICONS = ['Folder', 'Users', 'BarChart3', 'ShieldAlert', 'FolderPlus']

export default function IconPicker({ value, onChange }) {
  // Amankan value agar selalu terbaca sebagai string nama ikon murni
  const currentIconName = typeof value === 'string' 
    ? value 
    : (value?.name || value?.displayName || 'FolderPlus')

  return (
    <div className="flex flex-col gap-2">
      {/* Area Preview Ikon yang sedang aktif */}
      <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="text-blue-500 bg-blue-500/10 p-2 rounded-lg">
          {getIcon(currentIconName)}
        </div>
        <span className="text-xs font-medium text-slate-300">{currentIconName}</span>
      </div>

      {/* Daftar pilihan ikon di dalam modal */}
      <div className="grid grid-cols-5 gap-2 mt-1">
        {AVAILABLE_ICONS.map((iconName) => {
          const Icon = LucideIcons[iconName] || LucideIcons.Folder
          const isSelected = currentIconName === iconName

          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)} // Mengirimkan STRING murni ke luar (FolderModal)
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={iconName}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
    </div>
  )
}