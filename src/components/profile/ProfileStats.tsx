interface ProfileStatsProps {
  postsCount: number
  followersCount: number
  followingCount: number
}

export function ProfileStats({ postsCount, followersCount, followingCount }: ProfileStatsProps) {
  return (
    <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{postsCount}</div>
        <div className="text-white/60 text-sm">Posts</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{followersCount}</div>
        <div className="text-white/60 text-sm">Followers</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{followingCount}</div>
        <div className="text-white/60 text-sm">Following</div>
      </div>
    </div>
  )
}