'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Reaction, ReactionCount } from '@/lib/types'

export async function toggleReaction(postId: string, reactionType: 'love' | 'amen' | 'praying') {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  try {
    // Check if user already has this reaction on this post
    const { data: existingReaction } = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single()
    
    if (existingReaction) {
      // Remove existing reaction
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id)
      
      if (deleteError) throw deleteError
      
      revalidatePath('/feed')
      revalidatePath('/profile')
      
      return { action: 'removed', reactionType }
    } else {
      // Add new reaction (this will replace any other reaction type due to unique constraint handling)
      // First remove any other reaction types by this user on this post
      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      // Insert new reaction
      const { data, error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        })
        .select()
        .single()
      
      if (error) throw error
      
      revalidatePath('/feed')
      revalidatePath('/profile')
      
      return { action: 'added', reactionType, data }
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    throw new Error('Failed to toggle reaction')
  }
}

export async function getReactionsForPost(postId: string): Promise<ReactionCount> {
  const supabase = createServerClient()
  
  try {
    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', postId)
    
    if (error) throw error
    
    // Count reactions by type
    const reactionCounts: ReactionCount = {
      love: 0,
      amen: 0,
      praying: 0
    }
    
    reactions?.forEach(reaction => {
      if (reaction.reaction_type in reactionCounts) {
        reactionCounts[reaction.reaction_type as keyof ReactionCount]++
      }
    })
    
    return reactionCounts
  } catch (error) {
    console.error('Error getting reactions for post:', error)
    throw new Error('Failed to get reactions')
  }
}

export async function getUserReaction(postId: string): Promise<string | null> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  try {
    const { data: reaction, error } = await supabase
      .from('reactions')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error
    }
    
    return reaction?.reaction_type || null
  } catch (error) {
    console.error('Error getting user reaction:', error)
    throw new Error('Failed to get user reaction')
  }
}