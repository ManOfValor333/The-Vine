import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}