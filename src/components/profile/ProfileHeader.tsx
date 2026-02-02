'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { FollowButton } from './FollowButton'
import { EditProfileModal } from './EditProfileModal'
import { MapPin, Calendar } from 'lucide-react'

interface ProfileHeaderProps {
  profile: Profile
  isOwnProfile: boolean
  isFollowing: boolean
  currentUserId?: string
}

export function ProfileHeader({ 
  profile, 
  isOwnProfile, 
  isFollowing, 
  currentUserId 
}: ProfileHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl mb-16"></div>
      
      {/* Profile Info */}
      <div className="absolute top-20 left-6">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name}
          size="xl"
          className="border-4 border-white/10"
        />
      </div>
      
      <div className="ml-32 mt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.display_name}
            </h1>
            <p className="text-white/70 mb-1">@{profile.username}</p>
            
            {profile.role !== 'member' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-500/20 text-gold-400 mb-3">
                {profile.role === 'pastor' && '✝️ Pastor'}
                {profile.role === 'leader' && '⭐ Leader'}
                {profile.role === 'admin' && '👑 Admin'}
              </span>
            )}
            
            {profile.bio && (
              <p className="text-white/80 mb-4 max-w-md">{profile.bio}</p>
            )}
            
            <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </Button>
            ) : currentUserId && (
              <FollowButton
                profileId={profile.id}
                isFollowing={isFollowing}
              />
            )}
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}