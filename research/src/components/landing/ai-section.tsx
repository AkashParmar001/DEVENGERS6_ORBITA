'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const commands = [
  'Inspect SAT-102 using ORBITAL-03',
  'Plan debris removal CR-7',
  'Dock with ISS module',
  'Survey LEO constellation',
]

const pipeline = [
  { step: 'TARGET IDENTIFIED', time: '0.2s' },
  { step: 'ENVIRONMENT ANALYZED', time: '0.8s' },
  { step: 'TRAJECTORY GENERATED', time: '1.4s' },
  { step: 'RISK CHECK COMPLETE', time: '1.9s' },
  { step: 'MISSION READY', time: '2.3s' },
]

export function AISection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [commandIndex, setCommandIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    if (!isInView) return
    const cmd = commands[commandIndex]
    let i = 0
    setTyped('')
    setActiveStep(-1)

    const typeInterval = setInterval(() => {
      if (i <= cmd.length) {
        setTyped(cmd.slice(0, i))
        i++
      } else {
        clearInterval(typeInterval)
        let step = 0
        const stepInterval = setInterval(() => {
          setActiveStep(step)
          step++
          if (step >= pipeline.length) {
            clearInterval(stepInterval)
            setTimeout(() => setCommandIndex((p) => (p + 1) % commands.length), 2500)
          }
        }, 350)
      }
    }, 60)

    return () => clearInterval(typeInterval)
  }, [commandIndex, isInView])

  return (
    <section id="intelligence" ref={ref} className="section relative bg-bg">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">AI INTELLIGENCE</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              COMMAND THE MISSION.<br />
              <span className="text-accent">LET AI PLAN THE PATH.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Command input */}
            <motion.div variants={fadeUp} className="panel p-5 space-y-3">
              <div className="flex items-center gap-2 label-mono text-accent">
                <span className="text-accent">&rsaquo;</span> ORBITA COMMAND INTERFACE
              </div>

              <div className="bg-bg border border-border-light rounded p-3 font-mono text-[13px]">
                <span className="text-accent">&gt;</span>{' '}
                <span className="text-frost">{typed}</span>
                <span className="inline-block w-px h-3.5 bg-accent/60 ml-0.5 animate-blink" />
              </div>

              <div className="space-y-1">
                {pipeline.map((step, i) => (
                  <div
                    key={step.step}
                    className={`flex items-center justify-between py-1.5 px-2.5 rounded text-[12px] font-mono transition-all duration-200 ${
                      i <= activeStep
                        ? 'bg-accent/5 text-frost border border-accent/15'
                        : 'text-steel'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {i <= activeStep ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-border" />
                      )}
                      {step.step}
                    </span>
                    <span className="text-[10px] text-steel">{step.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Result panel */}
            <motion.div variants={fadeUp} className="panel p-5 space-y-4">
              <div className="flex items-center gap-2 label-mono text-success">
                <span className="text-success">&#9679;</span> MISSION PLAN GENERATED
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'TARGET', v: 'SAT-102' },
                  { l: 'ORBIT', v: 'LEO 548km' },
                  { l: 'EST. DURATION', v: '4h 32m' },
                  { l: 'RISK', v: '0.02%', c: 'text-success' },
                ].map((item) => (
                  <div key={item.l} className="bg-bg border border-border-light rounded p-3">
                    <div className="label-mono mb-1">{item.l}</div>
                    <div className={`value-mono text-[12px] ${item.c || ''}`}>{item.v}</div>
                  </div>
                ))}
              </div>

              <div className="bg-bg border border-border-light rounded p-3">
                <div className="label-mono mb-2">TRAJECTORY</div>
                <div className="h-16 bg-surface-secondary rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 60">
                    <path d="M 20 45 Q 100 15 200 30 T 380 20" fill="none" stroke="#176B9E" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="20" cy="45" r="3" fill="#176B9E" />
                    <circle cx="380" cy="20" r="3" fill="#2E8B62" />
                  </svg>
                </div>
              </div>

              <button className="w-full bg-accent text-white px-4 py-2 text-[12px] font-semibold rounded hover:bg-accent-dim transition-colors duration-150">
                Execute Mission Plan
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
