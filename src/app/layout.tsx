import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'The Vine - Church Community Platform',
  description: 'Connect, grow, and flourish together in faith. Share prayers, celebrate together, and build meaningful relationships in your church community.',
  keywords: ['church', 'community', 'faith', 'prayer', 'christian', 'social'],
  authors: [{ name: 'The Vine Team' }],
  creator: 'The Vine',
  publisher: 'The Vine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thevine.church'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thevine.church',
    siteName: 'The Vine',
    title: 'The Vine - Church Community Platform',
    description: 'Connect, grow, and flourish together in faith. Share prayers, celebrate together, and build meaningful relationships in your church community.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Vine - Church Community Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thevineapp',
    creator: '@thevineapp',
    title: 'The Vine - Church Community Platform',
    description: 'Connect, grow, and flourish together in faith.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0510" />
      </head>
      <body 
        className={cn(
          'min-h-screen bg-purple-900 text-white antialiased overflow-x-hidden',
          inter.variable,
          cormorant.variable
        )}
      >
        {/* Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Purple Orb - Top Left */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          
          {/* Gold Orb - Top Right */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
          
          {/* Purple Orb - Bottom Left */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
          
          {/* Gold Orb - Bottom Right */}
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl animate-pulse delay-3000" />
          
          {/* Center Purple Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Noise Texture Overlay */}
        <div 
          className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '400px 400px'
          }}
        />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}