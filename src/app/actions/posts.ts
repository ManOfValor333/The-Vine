'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const content = formData.get('content') as string
  const postType = formData.get('post_type') as string
  const imageFile = formData.get('image') as File | null

  if (!content?.trim()) {
    throw new Error('Content is required')
  }

  let imageUrl = null

  // Upload image if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error('Failed to upload image')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(uploadData.path)

    imageUrl = publicUrl
  }

  // Create post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: content.trim(),
      post_type: postType || 'post',
      image_url: imageUrl,
      visibility: 'public'
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create post')
  }

  revalidatePath('/feed')
  revalidatePath('/(main)')
  
  return data
}

export async function deletePost(postId: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user owns the post
  const { data: post } = await supabase
    .from('posts')
    .select('author_id, image_url')
    .eq('id', postId)
    .single()

  if (!post || post.author_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // Delete image from storage if exists
  if (post.image_url) {
    const path = post.image_url.split('/').slice(-2).join('/')
    await supabase.storage
      .from('post-images')
      .remove([path])
  }

  // Delete post
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw new Error('Failed to delete post')
  }

  revalidatePath('/feed')
  revalidatePath('/(main)')
}