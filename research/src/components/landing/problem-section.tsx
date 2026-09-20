'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const stats = [
  { value: '36,500+', label: 'TRACKED OBJECTS', note: 'in low earth orbit' },
  { value: '12,000+', label: 'ACTIVE SATELLITES', note: 'and growing' },
  { value: 'HIGH', label: 'ORBITAL DEBRIS', note: 'of all tracked objects' },
  { value: 'INCREASING', label: 'MISSION COMPLEXITY', note: 'year over year' },
]

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="platform" ref={ref} className="section relative bg-white">
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">THE CHALLENGE</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              SPACE IS BECOMING{' '}
              <span className="text-accent">AN OPERATING ENVIRONMENT.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-mist leading-relaxed max-w-xl">
              As orbital infrastructure scales from thousands to millions of objects,
              autonomous intelligence becomes the only viable path to safe operations.
            </motion.p>
          </div>

          <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="bg-white p-5 lg:p-6 space-y-2">
                <div className="text-xl lg:text-2xl font-semibold text-navy font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="label-mono text-accent">{stat.label}</div>
                <div className="text-[11px] text-steel">{stat.note}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="space-y-3 pt-4">
            {['MORE SPACECRAFT', 'MORE TRAFFIC', 'MORE DEBRIS', 'MORE COMPLEXITY'].map((phrase, i) => (
              <motion.div
                key={phrase}
                initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="text-display-md font-semibold text-border/60 hover:text-navy transition-colors duration-300 cursor-default"
              >
                {phrase}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
