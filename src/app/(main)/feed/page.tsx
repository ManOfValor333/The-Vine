import { createServerClient } from '@/lib/supabase/server'
import { PostCreate } from '@/components/posts/PostCreate'
import { PostFeed } from '@/components/posts/PostFeed'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  const supabase = createServerClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial posts with author profiles and reaction counts
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      reactions(reaction_type),
      comments(id)
    `)
    .in('visibility', ['public', 'church'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching posts:', error)
  }

  // Transform posts to include reaction counts and user reactions
  const transformedPosts = posts?.map(post => ({
    ...post,
    reactions: {
      love: post.reactions?.filter((r: any) => r.reaction_type === 'love').length || 0,
      amen: post.reactions?.filter((r: any) => r.reaction_type === 'amen').length || 0,
      praying: post.reactions?.filter((r: any) => r.reaction_type === 'praying').length || 0,
    },
    comments_count: post.comments?.length || 0,
    user_reaction: null, // Will be fetched client-side
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <PostCreate />
        <PostFeed initialPosts={transformedPosts} />
      </div>
    </div>
  )
}