import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300',
        'hover:-translate-y-1 active:translate-y-0 transform-gpu',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        // variant styles
        {
          'bg-gradient-to-r from-gold-400 to-gold-600 text-purple-900 hover:from-gold-300 hover:to-gold-500 focus:ring-gold-400': variant === 'primary',
          'bg-white/5 backdrop-blur-xl text-white border border-white/10 hover:bg-white/10 hover:border-white/20 focus:ring-white/20': variant === 'secondary',
          'bg-transparent text-white/70 hover:text-white hover:bg-white/5 focus:ring-white/10': variant === 'ghost',
        },
        // size styles
        {
          'px-3 py-1.5 text-sm h-8': size === 'sm',
          'px-4 py-2 text-base h-10': size === 'md',
          'px-6 py-3 text-lg h-12': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className={cn(
          'animate-spin',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )} />
      )}
      {children}
    </button>
  )
}