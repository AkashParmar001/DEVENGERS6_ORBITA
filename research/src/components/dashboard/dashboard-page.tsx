'use client'

import { Rocket, Radio, Satellite, Bot, Activity, ChevronRight } from 'lucide-react'
import { SpaceScene } from '@/components/space/SpaceScene'
import { GaugeBar } from '../ui/gauge-bar'
import { useMissions, useSatellites, useRobots, useBackendHealth, useIntelligenceHealth } from '@/lib/api'

function missionProgress(status: string): number {
  const map: Record<string, number> = {
    DRAFT: 0, PLANNING: 15, VALIDATING: 30, READY: 45, SIMULATING: 70,
    COMPLETED: 100, PAUSED: 70, FAILED: 70, ABORTING: 70, ABORTED: 70,
  }
  return map[status] ?? 0
}

function StatusDot({ status }: { status: 'ok' | 'error' | 'loading' }) {
  const color = status === 'ok' ? 'bg-success' : status === 'error' ? 'bg-danger' : 'bg-warning'
  const pulse = status === 'ok' ? 'animate-pulse' : ''
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} ${pulse}`} />
}

export default function DashboardPage() {
  const { missions, total: missionTotal, isLoading: missionsLoading } = useMissions({ limit: 50 })
  const { satellites, total: satTotal } = useSatellites({ limit: 50 })
  const { robots, total: robTotal } = useRobots({ limit: 50 })
  const { health } = useBackendHealth()
  const { intelligence } = useIntelligenceHealth()

  const completedCount = missions.filter((m) => m.status === 'COMPLETED').length
  const activeCount = missions.filter(
    (m) => m.status === 'SIMULATING' || m.status === 'PLANNING' || m.status === 'VALIDATING'
  ).length
  const recentMissions = missions.slice(0, 5)

  const backendStatus = health?.status === 'ok' ? 'ok' : health === null ? 'loading' : 'error'
  const intelStatus = intelligence?.status === 'ok' ? 'ok' : intelligence === null ? 'loading' : 'error'

  const latestMission = missions[0]
  const latestEvent = latestMission
    ? { title: latestMission.name, severity: latestMission.status, time: latestMission.created_at }
    : null

  return (
    <div className="space-y-4">
      {/* ── Full-width Orbital Viewport ── */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-navy" style={{ height: 'clamp(340px, 52vh, 560px)' }}>
        <SpaceScene
          interactive
          showHUD
          className="w-full h-full"
          altitude={health ? 408 : 408}
          velocity={7.66}
          objectsTracked={satTotal || 36512}
          collisionRisk={activeCount > 3 ? 'MEDIUM' : 'LOW'}
          activeMissions={activeCount || missionTotal}
        />

        {/* ── Floating Panels: Bottom-left (Missions) ── */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
          <div className="bg-navy/80 backdrop-blur-md border border-white/8 rounded-lg p-3 w-64">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-mono font-medium tracking-wider text-white/60 uppercase">Missions</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 tabular-nums">{missionTotal} total</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2.5">
              {[
                { label: 'Active', value: activeCount, color: 'text-accent' },
                { label: 'Completed', value: completedCount, color: 'text-success' },
                { label: 'Failed', value: missions.filter((m) => m.status === 'FAILED').length, color: 'text-danger' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg font-mono font-semibold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] font-mono text-white/30 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="divider bg-white/8 my-2" />

            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {recentMissions.length === 0 && !missionsLoading && (
                <p className="text-[10px] text-white/30 text-center py-2">No missions</p>
              )}
              {recentMissions.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-1">
                  <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                    m.status === 'COMPLETED' ? 'bg-success' :
                    m.status === 'SIMULATING' ? 'bg-accent' :
                    m.status === 'FAILED' ? 'bg-danger' : 'bg-white/30'
                  }`} />
                  <span className="text-[10px] text-white/70 truncate flex-1">{m.name}</span>
                  <span className="text-[9px] font-mono text-white/40 tabular-nums">{missionProgress(m.status)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Floating Panels: Bottom-right (System Health) ── */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <div className="bg-navy/80 backdrop-blur-md border border-white/8 rounded-lg p-3 w-56">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Radio className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-mono font-medium tracking-wider text-white/60 uppercase">System Health</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={backendStatus} />
                  <span className="text-[10px] text-white/60">NestJS Backend</span>
                </div>
                <span className={`text-[9px] font-mono ${backendStatus === 'ok' ? 'text-success' : 'text-danger'}`}>
                  {backendStatus === 'ok' ? 'ONLINE' : backendStatus === 'loading' ? 'CHECKING' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={intelStatus} />
                  <span className="text-[10px] text-white/60">Python Intelligence</span>
                </div>
                <span className={`text-[9px] font-mono ${intelStatus === 'ok' ? 'text-success' : 'text-warning'}`}>
                  {intelStatus === 'ok' ? 'ONLINE' : intelStatus === 'loading' ? 'CHECKING' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status="ok" />
                  <span className="text-[10px] text-white/60">Supabase</span>
                </div>
                <span className="text-[9px] font-mono text-success">ONLINE</span>
              </div>

              {health && (
                <div className="pt-1.5 mt-1.5 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-white/30">Uptime</span>
                    <span className="text-[9px] font-mono text-white/50 tabular-nums">{Math.round(health.uptime)}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Scanline overlay ── */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />
      </div>

      {/* ── Bottom Data Strip: 4-column grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Satellites */}
        <div className="panel p-4 hover:border-accent/20 hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-icon" />
              <span className="label-mono">SATELLITES</span>
            </div>
            <span className="status-dot" />
          </div>
          <p className="text-xl font-mono font-semibold text-navy tabular-nums mb-1">{satTotal}</p>
          <p className="text-[10px] text-steel font-mono">tracked objects in orbit</p>
          <div className="mt-3">
            <GaugeBar value={Math.min(satTotal * 10, 100)} color="accent" size="sm" showLabel={false} />
          </div>
        </div>

        {/* Robots */}
        <div className="panel p-4 hover:border-accent/20 hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-icon" />
              <span className="label-mono">ROBOTS</span>
            </div>
            <span className="status-dot" />
          </div>
          <p className="text-xl font-mono font-semibold text-navy tabular-nums mb-1">{robTotal}</p>
          <p className="text-[10px] text-steel font-mono">active robotic units</p>
          <div className="mt-3">
            <GaugeBar value={Math.min(robTotal * 20, 100)} color="success" size="sm" showLabel={false} />
          </div>
        </div>

        {/* Telemetry */}
        <div className="panel p-4 hover:border-accent/20 hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-icon" />
              <span className="label-mono">TELEMETRY</span>
            </div>
            <span className={`text-[9px] font-mono ${health?.status === 'ok' ? 'text-success' : 'text-steel'}`}>
              {health?.status === 'ok' ? 'LIVE' : 'N/A'}
            </span>
          </div>
          {satellites.length > 0 ? (
            <div>
              <p className="text-lg font-mono font-semibold text-navy tabular-nums mb-1">
                {satellites[0].space_objects?.name || 'N/A'}
              </p>
              <p className="text-[10px] text-steel font-mono">{satellites[0].satellite_type}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-mono font-semibold text-navy mb-1">--</p>
              <p className="text-[10px] text-steel font-mono">No telemetry data</p>
            </div>
          )}
          <div className="mt-3">
            <GaugeBar value={health?.status === 'ok' ? 95 : 0} color="success" size="sm" showLabel={false} />
          </div>
        </div>

        {/* Events */}
        <div className="panel p-4 hover:border-accent/20 hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-icon" />
              <span className="label-mono">EVENTS</span>
            </div>
          </div>
          {latestEvent ? (
            <div>
              <p className="text-lg font-mono font-semibold text-navy truncate mb-1">{latestEvent.title}</p>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  latestEvent.severity === 'COMPLETED' ? 'bg-success' :
                  latestEvent.severity === 'FAILED' ? 'bg-danger' :
                  latestEvent.severity === 'SIMULATING' ? 'bg-accent' : 'bg-warning'
                }`} />
                <span className="text-[10px] text-steel font-mono">{latestEvent.severity}</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-mono font-semibold text-navy mb-1">--</p>
              <p className="text-[10px] text-steel font-mono">No recent events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
