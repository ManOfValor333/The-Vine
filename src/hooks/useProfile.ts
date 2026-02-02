'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Profile } from '@/lib/types'

interface ProfileStats {
  posts_count: number
  followers_count: number
  following_count: number
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)

        // Fetch stats
        const [postsCount, followersCount, followingCount] = await Promise.all([
          supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('author_id', userId),
          supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', userId),
          supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', userId),
        ])

        setStats({
          posts_count: postsCount.count || 0,
          followers_count: followersCount.count || 0,
          following_count: followingCount.count || 0,
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
  }
}