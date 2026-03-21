import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/Providers'
import { PageTransition } from '@/components/veritai/PageTransition'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VeritAI - Evidence-backed truth, powered by AI',
  description: 'VeritAI extracts every claim from articles, URLs, and images — then verifies each against real-time web evidence.',
  keywords: ['fact-check', 'AI', 'verification', 'claims', 'truth', 'evidence'],
  authors: [{ name: 'VeritAI' }],
  creator: 'VeritAI',
  openGraph: {
    title: 'VeritAI - Evidence-backed truth, powered by AI',
    description: 'Stop believing. Start verifying. AI-powered fact-checking platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VeritAI - Evidence-backed truth, powered by AI',
    description: 'Stop believing. Start verifying. AI-powered fact-checking platform.',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0F1E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} font-sans antialiased`}>
        <Providers>
          {/* Floating orbs for background effect */}
          <div className="orb orb-1" aria-hidden="true" />
          <div className="orb orb-2" aria-hidden="true" />
          <div className="orb orb-3" aria-hidden="true" />
          
          <div className="relative z-10">
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
