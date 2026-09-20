'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  useMissions,
  useOrbitalStates,
  runSimulation,
  type Mission,
  type OrbitalState,
} from '@/lib/api'
import { SpaceScene } from '@/components/space/SpaceScene'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Rocket,
  Timer,
  Gauge,
  Orbit,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react'

const stages = [
  'TARGET ACQUIRED',
  'TRAJECTORY PLANNED',
  'APPROACH',
  'SAFE CORRIDOR',
  'INSPECTION',
  'MISSION COMPLETE',
]

function missionProgress(status: string): number {
  const map: Record<string, number> = {
    DRAFT: 0, PLANNING: 15, VALIDATING: 30, READY: 45, SIMULATING: 70,
    COMPLETED: 100, PAUSED: 70, FAILED: 70, ABORTING: 70, ABORTED: 70,
  }
  return map[status] ?? 0
}

function missionStage(status: string): number {
  const map: Record<string, number> = {
    DRAFT: 0, PLANNING: 1, VALIDATING: 2, READY: 3, SIMULATING: 4, COMPLETED: 5,
  }
  return map[status] ?? 0
}

interface SimulationResult {
  trajectory: { time_s: number; x: number; y: number; z: number }[]
  total_delta_v_ms: number
  duration_seconds: number
  fuel_consumed_kg: number
}

function VectorReadout({ label, values, unit }: { label: string; values: number[]; unit: string }) {
  return (
    <div className="space-y-1">
      <div className="label-mono text-[8px] text-accent">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <div key={axis} className="text-center p-1.5 rounded bg-bg border border-border-light">
            <div className="text-[7px] font-mono text-steel">{axis}</div>
            <div className="text-[10px] font-mono font-semibold text-frost tabular-nums">
              {values[i]?.toFixed(2) ?? '—'}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[8px] font-mono text-steel text-center">{unit}</div>
    </div>
  )
}

function StageProgress({ currentStage }: { currentStage: number }) {
  return (
    <div className="space-y-1">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                i < currentStage
                  ? 'bg-success border-success'
                  : i === currentStage
                    ? 'bg-accent border-accent animate-pulse'
                    : 'bg-transparent border-border'
              }`}
            />
            {i < stages.length - 1 && (
              <div
                className={`absolute top-2.5 left-1/2 -translate-x-1/2 w-px h-3 ${
                  i < currentStage ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </div>
          <span className={`text-[9px] font-mono ${i <= currentStage ? 'text-frost' : 'text-steel'}`}>
            {stage}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SimulationPage() {
  const { missions, isLoading } = useMissions({ limit: 50 })
  const [selectedMission, setSelectedMission] = useState<string | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [timeScale, setTimeScale] = useState(1)
  const [simElapsed, setSimElapsed] = useState(0)
  const [simError, setSimError] = useState<string | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const active = missions.find((m) => m.id === selectedMission)
  const activeStage = active ? missionStage(active.status) : 0

  const { states: robotStates } = useOrbitalStates(active?.robot_id ?? null)
  const { states: targetStates } = useOrbitalStates(active?.target_id ?? null)

  const robotLatest = robotStates[0] ?? null
  const targetLatest = targetStates[0] ?? null

  const canRun = selectedMission && robotLatest && targetLatest && !simRunning

  const handleRunSimulation = useCallback(async () => {
    if (!selectedMission || !robotLatest || !targetLatest) return
    setSimRunning(true)
    setSimError(null)
    setSimResult(null)
    setSimElapsed(0)

    elapsedRef.current = setInterval(() => {
      setSimElapsed((prev) => prev + 1)
    }, 1000)

    try {
      const result = await runSimulation({
        mission_id: selectedMission,
        robot_state: {
          position_km: [robotLatest.position_x_km, robotLatest.position_y_km, robotLatest.position_z_km],
          velocity_kms: [robotLatest.velocity_x_kms, robotLatest.velocity_y_kms, robotLatest.velocity_z_kms],
        },
        target_state: {
          position_km: [targetLatest.position_x_km, targetLatest.position_y_km, targetLatest.position_z_km],
          velocity_kms: [targetLatest.velocity_x_kms, targetLatest.velocity_y_kms, targetLatest.velocity_z_kms],
        },
        duration_seconds: 7200,
        time_step_seconds: 10,
      })
      setSimResult(result.data)
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      if (elapsedRef.current) clearInterval(elapsedRef.current)
      setSimRunning(false)
    }
  }, [selectedMission, robotLatest, targetLatest])

  const handleReset = useCallback(() => {
    setSimResult(null)
    setSimElapsed(0)
    setSimError(null)
    if (elapsedRef.current) clearInterval(elapsedRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Main viewport */}
      <div className="w-full h-[45vh] min-h-[280px] relative overflow-hidden">
        <SpaceScene
          interactive={false}
          showHUD
          altitude={robotLatest?.altitude_km ?? 408}
          velocity={7.66}
          objectsTracked={missions.length}
          collisionRisk="LOW"
          activeMissions={missions.filter((m) => m.status === 'SIMULATING').length || 1}
        />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </div>

      {/* Controls + Data row */}
      <div className="flex-1 px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left sidebar — Controls */}
        <div className="lg:col-span-3 space-y-3">
          {/* Time scale */}
          <div className="panel p-3">
            <div className="label-mono text-[9px] text-accent mb-2">TIME SCALE</div>
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-steel" />
              <input
                type="range"
                min={0.25}
                max={10}
                step={0.25}
                value={timeScale}
                onChange={(e) => setTimeScale(Number(e.target.value))}
                className="flex-1 h-1 bg-surface-secondary rounded-full appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[11px] font-mono font-semibold text-frost w-10 text-right tabular-nums">{timeScale}×</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="panel p-3">
            <div className="label-mono text-[9px] text-accent mb-2">SIMULATION CONTROL</div>
            <div className="flex items-center gap-2">
              <button
                onClick={simRunning ? undefined : handleRunSimulation}
                disabled={!canRun}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  simRunning ? 'bg-accent/50' : 'bg-accent hover:bg-accent/90'
                }`}
              >
                {simRunning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    RUNNING
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    RUN
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={simRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-mist bg-bg border border-border rounded hover:border-accent/30 transition-colors disabled:opacity-30"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </button>
            </div>
            {simElapsed > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-mono text-steel">
                  ELAPSED {Math.floor(simElapsed / 60)}m {String(simElapsed % 60).padStart(2, '0')}s
                </span>
              </div>
            )}
          </div>

          {/* Stage progress */}
          <div className="panel p-3">
            <div className="label-mono text-[9px] text-accent mb-2">MISSION STAGES</div>
            <StageProgress currentStage={activeStage} />
          </div>

          {/* Mission selector */}
          <div className="panel p-3">
            <div className="label-mono text-[9px] text-accent mb-2">SELECT MISSION</div>
            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {isLoading ? (
                <div className="text-[10px] text-steel text-center py-3">Loading...</div>
              ) : missions.length === 0 ? (
                <div className="text-[10px] text-steel text-center py-3">No missions</div>
              ) : (
                missions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMission(m.id)
                      handleReset()
                    }}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      selectedMission === m.id
                        ? 'border-accent/30 bg-accent/5'
                        : 'border-border-light hover:border-accent/15 hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-frost truncate">{m.name}</span>
                      <span className="text-[8px] font-mono text-steel">{missionProgress(m.status)}%</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center — Status / Results */}
        <div className="lg:col-span-5 panel p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4 text-accent" />
              <h2 className="text-[13px] font-semibold text-navy">
                {active ? active.name : 'Simulation Results'}
              </h2>
            </div>
            {active && (
              <span className="text-[9px] font-mono text-steel">{active.id.slice(0, 8)}</span>
            )}
          </div>

          {!active && !simResult && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Orbit className="w-10 h-10 text-border-light mb-3" strokeWidth={1} />
              <p className="text-[12px] text-steel">Select a mission to begin simulation</p>
              <p className="text-[10px] text-steel mt-1">Orbital states will be loaded automatically</p>
            </div>
          )}

          {active && !simResult && (
            <div className="flex-1 space-y-4">
              {/* Mission objective */}
              <div className="bg-bg rounded border border-border-light p-3">
                <div className="label-mono text-[9px] text-accent mb-1">OBJECTIVE</div>
                <p className="text-[11px] text-frost leading-relaxed">{active.objective}</p>
              </div>

              {/* Telemetry readouts */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">STAGE</div>
                  <div className="text-[13px] font-semibold font-mono text-frost">{activeStage + 1}/{stages.length}</div>
                </div>
                <div className="text-center p-2 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">PRIORITY</div>
                  <div className="text-[13px] font-semibold font-mono text-accent">{active.priority}</div>
                </div>
                <div className="text-center p-2 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">PROGRESS</div>
                  <div className="text-[13px] font-semibold font-mono text-frost">{missionProgress(active.status)}%</div>
                </div>
              </div>

              {!robotLatest && !targetLatest && (
                <div className="bg-warning/5 border border-warning/20 rounded p-3 text-center">
                  <p className="text-[10px] text-warning">No orbital state data available for this mission</p>
                  <p className="text-[9px] text-steel mt-1">Ensure robot and target objects have orbital states</p>
                </div>
              )}

              {simError && (
                <div className="bg-danger/5 border border-danger/20 rounded p-3">
                  <p className="text-[10px] text-danger font-medium">Simulation Error</p>
                  <p className="text-[9px] text-steel mt-1">{simError}</p>
                </div>
              )}
            </div>
          )}

          {simResult && (
            <div className="flex-1 space-y-4">
              <div className="bg-success/5 border border-success/20 rounded p-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-[11px] font-semibold text-success">Simulation Complete</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2.5 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">DELTA-V</div>
                  <div className="text-[14px] font-semibold font-mono text-accent tabular-nums">
                    {simResult.total_delta_v_ms.toFixed(2)}
                  </div>
                  <div className="text-[8px] font-mono text-steel">m/s</div>
                </div>
                <div className="text-center p-2.5 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">DURATION</div>
                  <div className="text-[14px] font-semibold font-mono text-frost tabular-nums">
                    {(simResult.duration_seconds / 3600).toFixed(1)}
                  </div>
                  <div className="text-[8px] font-mono text-steel">hours</div>
                </div>
                <div className="text-center p-2.5 rounded border border-border-light bg-bg">
                  <div className="label-mono text-[8px] mb-1">FUEL</div>
                  <div className="text-[14px] font-semibold font-mono text-frost tabular-nums">
                    {simResult.fuel_consumed_kg.toFixed(1)}
                  </div>
                  <div className="text-[8px] font-mono text-steel">kg</div>
                </div>
              </div>

              {/* Trajectory preview */}
              {simResult.trajectory && simResult.trajectory.length > 0 && (
                <div className="bg-bg rounded border border-border-light p-3">
                  <div className="label-mono text-[9px] text-accent mb-2">TRAJECTORY DATA</div>
                  <div className="max-h-[120px] overflow-y-auto space-y-1">
                    {simResult.trajectory.slice(0, 12).map((pt, i) => (
                      <div key={i} className="flex items-center gap-3 text-[9px] font-mono">
                        <span className="text-steel w-12 tabular-nums">T+{pt.time_s}s</span>
                        <span className="text-frost tabular-nums">X:{pt.x.toFixed(1)}</span>
                        <span className="text-frost tabular-nums">Y:{pt.y.toFixed(1)}</span>
                        <span className="text-frost tabular-nums">Z:{pt.z.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-bg text-mist text-[10px] font-medium rounded border border-border hover:border-accent/30 transition-colors"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar — Orbital data */}
        <div className="lg:col-span-4 space-y-3">
          {/* Robot state */}
          <div className="panel p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Rocket className="w-3.5 h-3.5 text-accent" />
              <div className="label-mono text-[9px] text-accent">ROBOT STATE</div>
            </div>
            {robotLatest ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">ALT</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{robotLatest.altitude_km.toFixed(1)} km</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">INC</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{robotLatest.inclination_deg.toFixed(2)}°</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">ECC</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{robotLatest.eccentricity.toFixed(4)}</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">OBJ</div>
                    <div className="text-[11px] font-mono font-semibold text-accent">{robotLatest.space_object_id.slice(0, 6)}</div>
                  </div>
                </div>
                <VectorReadout label="POSITION" values={[robotLatest.position_x_km, robotLatest.position_y_km, robotLatest.position_z_km]} unit="km" />
                <VectorReadout label="VELOCITY" values={[robotLatest.velocity_x_kms, robotLatest.velocity_y_kms, robotLatest.velocity_z_kms]} unit="km/s" />
              </div>
            ) : (
              <div className="text-[10px] text-steel text-center py-3">No data</div>
            )}
          </div>

          {/* Target state */}
          <div className="panel p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-warning" />
              <div className="label-mono text-[9px] text-warning">TARGET STATE</div>
            </div>
            {targetLatest ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">ALT</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{targetLatest.altitude_km.toFixed(1)} km</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">INC</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{targetLatest.inclination_deg.toFixed(2)}°</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">ECC</div>
                    <div className="text-[11px] font-mono font-semibold text-frost tabular-nums">{targetLatest.eccentricity.toFixed(4)}</div>
                  </div>
                  <div className="p-1.5 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel">OBJ</div>
                    <div className="text-[11px] font-mono font-semibold text-warning">{targetLatest.space_object_id.slice(0, 6)}</div>
                  </div>
                </div>
                <VectorReadout label="POSITION" values={[targetLatest.position_x_km, targetLatest.position_y_km, targetLatest.position_z_km]} unit="km" />
                <VectorReadout label="VELOCITY" values={[targetLatest.velocity_x_kms, targetLatest.velocity_y_kms, targetLatest.velocity_z_kms]} unit="km/s" />
              </div>
            ) : (
              <div className="text-[10px] text-steel text-center py-3">No data</div>
            )}
          </div>

          {/* Relative state */}
          {robotLatest && targetLatest && (
            <div className="panel p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Gauge className="w-3.5 h-3.5 text-frost" />
                <div className="label-mono text-[9px] text-frost">RELATIVE STATE</div>
              </div>
              {(() => {
                const dx = targetLatest.position_x_km - robotLatest.position_x_km
                const dy = targetLatest.position_y_km - robotLatest.position_y_km
                const dz = targetLatest.position_z_km - robotLatest.position_z_km
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
                return (
                  <div className="p-2 rounded bg-bg border border-border-light text-center">
                    <div className="text-[8px] font-mono text-steel mb-0.5">SEPARATION</div>
                    <div className="text-[16px] font-mono font-bold text-frost tabular-nums">{dist.toFixed(1)}</div>
                    <div className="text-[8px] font-mono text-steel">km</div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
