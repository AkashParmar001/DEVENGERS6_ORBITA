'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState } from 'react'

const experiments = [
  { id: 'EXP-001', name: 'Conjunction Alert Latency', status: 'completed', result: 'PASS', risk: 0.01, date: '2026-09-10' },
  { id: 'EXP-002', name: 'Autonomous Docking Speed', status: 'completed', result: 'PASS', risk: 0.02, date: '2026-09-12' },
  { id: 'EXP-003', name: 'Fuel Consumption Model', status: 'running', result: 'PENDING', risk: 0.04, date: '2026-09-18' },
  { id: 'EXP-004', name: 'Multi-Agent Coordination', status: 'queued', result: 'PENDING', risk: 0.06, date: '2026-09-22' },
  { id: 'EXP-005', name: 'Debris Avoidance Timing', status: 'completed', result: 'PASS', risk: 0.03, date: '2026-09-14' },
]

const statusBadge: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  running: 'bg-accent/10 text-accent',
  queued: 'bg-surface-secondary text-steel',
}

const resultBadge: Record<string, string> = {
  PASS: 'text-success',
  FAIL: 'text-danger',
  PENDING: 'text-steel',
}

export default function ExperimentsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const active = experiments.find((e) => e.id === selected)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Experiment list */}
        <div className={`${selected ? 'hidden lg:block' : ''} space-y-2`}>
          <div className="panel p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[12px] font-semibold text-navy">Experiments</h2>
              <span className="text-[9px] font-mono text-steel bg-bg px-1.5 py-0.5 rounded">{experiments.length}</span>
            </div>
            <div className="space-y-1.5">
              {experiments.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelected(e.id)}
                  className={`w-full text-left p-2.5 rounded border transition-all ${
                    selected === e.id
                      ? 'border-accent/30 bg-accent/5 shadow-card-hover'
                      : 'border-border-light hover:border-accent/15 hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-frost truncate">{e.name}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${statusBadge[e.status]}`}>{e.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-mono text-steel">{e.id}</span>
                    <span className={`text-[9px] font-mono font-semibold ${resultBadge[e.result]}`}>{e.result}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className={`${selected ? '' : 'hidden lg:block'} lg:col-span-2 panel p-5`}>
          {active ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-navy">{active.name}</h3>
                  <p className="text-[11px] text-steel font-mono mt-0.5">{active.id} · {active.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusBadge[active.status]}`}>{active.status}</span>
                  <span className={`text-[11px] font-semibold font-mono ${resultBadge[active.result]}`}>{active.result}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'RISK', v: `${active.risk}%`, c: active.risk > 0.05 ? 'text-warning' : 'text-success' },
                  { l: 'STATUS', v: active.status.toUpperCase(), c: active.status === 'running' ? 'text-accent' : 'text-frost' },
                  { l: 'RESULT', v: active.result, c: resultBadge[active.result] },
                ].map((t) => (
                  <div key={t.l} className="text-center p-2.5 rounded border border-border-light bg-bg">
                    <div className="label-mono text-[9px] mb-1">{t.l}</div>
                    <div className={`text-[14px] font-semibold font-mono ${t.c}`}>{t.v}</div>
                  </div>
                ))}
              </div>

              {active.status === 'running' && (
                <div className="panel p-4 bg-accent/3 border border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-mono text-accent">RUNNING</span>
                  </div>
                  <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1.5 }} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="label-mono text-accent text-[10px]">EXPERIMENT LOG</div>
                {['Initialization', 'Parameter sweep', active.status === 'running' ? 'In progress...' : 'Complete'].map((step, i) => {
                  const done = i < (active.status === 'running' ? 2 : 3)
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <div className={`w-1 h-1 rounded-full ${done ? 'bg-success' : 'bg-border'}`} />
                      <span className={done ? 'text-frost' : 'text-steel'}>{step}</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-accent text-white text-[11px] font-semibold rounded hover:bg-accent-dim transition-colors">
                  {active.status === 'running' ? 'Monitor' : active.status === 'queued' ? 'Start' : 'View Results'}
                </button>
                <button onClick={() => setSelected(null)} className="px-3 py-1.5 bg-bg text-mist text-[11px] font-medium rounded border border-border hover:border-accent/30 transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-10 h-10 rounded bg-bg border border-border-light flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-steel"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <p className="text-[12px] text-steel">Select an experiment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
