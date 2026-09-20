'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Rocket,
  Globe,
  Cpu,
  ShieldAlert,
  FlaskConical,
  ChevronLeft,
} from 'lucide-react'

interface ProductNavProps {
  collapsed: boolean
  onToggle: () => void
}

const sections = [
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Missions', href: '/missions', icon: Rocket },
      { label: 'Orbital Map', href: '/digital-twin', icon: Globe },
      { label: 'Simulation', href: '/simulation', icon: Cpu },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { label: 'Risk Analysis', href: '/risk', icon: ShieldAlert },
      { label: 'Experiments', href: '/experiments', icon: FlaskConical },
    ],
  },
]

export function ProductNav({ collapsed, onToggle }: ProductNavProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`h-full bg-navy flex flex-col overflow-hidden transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="h-12 flex items-center border-b border-white/8 px-4 flex-shrink-0">
        {collapsed ? (
          <Link href="/" className="mx-auto">
            <div className="w-7 h-7 rounded border border-accent/40 flex items-center justify-center bg-accent/10">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 w-full">
            <div className="w-7 h-7 rounded border border-accent/40 flex items-center justify-center bg-accent/10 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <span className="text-[12px] font-semibold tracking-wider text-white">ORBITA</span>
            <button
              onClick={onToggle}
              className="ml-auto p-1 rounded hover:bg-white/8 text-steel hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[9px] font-mono font-medium tracking-[0.12em] text-white/30 uppercase">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 rounded text-[12px] font-medium transition-colors duration-150 ${
                      collapsed ? 'justify-center px-0 py-2 mx-1' : 'px-2.5 py-1.5'
                    } ${
                      isActive
                        ? 'bg-accent/15 text-white border-l-2 border-accent'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-white/40'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status Panel */}
      {!collapsed && (
        <div className="p-3 border-t border-white/8">
          <div className="rounded bg-white/5 p-2.5 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-mono font-medium tracking-wider text-white/70 uppercase">
                ALL SYSTEMS NOMINAL
              </span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[9px] font-mono text-white/30">Ephemeris: &lt;0.002%</span>
              <span className="text-[9px] font-mono text-success/80">99.97%</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed status dot */}
      {collapsed && (
        <div className="p-3 border-t border-white/8 flex justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" title="All systems nominal" />
        </div>
      )}
    </aside>
  )
}
