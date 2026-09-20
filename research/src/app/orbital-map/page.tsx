'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { MOCK_SATELLITES } from '../../lib/mock/data'

const SpaceScene = dynamic(() => import('../../components/space/space-scene').then(m => ({ default: m.SpaceScene })), { ssr: false })

const FILTERS = [
  { label: 'ALL', count: MOCK_SATELLITES.length },
  { label: 'SATELLITES', count: MOCK_SATELLITES.filter(s => s.type === 'satellite').length },
  { label: 'DEBRIS', count: MOCK_SATELLITES.filter(s => s.type === 'debris').length },
  { label: 'SPACECRAFT', count: MOCK_SATELLITES.filter(s => s.type === 'spacecraft').length },
  { label: 'ROBOTS', count: MOCK_SATELLITES.filter(s => s.type === 'robot').length },
]

export default function OrbitalMapPage() {
  const [filter, setFilter] = useState('ALL')
  const filteredCount = filter === 'ALL' ? MOCK_SATELLITES.length : MOCK_SATELLITES.filter(s => {
    const f = filter.toLowerCase()
    if (f === 'satellites') return s.type === 'satellite'
    if (f === 'debris') return s.type === 'debris'
    if (f === 'spacecraft') return s.type === 'spacecraft'
    if (f === 'robots') return s.type === 'robot'
    return true
  }).length

  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div className="space-viz h-[calc(100vh-180px)] relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><span className="label-mono text-steel">LOADING ORBITAL ENVIRONMENT...</span></div>}>
            <SpaceScene showHUD showDebris showOrbits interactive filter={filter} className="w-full h-full" />
          </Suspense>

          {/* Filter controls */}
          <div className="absolute top-4 left-4 z-10">
            <div className="hud-element p-2 flex items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setFilter(f.label)}
                  className={`px-2.5 py-1.5 text-[9px] font-mono rounded transition-all ${
                    filter === f.label
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-steel hover:text-frost border border-transparent'
                  }`}
                >
                  {f.label} <span className="ml-1 text-[8px] opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Object count */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="hud-element px-3 py-2">
              <span className="text-[9px] font-mono text-steel">
                SHOWING {filteredCount} OF {MOCK_SATELLITES.length} OBJECTS · {filter === 'ALL' ? 'LEO + GEO' : filter.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="absolute top-4 right-4 z-10">
            <div className="hud-element px-3 py-2 flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-steel"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span className="text-[9px] font-mono text-steel">SEARCH OBJECTS...</span>
            </div>
          </div>
        </div>
      </div>
    </OrbitaShell>
  )
}
