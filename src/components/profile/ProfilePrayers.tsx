'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PrayerRequest } from '@/lib/types'
import { PrayerCard } from '@/components/prayer/PrayerCard'

interface ProfilePrayersProps {
  profileId: string
  isOwnProfile: boolean
}

export function ProfilePrayers({ profileId, isOwnProfile }: ProfilePrayersProps) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    async function fetchPrayers() {
      try {
        const { data, error } = await supabase
          .from('prayer_requests')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('author_id', profileId)
          .order('created_at', { ascending: false })
          
        if (error) throw error
        setPrayers(data || [])
      } catch (error) {
        console.error('Error fetching prayers:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrayers()
  }, [profileId, supabase])
  
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }
  
  if (prayers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🙏</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isOwnProfile ? "You haven't shared any prayer requests yet" : "No prayer requests yet"}
        </h3>
        <p className="text-white/60">
          {isOwnProfile 
            ? "Share your prayer requests to receive support from your church family!"
            : "This member hasn't shared any prayer requests yet."
          }
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {prayers.map((prayer) => (
        <PrayerCard key={prayer.id} prayer={prayer} />
      ))}
    </div>
  )
}