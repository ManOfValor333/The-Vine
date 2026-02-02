'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, icon, rows = 4, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-white/50">
              {icon}
            </div>
          )}
          <textarea
            ref={ref}
            rows={rows}
            className={cn(
              'w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all duration-300',
              'hover:border-white/20 resize-none',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'