'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

const agents = [
  { id: 'ORBITAL-01', role: 'INSPECTION', status: 'ACTIVE' },
  { id: 'ORBITAL-02', role: 'SERVICING', status: 'STANDBY' },
  { id: 'ORBITAL-03', role: 'REFUELING', status: 'ACTIVE' },
  { id: 'ORBITAL-04', role: 'DEBRIS', status: 'DEPLOYED' },
]

const eventLog = [
  { time: '14:32:01', event: 'ANOMALY DETECTED', type: 'alert' },
  { time: '14:32:02', event: 'ORBITA INTELLIGENCE', type: 'process' },
  { time: '14:32:03', event: 'TASK ALLOCATION', type: 'process' },
  { time: '14:32:04', event: 'ORBITAL-02 DEPLOYED', type: 'action' },
]

export function MultiAgentSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="section relative bg-bg">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <motion.p variants={fadeUp} className="label-mono text-accent">MULTI-AGENT OPERATIONS</motion.p>
            <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
              ONE ROBOT IS A TOOL.<br />
              <span className="text-accent">A NETWORK IS INFRASTRUCTURE.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Agent cards */}
            <motion.div variants={fadeUp} className="space-y-2">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="panel p-3 flex items-center gap-3 hover:border-accent/30 hover:shadow-card-hover transition-all"
                >
                  <div className="w-8 h-8 rounded bg-bg border border-border-light flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-success' : agent.status === 'DEPLOYED' ? 'bg-accent' : 'bg-border'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-frost">{agent.id}</div>
                    <div className="text-[10px] text-steel">{agent.role}</div>
                  </div>
                  <span className={`text-[10px] font-mono ${agent.status === 'ACTIVE' ? 'text-success' : agent.status === 'DEPLOYED' ? 'text-accent' : 'text-steel'}`}>
                    {agent.status}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Event log */}
            <motion.div variants={fadeUp} className="panel p-5">
              <div className="flex items-center gap-2 label-mono text-warning mb-3">
                <span className="text-warning">&#9679;</span> EVENT LOG
              </div>
              <div className="space-y-0">
                {eventLog.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2 border-b border-border-light last:border-0">
                    <span className="text-[10px] font-mono text-steel w-16 flex-shrink-0">{item.time}</span>
                    <span className={`text-[11px] font-mono ${item.type === 'alert' ? 'text-warning' : item.type === 'action' ? 'text-accent' : 'text-mist'}`}>
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border-light text-[10px] font-mono text-steel">
                Network: <span className="text-success">4 agents</span> · <span className="text-accent">2 active</span> · <span className="text-mist">1 standby</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
