import { cn } from '../../constants/helpers.js'

const VARIANT = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
}
const SIZE = {
  sm:      'h-7 px-3 text-xs gap-1.5 rounded-lg',
  md:      'h-9 px-4 text-sm gap-2 rounded-xl',
  icon:    'h-9 w-9 rounded-xl',
  'icon-sm':'h-7 w-7 rounded-lg',
}

export default function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(VARIANT[variant], SIZE[size], className)}
    >
      {children}
    </button>
  )
}
