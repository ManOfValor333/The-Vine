'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Heart, BookOpen, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Event, PrayerRequest } from '@/lib/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface UpcomingEvent {
  id: string
  title: string
  event_date: string
  location: string | null
}

interface PrayerPreview {
  id: string
  content: string
  author: {
    display_name: string
    avatar_url: string | null
  }
  created_at: string
}

interface SuggestedUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: string
}

export function RightSidebar() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [prayerPreviews, setPrayerPreviews] = useState<PrayerPreview[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSidebarData()
  }, [])

  async function loadSidebarData() {
    try {
      const supabase = createClient()

      // Load upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, event_date, location')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3)

      // Load recent prayer requests
      const { data: prayers } = await supabase
        .from('prayer_requests')
        .select(`
          id,
          content,
          created_at,
          author:profiles(display_name, avatar_url)
        `)
        .eq('is_answered', false)
        .order('created_at', { ascending: false })
        .limit(3)

      // Load suggested users (pastors and leaders first)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role')
        .in('role', ['pastor', 'leader', 'member'])
        .order('role', { ascending: true })
        .limit(4)

      setUpcomingEvents(events || [])
      setPrayerPreviews(prayers || [])
      setSuggestedUsers(users || [])
    } catch (error) {
      console.error('Error loading sidebar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scriptureOfDay = {
    verse: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
    reference: "Jeremiah 29:11"
  }

  return (
    <div className="w-80 min-h-screen bg-gradient-to-b from-purple-900/20 to-purple-800/20 p-6 space-y-6">
      {/* Live Banner */}
      <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-400/20 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">LIVE NOW</p>
            <p className="text-white/70 text-xs">Sunday Service</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full mt-3 bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
        >
          Join Stream
        </Button>
      </div>

      {/* Scripture of the Day */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-gold-400" />
          <h3 className="text-white font-semibold">Scripture of the Day</h3>
        </div>
        <blockquote className="text-white/90 text-sm leading-relaxed mb-3 italic">
          "{scriptureOfDay.verse}"
        </blockquote>
        <p className="text-gold-400 text-sm font-medium">
          {scriptureOfDay.reference}
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gold-400" />
          <h3 className="text-white font-semibold">Upcoming Events</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                <h4 className="text-white font-medium text-sm mb-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-sm">No upcoming events</p>
        )}
        
        <Button variant="ghost" size="sm" className="w-full mt-4 text-gold-400 hover:text-gold-300">
          View All Events
        </Button>
      </div>

      {/* Prayer Wall Preview */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-gold-400" />
          <h3 className="text-white font-semibold">Prayer Wall</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded mb-1"></div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : prayerPreviews.length > 0 ? (
          <div className="space-y-4">
            {prayerPreviews.map((prayer) => (
              <div key={prayer.id} className="flex gap-3">
                <Avatar 
                  src={prayer.author.avatar_url} 
                  name={prayer.author.display_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                    {prayer.content}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    by {prayer.author.display_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-sm">No prayer requests yet</p>
        )}
        
        <Button variant="ghost" size="sm" className="w-full mt-4 text-gold-400 hover:text-gold-300">
          View Prayer Wall
        </Button>
      </div>

      {/* People to Follow */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gold-400" />
          <h3 className="text-white font-semibold">Connect with Others</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-1"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                </div>
                <div className="w-16 h-6 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : suggestedUsers.length > 0 ? (
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar 
                  src={user.avatar_url} 
                  name={user.display_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user.display_name}
                  </p>
                  <p className={cn(
                    "text-xs capitalize",
                    user.role === 'pastor' && "text-gold-400",
                    user.role === 'leader' && "text-purple-300",
                    user.role === 'member' && "text-white/60"
                  )}>
                    {user.role}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-gold-400 hover:text-gold-300 text-xs px-3">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60 text-sm">No suggestions available</p>
        )}
      </div>
    </div>
  )
}