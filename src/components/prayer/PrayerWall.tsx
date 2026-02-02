'use client'

import { useState } from 'react'
import { PrayerCard } from './PrayerCard'
import { Button } from '@/components/ui/Button'
import { PrayerRequest } from '@/lib/types'
import { useRouter, useSearchParams } from 'next/navigation'

interface PrayerWallProps {
  prayers: (PrayerRequest & {
    author: {
      id: string
      username: string
      display_name: string
      avatar_url: string | null
      role: string
    }
    prayer_support: { count: number }[]
    prayer_support: { user_id: string }[]
  })[]
  currentUserId?: string
}

export function PrayerWall({ prayers, currentUserId }: PrayerWallProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter') || 'all'

  const filterOptions = [
    { value: 'all', label: 'All Prayers', count: prayers.length },
    { value: 'my-prayers', label: 'My Prayers', count: prayers.filter(p => p.author_id === currentUserId).length },
    { value: 'answered', label: 'Answered', count: prayers.filter(p => p.is_answered).length }
  ]

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams)
    if (filter === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', filter)
    }
    router.push(`/prayer-wall?${params.toString()}`)
  }

  // Process prayers data to match PrayerRequest type
  const processedPrayers: (PrayerRequest & {
    author: {
      id: string
      username: string
      display_name: string
      avatar_url: string | null
      role: string
    }
  })[] = prayers.map(prayer => ({
    ...prayer,
    praying_count: prayer.prayer_support[0]?.count || 0,
    is_praying: prayer.prayer_support.some(ps => ps.user_id === currentUserId)
  }))

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentFilter === option.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleFilterChange(option.value)}
            className="flex items-center gap-2"
          >
            {option.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentFilter === option.value 
                ? 'bg-purple-900/20 text-purple-900' 
                : 'bg-white/10 text-white/60'
            }`}>
              {option.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Prayer List */}
      <div className="space-y-4">
        {processedPrayers.length === 0 ? (
          <div className="text-center py-12 text-white/70">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-xl font-semibold mb-2">No prayers found</h3>
            <p>
              {currentFilter === 'my-prayers' 
                ? "You haven't shared any prayer requests yet."
                : currentFilter === 'answered'
                ? "No answered prayers to show."
                : "Be the first to share a prayer request."
              }
            </p>
          </div>
        ) : (
          processedPrayers.map((prayer) => (
            <PrayerCard 
              key={prayer.id} 
              prayer={prayer} 
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}