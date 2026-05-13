import { BarChart3, ShieldAlert, ClipboardCheck, PackageSearch, ShieldCheck, FileWarning, FileText, FolderPlus } from 'lucide-react'
import { cn } from '../../constants/helpers.js'

const OPTS = [
  { n: 'BarChart3',     I: BarChart3 },
  { n: 'ShieldAlert',   I: ShieldAlert },
  { n: 'ClipboardCheck',I: ClipboardCheck },
  { n: 'PackageSearch', I: PackageSearch },
  { n: 'ShieldCheck',   I: ShieldCheck },
  { n: 'FileWarning',   I: FileWarning },
  { n: 'FileText',      I: FileText },
  { n: 'FolderPlus',    I: FolderPlus },
]

export const ICON_MAP = Object.fromEntries(OPTS.map(({ n, I }) => [n, I]))
export const getIcon  = (name) => ICON_MAP[name] || FolderPlus

export default function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-1.5">
      {OPTS.map(({ n, I }) => (
        <button key={n} type="button" onClick={() => onChange(n)} className={cn('ic-opt', value === n && 'selected')}>
          <I size={20} />
        </button>
      ))}
    </div>
  )
}
