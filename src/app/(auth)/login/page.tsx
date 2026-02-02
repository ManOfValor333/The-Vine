'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        router.push('/feed')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_gold-400_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_gold-400_0%,_transparent_50%)]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent mb-2">
            The Vine
          </h1>
          <p className="text-white/70 text-lg">
            Welcome back to your spiritual community
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-white/90 font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-white/90 font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-900/20 border-t-purple-900 rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link
              href="/auth/forgot-password"
              className="text-gold-400 hover:text-gold-300 text-sm transition-colors duration-300"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-4 text-white/50 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-white/70 mb-3">
              New to The Vine?
            </p>
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/50 text-sm">
          <p>Join thousands in spiritual fellowship</p>
        </div>
      </div>
    </div>
  )
}