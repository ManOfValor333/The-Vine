export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-400"></div>
          <span className="text-white font-medium">Loading The Vine...</span>
        </div>
      </div>
    </div>
  )
}