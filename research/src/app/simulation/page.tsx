'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { motion } from 'motion/react'

const SpaceScene = dynamic(() => import('../../components/space/space-scene').then(m => ({ default: m.SpaceScene })), { ssr: false })

const scenarios = [
  { id: 'baseline', name: 'BASELINE', desc: 'Nominal safe approach', risk: 0.02, fuel: 12, riskColor: 'text-success', barColor: 'bg-success' },
  { id: 'low-fuel', name: 'LOW FUEL', desc: 'Optimized fuel usage', risk: 0.08, fuel: 6, riskColor: 'text-warning', barColor: 'bg-warning' },
  { id: 'high-risk', name: 'HIGH RISK', desc: 'Collision window risk', risk: 0.45, fuel: 8, riskColor: 'text-danger', barColor: 'bg-danger' },
  { id: 'abort', name: 'EMERGENCY ABORT', desc: 'Immediate return to orbit', risk: 0.01, fuel: 18, riskColor: 'text-accent', barColor: 'bg-accent' },
]

const timelineSteps = ['T+00:00', 'T+05:00', 'T+10:00', 'T+15:00', 'T+20:00', 'T+25:00', 'T+30:00']

export default function SimulationPage() {
  const [selectedScenario, setSelectedScenario] = useState('baseline')
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(1)

  const activeScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[0]

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setElapsed((p) => {
        if (p >= 30) { setIsPlaying(false); return 30 }
        return p + 0.5 * speed
      })
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, speed])

  const handleReset = useCallback(() => {
    setElapsed(0)
    setIsPlaying(false)
  }, [])

  const handleStepForward = useCallback(() => {
    setElapsed((p) => Math.min(p + 1, 30))
  }, [])

  const handleScenarioChange = useCallback((id: string) => {
    setSelectedScenario(id)
    setElapsed(0)
    setIsPlaying(false)
  }, [])

  const handlePlayPause = useCallback(() => {
    if (elapsed >= 30) {
      setElapsed(0)
    }
    setIsPlaying((p) => !p)
  }, [elapsed])

  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-navy">Simulation Engine</h1>
            <p className="text-[11px] text-steel font-mono mt-0.5">Physics-accurate orbital dynamics simulation</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isPlaying ? 'bg-accent/10 text-accent' : elapsed > 0 ? 'bg-warning/10 text-warning' : 'bg-surface-secondary text-steel'}`}>
              {isPlaying ? 'RUNNING' : elapsed >= 30 ? 'COMPLETE' : elapsed > 0 ? 'PAUSED' : 'IDLE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main viewport */}
          <div className="lg:col-span-3 space-viz h-[360px] relative">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><span className="label-mono text-steel">INITIALIZING SIMULATION...</span></div>}>
              <SpaceScene showHUD={false} showDebris showOrbits interactive className="w-full h-full" />
            </Suspense>

            {/* Simulation overlay */}
            <div className="absolute top-4 left-4 z-10 hud-element px-4 py-3 space-y-2">
              <div className="technical-label text-accent">SIMULATION STATE</div>
              <div className="text-[11px] font-mono text-frost">
                ELAPSED: T+{String(Math.floor(elapsed)).padStart(2, '0')}:{String(Math.floor((elapsed % 1) * 60)).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-steel">
                SCENARIO: {activeScenario.name}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="hud-element px-4 py-2 flex items-center gap-3">
                <button onClick={handleReset} className="w-7 h-7 rounded border border-border flex items-center justify-center text-steel hover:text-frost hover:border-accent/30 transition-all" title="Reset">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                </button>
                <button onClick={handlePlayPause} className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white hover:bg-accent-dim transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  )}
                </button>
                <button onClick={handleStepForward} className="w-7 h-7 rounded border border-border flex items-center justify-center text-steel hover:text-frost hover:border-accent/30 transition-all" title="Step forward">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/><polygon points="12,3 22,12 12,21"/></svg>
                </button>
                <div className="w-px h-5 bg-border" />
                <div className="flex items-center gap-1.5">
                  {[1, 2, 5, 10].map((s) => (
                    <button key={s} onClick={() => setSpeed(s)} className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-all ${speed === s ? 'bg-accent/10 text-accent border border-accent/20' : 'text-steel hover:text-frost border border-transparent'}`}>{s}x</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline bar */}
            <div className="absolute bottom-16 left-4 right-4 z-10">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(elapsed / 30) * 100}%` }} transition={{ duration: 0.1 }} />
              </div>
              <div className="flex justify-between mt-1">
                {timelineSteps.map((t) => (
                  <span key={t} className="text-[8px] font-mono text-steel">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Scenario selector */}
          <div className="space-y-3">
            <div className="panel p-3">
              <div className="label-mono text-accent mb-3">SCENARIOS</div>
              <div className="space-y-1.5">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioChange(s.id)}
                    className={`w-full text-left p-2.5 rounded border transition-all ${
                      selectedScenario === s.id
                        ? 'border-accent/30 bg-accent/5 shadow-card-hover'
                        : 'border-border-light hover:border-accent/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-frost">{s.name}</span>
                      <span className={`text-[9px] font-mono ${s.riskColor}`}>{s.risk}%</span>
                    </div>
                    <div className="text-[9px] text-steel mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-mono text-accent mb-2">TELEMETRY</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-steel">FUEL</span>
                    <span className="font-mono text-frost">{activeScenario.fuel}L</span>
                  </div>
                  <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(activeScenario.fuel / 20) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-steel">RISK</span>
                    <span className="font-mono text-frost">{activeScenario.risk}%</span>
                  </div>
                  <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${activeScenario.barColor} rounded-full`} style={{ width: `${Math.min(activeScenario.risk * 200, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-steel">PROGRESS</span>
                    <span className="font-mono text-frost">{Math.round((elapsed / 30) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(elapsed / 30) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrbitaShell>
  )
}
