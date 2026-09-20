'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { motion } from 'motion/react'

const SpaceScene = dynamic(() => import('../../components/space/space-scene').then(m => ({ default: m.SpaceScene })), { ssr: false })

const STATE_DATA = [
  {
    label: 'PHYSICAL STATE',
    desc: 'Current hardware telemetry from the spacecraft bus',
    metrics: [
      { l: 'TEMPERATURE', v: '22.4', u: '°C', c: 'text-frost' },
      { l: 'BATTERY', v: '92', u: '%', c: 'text-success' },
      { l: 'FUEL', v: '87', u: '%', c: 'text-accent' },
      { l: 'HEALTH', v: '98.7', u: '%', c: 'text-success' },
      { l: 'VELOCITY', v: '7.42', u: 'km/s', c: 'text-frost' },
      { l: 'ORIENTATION', v: 'NOMINAL', u: '', c: 'text-success' },
      { l: 'PAYLOAD', v: 'ACTIVE', u: '', c: 'text-accent' },
      { l: 'COMMS', v: 'STRONG', u: '', c: 'text-success' },
    ],
  },
  {
    label: 'SIMULATED STATE',
    desc: 'Predicted state from orbital mechanics model',
    metrics: [
      { l: 'TEMPERATURE', v: '21.8', u: '°C', c: 'text-frost' },
      { l: 'BATTERY', v: '89', u: '%', c: 'text-success' },
      { l: 'FUEL', v: '84', u: '%', c: 'text-accent' },
      { l: 'HEALTH', v: '97.2', u: '%', c: 'text-success' },
      { l: 'VELOCITY', v: '7.41', u: 'km/s', c: 'text-frost' },
      { l: 'ORIENTATION', v: 'NOMINAL', u: '', c: 'text-success' },
      { l: 'PAYLOAD', v: 'ACTIVE', u: '', c: 'text-accent' },
      { l: 'COMMS', v: 'STRONG', u: '', c: 'text-success' },
    ],
  },
  {
    label: 'PREDICTED STATE',
    desc: 'AI-predicted state at T+24 hours',
    metrics: [
      { l: 'TEMPERATURE', v: '23.1', u: '°C', c: 'text-warning' },
      { l: 'BATTERY', v: '78', u: '%', c: 'text-warning' },
      { l: 'FUEL', v: '81', u: '%', c: 'text-accent' },
      { l: 'HEALTH', v: '96.5', u: '%', c: 'text-success' },
      { l: 'VELOCITY', v: '7.39', u: 'km/s', c: 'text-frost' },
      { l: 'ORIENTATION', v: 'DEGRADED', u: '', c: 'text-warning' },
      { l: 'PAYLOAD', v: 'ACTIVE', u: '', c: 'text-accent' },
      { l: 'COMMS', v: 'WEAK', u: '', c: 'text-warning' },
    ],
  },
]

export default function DigitalTwinPage() {
  const [activeState, setActiveState] = useState(0)
  const current = STATE_DATA[activeState]

  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-navy">Digital Twin</h1>
            <p className="text-[11px] text-steel font-mono mt-0.5">{current.desc}</p>
          </div>
          <div className="flex items-center gap-1">
            {STATE_DATA.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveState(i)}
                className={`px-2.5 py-1.5 text-[9px] font-mono rounded transition-all ${activeState === i ? 'bg-accent/10 text-accent border border-accent/20' : 'text-steel hover:text-frost border border-transparent'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-viz h-[400px] relative">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><span className="label-mono text-steel">LOADING DIGITAL TWIN...</span></div>}>
              <SpaceScene showHUD showDebris={false} showOrbits interactive className="w-full h-full" />
            </Suspense>
            <div className="absolute top-4 left-4 z-10 hud-element px-3 py-2 space-y-1">
              <div className="technical-label text-accent">{current.label}</div>
              <div className="text-[10px] font-mono text-steel">SAT-204 · ORBITAL-03</div>
            </div>
            <div className="absolute bottom-4 left-4 z-10">
              <div className="hud-element px-3 py-2 flex items-center gap-2">
                <span className="status-dot" />
                <span className="text-[9px] font-mono text-success">SYNCHRONIZED</span>
              </div>
            </div>
          </div>

          <motion.div
            key={activeState}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="panel p-5"
          >
            <div className="label-mono text-accent mb-4">TELEMETRY</div>
            <div className="space-y-3">
              {current.metrics.map((m) => (
                <div key={m.l} className="flex items-center justify-between py-1.5 border-b border-border-light last:border-0">
                  <span className="label-mono">{m.l}</span>
                  <span className={`value-mono ${m.c}`}>{m.v}{m.u && <span className="text-steel ml-1">{m.u}</span>}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </OrbitaShell>
  )
}
