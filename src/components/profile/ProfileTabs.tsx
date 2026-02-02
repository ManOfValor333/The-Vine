'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { ProfilePosts } from './ProfilePosts'
import { ProfilePrayers } from './ProfilePrayers'
import { ProfileAbout } from './ProfileAbout'
import { cn } from '@/lib/utils'

interface ProfileTabsProps {
  profileId: string
  profile: Profile
  isOwnProfile: boolean
}

type TabType = 'posts' | 'prayers' | 'about'

export function ProfileTabs({ profileId, profile, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  
  const tabs = [
    { id: 'posts' as TabType, label: 'Posts', icon: '📝' },
    { id: 'prayers' as TabType, label: 'Prayers', icon: '🙏' },
    { id: 'about' as TabType, label: 'About', icon: 'ℹ️' }
  ]
  
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'text-gold-400 border-b-2 border-gold-400'
                  : 'text-white/60 hover:text-white'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <ProfilePosts profileId={profileId} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === 'prayers' && (
          <ProfilePrayers profileId={profileId} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === 'about' && (
          <ProfileAbout profile={profile} />
        )}
      </div>
    </div>
  )
}