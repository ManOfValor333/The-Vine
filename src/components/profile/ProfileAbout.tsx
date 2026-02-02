import { Profile } from '@/lib/types'
import { Calendar, User, Crown, Star } from 'lucide-react'

interface ProfileAboutProps {
  profile: Profile
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'pastor':
        return { icon: <Crown className="w-5 h-5" />, label: 'Pastor', color: 'text-gold-400' }
      case 'leader':
        return { icon: <Star className="w-5 h-5" />, label: 'Church Leader', color: 'text-purple-400' }
      case 'admin':
        return { icon: <Crown className="w-5 h-5" />, label: 'Administrator', color: 'text-gold-400' }
      default:
        return { icon: <User className="w-5 h-5" />, label: 'Church Member', color: 'text-white/60' }
    }
  }
  
  const roleInfo = getRoleInfo(profile.role)
  
  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">About</h3>
            <p className="text-white/80 leading-relaxed">{profile.bio}</p>
          </div>
        )}
        
        {/* Role & Details */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={roleInfo.color}>
                {roleInfo.icon}
              </div>
              <span className="text-white/80">{roleInfo.label}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/60" />
              <span className="text-white/80">
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-white/60" />
              <span className="text-white/80">@{profile.username}</span>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        {!profile.bio && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-white/60">
              This member hasn't added any additional information yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}