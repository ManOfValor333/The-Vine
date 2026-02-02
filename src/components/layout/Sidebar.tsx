'use client'

import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { 
  HomeIcon, 
  HeartIcon, 
  CalendarIcon, 
  UserGroupIcon,
  VideoCameraIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  HeartIcon as HeartIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  VideoCameraIcon as VideoCameraIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/solid'

const navigation = [
  {
    name: 'Home Feed',
    href: '/feed',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: 'Prayer Wall',
    href: '/prayer-wall',
    icon: HeartIcon,
    activeIcon: HeartIconSolid,
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarIcon,
    activeIcon: CalendarIconSolid,
  },
  {
    name: 'Ministries',
    href: '/ministries',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid,
  },
  {
    name: 'Live',
    href: '/live',
    icon: VideoCameraIcon,
    activeIcon: VideoCameraIconSolid,
  },
  {
    name: 'Bible Study',
    href: '/bible-study',
    icon: BookOpenIcon,
    activeIcon: BookOpenIconSolid,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  },
]

export function Sidebar() {
  const { user } = useAuth()
  const { profile, stats } = useProfile(user?.id)
  const pathname = usePathname()

  if (!user || !profile) return null

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-900 to-purple-800 border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            The Vine
          </h1>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-b border-white/10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={profile.avatar_url}
                alt={profile.display_name}
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {profile.display_name}
                </h3>
                <p className="text-white/60 text-sm capitalize">
                  {profile.role}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-center">
              <div>
                <div className="text-xl font-bold text-gold-400">
                  {stats?.posts_count || 0}
                </div>
                <div className="text-xs text-white/60">Posts</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gold-400">
                  {stats?.followers_count || 0}
                </div>
                <div className="text-xs text-white/60">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gold-400">
                  {stats?.following_count || 0}
                </div>
                <div className="text-xs text-white/60">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = isActive ? item.activeIcon : item.icon

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                      isActive
                        ? 'bg-gradient-to-r from-gold-400/20 to-gold-600/20 text-gold-400 border border-gold-400/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'h-5 w-5 transition-transform duration-300',
                        !isActive && 'group-hover:scale-110'
                      )} 
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-white/40">
              © 2024 The Vine
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}