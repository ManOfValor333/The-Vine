'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Post } from '@/lib/types'
import { PostCard } from '@/components/posts/PostCard'

interface ProfilePostsProps {
  profileId: string
  isOwnProfile: boolean
}

export function ProfilePosts({ profileId, isOwnProfile }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('author_id', profileId)
          .eq('post_type', 'post')
          .order('created_at', { ascending: false })
          
        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
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
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {isOwnProfile ? "You haven't shared any posts yet" : "No posts yet"}
        </h3>
        <p className="text-white/60">
          {isOwnProfile 
            ? "Share your first post to connect with your church community!"
            : "This member hasn't shared any posts yet."
          }
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}