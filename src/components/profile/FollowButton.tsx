'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Button } from '@/components/ui/Button'
import { followUser, unfollowUser } from '@/app/actions/follows'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  className?: string
}

export function FollowButton({ 
  userId, 
  initialIsFollowing, 
  className 
}: FollowButtonProps) {
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    initialIsFollowing,
    (state, newState: boolean) => newState
  )

  // Don't show follow button for own profile
  if (!user || user.id === userId) {
    return null
  }

  const handleToggleFollow = () => {
    startTransition(async () => {
      try {
        // Optimistically update the UI
        setOptimisticFollowing(!optimisticFollowing)
        
        if (optimisticFollowing) {
          await unfollowUser(userId)
        } else {
          await followUser(userId)
        }
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticFollowing(optimisticFollowing)
        console.error('Follow/unfollow error:', error)
      }
    })
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isPending}
      variant={optimisticFollowing ? 'secondary' : 'primary'}
      size="sm"
      className={cn(
        'min-w-[100px] transition-all duration-300',
        optimisticFollowing && 'hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/30',
        isPending && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{optimisticFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </div>
      ) : (
        <span className="group-hover:hidden">
          {optimisticFollowing ? 'Following' : 'Follow'}
        </span>
      )}
      
      {/* Show "Unfollow" on hover when following */}
      {optimisticFollowing && !isPending && (
        <span className="hidden group-hover:inline text-red-400">
          Unfollow
        </span>
      )}
    </Button>
  )
}