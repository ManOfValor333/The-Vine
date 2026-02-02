'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData) {
  const supabase = createServerClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Authentication failed')
  }

  revalidatePath('/')
  redirect('/feed')
}

export async function signUp(formData: FormData) {
  const supabase = createServerClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string
  const username = formData.get('username') as string

  if (!email || !password || !displayName || !username) {
    throw new Error('All fields are required')
  }

  // Check if username is already taken
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existingProfile) {
    throw new Error('Username is already taken')
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        username: username,
      }
    }
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Account creation failed')
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      username,
      display_name: displayName,
      role: 'member'
    })

  if (profileError) {
    throw new Error('Failed to create profile')
  }

  revalidatePath('/')
  redirect('/feed')
}

export async function signOut() {
  const supabase = createServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  redirect('/login')
}