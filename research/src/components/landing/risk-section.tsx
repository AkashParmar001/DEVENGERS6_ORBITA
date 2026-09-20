'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

export function RiskSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>('A')

  return (
    <section ref={ref} className="section relative bg-white">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">RISK INTELLIGENCE</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              EVERY ACTION HAS A <span className="text-accent">RISK MODEL.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk visualization */}
            <motion.div variants={fadeUp} className="panel p-5 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-2 label-mono text-warning">
                  <span className="text-warning">&#9679;</span> COLLISION PROBABILITY MODEL
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-steel">PROBABILITY</span>
                    <span className="text-success">0.023%</span>
                  </div>
                  <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '23%' } : {}}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>

                <div className="bg-bg border border-border-light rounded p-3">
                  <div className="label-mono mb-2">TRAJECTORY UNCERTAINTY</div>
                  <div className="h-28 relative">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <path d="M 50 50 Q 200 15 350 50" fill="none" stroke="#176B9E" strokeWidth="0.8" />
                      <path d="M 50 50 Q 200 30 350 50" fill="none" stroke="#176B9E" strokeWidth="0.4" opacity="0.3" />
                      <path d="M 50 50 Q 200 70 350 50" fill="none" stroke="#176B9E" strokeWidth="0.4" opacity="0.3" />
                      <path d="M 50 50 Q 200 5 350 50" fill="none" stroke="#C94A4A" strokeWidth="0.4" opacity="0.2" strokeDasharray="3 3" />
                      <path d="M 50 50 Q 200 85 350 50" fill="none" stroke="#C94A4A" strokeWidth="0.4" opacity="0.2" strokeDasharray="3 3" />
                      <circle cx="50" cy="50" r="3" fill="#176B9E" />
                      <circle cx="350" cy="50" r="3" fill="#2E8B62" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trajectory options */}
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="label-mono text-accent">TRAJECTORY OPTIONS</div>

              {[
                { id: 'A' as const, label: 'OPTION A', fuel: 'LOW FUEL', exposure: 'HIGHER EXPOSURE', risk: '0.045%', time: '3h 12m' },
                { id: 'B' as const, label: 'OPTION B', fuel: 'MORE FUEL', exposure: 'LOWER EXPOSURE', risk: '0.012%', time: '4h 28m' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left panel p-4 transition-all duration-150 ${
                    selectedOption === opt.id ? 'border-accent/40 bg-accent/5 shadow-card-hover' : 'hover:border-border hover:shadow-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-mono text-accent">{opt.label}</span>
                    <span className="text-[11px] font-mono text-frost">{opt.risk}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <div className="text-[10px] text-steel">FUEL</div>
                      <div className="font-mono text-frost">{opt.fuel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-steel">EXPOSURE</div>
                      <div className="font-mono text-frost">{opt.exposure}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border-light text-[10px] font-mono text-steel">EST. TIME: {opt.time}</div>
                </button>
              ))}

              <button className="w-full bg-accent text-white px-4 py-2 text-[12px] font-semibold rounded hover:bg-accent-dim transition-colors duration-150 mt-2">
                Select Trajectory
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
