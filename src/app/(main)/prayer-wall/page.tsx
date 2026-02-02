import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { PrayerWall } from '@/components/prayer/PrayerWall'
import { PrayerCreate } from '@/components/prayer/PrayerCreate'
import { Card } from '@/components/ui/Card'

interface PageProps {
  searchParams: {
    filter?: 'all' | 'my-prayers' | 'answered'
  }
}

async function getPrayerRequests(filter: string = 'all', userId?: string) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('prayer_requests')
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url, role),
      prayer_support(count),
      prayer_support!inner(user_id)
    `)

  if (filter === 'my-prayers' && userId) {
    query = query.eq('author_id', userId)
  } else if (filter === 'answered') {
    query = query.eq('is_answered', true)
  } else {
    query = query.eq('is_answered', false)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function PrayerContent({ filter }: { filter: string }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const prayers = await getPrayerRequests(filter, user?.id)
  
  return (
    <div className="space-y-6">
      <PrayerWall prayers={prayers} currentUserId={user?.id} />
    </div>
  )
}

export default async function PrayerWallPage({ searchParams }: PageProps) {
  const filter = searchParams.filter || 'all'
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
          Prayer Wall
        </h1>
        <p className="text-white/70">
          Share your prayer requests and lift each other up in prayer
        </p>
      </div>

      <Card className="p-6">
        <PrayerCreate />
      </Card>

      <Suspense fallback={
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      }>
        <PrayerContent filter={filter} />
      </Suspense>
    </div>
  )
}