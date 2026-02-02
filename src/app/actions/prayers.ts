'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PrayerRequest } from '@/lib/types'

export async function createPrayerRequest(content: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Create prayer request
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({ 
      author_id: user.id,
      content: content.trim()
    })
    .select(`
      *,
      author:profiles(*)
    `)
    .single()
  
  if (error) throw error
  
  // Revalidate relevant paths
  revalidatePath('/prayer-wall')
  revalidatePath('/feed')
  
  return data
}

export async function deletePrayerRequest(id: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Verify user owns this prayer request
  const { data: prayer, error: fetchError } = await supabase
    .from('prayer_requests')
    .select('author_id')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  if (prayer.author_id !== user.id) throw new Error('Unauthorized')
  
  // Delete prayer request
  const { error } = await supabase
    .from('prayer_requests')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  
  // Revalidate relevant paths
  revalidatePath('/prayer-wall')
  revalidatePath('/feed')
  revalidatePath(`/profile/${user.id}`)
  
  return { success: true }
}

export async function togglePraying(prayerId: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Check if user is already praying
  const { data: existing } = await supabase
    .from('prayer_support')
    .select('id')
    .eq('prayer_id', prayerId)
    .eq('user_id', user.id)
    .single()
  
  if (existing) {
    // Remove prayer support
    const { error } = await supabase
      .from('prayer_support')
      .delete()
      .eq('prayer_id', prayerId)
      .eq('user_id', user.id)
    
    if (error) throw error
  } else {
    // Add prayer support
    const { error } = await supabase
      .from('prayer_support')
      .insert({
        prayer_id: prayerId,
        user_id: user.id
      })
    
    if (error) throw error
  }
  
  // Revalidate relevant paths
  revalidatePath('/prayer-wall')
  revalidatePath('/feed')
  
  return { success: true, isPraying: !existing }
}

export async function markAnswered(prayerId: string) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Verify user owns this prayer request
  const { data: prayer, error: fetchError } = await supabase
    .from('prayer_requests')
    .select('author_id')
    .eq('id', prayerId)
    .single()
  
  if (fetchError) throw fetchError
  if (prayer.author_id !== user.id) throw new Error('Unauthorized')
  
  // Mark as answered
  const { data, error } = await supabase
    .from('prayer_requests')
    .update({ 
      is_answered: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', prayerId)
    .select(`
      *,
      author:profiles(*)
    `)
    .single()
  
  if (error) throw error
  
  // Revalidate relevant paths
  revalidatePath('/prayer-wall')
  revalidatePath('/feed')
  revalidatePath(`/profile/${user.id}`)
  
  return data
}

export async function getPrayerRequests(filter?: 'all' | 'answered' | 'unanswered' | 'my-prayers') {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  let query = supabase
    .from('prayer_requests')
    .select(`
      *,
      author:profiles(*),
      prayer_support(user_id)
    `)
    .order('created_at', { ascending: false })
  
  // Apply filters
  if (filter === 'answered') {
    query = query.eq('is_answered', true)
  } else if (filter === 'unanswered') {
    query = query.eq('is_answered', false)
  } else if (filter === 'my-prayers') {
    query = query.eq('author_id', user.id)
  }
  
  const { data: prayers, error } = await query
  
  if (error) throw error
  
  // Transform data to include prayer counts and user's prayer status
  const transformedPrayers = prayers?.map(prayer => ({
    ...prayer,
    praying_count: prayer.prayer_support?.length || 0,
    is_praying: prayer.prayer_support?.some(support => support.user_id === user.id) || false
  })) || []
  
  return transformedPrayers as (PrayerRequest & { 
    praying_count: number; 
    is_praying: boolean;
  })[]
}