'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const stages = ['TARGET ACQUIRED', 'TRAJECTORY PLANNED', 'APPROACH', 'SAFE CORRIDOR', 'INSPECTION', 'MISSION COMPLETE']

export function SimulationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const interval = setInterval(() => setActiveStage((p) => (p + 1) % stages.length), 2200)
    return () => clearInterval(interval)
  }, [isInView])

  return (
    <section id="simulation" ref={ref} className="section relative bg-bg">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">MISSION SIMULATION</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              VALIDATE BEFORE <span className="text-accent">LAUNCH.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulation viewport - dark localized */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-viz p-5 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="label-mono text-steel">MISSION 024</div>
                    <div className="text-[13px] font-medium text-white mt-0.5">SATELLITE INSPECTION</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot" />
                    <span className="label-mono text-success">SIMULATING</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-5">
                  {[
                    { l: 'ALTITUDE', v: '548.3', u: 'KM' },
                    { l: 'DISTANCE', v: '182', u: 'M' },
                    { l: 'VELOCITY', v: '0.18', u: 'M/S' },
                    { l: 'FUEL', v: '78', u: '%' },
                    { l: 'RISK', v: '0.002', u: '%' },
                  ].map((t) => (
                    <div key={t.l} className="text-center">
                      <div className="label-mono text-[9px] mb-1 text-steel">{t.l}</div>
                      <div className="text-[15px] font-mono font-semibold text-white">{t.v}</div>
                      <div className="text-[9px] text-steel">{t.u}</div>
                    </div>
                  ))}
                </div>

                <div className="h-40 bg-surface-0/30 rounded border border-surface-4/30 relative overflow-hidden">
                  <motion.div className="absolute top-1/2 -translate-y-1/2 right-10" animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
                    <div className="w-6 h-2 bg-surface-5/50 border border-surface-5/30 rounded" />
                  </motion.div>
                  <motion.div className="absolute top-1/2 -translate-y-1/2" animate={{ x: [30, 180] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} style={{ left: '8%' }}>
                    <div className="w-5 h-2 bg-accent/30 border border-accent/50 rounded relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-px bg-accent/20" />
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-px bg-accent/20" />
                    </div>
                  </motion.div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 160">
                    <line x1="60" y1="80" x2="540" y2="80" stroke="#2C9EDB" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                  </svg>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-steel">100M</div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-steel">0M</div>
                </div>
              </div>
            </motion.div>

            {/* Mission stages - light panel */}
            <motion.div variants={fadeUp} className="panel p-5">
              <div className="label-mono text-accent mb-3">MISSION STAGES</div>
              <div className="space-y-0">
                {stages.map((stage, i) => (
                  <div key={stage} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${i < activeStage ? 'bg-success' : i === activeStage ? 'bg-accent ring-3 ring-accent/15' : 'bg-border'}`} />
                      {i < stages.length - 1 && <div className="w-px flex-1 bg-border-light my-1" />}
                    </div>
                    <div className="pb-3">
                      <span className={`text-[11px] font-mono ${i <= activeStage ? 'text-frost' : 'text-steel'}`}>{stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
