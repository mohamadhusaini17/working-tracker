import React from 'react'
import { 
  BarChart3, ShieldAlert, ClipboardCheck, PackageSearch, 
  ShieldCheck, FileWarning, FileText, FolderPlus, Home 
} from 'lucide-react'
import { cn } from '../../constants/helpers.js'

const OPTS = [
  { n: 'Home',           I: Home },
  { n: 'BarChart3',      I: BarChart3 },
  { n: 'ShieldAlert',    I: ShieldAlert },
  { n: 'ClipboardCheck', I: ClipboardCheck },
  { n: 'PackageSearch',  I: PackageSearch },
  { n: 'ShieldCheck',    I: ShieldCheck },
  { n: 'FileWarning',    I: FileWarning },
  { n: 'FileText',       I: FileText },
  { n: 'FolderPlus',     I: FolderPlus },
]

export const ICON_MAP = Object.fromEntries(OPTS.map(({ n, I }) => [n, I]))

/**
 * Mengambil komponen ikon secara aman dan tahan dari bug minifikasi produksi
 */
export const getIcon = (name) => {
  if (!name) return FolderPlus

  // Cari berdasarkan nama asli atau versi huruf kecil (case-insensitive)
  const foundIcon = ICON_MAP[name] || 
                    ICON_MAP[name.charAt(0).toUpperCase() + name.slice(1)] || 
                    ICON_MAP['Home'] // Jika di database tertulis 'home', arahkan ke ikon Home

  // Proteksi utama: Pastikan yang dikembalikan adalah komponen React fungsional yang valid
  if (typeof foundIcon === 'function' || (foundIcon && typeof foundIcon.$$typeof === 'symbol')) {
    return foundIcon
  }

  return FolderPlus
}

export default function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-1.5">
      {OPTS.map(({ n, I }) => (
        <button 
          key={n} 
          type="button" 
          onClick={() => onChange(n)} 
          className={cn('ic-opt', value === n && 'selected')}
        >
          <I size={20} />
        </button>
      ))}
    </div>
  )
}