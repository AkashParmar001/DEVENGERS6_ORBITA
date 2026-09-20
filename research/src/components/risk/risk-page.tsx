'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  useSatellites,
  useRobots,
  useOrbitalStates,
  assessCollisionRisk,
  type Satellite,
  type Robot,
  type OrbitalState,
} from '@/lib/api'
import { SpaceScene } from '@/components/space/SpaceScene'
import {
  AlertTriangle,
  Shield,
  ChevronDown,
  Crosshair,
  Activity,
  Ruler,
  FileText,
  Zap,
} from 'lucide-react'

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  negligible: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  high: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
  critical: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
}

interface RiskResult {
  risk_level: string
  probability: number
  minimum_distance_km: number
  assessment: string
}

function ProbabilityGauge({ probability, riskLevel }: { probability: number; riskLevel: string }) {
  const pct = Math.min(probability * 100, 100)
  const r = 44
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const offset = arc - (pct / 100) * arc
  const cfg = severityConfig[riskLevel] ?? severityConfig.negligible

  return (
    <div className="relative w-[120px] h-[100px] mx-auto">
      <svg width="120" height="100" viewBox="0 0 120 100">
        {/* Background arc */}
        <path
          d="M 15 85 A 44 44 0 1 1 105 85"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-border-light"
        />
        {/* Active arc */}
        <path
          d="M 15 85 A 44 44 0 1 1 105 85"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={arc}
          strokeDashoffset={offset}
          className={cfg.color}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="60" y="52" textAnchor="middle" className="text-[16px] font-mono font-bold fill-frost">
          {pct < 0.01 ? '<0.01' : pct.toFixed(2)}
        </text>
        <text x="60" y="66" textAnchor="middle" className="text-[9px] font-mono fill-steel">
          % PROB
        </text>
      </svg>
    </div>
  )
}

function OrbitalParams({ state, label, color }: { state: OrbitalState | null; label: string; color: string }) {
  if (!state) {
    return (
      <div className="p-2.5 rounded border border-border-light bg-bg text-center">
        <div className="text-[10px] text-steel">No orbital data</div>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <div className="label-mono text-[9px]" style={{ color }}>{label}</div>
      <div className="grid grid-cols-2 gap-1">
        {[
          { l: 'ALT', v: `${state.altitude_km.toFixed(1)} km` },
          { l: 'INC', v: `${state.inclination_deg.toFixed(2)}°` },
          { l: 'ECC', v: state.eccentricity.toFixed(4) },
          { l: 'ID', v: state.space_object_id.slice(0, 8) },
        ].map((p) => (
          <div key={p.l} className="p-1.5 rounded bg-bg border border-border-light">
            <div className="text-[7px] font-mono text-steel">{p.l}</div>
            <div className="text-[10px] font-mono font-semibold text-frost tabular-nums">{p.v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <div className="label-mono text-[8px] text-steel">POSITION (km)</div>
        <div className="grid grid-cols-3 gap-1">
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="text-center p-1 rounded bg-bg border border-border-light">
              <div className="text-[7px] font-mono text-steel">{axis}</div>
              <div className="text-[9px] font-mono font-semibold text-frost tabular-nums">
                {[state.position_x_km, state.position_y_km, state.position_z_km][i]?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ObjectDropdown({
  label,
  color,
  objects,
  selectedId,
  onSelect,
}: {
  label: string
  color: string
  objects: { id: string; name: string; type: string }[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = objects.find((o) => o.id === selectedId)

  return (
    <div className="relative">
      <div className="label-mono text-[9px] mb-1" style={{ color }}>{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2 rounded border border-border-light bg-bg hover:border-accent/20 transition-colors text-left"
      >
        <span className={`text-[11px] font-medium ${selected ? 'text-frost' : 'text-steel'}`}>
          {selected ? selected.name : 'Select object...'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-steel transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full left-0 right-0 mt-1 max-h-[160px] overflow-y-auto bg-surface border border-border-light rounded shadow-lg"
          >
            <button
              onClick={() => { onSelect(null); setOpen(false) }}
              className="w-full text-left p-2 text-[10px] text-steel hover:bg-surface-secondary transition-colors border-b border-border-light"
            >
              Clear selection
            </button>
            {objects.map((obj) => (
              <button
                key={obj.id}
                onClick={() => { onSelect(obj.id); setOpen(false) }}
                className={`w-full text-left p-2 hover:bg-surface-secondary transition-colors flex items-center justify-between ${
                  selectedId === obj.id ? 'bg-accent/5' : ''
                }`}
              >
                <span className="text-[10px] font-medium text-frost">{obj.name}</span>
                <span className="text-[8px] font-mono text-steel">{obj.type}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RiskPage() {
  const { satellites } = useSatellites({ limit: 50 })
  const { robots } = useRobots({ limit: 50 })
  const [selectedA, setSelectedA] = useState<string | null>(null)
  const [selectedB, setSelectedB] = useState<string | null>(null)
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { states: statesA, latest: latestA } = useOrbitalStates(selectedA)
  const { states: statesB, latest: latestB } = useOrbitalStates(selectedB)

  const allObjects = useMemo(
    () => [
      ...satellites.map((s) => ({ id: s.space_object_id, name: s.space_objects.name, type: 'SAT' })),
      ...robots.map((r) => ({ id: r.space_object_id, name: r.space_objects.name, type: 'ROB' })),
    ],
    [satellites, robots],
  )

  const handleAssessRisk = useCallback(async () => {
    if (!latestA || !latestB || selectedA === selectedB) return
    setLoading(true)
    setError(null)
    try {
      const result = await assessCollisionRisk({
        object_a: {
          position_km: [latestA.position_x_km, latestA.position_y_km, latestA.position_z_km],
          velocity_kms: [latestA.velocity_x_kms, latestA.velocity_y_kms, latestA.velocity_z_kms],
        },
        object_b: {
          position_km: [latestB.position_x_km, latestB.position_y_km, latestB.position_z_km],
          velocity_kms: [latestB.velocity_x_kms, latestB.velocity_y_kms, latestB.velocity_z_kms],
        },
        time_horizon_seconds: 3600,
      })
      setRiskResult(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed')
    } finally {
      setLoading(false)
    }
  }, [latestA, latestB, selectedA, selectedB])

  const riskCfg = riskResult ? severityConfig[riskResult.risk_level] ?? severityConfig.negligible : null

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* SpaceScene banner */}
      <div className="w-full h-[35vh] min-h-[240px] relative overflow-hidden">
        <SpaceScene
          interactive={false}
          showHUD
          altitude={latestA?.altitude_km ?? 408}
          velocity={7.66}
          objectsTracked={allObjects.length}
          collisionRisk={riskResult ? (riskResult.risk_level.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') : 'LOW'}
          activeMissions={0}
        />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left panel — Object selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="panel p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Crosshair className="w-4 h-4 text-accent" />
              <h2 className="text-[12px] font-semibold text-navy">Object Selection</h2>
            </div>

            <div className="space-y-3">
              <ObjectDropdown
                label="OBJECT A (CHASER)"
                color="#176B9E"
                objects={allObjects}
                selectedId={selectedA}
                onSelect={setSelectedA}
              />
              <ObjectDropdown
                label="OBJECT B (TARGET)"
                color="#B7791F"
                objects={allObjects}
                selectedId={selectedB}
                onSelect={setSelectedB}
              />
            </div>

            {selectedA === selectedB && selectedA && (
              <p className="text-[9px] text-warning mt-2 text-center">Select two different objects</p>
            )}

            {/* Orbital params preview */}
            <div className="mt-3 space-y-2">
              <OrbitalParams state={latestA} label="CHASER ORBIT" color="#176B9E" />
              <OrbitalParams state={latestB} label="TARGET ORBIT" color="#B7791F" />
            </div>

            <button
              onClick={handleAssessRisk}
              disabled={!selectedA || !selectedB || loading || selectedA === selectedB || !latestA || !latestB}
              className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-danger text-white text-[11px] font-semibold rounded hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Assessing...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  ASSESS COLLISION RISK
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right panel — Results */}
        <div className="lg:col-span-8 panel p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <h2 className="text-[13px] font-semibold text-navy">Risk Assessment</h2>
            </div>
            {riskResult && (
              <button
                onClick={() => setRiskResult(null)}
                className="text-[10px] text-steel hover:text-frost transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {riskResult && riskCfg ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="flex-1 space-y-4"
              >
                {/* Risk level badge */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${riskCfg.bg} ${riskCfg.border}`}>
                    <AlertTriangle className={`w-4 h-4 ${riskCfg.color}`} />
                    <span className={`text-[12px] font-semibold uppercase ${riskCfg.color}`}>
                      {riskResult.risk_level}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-steel">
                    T+3600s horizon
                  </span>
                </div>

                {/* Gauge + Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Probability gauge */}
                  <div className="bg-bg rounded-lg border border-border-light p-4 flex flex-col items-center justify-center">
                    <div className="label-mono text-[9px] text-accent mb-2">COLLISION PROBABILITY</div>
                    <ProbabilityGauge probability={riskResult.probability} riskLevel={riskResult.risk_level} />
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg border border-border-light bg-bg">
                      <div className="label-mono text-[8px] mb-1">PROBABILITY</div>
                      <div className={`text-[20px] font-mono font-bold tabular-nums ${riskCfg.color}`}>
                        {(riskResult.probability * 100).toFixed(4)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-border-light bg-bg">
                      <div className="label-mono text-[8px] mb-1">MINIMUM DISTANCE</div>
                      <div className="text-[20px] font-mono font-bold text-frost tabular-nums">
                        {riskResult.minimum_distance_km.toFixed(2)}
                        <span className="text-[10px] font-normal text-steel ml-1">km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Probability bar */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-steel">Collision Probability</span>
                    <span className="font-mono text-frost">{(riskResult.probability * 100).toFixed(4)}%</span>
                  </div>
                  <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${riskCfg.color === 'text-danger' ? 'bg-danger' : riskCfg.color === 'text-warning' ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${Math.min(riskResult.probability * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Assessment text */}
                <div className="bg-bg rounded-lg border border-border-light p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <div className="label-mono text-[9px] text-accent">ASSESSMENT</div>
                  </div>
                  <p className="text-[11px] text-frost leading-relaxed">{riskResult.assessment}</p>
                </div>

                {/* Distance visualization */}
                <div className="bg-bg rounded-lg border border-border-light p-3">
                  <div className="label-mono text-[9px] text-accent mb-2">ENCOUNTER GEOMETRY</div>
                  <div className="flex items-center justify-center gap-6 py-3">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto">
                        <span className="text-[10px] font-bold text-accent">A</span>
                      </div>
                      <div className="text-[8px] font-mono text-steel mt-1">CHASER</div>
                    </div>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-px bg-border relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-[8px] font-mono text-frost bg-bg px-1">
                          {riskResult.minimum_distance_km.toFixed(0)} km
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-warning/10 border-2 border-warning flex items-center justify-center mx-auto">
                        <span className="text-[10px] font-bold text-warning">B</span>
                      </div>
                      <div className="text-[8px] font-mono text-steel mt-1">TARGET</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12"
              >
                <div className="relative w-16 h-16 mb-4">
                  <AlertTriangle className="w-16 h-16 text-border-light" strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-steel" />
                  </div>
                </div>
                <p className="text-[13px] text-frost font-medium">No risk assessment yet</p>
                <p className="text-[10px] text-steel mt-1">Select two objects and assess collision risk</p>
                <p className="text-[9px] text-steel mt-0.5">Uses deterministic Keplerian propagation</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-3 bg-danger/5 border border-danger/20 rounded p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
              <span className="text-[10px] text-danger">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
