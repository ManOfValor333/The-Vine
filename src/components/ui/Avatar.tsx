import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm', 
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-purple-900 font-semibold overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {src ? (
        <img 
          src={src} 
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  )
}