import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props here
}

export function Input({ 
  className, 
  type = 'text',
  ...props 
}: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/50',
        'focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}