'use client'

import { useState, useEffect, useCallback } from 'react'
import { useScroll, motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Missions', href: '#missions' },
  { label: 'Simulation', href: '#simulation' },
  { label: 'Risk', href: '#risk' },
  { label: 'Reports', href: '#reports' },
]

function useUTCTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s} UTC`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function OrbitaNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const utcTime = useUTCTime()

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 40))
  }, [scrollY])

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/92 backdrop-blur-md border-b border-border shadow-card'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-[72rem] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-7 h-7">
                <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
                  <circle cx="14" cy="14" r="11" stroke="#176B9E" strokeWidth="1" opacity="0.25" />
                  <ellipse
                    cx="14"
                    cy="14"
                    rx="11"
                    ry="5"
                    stroke="#176B9E"
                    strokeWidth="1"
                    opacity="0.5"
                    transform="rotate(-20 14 14)"
                  />
                  <circle cx="14" cy="14" r="2.5" fill="#176B9E" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-wider text-navy">ORBITA</span>
            </a>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-[12px] font-medium text-mist hover:text-frost transition-colors duration-150"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden lg:block font-mono text-[11px] text-steel tabular-nums">
              {utcTime}
            </span>
            <a
              href="/dashboard"
              className="hidden md:flex items-center text-[12px] font-medium px-4 py-1.5 rounded border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-150"
            >
              ENTER
            </a>
            <button
              className="md:hidden p-1.5 text-mist hover:text-frost transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-14 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-card md:hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-left text-sm font-medium text-mist hover:text-frost py-2 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-border mt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-steel tabular-nums">{utcTime}</span>
                <a
                  href="/dashboard"
                  className="text-[12px] font-medium px-4 py-1.5 rounded border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-150"
                >
                  ENTER
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
