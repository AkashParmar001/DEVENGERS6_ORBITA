import './globals.css'

export const metadata = {
  title: 'ORBITA — Autonomous Intelligence for Space Infrastructure',
  description: 'A digital environment for autonomous space robotics to understand, plan, simulate, and validate complex operations in orbit.',
  icons: {
    icon: '/favicon.svg',
  },
  metadataBase: new URL('https://orbita.dev'),
  openGraph: {
    title: 'ORBITA — Autonomous Intelligence for Space Infrastructure',
    description: 'A digital environment for autonomous space robotics to understand, plan, simulate, and validate complex operations in orbit.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-bg text-frost">
        {children}
      </body>
    </html>
  )
}
