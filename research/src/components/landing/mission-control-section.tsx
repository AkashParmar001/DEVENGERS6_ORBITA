'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const logEntries = [
  { time: '14:32:01', text: 'Target acquired: SAT-102', done: true },
  { time: '14:32:15', text: 'Trajectory validated', done: true },
  { time: '14:34:42', text: 'Inspection in progress', active: true },
]

export function MissionControlSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="missions" ref={ref} className="section relative bg-white">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-10">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">MISSION CONTROL</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              FROM INTELLIGENCE <span className="text-accent">TO ACTION.</span>
            </motion.h2>
          </div>

          <motion.div variants={fadeUp} className="panel overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-bg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-accent/30 flex items-center justify-center bg-accent/5">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-navy">ORBITA</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-steel">
                <span className="flex items-center gap-1.5"><span className="status-dot" /> ONLINE</span>
                <span className="text-border">|</span>
                <span suppressHydrationWarning>UTC 13:25:00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Orbital map - dark localized */}
              <div className="lg:col-span-2 p-5 border-r border-border">
                <div className="space-viz h-56 relative overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 rounded-full bg-surface-3 border border-accent/15" />
                    <div className="absolute -inset-6 orbit-ring" />
                    <div className="absolute -inset-12 orbit-ring" style={{ opacity: 0.5 }} />
                  </div>
                  <div className="absolute top-3 left-3 label-mono text-steel">ORBITAL MAP</div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[9px] font-mono text-success">
                    <span className="status-dot" /> LIVE
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="label-mono text-accent mb-1">ACTIVE MISSION</div>
                  <div className="text-[12px] font-medium text-frost">SAT-102 INSPECTION</div>
                  <div className="text-[10px] text-steel mt-0.5">Robot: ORBITAL-03</div>
                </div>

                <div className="space-y-0">
                  {[{ l: 'RISK', v: 'LOW', c: 'text-success' }, { l: 'FUEL', v: '78%', c: 'text-frost' }, { l: 'ETA', v: '02:34', c: 'text-frost' }].map((t) => (
                    <div key={t.l} className="flex items-center justify-between py-1.5 border-b border-border-light last:border-0">
                      <span className="label-mono">{t.l}</span>
                      <span className={`value-mono text-[11px] ${t.c}`}>{t.v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="label-mono text-accent mb-2">MISSION LOG</div>
                  <div className="space-y-1">
                    {logEntries.map((entry, i) => (
                      <div key={i} className={`flex items-start gap-1.5 text-[10px] font-mono py-1 ${entry.done ? 'text-steel' : entry.active ? 'text-accent' : 'text-border'}`}>
                        <span className="w-1 h-1 rounded-full mt-1 flex-shrink-0 bg-current" />
                        <span>{entry.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
