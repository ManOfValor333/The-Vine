'use client'

import { useState, useTransition } from 'react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { updateProfile } from '@/app/actions/profile'
import { X } from 'lucide-react'

interface EditProfileModalProps {
  profile: Profile
  onClose: () => void
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    username: profile.username,
    bio: profile.bio || ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        const data = new FormData()
        data.append('display_name', formData.display_name)
        data.append('username', formData.username)
        data.append('bio', formData.bio)
        
        await updateProfile(data)
        onClose()
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    })
  }
  
  return (
    <Modal onClose={onClose}>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Display Name
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Username
            </label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-gold-400 transition-colors resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}