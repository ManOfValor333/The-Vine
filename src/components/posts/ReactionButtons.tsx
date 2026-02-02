'use client'

import { useState } from 'react'
import { Heart, Hands, Pray } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactionCount, Reaction } from '@/lib/types'
import { toggleReaction } from '@/app/actions/reactions'

interface ReactionButtonsProps {
  postId: string
  reactions: ReactionCount
  userReaction: string | null
}

export function ReactionButtons({ 
  postId, 
  reactions: initialReactions, 
  userReaction: initialUserReaction 
}: ReactionButtonsProps) {
  const [reactions, setReactions] = useState(initialReactions)
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction)
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null)

  const handleReactionClick = async (reactionType: 'love' | 'amen' | 'praying') => {
    const isCurrentReaction = userReaction === reactionType
    const newUserReaction = isCurrentReaction ? null : reactionType

    // Optimistic update
    setReactions(prev => {
      const newReactions = { ...prev }
      
      // Remove old reaction
      if (userReaction) {
        newReactions[userReaction as keyof ReactionCount]--
      }
      
      // Add new reaction
      if (!isCurrentReaction) {
        newReactions[reactionType]++
      }
      
      return newReactions
    })

    setUserReaction(newUserReaction)
    
    // Animate the clicked reaction
    setAnimatingReaction(reactionType)
    setTimeout(() => setAnimatingReaction(null), 600)

    try {
      await toggleReaction(postId, reactionType)
    } catch (error) {
      // Revert optimistic update on error
      setReactions(initialReactions)
      setUserReaction(initialUserReaction)
    }
  }

  const reactionButtons = [
    {
      type: 'love' as const,
      icon: Heart,
      label: 'Love',
      count: reactions.love,
      gradient: 'from-red-400 to-pink-500'
    },
    {
      type: 'amen' as const,
      icon: Hands,
      label: 'Amen',
      count: reactions.amen,
      gradient: 'from-gold-400 to-gold-500'
    },
    {
      type: 'praying' as const,
      icon: Pray,
      label: 'Praying',
      count: reactions.praying,
      gradient: 'from-blue-400 to-indigo-500'
    }
  ]

  return (
    <div className="flex items-center gap-2">
      {reactionButtons.map(({ type, icon: Icon, label, count, gradient }) => {
        const isActive = userReaction === type
        const isAnimating = animatingReaction === type

        return (
          <button
            key={type}
            onClick={() => handleReactionClick(type)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300',
              'bg-white/5 border border-white/10 hover:bg-white/10',
              isActive && `bg-gradient-to-r ${gradient} text-purple-900 border-transparent`,
              'group relative overflow-hidden'
            )}
          >
            <Icon 
              className={cn(
                'w-4 h-4 transition-all duration-300',
                isActive ? 'text-purple-900' : 'text-white/70 group-hover:text-white',
                isAnimating && 'animate-bounce scale-125'
              )}
            />
            
            {count > 0 && (
              <span className={cn(
                'text-xs font-semibold transition-colors duration-300',
                isActive ? 'text-purple-900' : 'text-white/70 group-hover:text-white'
              )}>
                {count}
              </span>
            )}

            {/* Ripple effect on click */}
            {isAnimating && (
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            )}
          </button>
        )
      })}
    </div>
  )
}