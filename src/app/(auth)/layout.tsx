import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-300/10 rounded-full blur-2xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                The Vine
              </h1>
            </div>
            <p className="text-white/70 text-sm">
              Growing together in faith and community
            </p>
          </div>

          {/* Glass card container */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:-translate-y-1 transition-transform duration-300">
            {children}
          </div>

          {/* Auth switch links */}
          <AuthSwitchLinks />
        </div>
      </div>
    </div>
  )
}

function AuthSwitchLinks() {
  // We'll use a client component for pathname detection
  return (
    <div className="mt-6 text-center">
      <AuthNavigation />
    </div>
  )
}

// Client component for navigation
'use client'
function AuthNavigation() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  return (
    <p className="text-white/60 text-sm">
      {isLogin ? "Don't have an account? " : "Already have an account? "}
      <Link 
        href={isLogin ? '/signup' : '/login'}
        className="text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium"
      >
        {isLogin ? 'Sign up' : 'Sign in'}
      </Link>
    </p>
  )
}