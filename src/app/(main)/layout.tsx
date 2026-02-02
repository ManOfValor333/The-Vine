import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      <Header />
      
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="fixed w-64 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-[calc(100vh-4rem)] lg:px-8 px-4">
          <main className="py-6">
            {children}
          </main>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 flex-shrink-0">
          <div className="fixed w-80 h-[calc(100vh-4rem)] overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}