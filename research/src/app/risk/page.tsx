'use client'

import { useState } from 'react'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { motion, AnimatePresence } from 'motion/react'

const conjunctions = [
  { id: 'CR-001', object: 'SAT-441', distance: '0.8 km', probability: '0.002%', severity: 'low' as const, time: '48h' },
  { id: 'CR-002', object: 'DEB-1092', distance: '0.3 km', probability: '0.045%', severity: 'medium' as const, time: '12h' },
  { id: 'CR-003', object: 'ISS', distance: '2.1 km', probability: '0.001%', severity: 'low' as const, time: '72h' },
  { id: 'CR-004', object: 'COSMOS-2542', distance: '0.1 km', probability: '0.15%', severity: 'high' as const, time: '6h' },
]

const riskFactors = [
  { name: 'Orbital Density', value: 62 },
  { name: 'Debris Proximity', value: 38 },
  { name: 'Solar Activity', value: 15 },
  { name: 'Tracking Confidence', value: 94 },
]

const severityBadge: Record<string, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-danger/10 text-danger',
}

export default function RiskPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const active = conjunctions.find((c) => c.id === selected)

  const handleAvoidance = (objectId: string) => {
    setToast(`Avoidance maneuver calculated for ${objectId} — Trajectory adjustment: 0.3° prograde`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-navy">Risk Analysis</h1>
            <p className="text-[11px] text-steel font-mono mt-0.5">Conjunction assessment and collision probability</p>
          </div>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${conjunctions.some(c => c.severity === 'high') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
            {conjunctions.filter(c => c.severity === 'high').length} HIGH RISK
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${selected ? 'hidden lg:block' : ''} space-y-2`}>
            <div className="panel p-3">
              <div className="label-mono text-accent mb-3">CONJUNCTION ALERTS</div>
              <div className="space-y-1.5">
                {conjunctions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left p-2.5 rounded border transition-all ${
                      selected === c.id
                        ? 'border-accent/30 bg-accent/5 shadow-card-hover'
                        : 'border-border-light hover:border-accent/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-frost">{c.object}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${severityBadge[c.severity]}`}>{c.severity}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] font-mono text-steel">{c.id} · T-{c.time}</span>
                      <span className="text-[9px] font-mono text-warning">{c.probability}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`${selected ? '' : 'hidden lg:block'} lg:col-span-2 panel p-5`}>
            {active ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-navy">Conjunction: {active.object}</h3>
                    <p className="text-[11px] text-steel font-mono mt-0.5">{active.id} · T-{active.time}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded ${severityBadge[active.severity]}`}>{active.severity}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'MISS DISTANCE', v: active.distance, c: 'text-frost' },
                    { l: 'PROBABILITY', v: active.probability, c: active.severity === 'high' ? 'text-danger' : 'text-success' },
                    { l: 'TIME TO TCA', v: active.time, c: 'text-accent' },
                  ].map((t) => (
                    <div key={t.l} className="text-center p-3 rounded border border-border-light bg-bg">
                      <div className="label-mono text-[9px] mb-1">{t.l}</div>
                      <div className={`text-[14px] font-semibold font-mono ${t.c}`}>{t.v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-steel">Collision Probability</span>
                    <span className="font-mono text-frost">{active.probability}</span>
                  </div>
                  <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${active.severity === 'high' ? 'bg-danger' : active.severity === 'medium' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(parseFloat(active.probability) * 600, 100)}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="label-mono text-accent text-[10px]">RISK FACTORS</div>
                  {riskFactors.map((rf) => (
                    <div key={rf.name}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-steel">{rf.name}</span>
                        <span className="font-mono text-frost">{rf.value}%</span>
                      </div>
                      <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${rf.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleAvoidance(active.object)} className="px-3 py-1.5 bg-danger text-white text-[11px] font-semibold rounded hover:bg-danger/90 transition-colors">Execute Avoidance</button>
                  <button onClick={() => setSelected(null)} className="px-3 py-1.5 bg-bg text-mist text-[11px] font-medium rounded border border-border hover:border-accent/30 transition-colors">Close</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-[12px] text-steel">Select a conjunction event to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <div className="hud-element px-4 py-2.5 flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-[11px] font-mono text-frost">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrbitaShell>
  )
}
