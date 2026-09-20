'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Globe, Rocket, Cpu, ShieldAlert, FlaskConical, FileText,
  Radio, Command, X
} from 'lucide-react'

const navItems = [
  { label: 'MISSIONS', href: '/missions', icon: Rocket },
  { label: 'ORBITAL MAP', href: '/orbital-map', icon: Globe },
  { label: 'SIMULATION', href: '/simulation', icon: Cpu },
  { label: 'DIGITAL TWIN', href: '/digital-twin', icon: Cpu },
  { label: 'RISK', href: '/risk', icon: ShieldAlert },
  { label: 'AGENTS', href: '/agents', icon: FlaskConical },
  { label: 'REPORTS', href: '/reports', icon: FileText },
]

export function Navigation() {
  const pathname = usePathname() || '/'
  const [utcTime, setUtcTime] = useState('')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(cmdQuery.toLowerCase())
  )

  useEffect(() => {
    const update = () => setUtcTime(new Date().toISOString().slice(11, 19))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((p) => !p)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-11 bg-white/92 backdrop-blur-md border-b border-border">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-5 h-5 rounded border border-accent/30 flex items-center justify-center bg-accent/5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            <span className="text-[12px] font-semibold tracking-[0.12em] text-navy">ORBITA</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-medium tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-accent/8 text-accent border border-accent/15'
                      : 'text-mist hover:text-frost hover:bg-surface-secondary'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Command palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border border-border text-[10px] font-mono text-steel hover:border-accent/30 hover:text-frost transition-all"
            >
              <Command className="w-3 h-3" />
              <span className="hidden md:inline">K</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-steel tabular-nums">
              <Radio className="w-2.5 h-2.5 text-success animate-pulse-soft" />
              <span>{utcTime || '--:--:--'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {cmdOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[70] w-full max-w-lg"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-white rounded-lg border border-border shadow-elevated overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <Command className="w-4 h-4 text-steel" />
                  <input
                    type="text"
                    value={cmdQuery}
                    onChange={(e) => setCmdQuery(e.target.value)}
                    placeholder="Search missions, systems, commands..."
                    className="flex-1 text-[12px] text-frost bg-transparent outline-none placeholder:text-steel"
                    autoFocus
                  />
                  <button onClick={() => setCmdOpen(false)}>
                    <X className="w-3.5 h-3.5 text-steel hover:text-frost" />
                  </button>
                </div>
                <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                  {filteredNavItems.length === 0 && (
                    <div className="px-3 py-4 text-center text-[11px] text-steel">No results found</div>
                  )}
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { setCmdOpen(false); setCmdQuery('') }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors text-[12px] ${
                          pathname === item.href
                            ? 'bg-accent/8 text-accent'
                            : 'text-mist hover:bg-surface-secondary hover:text-frost'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-steel" />
                        <span>{item.label}</span>
                        {pathname === item.href && <span className="ml-auto text-[9px] font-mono text-accent">ACTIVE</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
