'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { PrayerRequest } from '@/lib/types'
import { togglePrayerSupport, markPrayerAnswered } from '@/app/actions/prayer'
import { cn } from '@/lib/utils'

interface PrayerCardProps {
  prayer: PrayerRequest & {
    author: {
      id: string
      username: string
      display_name: string
      avatar_url: string | null
      role: string
    }
  }
  currentUserId?: string
}

export function PrayerCard({ prayer, currentUserId }: PrayerCardProps) {
  const [isPraying, setIsPraying] = useState(prayer.is_praying || false)
  const [prayingCount, setPrayingCount] = useState(prayer.praying_count || 0)
  const [isAnswered, setIsAnswered] = useState(prayer.is_answered)
  const [isPendingPrayer, startPrayerTransition] = useTransition()
  const [isPendingAnswer, startAnswerTransition] = useTransition()

  const handlePrayerToggle = () => {
    if (!currentUserId) return

    startPrayerTransition(async () => {
      try {
        const wasPreying = isPraying
        setIsPraying(!isPraying)
        setPrayingCount(prev => wasPreying ? prev - 1 : prev + 1)

        await togglePrayerSupport(prayer.id)
      } catch (error) {
        // Revert optimistic update
        setIsPraying(isPraying)
        setPrayingCount(prayingCount)
        console.error('Failed to toggle prayer support:', error)
      }
    })
  }

  const handleMarkAnswered = () => {
    if (!currentUserId || prayer.author_id !== currentUserId) return

    startAnswerTransition(async () => {
      try {
        setIsAnswered(true)
        await markPrayerAnswered(prayer.id)
      } catch (error) {
        setIsAnswered(false)
        console.error('Failed to mark prayer as answered:', error)
      }
    })
  }

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      pastor: 'bg-gradient-to-r from-gold-500 to-gold-600 text-purple-900',
      leader: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      admin: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
    }

    if (role === 'member') return null

    return (
      <span className={cn(
        'px-2 py-0.5 text-xs font-medium rounded-full',
        roleStyles[role as keyof typeof roleStyles] || 'bg-white/10 text-white'
      )}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <Card className={cn(
      'p-6 transition-all duration-300',
      isAnswered && 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20'
    )}>
      {isAnswered && (
        <div className="flex items-center gap-2 mb-4 text-green-400">
          <span className="text-sm">✅</span>
          <span className="text-sm font-medium">Prayer Answered!</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <Avatar 
          src={prayer.author.avatar_url} 
          alt={prayer.author.display_name}
          fallback={prayer.author.display_name.charAt(0)}
        />
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {prayer.author.display_name}
              </span>
              {getRoleBadge(prayer.author.role)}
              <span className="text-white/50">@{prayer.author.username}</span>
            </div>
            <span className="text-sm text-white/50">
              {formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
            {prayer.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={isPraying ? 'primary' : 'ghost'}
                size="sm"
                onClick={handlePrayerToggle}
                disabled={!currentUserId || isPendingPrayer}
                className="flex items-center gap-2"
              >
                <span className="text-lg">🙏</span>
                {isPraying ? 'Praying' : 'Pray'}
                {prayingCount > 0 && (
                  <span className="text-xs">({prayingCount})</span>
                )}
              </Button>

              {currentUserId === prayer.author_id && !isAnswered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAnswered}
                  disabled={isPendingAnswer}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300"
                >
                  <span className="text-lg">✅</span>
                  Mark as Answered
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}