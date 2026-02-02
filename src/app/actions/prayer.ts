'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPrayerRequest(formData: FormData) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const content = formData.get('content') as string
  if (!content?.trim()) throw new Error('Content is required')

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({
      author_id: user.id,
      content: content.trim()
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/prayer-wall')
  return data
}

export async function togglePrayerSupport(prayerId: string) {
  const supabase = createServerClient()
  
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

  revalidatePath('/prayer-wall')
}

export async function markPrayerAnswered(prayerId: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify user owns the prayer
  const { data: prayer, error: fetchError } = await supabase
    .from('prayer_requests')
    .select('author_id')
    .eq('id', prayerId)
    .single()

  if (fetchError) throw fetchError
  if (prayer.author_id !== user.id) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('prayer_requests')
    .update({ is_answered: true, updated_at: new Date().toISOString() })
    .eq('id', prayerId)

  if (error) throw error

  revalidatePath('/prayer-wall')
}