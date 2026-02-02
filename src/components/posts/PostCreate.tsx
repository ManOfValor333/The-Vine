'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { createPost } from '@/app/actions/posts'
import { useAuth } from '@/hooks/useAuth'
import { ImageIcon, Calendar, Heart, X } from 'lucide-react'

export function PostCreate() {
  const { profile } = useAuth()
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<'post' | 'prayer' | 'announcement'>('post')
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      formData.append('post_type', postType)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await createPost(formData)
      
      // Reset form
      setContent('')
      setPostType('post')
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) return null

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-4">
          <Avatar 
            src={profile.avatar_url} 
            alt={profile.display_name}
            className="flex-shrink-0"
          />
          <div className="flex-1 space-y-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPostType('post')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  postType === 'post' 
                    ? 'bg-gold-400 text-purple-900' 
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setPostType('prayer')}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center space-x-1 ${
                  postType === 'prayer' 
                    ? 'bg-gold-400 text-purple-900' 
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Prayer</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('announcement')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  postType === 'announcement' 
                    ? 'bg-gold-400 text-purple-900' 
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                Announcement
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'prayer' 
                  ? "Share a prayer request or praise..."
                  : postType === 'announcement'
                  ? "Share an important announcement..."
                  : "What's on your heart?"
              }
              className="w-full bg-transparent border-none resize-none text-lg placeholder-white/50 focus:outline-none text-white min-h-[100px]"
              maxLength={500}
            />

            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors">
                  <ImageIcon className="w-5 h-5 text-white/70" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                <div className="text-sm text-white/50">
                  {content.length}/500
                </div>
              </div>

              <Button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}