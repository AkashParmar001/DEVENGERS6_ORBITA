'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  useMissions,
  useMission,
  useMissionEvents,
  transitionMission,
  type Mission,
  type MissionEvent,
} from '@/lib/api'
import { SpaceScene } from '@/components/space/SpaceScene'
import {
  Rocket,
  Target,
  AlertTriangle,
  Pause,
  CheckCircle2,
  ArrowLeft,
  Orbit,
  Clock,
  Flag,
  ChevronRight,
} from 'lucide-react'

const statusColors: Record<string, string> = {
  COMPLETED: 'text-success',
  SIMULATING: 'text-accent',
  DRAFT: 'text-steel',
  PLANNING: 'text-accent',
  VALIDATING: 'text-warning',
  READY: 'text-success',
  PAUSED: 'text-warning',
  FAILED: 'text-danger',
  ABORTING: 'text-danger',
  ABORTED: 'text-danger',
}

const statusBg: Record<string, string> = {
  COMPLETED: 'bg-success/10 border-success/20',
  SIMULATING: 'bg-accent/10 border-accent/20',
  DRAFT: 'bg-surface-secondary border-border-light',
  PLANNING: 'bg-accent/10 border-accent/20',
  VALIDATING: 'bg-warning/10 border-warning/20',
  READY: 'bg-success/10 border-success/20',
  PAUSED: 'bg-warning/10 border-warning/20',
  FAILED: 'bg-danger/10 border-danger/20',
  ABORTING: 'bg-danger/10 border-danger/20',
  ABORTED: 'bg-danger/10 border-danger/20',
}

const statusLabel: Record<string, string> = {
  COMPLETED: 'completed',
  SIMULATING: 'active',
  DRAFT: 'draft',
  PLANNING: 'planning',
  VALIDATING: 'validating',
  READY: 'ready',
  PAUSED: 'paused',
  FAILED: 'failed',
  ABORTING: 'aborting',
  ABORTED: 'aborted',
}

function missionProgress(m: Mission): number {
  const map: Record<string, number> = {
    DRAFT: 0,
    PLANNING: 15,
    VALIDATING: 30,
    READY: 45,
    SIMULATING: 70,
    COMPLETED: 100,
    PAUSED: 70,
    FAILED: 70,
    ABORTING: 70,
    ABORTED: 70,
  }
  return map[m.status] ?? 0
}

function ProgressRing({ progress, size = 36 }: { progress: number; size?: number }) {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="2" className="text-border-light" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={progress === 100 ? 'text-success' : 'text-accent'}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className="text-[8px] font-mono fill-frost">
        {progress}
      </text>
    </svg>
  )
}

function TimelineDot({ event, isLast }: { event: MissionEvent; isLast: boolean }) {
  const color =
    event.severity === 'success'
      ? 'bg-success'
      : event.severity === 'warning'
        ? 'bg-warning'
        : event.severity === 'critical'
          ? 'bg-danger'
          : 'bg-accent'
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${color} mt-1.5`} />
        {!isLast && <div className="w-px h-full min-h-[20px] bg-border-light" />}
      </div>
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] ${
              event.severity === 'success'
                ? 'text-success'
                : event.severity === 'warning'
                  ? 'text-warning'
                  : event.severity === 'critical'
                    ? 'text-danger'
                    : 'text-frost'
            }`}
          >
            {event.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-mono text-steel">{event.event_type}</span>
          <span className="text-[9px] font-mono text-steel">
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}

function MissionCard({
  mission,
  isSelected,
  onClick,
}: {
  mission: Mission
  isSelected: boolean
  onClick: () => void
}) {
  const progress = missionProgress(mission)
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-[200px] p-3 rounded-lg border text-left transition-all ${
        isSelected
          ? 'border-accent/30 bg-accent/5 shadow-[0_0_20px_rgba(23,107,158,0.08)]'
          : 'border-border-light bg-surface hover:border-accent/15 hover:bg-surface-secondary'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${statusBg[mission.status]} ${statusColors[mission.status]}`}>
          {statusLabel[mission.status] || mission.status.toLowerCase()}
        </span>
        <ProgressRing progress={progress} size={28} />
      </div>
      <h3 className="text-[11px] font-semibold text-frost truncate">{mission.name}</h3>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[9px] font-mono text-steel">{mission.id.slice(0, 8)}</span>
        <span className="text-[9px] font-mono text-accent">P{mission.priority}</span>
      </div>
      {mission.target_id && (
        <div className="flex items-center gap-1 mt-1.5">
          <Target className="w-2.5 h-2.5 text-steel" />
          <span className="text-[8px] font-mono text-steel">{mission.target_id.slice(0, 8)}</span>
        </div>
      )}
    </button>
  )
}

function MissionDetail({
  mission,
  events,
  onClose,
}: {
  mission: Mission
  events: MissionEvent[]
  onClose: () => void
}) {
  const [acting, setActing] = useState<string | null>(null)

  const handleTransition = useCallback(
    async (action: string) => {
      setActing(action)
      try {
        await transitionMission(mission.id, action)
      } catch {
        /* silent — SWR will revalidate */
      } finally {
        setActing(null)
      }
    },
    [mission.id],
  )

  const progress = missionProgress(mission)

  const actions: { label: string; action: string; icon: typeof Rocket; color: string; enabled: boolean }[] = [
    { label: 'PLAN', action: 'plan', icon: Target, color: 'bg-accent hover:bg-accent/90', enabled: mission.status === 'DRAFT' },
    { label: 'VALIDATE', action: 'validate', icon: CheckCircle2, color: 'bg-accent hover:bg-accent/90', enabled: mission.status === 'PLANNING' },
    { label: 'SIMULATE', action: 'simulate', icon: Rocket, color: 'bg-accent hover:bg-accent/90', enabled: mission.status === 'VALIDATING' || mission.status === 'READY' },
    { label: 'PAUSE', action: 'pause', icon: Pause, color: 'bg-warning hover:bg-warning/90', enabled: mission.status === 'SIMULATING' },
    { label: 'ABORT', action: 'abort', icon: AlertTriangle, color: 'bg-danger hover:bg-danger/90', enabled: ['SIMULATING', 'PAUSED', 'PLANNING', 'VALIDATING', 'READY'].includes(mission.status) },
  ]

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-surface border-l border-border-light shadow-[−20px_0_60px_rgba(0,0,0,0.15)] z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[10px] font-medium text-steel hover:text-frost transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK
        </button>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusBg[mission.status]} ${statusColors[mission.status]}`}>
          {statusLabel[mission.status]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-[15px] font-semibold text-navy">{mission.name}</h2>
          <p className="text-[10px] font-mono text-steel mt-1">{mission.id}</p>
        </div>

        {/* Objective */}
        <div className="bg-bg rounded-lg border border-border-light p-3">
          <div className="label-mono text-[9px] text-accent mb-1.5">OBJECTIVE</div>
          <p className="text-[11px] text-frost leading-relaxed">{mission.objective}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg border border-border-light bg-bg">
            <div className="label-mono text-[8px] mb-1">STATUS</div>
            <div className={`text-[12px] font-semibold font-mono ${statusColors[mission.status]}`}>{mission.status}</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border border-border-light bg-bg">
            <div className="label-mono text-[8px] mb-1">PRIORITY</div>
            <div className="text-[12px] font-semibold font-mono text-accent">{mission.priority}</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border border-border-light bg-bg">
            <div className="label-mono text-[8px] mb-1">PROGRESS</div>
            <div className="text-[12px] font-semibold font-mono text-frost">{progress}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-success' : 'bg-accent'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[9px] font-mono text-steel">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {mission.created_at?.slice(0, 10)}
          </span>
          {mission.started_at && (
            <span className="flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              Started {mission.started_at.slice(0, 10)}
            </span>
          )}
          {mission.target_id && (
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              Target {mission.target_id.slice(0, 8)}
            </span>
          )}
        </div>

        {/* Events */}
        {events.length > 0 && (
          <div>
            <div className="label-mono text-[10px] text-accent mb-3">EVENTS TIMELINE</div>
            <div className="space-y-0">
              {events.slice(0, 10).map((e, i) => (
                <TimelineDot key={e.id} event={e} isLast={i === events.slice(0, 10).length - 1} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div>
          <div className="label-mono text-[10px] text-steel mb-2">MISSION ACTIONS</div>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.action}
                  onClick={() => handleTransition(a.action)}
                  disabled={!a.enabled || acting !== null}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${a.color}`}
                >
                  {acting === a.action ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-16 h-16 mb-4">
        <Orbit className="w-16 h-16 text-border-light" strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-steel" />
        </div>
      </div>
      <p className="text-[13px] text-frost font-medium">No mission selected</p>
      <p className="text-[10px] text-steel mt-1">Choose a mission from the timeline below to view details</p>
    </motion.div>
  )
}

export default function MissionsPage() {
  const { missions, total, isLoading, isError } = useMissions({ limit: 50 })
  const [selected, setSelected] = useState<string | null>(null)
  const { mission: active } = useMission(selected)
  const { events } = useMissionEvents(selected)

  if (isError) {
    return (
      <div className="panel p-5 text-center">
        <AlertTriangle className="w-5 h-5 text-danger mx-auto mb-2" />
        <p className="text-[12px] text-danger font-medium">Failed to load missions</p>
        <p className="text-[10px] text-steel mt-1">Ensure the NestJS backend is running on port 4000</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* SpaceScene banner */}
      <div className="w-full h-[30vh] min-h-[220px] relative overflow-hidden rounded-b-xl">
        <SpaceScene showHUD altitude={408} velocity={7.66} objectsTracked={total} collisionRisk="LOW" activeMissions={total} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-accent" />
            <h1 className="text-[14px] font-semibold text-navy">Mission Timeline</h1>
          </div>
          <span className="text-[10px] font-mono text-steel bg-surface-secondary px-2 py-0.5 rounded">
            {isLoading ? 'Loading...' : `${total} missions`}
          </span>
        </div>

        {/* Horizontal timeline */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          {isLoading ? (
            <div className="flex items-center gap-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[200px] h-[110px] rounded-lg border border-border-light bg-surface animate-pulse" />
              ))}
            </div>
          ) : missions.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-[11px] text-steel">No missions found</p>
            </div>
          ) : (
            <div className="flex items-stretch gap-3 py-2">
              {missions.map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  isSelected={selected === m.id}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail area */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="panel p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <h2 className="text-[13px] font-semibold text-navy">{active.name}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[10px] text-steel hover:text-frost transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="p-2.5 rounded border border-border-light bg-bg text-center">
                  <div className="label-mono text-[8px] mb-1">STATUS</div>
                  <div className={`text-[12px] font-semibold font-mono ${statusColors[active.status]}`}>{active.status}</div>
                </div>
                <div className="p-2.5 rounded border border-border-light bg-bg text-center">
                  <div className="label-mono text-[8px] mb-1">PRIORITY</div>
                  <div className="text-[12px] font-semibold font-mono text-accent">{active.priority}</div>
                </div>
                <div className="p-2.5 rounded border border-border-light bg-bg text-center">
                  <div className="label-mono text-[8px] mb-1">PROGRESS</div>
                  <div className="text-[12px] font-semibold font-mono text-frost">{missionProgress(active)}%</div>
                </div>
                <div className="p-2.5 rounded border border-border-light bg-bg text-center">
                  <div className="label-mono text-[8px] mb-1">EVENTS</div>
                  <div className="text-[12px] font-semibold font-mono text-frost">{events.length}</div>
                </div>
              </div>

              <p className="text-[11px] text-steel mb-3 leading-relaxed">{active.objective}</p>

              {/* Inline actions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'PLAN', action: 'plan', enabled: active.status === 'DRAFT' },
                  { label: 'VALIDATE', action: 'validate', enabled: active.status === 'PLANNING' },
                  { label: 'SIMULATE', action: 'simulate', enabled: active.status === 'VALIDATING' || active.status === 'READY' },
                  { label: 'PAUSE', action: 'pause', enabled: active.status === 'SIMULATING' },
                  { label: 'ABORT', action: 'abort', enabled: ['SIMULATING', 'PAUSED', 'PLANNING', 'VALIDATING', 'READY'].includes(active.status) },
                ].map((a) => (
                  <button
                    key={a.action}
                    onClick={() => handleInlineTransition(active.id, a.action)}
                    disabled={!a.enabled}
                    className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-semibold rounded border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {events.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-light">
                  <div className="label-mono text-[9px] text-accent mb-2">RECENT EVENTS</div>
                  <div className="space-y-1.5">
                    {events.slice(0, 4).map((e) => (
                      <div key={e.id} className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.severity === 'success'
                              ? 'bg-success'
                              : e.severity === 'warning'
                                ? 'bg-warning'
                                : e.severity === 'critical'
                                  ? 'bg-danger'
                                  : 'bg-accent'
                          }`}
                        />
                        <span className="text-[10px] text-frost flex-1 truncate">{e.title}</span>
                        <span className="text-[9px] font-mono text-steel">{e.event_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>

      {/* Slide-in detail panel */}
      <AnimatePresence>
        {active && (
          <MissionDetail
            mission={active}
            events={events}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/20 backdrop-blur-[2px] z-30"
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

async function handleInlineTransition(id: string, action: string) {
  try {
    await transitionMission(id, action)
  } catch {
    /* SWR revalidates */
  }
}
