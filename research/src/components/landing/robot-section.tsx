'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const capabilities = [
  { name: 'VISION', desc: 'Multi-spectral imaging and anomaly detection' },
  { name: 'NAVIGATION', desc: 'Autonomous orbital trajectory planning' },
  { name: 'RENDEZVOUS', desc: 'Precision proximity operations' },
  { name: 'DOCKING', desc: 'Robotic capture and berthing' },
  { name: 'MANIPULATION', desc: 'Tool-based servicing and repair' },
  { name: 'INSPECTION', desc: '360-degree structural assessment' },
]

export function RobotSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="section relative bg-white">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">AUTONOMOUS AGENT</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              MEET <span className="text-accent">ORBITAL-03.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-mist leading-relaxed max-w-xl">
              An autonomous servicing spacecraft with integrated vision, navigation,
              and manipulation capabilities for orbital operations.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Robot visualization - dark localized */}
            <motion.div variants={fadeUp} className="space-viz min-h-[340px] relative">
              <div className="absolute inset-0 grid-bg opacity-20" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    className="w-20 h-10 bg-surface-3 border border-accent/30 rounded relative"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-accent/20 rounded" />
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-accent/20 rounded" />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-px h-5 bg-accent/25" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent/50" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1.5 w-1.5 h-1.5 rounded-full bg-accent-bright/60" />
                  </motion.div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="label-mono text-accent/70">ORBITAL-03</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 label-mono text-steel">LEO 548KM</div>
            </motion.div>

            {/* Capabilities */}
            <motion.div variants={fadeUp} className="space-y-2">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.name}
                  initial={{ opacity: 0, x: 8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
                  className="panel p-3 flex items-center gap-3 hover:border-accent/30 hover:shadow-card-hover transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-bg border border-border-light flex items-center justify-center text-[10px] font-mono text-steel group-hover:text-accent group-hover:border-accent/20 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-frost">{cap.name}</div>
                    <div className="text-[11px] text-steel">{cap.desc}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border group-hover:text-accent transition-colors flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
