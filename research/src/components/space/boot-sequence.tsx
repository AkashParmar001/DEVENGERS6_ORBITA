'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'

const steps = [
  { label: 'INITIALIZING SPACE ENVIRONMENT', delay: 0 },
  { label: 'LOADING ORBITAL DATA', delay: 200 },
  { label: 'CONNECTING MISSION SYSTEMS', delay: 400 },
  { label: 'INITIALIZING SIMULATION ENGINE', delay: 600 },
  { label: 'CONNECTING TELEMETRY', delay: 800 },
]

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    steps.forEach((step, i) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i])
        if (i === steps.length - 1) {
          setTimeout(() => {
            setDone(true)
            setTimeout(onComplete, 400)
          }, 400)
        }
      }, step.delay + 120)
    })
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: '#0A1118' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="max-w-sm w-full space-y-8 px-6">
            {/* Logo */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="opacity-80">
                  <circle cx="14" cy="14" r="4" stroke="#2C9EDB" strokeWidth="1" fill="none" />
                  <ellipse cx="14" cy="14" rx="13" ry="6" stroke="#2C9EDB" strokeWidth="0.5" fill="none" opacity="0.4" transform="rotate(-20 14 14)" />
                  <ellipse cx="14" cy="14" rx="13" ry="6" stroke="#2C9EDB" strokeWidth="0.5" fill="none" opacity="0.25" transform="rotate(35 14 14)" />
                  <circle cx="14" cy="14" r="1.5" fill="#2C9EDB" />
                </svg>
                <span className="text-[18px] font-semibold tracking-[0.15em] text-white/90" style={{ fontFamily: "'Inter', sans-serif" }}>
                  ORBITA
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/30">
                AUTONOMOUS SPACE INFRASTRUCTURE
              </p>
            </motion.div>

            {/* Progress steps */}
            <div className="space-y-1.5">
              {steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="flex items-center gap-3 text-[11px] font-mono"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: completedSteps.includes(i) ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <span className={`w-3 text-right ${completedSteps.includes(i) ? 'text-[#2C9EDB]' : 'text-white/15'}`}>
                    {completedSteps.includes(i) ? '▸' : '·'}
                  </span>
                  <span className={completedSteps.includes(i) ? 'text-white/70' : 'text-white/20'}>
                    {step.label}
                  </span>
                  {completedSteps.includes(i) && (
                    <motion.span
                      className="text-[#2E8B62] text-[9px]"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      OK
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Ready message */}
            {completedSteps.length === steps.length && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded border border-[#2C9EDB]/20 bg-[#2C9EDB]/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B62] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#2C9EDB] tracking-wider">SYSTEM READY</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
