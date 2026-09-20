'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const pipeline = [
  { step: 'ORBITAL DATA', desc: 'Real-time telemetry from ground stations' },
  { step: 'SPACE OBJECTS', desc: 'Catalog of 36,500+ tracked objects' },
  { step: 'DIGITAL TWIN', desc: 'Physics-accurate orbital simulation' },
  { step: 'AI WORLD MODEL', desc: 'Predictive intelligence engine' },
  { step: 'MISSION INTELLIGENCE', desc: 'Autonomous decision support' },
]

export function DigitalTwinSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="digital-twin" ref={ref} className="section relative bg-white">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">DIGITAL TWIN</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              A LIVING MODEL{' '}
              <span className="text-accent">OF SPACE.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-mist leading-relaxed max-w-xl">
              Every satellite, every piece of debris, every orbital trajectory — modeled in real-time
              with physics-accurate simulation and AI-powered prediction.
            </motion.p>
          </div>

          {/* Pipeline */}
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border hidden lg:block" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {pipeline.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                  className="relative"
                >
                  <div className="panel p-4 text-center space-y-2 hover:border-accent/30 hover:shadow-card-hover transition-all">
                    <div className="label-mono text-accent">{item.step}</div>
                    <p className="text-[11px] text-steel leading-snug">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Architecture */}
          <motion.div variants={fadeUp} className="panel p-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <span className="status-dot" />
                <span className="label-mono text-accent">SYSTEM ARCHITECTURE</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: 'ORBITAL DB', status: 'ACTIVE', value: '36,512 objects' },
                  { name: 'TWIN ENGINE', status: 'ACTIVE', value: '60 FPS' },
                  { name: 'AI CORE', status: 'ACTIVE', value: 'v3.2.1' },
                  { name: 'SIM ENGINE', status: 'ACTIVE', value: '1,247 runs' },
                ].map((sys) => (
                  <div key={sys.name} className="bg-bg border border-border-light rounded p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="status-dot" />
                      <span className="text-[11px] font-mono font-medium text-frost">{sys.name}</span>
                    </div>
                    <div className="text-[11px] text-steel">{sys.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
