import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ORBITA — Autonomous Intelligence for Space Infrastructure',
  description: 'A software-defined digital twin and autonomous mission-planning environment for testing, simulating, validating and analyzing space-robotic operations before deployment.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'ORBITA — Autonomous Intelligence for Space Infrastructure',
    description: 'Simulate. Validate. Analyze. Operate with confidence.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-bg text-frost antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
