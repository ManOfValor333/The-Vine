import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { ProfileStats } from '@/components/profile/ProfileStats'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()
    
  if (profileError || !profile) {
    notFound()
  }
  
  // Get user stats
  const [
    { count: postsCount },
    { count: followersCount },
    { count: followingCount }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', params.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', params.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', params.id)
  ])
  
  // Check if current user follows this profile
  let isFollowing = false
  if (user && user.id !== params.id) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', params.id)
      .single()
    isFollowing = !!followData
  }
  
  const isOwnProfile = user?.id === params.id
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
        <ProfileHeader 
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          currentUserId={user?.id}
        />
        
        <ProfileStats 
          postsCount={postsCount || 0}
          followersCount={followersCount || 0}
          followingCount={followingCount || 0}
        />
      </div>
      
      {/* Profile Content Tabs */}
      <ProfileTabs 
        profileId={params.id}
        profile={profile}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}