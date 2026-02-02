'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    username: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (!formData.displayName.trim()) {
      setError('Display name is required')
      return false
    }
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.includes(' ')) {
      setError('Username cannot contain spaces')
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username.toLowerCase())
        .single()

      if (existingUser) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: formData.username.toLowerCase(),
          display_name: formData.displayName,
          role: 'member'
        })

      if (profileError) {
        setError('Failed to create profile: ' + profileError.message)
        setLoading(false)
        return
      }

      // Redirect to feed
      router.push('/feed')
      
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
            The Vine
          </h1>
          <p className="text-white/70 mt-2">
            Join our faith community
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white/90 mb-2">
                Display Name
              </label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="@username"
                required
                disabled={loading}
              />
              <p className="text-xs text-white/50 mt-1">
                This will be your unique handle
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <p className="text-xs text-white/50 mt-1">
                At least 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            By signing up, you agree to connect with our faith community
          </p>
        </div>
      </div>
    </div>
  )
}