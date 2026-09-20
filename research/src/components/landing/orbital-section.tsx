'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState } from 'react'
import { fadeUp, stagger, slideLeft } from '../../lib/motion/variants'

const satellites = [
  { id: 'SAT-102', orbit: 'LEO', altitude: '548.4 km', velocity: '7.58 km/s', health: 87, risk: 'LOW', status: 'OPERATIONAL' },
  { id: 'SAT-201', orbit: 'LEO', altitude: '520.1 km', velocity: '7.62 km/s', health: 94, risk: 'LOW', status: 'OPERATIONAL' },
  { id: 'DEBRIS-001', orbit: 'LEO', altitude: '350.2 km', velocity: '7.71 km/s', health: 0, risk: 'MEDIUM', status: 'TRACKING' },
  { id: 'SAT-305', orbit: 'MEO', altitude: '20,200 km', velocity: '3.87 km/s', health: 62, risk: 'CAUTION', status: 'WARNING' },
]

export function OrbitalSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [selected, setSelected] = useState(0)

  return (
    <section ref={ref} className="section relative overflow-hidden bg-bg">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-10">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">ORBITAL ENVIRONMENT</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              A COMPLETE VIEW OF{' '}
              <span className="text-accent">LOW EARTH ORBIT.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orbital visualization - dark localized */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-viz min-h-[360px] relative">
              <div className="absolute inset-0 grid-bg opacity-30" />

              {/* Central Earth */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-full bg-surface-3 border border-accent/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent/50" />
                </div>
                <div className="absolute -inset-10 orbit-ring" />
                <div className="absolute -inset-16 orbit-ring" style={{ opacity: 0.5 }} />
                <div className="absolute -inset-24 orbit-ring" style={{ opacity: 0.3 }} />
              </div>

              {/* Satellite dots */}
              {satellites.map((sat, i) => (
                <button
                  key={sat.id}
                  className={`absolute w-2 h-2 rounded-full cursor-pointer transition-all duration-200 ${
                    selected === i
                      ? 'bg-accent-bright scale-150 ring-4 ring-accent/30'
                      : 'bg-accent/50 hover:bg-accent hover:scale-125'
                  }`}
                  style={{ top: `${25 + i * 15}%`, left: `${20 + i * 18}%` }}
                  onClick={() => setSelected(i)}
                />
              ))}

              <div className="absolute bottom-3 left-3 label-mono text-steel">ORBITAL MAP — REAL-TIME</div>
            </motion.div>

            {/* Info panel */}
            <motion.div variants={slideLeft} className="space-y-3">
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="status-dot" />
                  <span className="text-[11px] font-mono font-semibold text-accent">{satellites[selected].id}</span>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'ORBIT', value: satellites[selected].orbit },
                    { label: 'ALTITUDE', value: satellites[selected].altitude },
                    { label: 'VELOCITY', value: satellites[selected].velocity },
                    { label: 'HEALTH', value: `${satellites[selected].health}%` },
                    { label: 'RISK', value: satellites[selected].risk },
                    { label: 'STATUS', value: satellites[selected].status },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                      <span className="label-mono">{item.label}</span>
                      <span className={`value-mono text-[12px] ${
                        item.label === 'RISK'
                          ? item.value === 'LOW' ? 'text-success' : item.value === 'CAUTION' ? 'text-warning' : 'text-danger'
                          : ''
                      }`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="label-mono text-center">
                {satellites.length} objects tracked in LEO
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
