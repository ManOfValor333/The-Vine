'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UserGroupIcon, 
  PlayCircleIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  PlayCircleIcon as PlayCircleIconSolid,
  BellIcon as BellIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/feed',
    icon: HomeIcon,
    activeIcon: HomeIconSolid
  },
  {
    label: 'People',
    href: '/people',
    icon: UserGroupIcon,
    activeIcon: UserGroupIconSolid
  },
  {
    label: 'Live',
    href: '/live',
    icon: PlayCircleIcon,
    activeIcon: PlayCircleIconSolid
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    activeIcon: BellIconSolid,
    badge: 3
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
    badge: 7
  }
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-purple-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-gold-400 to-gold-500">
            <svg
              className="h-5 w-5 text-purple-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="12" cy="6" r="1.5"/>
              <circle cx="16" cy="8" r="1.5"/>
              <circle cx="10" cy="12" r="1.5"/>
              <circle cx="14" cy="10" r="1.5"/>
              <path d="M8 10c1 2 2 3 4 3s3-1 4-3"/>
            </svg>
          </div>
          <span className="bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-xl font-bold text-transparent">
            The Vine
          </span>
        </Link>

        {/* Search Bar */}
        <div className="relative mx-8 flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search The Vine..."
            className="w-full rounded-full bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 border border-white/10 focus:border-gold-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/feed' && pathname === '/')
            const IconComponent = isActive ? item.activeIcon : item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center justify-center rounded-xl p-3 transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-gold-400/20 to-gold-500/20 text-gold-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <IconComponent className="h-6 w-6" />
                
                {/* Notification Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-xs font-semibold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500" />
                )}

                {/* Tooltip */}
                <div className="absolute top-full mt-2 hidden group-hover:block">
                  <div className="rounded-lg bg-purple-800 px-2 py-1 text-xs text-white shadow-lg">
                    {item.label}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}