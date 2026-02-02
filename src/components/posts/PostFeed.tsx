'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientClient } from '@/lib/supabase/client'
import { PostCard } from './PostCard'
import { type Post } from '@/lib/types'
import { RefreshCw } from 'lucide-react'

interface PostFeedProps {
  initialPosts: Post[]
}

export function PostFeed({ initialPosts }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClientClient()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new post with author data
            const { data: newPost } = await supabase
              .from('posts')
              .select(`
                *,
                author:profiles(*),
                reactions(reaction_type),
                comments(id)
              `)
              .eq('id', payload.new.id)
              .single()

            if (newPost) {
              const transformedPost = {
                ...newPost,
                reactions: {
                  love: newPost.reactions?.filter((r: any) => r.reaction_type === 'love').length || 0,
                  amen: newPost.reactions?.filter((r: any) => r.reaction_type === 'amen').length || 0,
                  praying: newPost.reactions?.filter((r: any) => r.reaction_type === 'praying').length || 0,
                },
                comments_count: newPost.comments?.length || 0,
                user_reaction: null,
              }

              setPosts(prev => [transformedPost, ...prev])
            }
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            // Refetch updated post
            const { data: updatedPost } = await supabase
              .from('posts')
              .select(`
                *,
                author:profiles(*),
                reactions(reaction_type),
                comments(id)
              `)
              .eq('id', payload.new.id)
              .single()

            if (updatedPost) {
              const transformedPost = {
                ...updatedPost,
                reactions: {
                  love: updatedPost.reactions?.filter((r: any) => r.reaction_type === 'love').length || 0,
                  amen: updatedPost.reactions?.filter((r: any) => r.reaction_type === 'amen').length || 0,
                  praying: updatedPost.reactions?.filter((r: any) => r.reaction_type === 'praying').length || 0,
                },
                comments_count: updatedPost.comments?.length || 0,
                user_reaction: null,
              }

              setPosts(prev => 
                prev.map(post => 
                  post.id === payload.new.id ? transformedPost : post
                )
              )
            }
          }
        }
      )
      .subscribe()

    // Subscribe to reaction changes
    const reactionChannel = supabase
      .channel('reactions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          const postId = payload.new?.post_id || payload.old?.post_id
          if (postId) {
            // Refetch reaction counts for the affected post
            refreshPostReactions(postId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(reactionChannel)
    }
  }, [supabase])

  const refreshPostReactions = async (postId: string) => {
    const { data: reactions } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', postId)

    const reactionCounts = {
      love: reactions?.filter(r => r.reaction_type === 'love').length || 0,
      amen: reactions?.filter(r => r.reaction_type === 'amen').length || 0,
      praying: reactions?.filter(r => r.reaction_type === 'praying').length || 0,
    }

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, reactions: reactionCounts }
          : post
      )
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      const { data: freshPosts } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*),
          reactions(reaction_type),
          comments(id)
        `)
        .in('visibility', ['public', 'church'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (freshPosts) {
        const transformedPosts = freshPosts.map(post => ({
          ...post,
          reactions: {
            love: post.reactions?.filter((r: any) => r.reaction_type === 'love').length || 0,
            amen: post.reactions?.filter((r: any) => r.reaction_type === 'amen').length || 0,
            praying: post.reactions?.filter((r: any) => r.reaction_type === 'praying').length || 0,
          },
          comments_count: post.comments?.length || 0,
          user_reaction: null,
        }))

        setPosts(transformedPosts)
      }
    } catch (error) {
      console.error('Error refreshing posts:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Pull to refresh for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      const startY = e.touches[0].clientY
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentY = moveEvent.touches[0].clientY
        const diff = currentY - startY
        
        if (diff > 100 && !isRefreshing) {
          handleRefresh()
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
        }
      }
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
      
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }
  }

  return (
    <div onTouchStart={handleTouchStart}>
      {/* Refresh indicator */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 text-lg">No posts yet</p>
            <p className="text-white/30 text-sm mt-2">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      )}
    </div>
  )
}