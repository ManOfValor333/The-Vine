'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function followUser(userId: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  if (user.id === userId) {
    throw new Error('Cannot follow yourself')
  }
  
  // Check if already following
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()
  
  if (existing) {
    throw new Error('Already following this user')
  }
  
  // Create follow relationship
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: userId
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Create notification for followed user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'follow',
      reference_id: data.id,
      message: 'started following you'
    })
  
  // Revalidate relevant paths
  revalidatePath('/feed')
  revalidatePath(`/profile/${userId}`)
  
  return data
}

export async function unfollowUser(userId: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Remove follow relationship
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)
  
  if (error) throw error
  
  // Revalidate relevant paths
  revalidatePath('/feed')
  revalidatePath(`/profile/${userId}`)
  
  return { success: true }
}

export async function isFollowing(userId: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  if (user.id === userId) return false
  
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()
  
  if (error) return false
  
  return !!data
}

export async function getFollowCounts(userId: string) {
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
  
  return {
    followers: followersCount || 0,
    following: followingCount || 0
  }
}