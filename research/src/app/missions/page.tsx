'use client'

import { useState } from 'react'
import { OrbitaShell } from '../../components/layout/orbita-shell'
import { MOCK_MISSIONS, MOCK_SATELLITES } from '../../lib/mock/data'
import { motion, AnimatePresence } from 'motion/react'

const statusStyles: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  simulating: 'bg-accent/10 text-accent',
  active: 'bg-accent/10 text-accent',
  planning: 'bg-surface-secondary text-steel',
  failed: 'bg-danger/10 text-danger',
}

export default function MissionsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const active = MOCK_MISSIONS.find((m) => m.id === selected)

  const handleCreate = () => {
    if (!newName || !newTarget) return
    setToast(`Mission "${newName}" created targeting ${newTarget}`)
    setShowNew(false)
    setNewName('')
    setNewTarget('')
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = (mission: typeof MOCK_MISSIONS[0]) => {
    if (mission.status === 'simulating') {
      setToast(`Monitoring ${mission.id} — Live telemetry active`)
    } else if (mission.status === 'planning') {
      setToast(`Starting ${mission.id} — AI plan generation initiated`)
    } else {
      setToast(`Opening report for ${mission.id}`)
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-navy">Missions</h1>
            <p className="text-[11px] text-steel font-mono mt-0.5">Autonomous mission planning and execution</p>
          </div>
          <button onClick={() => setShowNew(true)} className="bg-accent text-white px-4 py-1.5 text-[11px] font-semibold rounded hover:bg-accent-dim transition-colors">
            + New Mission
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${selected ? 'hidden lg:block' : ''} space-y-2`}>
            <div className="panel p-3">
              <div className="space-y-1.5">
                {MOCK_MISSIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      selected === m.id
                        ? 'border-accent/30 bg-accent/5 shadow-card-hover'
                        : 'border-border-light hover:border-accent/15 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-frost truncate">{m.name}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${statusStyles[m.status]}`}>{m.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-steel">{m.id} · Target: {m.target}</span>
                      <span className="text-[9px] font-mono text-accent">+{m.xp} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`${selected ? '' : 'hidden lg:block'} lg:col-span-2 panel p-6`}>
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold text-navy">{active.name}</h3>
                      <p className="text-[11px] text-steel font-mono mt-0.5">{active.id} · Target: {active.target}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-1 rounded ${statusStyles[active.status]}`}>{active.status}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { l: 'RISK', v: `${active.risk}%`, c: active.risk > 0.1 ? 'text-warning' : 'text-success' },
                      { l: 'XP EARNED', v: `+${active.xp}`, c: 'text-accent' },
                      { l: 'PROGRESS', v: `${active.progress}%`, c: 'text-frost' },
                      { l: 'CREATED', v: new Date(active.created).toLocaleDateString(), c: 'text-steel' },
                    ].map((t) => (
                      <div key={t.l} className="text-center p-3 rounded border border-border-light bg-bg">
                        <div className="label-mono text-[9px] mb-1">{t.l}</div>
                        <div className={`text-[14px] font-semibold font-mono ${t.c}`}>{t.v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="label-mono text-accent text-[10px]">MISSION PHASES</div>
                    {['Target acquired', 'Trajectory validated', 'Approach', 'Inspection', 'Data collection', 'Return to base'].map((step, i) => {
                      const isComplete = i < Math.floor(active.progress / 20)
                      const isCurrent = i === Math.floor(active.progress / 20)
                      return (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="flex flex-col items-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-success' : isCurrent ? 'bg-accent animate-pulse-soft' : 'bg-border'}`} />
                            {i < 5 && <div className="w-px h-4 bg-border-light" />}
                          </div>
                          <span className={`text-[11px] ${isComplete ? 'text-frost' : isCurrent ? 'text-accent' : 'text-steel'}`}>{step}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleAction(active)} className="px-4 py-2 bg-accent text-white text-[11px] font-semibold rounded hover:bg-accent-dim transition-colors">
                      {active.status === 'simulating' ? 'Monitor' : active.status === 'planning' ? 'Start' : 'View Report'}
                    </button>
                    <button onClick={() => setSelected(null)} className="px-4 py-2 bg-bg text-mist text-[11px] font-medium rounded border border-border hover:border-accent/30 transition-colors">
                      Close
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-[12px] text-steel">Select a mission to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Mission Dialog */}
      <AnimatePresence>
        {showNew && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNew(false)} />
            <motion.div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[60] w-full max-w-md" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="bg-white rounded-lg border border-border shadow-elevated p-6 space-y-4">
                <h3 className="text-[14px] font-semibold text-navy">Create New Mission</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label-mono block mb-1">MISSION NAME</label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Satellite Inspection MSN-006" className="w-full px-3 py-2 text-[12px] text-frost bg-bg border border-border rounded outline-none focus:border-accent/40 transition-colors" />
                  </div>
                  <div>
                    <label className="label-mono block mb-1">TARGET</label>
                    <select value={newTarget} onChange={(e) => setNewTarget(e.target.value)} className="w-full px-3 py-2 text-[12px] text-frost bg-bg border border-border rounded outline-none focus:border-accent/40 transition-colors">
                      <option value="">Select target...</option>
                      {MOCK_SATELLITES.map((s) => (
                        <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-[11px] text-mist border border-border rounded hover:border-accent/30 transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={!newName || !newTarget} className="px-3 py-1.5 text-[11px] font-semibold text-white bg-accent rounded hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create Mission</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <div className="hud-element px-4 py-2.5 flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-[11px] font-mono text-frost">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrbitaShell>
  )
}
