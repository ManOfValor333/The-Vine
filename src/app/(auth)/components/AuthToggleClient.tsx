'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AuthToggleClient() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  return (
    <p className="text-white/60">
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