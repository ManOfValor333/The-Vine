'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { createPrayerRequest } from '@/app/actions/prayer'

export function PrayerCreate() {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('content', content.trim())
        
        await createPrayerRequest(formData)
        setContent('')
      } catch (error) {
        console.error('Failed to create prayer request:', error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prayer-content" className="block text-sm font-medium text-white/80 mb-2">
          Share your prayer request
        </label>
        <textarea
          id="prayer-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What would you like us to pray for?"
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 resize-none transition-all duration-300"
          rows={4}
          maxLength={500}
        />
        <div className="text-right text-sm text-white/50 mt-1">
          {content.length}/500
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isPending || content.length > 500}
          className="flex items-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-purple-900/30 border-t-purple-900 rounded-full animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <span className="text-lg">🙏</span>
              Share Prayer Request
            </>
          )}
        </Button>
      </div>
    </form>
  )
}