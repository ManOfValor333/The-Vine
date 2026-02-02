'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Post } from '@/lib/types'
import { Heart, MessageCircle, Share, Sparkles, HandHeart } from 'lucide-react'
import Image from 'next/image'

interface PostCardProps {
  post: Post
  onReact?: (postId: string, reactionType: 'love' | 'amen' | 'praying') => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
}

export function PostCard({ post, onReact, onComment, onShare }: PostCardProps) {
  const [isReacting, setIsReacting] = useState(false)

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pastor':
        return (
          <span className="bg-gradient-to-r from-gold-400 to-gold-500 text-purple-900 px-2 py-0.5 rounded-full text-xs font-medium">
            Pastor
          </span>
        )
      case 'leader':
        return (
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
            Leader
          </span>
        )
      case 'admin':
        return (
          <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-purple-900 px-2 py-0.5 rounded-full text-xs font-medium">
            Admin
          </span>
        )
      default:
        return null
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'church':
        return '🏛️'
      case 'private':
        return '🔒'
      default:
        return '🌍'
    }
  }

  const handleReaction = async (reactionType: 'love' | 'amen' | 'praying') => {
    if (isReacting) return
    setIsReacting(true)
    
    try {
      await onReact?.(post.id, reactionType)
    } finally {
      setIsReacting(false)
    }
  }

  const getPostTypeEmoji = (postType: string) => {
    switch (postType) {
      case 'prayer':
        return '🙏'
      case 'event':
        return '📅'
      case 'announcement':
        return '📢'
      default:
        return null
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
      {/* Author Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar 
            src={post.author?.avatar_url} 
            alt={post.author?.display_name || 'User'}
            size="md"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium text-sm">
                {post.author?.display_name}
              </h3>
              {post.author?.role && getRoleBadge(post.author.role)}
            </div>
            <p className="text-white/60 text-xs">
              @{post.author?.username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>{getVisibilityIcon(post.visibility)}</span>
          <span>{formatTimeAgo(post.created_at)}</span>
          {getPostTypeEmoji(post.post_type) && (
            <span className="ml-1">{getPostTypeEmoji(post.post_type)}</span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="mb-4">
        <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image Support */}
      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <Image
            src={post.image_url}
            alt="Post image"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Stats Row */}
      {post.reactions && (
        <div className="flex items-center gap-4 mb-4 text-white/60 text-sm">
          {post.reactions.love > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-400" />
              {post.reactions.love}
            </span>
          )}
          {post.reactions.amen > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-gold-400" />
              {post.reactions.amen}
            </span>
          )}
          {post.reactions.praying > 0 && (
            <span className="flex items-center gap-1">
              <HandHeart className="w-4 h-4 text-purple-400" />
              {post.reactions.praying}
            </span>
          )}
          {post.comments_count && post.comments_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.comments_count}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('love')}
            className={cn(
              "flex items-center gap-2 hover:bg-red-500/20 hover:text-red-400",
              post.user_reaction === 'love' && "bg-red-500/20 text-red-400"
            )}
            disabled={isReacting}
          >
            <Heart className="w-4 h-4" />
            Love
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('amen')}
            className={cn(
              "flex items-center gap-2 hover:bg-gold-500/20 hover:text-gold-400",
              post.user_reaction === 'amen' && "bg-gold-500/20 text-gold-400"
            )}
            disabled={isReacting}
          >
            <Sparkles className="w-4 h-4" />
            Amen
          </Button>

          {post.post_type === 'prayer' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('praying')}
              className={cn(
                "flex items-center gap-2 hover:bg-purple-500/20 hover:text-purple-400",
                post.user_reaction === 'praying' && "bg-purple-500/20 text-purple-400"
              )}
              disabled={isReacting}
            >
              <HandHeart className="w-4 h-4" />
              Praying
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="flex items-center gap-2 hover:bg-white/10"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-2 hover:bg-white/10"
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}