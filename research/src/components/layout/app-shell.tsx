'use client'

import { PropsWithChildren, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProductNav } from './product-nav'
import { Menu, Radio, ChevronRight } from 'lucide-react'

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Mission Operations', subtitle: 'Real-time orbital fleet monitoring and system health' },
  '/missions': { title: 'Mission Planner', subtitle: 'Autonomous mission planning and execution' },
  '/digital-twin': { title: 'Digital Twin', subtitle: '3D orbital environment visualization' },
  '/simulation': { title: 'Simulation Engine', subtitle: 'Physics-accurate orbital dynamics simulation' },
  '/risk': { title: 'Risk Analysis', subtitle: 'Conjunction assessment and collision probability' },
  '/experiments': { title: 'Experiments', subtitle: 'Batch simulation runs and policy benchmarking' },
  '/career': { title: 'Career', subtitle: 'Skills, badges, and operator progression' },
}

export function AppShell({ children }: PropsWithChildren) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [utcTime, setUtcTime] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname() || '/dashboard'
  const meta = ROUTE_META[pathname] || { title: 'Mission Control', subtitle: 'ORBITA Platform' }

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      setUtcTime(`${h}:${m}:${s} UTC`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="h-screen bg-bg text-frost font-sans flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <ProductNav collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
            onClick={closeMobileNav}
          />
          <div className="relative z-10 h-full">
            <ProductNav collapsed={false} onToggle={closeMobileNav} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-12 bg-white border-b border-border px-4 lg:px-5 flex items-center justify-between gap-3 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded border border-border text-mist hover:text-frost hover:border-accent/30 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded border border-border text-mist hover:text-frost hover:border-accent/30 transition-colors"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>

            <div className="min-w-0">
              <h1 className="text-[13px] font-semibold text-navy truncate">{meta.title}</h1>
              <p className="text-[10px] text-steel font-mono truncate hidden sm:block">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-[10px] font-mono text-steel bg-bg">
              <Radio className="w-3 h-3 text-success animate-pulse" />
              <span className="tabular-nums">{utcTime || '00:00:00 UTC'}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-border text-[10px] font-mono text-steel bg-bg">
              <span className="status-dot" />
              <span className="text-success">NOMINAL</span>
            </div>

            <Link
              href="/career"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border hover:border-accent/30 hover:shadow-card transition-all bg-white"
            >
              <div className="w-5 h-5 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-[9px] font-mono font-semibold text-accent">L2</div>
              <div className="hidden sm:block text-left">
                <div className="text-[9px] font-mono text-steel">2,470 <span className="text-accent">XP</span></div>
                <div className="w-16 h-0.5 bg-border rounded mt-0.5 overflow-hidden"><div className="h-full bg-accent rounded" style={{ width: '82%' }} /></div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-5 mx-auto w-full max-w-[1600px] space-y-5 pb-6">
            {children}
          </div>
        </main>

        {/* Footer Status Line */}
        <footer className="flex-shrink-0 px-5 py-1.5 border-t border-border text-[10px] font-mono text-steel flex items-center justify-between bg-white">
          <span>ORBITA PLATFORM // V3.2</span>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="status-dot" /> NOMINAL
            </span>
            <span className="tabular-nums">36,512 OBJECTS</span>
            <span className="hidden md:inline tabular-nums">MESH: 99.97%</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
