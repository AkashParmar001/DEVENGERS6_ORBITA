'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Mission Operations', subtitle: 'Real-time orbital fleet monitoring and system health' },
  '/missions': { title: 'Mission Planner', subtitle: 'Autonomous mission planning and execution' },
  '/orbital-map': { title: 'Orbital Map', subtitle: 'Full-space orbital visualization and object tracking' },
  '/digital-twin': { title: 'Digital Twin', subtitle: '3D orbital environment visualization' },
  '/simulation': { title: 'Simulation Engine', subtitle: 'Physics-accurate orbital dynamics simulation' },
  '/risk': { title: 'Risk Analysis', subtitle: 'Conjunction assessment and collision probability' },
  '/agents': { title: 'AI Agents', subtitle: 'Multi-agent mission intelligence network' },
  '/reports': { title: 'Reports', subtitle: 'Mission reports and analysis documents' },
  '/experiments': { title: 'Experiments', subtitle: 'Batch simulation runs and policy benchmarking' },
  '/career': { title: 'Career', subtitle: 'Skills, badges, and operator progression' },
}

export function OrbitaShell({ children }: PropsWithChildren) {
  const pathname = usePathname() || '/dashboard'
  const meta = ROUTE_META[pathname] || { title: 'Mission Control', subtitle: 'ORBITA Platform' }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <Navigation />
      <main className="pt-11">
        <div className="p-4 lg:p-6 mx-auto w-full max-w-[1600px] space-y-5 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
