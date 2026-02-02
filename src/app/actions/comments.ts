'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Comment } from '@/lib/types'

export async function createComment(postId: string, content: string): Promise<Comment> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Validate inputs
  if (!postId.trim()) throw new Error('Post ID is required')
  if (!content.trim()) throw new Error('Comment content is required')
  if (content.length > 1000) throw new Error('Comment too long')
  
  // Check if post exists
  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .single()
  
  if (!post) throw new Error('Post not found')
  
  // Create comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim()
    })
    .select(`
      *,
      author:profiles(
        id,
        username,
        display_name,
        avatar_url,
        role
      )
    `)
    .single()
  
  if (error) throw error
  
  // Create notification for post author (if not commenting on own post)
  const { data: postAuthor } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()
  
  if (postAuthor && postAuthor.author_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        user_id: postAuthor.author_id,
        type: 'comment',
        reference_id: data.id,
        message: `${data.author?.display_name} commented on your post`
      })
  }
  
  // Revalidate relevant paths
  revalidatePath('/feed')
  revalidatePath(`/profile/${user.id}`)
  
  return data
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Check if comment exists and user owns it or has admin role
  const { data: comment } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(role)
    `)
    .eq('id', commentId)
    .single()
  
  if (!comment) throw new Error('Comment not found')
  
  // Check authorization - user must own comment or be admin/pastor
  const userProfile = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const canDelete = comment.author_id === user.id || 
                   userProfile.data?.role === 'admin' || 
                   userProfile.data?.role === 'pastor'
  
  if (!canDelete) throw new Error('Unauthorized to delete this comment')
  
  // Delete comment
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
  
  // Revalidate relevant paths
  revalidatePath('/feed')
  revalidatePath(`/profile/${user.id}`)
}

export async function getCommentsForPost(
  postId: string, 
  cursor?: string
): Promise<{ comments: Comment[], nextCursor?: string }> {
  const supabase = createServerClient()
  
  // Get current user (optional for reading comments)
  const { data: { user } } = await supabase.auth.getUser()
  
  const COMMENTS_PER_PAGE = 20
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      author:profiles(
        id,
        username,
        display_name,
        avatar_url,
        role
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(COMMENTS_PER_PAGE + 1)
  
  // Add cursor pagination if provided
  if (cursor) {
    query = query.gt('created_at', cursor)
  }
  
  const { data: comments, error } = await query
  
  if (error) throw error
  
  // Check if there are more comments
  let nextCursor: string | undefined
  let returnComments = comments || []
  
  if (returnComments.length > COMMENTS_PER_PAGE) {
    nextCursor = returnComments[COMMENTS_PER_PAGE - 1].created_at
    returnComments = returnComments.slice(0, COMMENTS_PER_PAGE)
  }
  
  return {
    comments: returnComments,
    nextCursor
  }
}