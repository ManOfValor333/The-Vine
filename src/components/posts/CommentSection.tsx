'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Comment, Profile } from '@/lib/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Send, MoreHorizontal, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CommentSectionProps {
  postId: string
  className?: string
}

export function CommentSection({ postId, className }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  const displayedComments = showAll ? comments : comments.slice(0, 3)

  useEffect(() => {
    loadComments()
    getCurrentUser()
    setupRealtime()
  }, [postId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Fetch the full comment with author data
          const { data } = await supabase
            .from('comments')
            .select(`
              *,
              author:profiles(
                id,
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setComments(prev => [...prev, data])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments(prev => prev.filter(comment => comment.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim()
        })

      if (error) throw error
      
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user || deleteLoading) return

    setDeleteLoading(commentId)
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id) // Ensure user can only delete their own comments

      if (error) throw error
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <Avatar
                src={comment.author?.avatar_url}
                alt={comment.author?.display_name || 'User'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {comment.author?.display_name}
                  </span>
                  <span className="text-xs text-white/50">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-white/90 break-words">
                  {comment.content}
                </p>
              </div>
              
              {/* Delete button for own comments */}
              {user?.id === comment.author_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deleteLoading === comment.id}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/50 hover:text-red-400 transition-all duration-200 disabled:opacity-50"
                >
                  {deleteLoading === comment.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          ))}

          {/* Show more button */}
          {comments.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors duration-200 flex items-center gap-1"
            >
              <MoreHorizontal className="w-4 h-4" />
              View {comments.length - 3} more comments
            </button>
          )}

          {showAll && comments.length > 3 && (
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-white/50 hover:text-white/70 transition-colors duration-200"
            >
              Show less
            </button>
          )}
        </div>
      )}

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleAddComment} className="flex items-start gap-3">
          <Avatar
            src={user.user_metadata?.avatar_url}
            alt="Your avatar"
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm"
              disabled={submitting}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || submitting}
              className="shrink-0"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      )}

      {/* No comments state */}
      {comments.length === 0 && (
        <p className="text-sm text-white/50 text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  )
}