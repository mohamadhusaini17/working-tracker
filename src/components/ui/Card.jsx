import { cn } from '../../constants/helpers.js'

export default function Card({ children, className, onClick }) {
  return (
    <div onClick={onClick} className={cn('card', onClick && 'card-hover', className)}>
      {children}
    </div>
  )
}
