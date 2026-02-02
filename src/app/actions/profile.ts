'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

export async function updateProfile(formData: FormData): Promise<Profile> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  const username = formData.get('username') as string
  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  
  // Validate required fields
  if (!username || !displayName) {
    throw new Error('Username and display name are required')
  }
  
  // Check if username is already taken (excluding current user)
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()
  
  if (existingUser) {
    throw new Error('Username is already taken')
  }
  
  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: displayName,
      bio: bio || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  
  // Revalidate relevant paths
  revalidatePath(`/profile/${user.id}`)
  revalidatePath('/settings')
  revalidatePath('/feed')
  
  return data
}

export async function uploadAvatar(formData: FormData): Promise<string> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    throw new Error('No file selected')
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`
  
  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true
    })
  
  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`)
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
  
  if (updateError) {
    throw new Error(`Failed to update profile with new avatar: ${updateError.message}`)
  }
  
  // Revalidate relevant paths
  revalidatePath(`/profile/${user.id}`)
  revalidatePath('/settings')
  revalidatePath('/feed')
  
  return publicUrl
}

export async function getFollowers(userId: string): Promise<Profile[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      profiles!follows_follower_id_fkey(*)
    `)
    .eq('following_id', userId)
  
  if (error) {
    console.error('Error fetching followers:', error)
    return []
  }
  
  return data.map(follow => follow.profiles).filter(Boolean)
}

export async function getFollowing(userId: string): Promise<Profile[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following_id,
      profiles!follows_following_id_fkey(*)
    `)
    .eq('follower_id', userId)
  
  if (error) {
    console.error('Error fetching following:', error)
    return []
  }
  
  return data.map(follow => follow.profiles).filter(Boolean)
}

export async function followUser(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Can't follow yourself
  if (user.id === userId) {
    throw new Error('Cannot follow yourself')
  }
  
  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()
  
  if (existingFollow) {
    throw new Error('Already following this user')
  }
  
  // Create follow relationship
  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: userId
    })
  
  if (error) {
    throw new Error(`Failed to follow user: ${error.message}`)
  }
  
  // Create notification for the followed user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'follow',
      reference_id: user.id,
      message: 'started following you'
    })
  
  // Revalidate relevant paths
  revalidatePath(`/profile/${userId}`)
  revalidatePath(`/profile/${user.id}`)
  revalidatePath('/feed')
}

export async function unfollowUser(userId: string): Promise<void> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Delete follow relationship
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)
  
  if (error) {
    throw new Error(`Failed to unfollow user: ${error.message}`)
  }
  
  // Revalidate relevant paths
  revalidatePath(`/profile/${userId}`)
  revalidatePath(`/profile/${user.id}`)
  revalidatePath('/feed')
}

export async function isFollowing(userId: string): Promise<boolean> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }
  
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()
  
  return !!data
}

export async function getProfileStats(userId: string): Promise<{
  followersCount: number
  followingCount: number
  postsCount: number
}> {
  const supabase = createServerClient()
  
  // Get followers count
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
  
  // Get following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
  
  // Get posts count
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId)
  
  return {
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    postsCount: postsCount || 0
  }
}