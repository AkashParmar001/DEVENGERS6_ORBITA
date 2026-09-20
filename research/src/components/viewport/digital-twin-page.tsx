'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  useSatellites,
  useRobots,
  useOrbitalStates,
  type Satellite as SatelliteType,
  type Robot,
  type OrbitalState,
} from '@/lib/api'
import { SpaceScene } from '@/components/space/SpaceScene'
import {
  Globe,
  Rocket,
  Radio,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  Satellite as SatelliteIcon,
  Cpu,
  X,
  Info,
  Crosshair,
} from 'lucide-react'

interface LayerToggle {
  id: string
  label: string
  icon: typeof Globe
  enabled: boolean
}

function ObjectListItem({
  name,
  type,
  isSelected,
  onClick,
}: {
  name: string
  type: string
  isSelected: boolean
  onClick: () => void
}) {
  const TypeIcon = type === 'SAT' ? SatelliteIcon : Cpu
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-2 rounded border transition-all text-left ${
        isSelected
          ? 'border-accent/30 bg-accent/5'
          : 'border-transparent hover:bg-surface-secondary hover:border-border-light'
      }`}
    >
      <TypeIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-steel'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium text-frost truncate">{name}</div>
        <div className="text-[8px] font-mono text-steel">{type}</div>
      </div>
      {isSelected && <ChevronRight className="w-3 h-3 text-accent flex-shrink-0" />}
    </button>
  )
}

function OrbitalParamsCompact({ state }: { state: OrbitalState | null }) {
  if (!state) return <div className="text-[10px] text-steel py-2">No orbital data</div>
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1">
        {[
          { l: 'ALT', v: `${state.altitude_km.toFixed(1)}`, u: 'km' },
          { l: 'INC', v: `${state.inclination_deg.toFixed(2)}`, u: '°' },
          { l: 'ECC', v: state.eccentricity.toFixed(4), u: '' },
        ].map((p) => (
          <div key={p.l} className="p-1.5 rounded bg-bg border border-border-light text-center">
            <div className="text-[7px] font-mono text-steel">{p.l}</div>
            <div className="text-[10px] font-mono font-semibold text-frost tabular-nums">{p.v}</div>
            {p.u && <div className="text-[7px] font-mono text-steel">{p.u}</div>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[
          { l: 'PX', v: state.position_x_km.toFixed(0) },
          { l: 'PY', v: state.position_y_km.toFixed(0) },
          { l: 'PZ', v: state.position_z_km.toFixed(0) },
        ].map((p) => (
          <div key={p.l} className="text-center p-1 rounded bg-bg border border-border-light">
            <div className="text-[7px] font-mono text-steel">{p.l}</div>
            <div className="text-[9px] font-mono font-semibold text-frost tabular-nums">{p.v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[
          { l: 'VX', v: state.velocity_x_kms.toFixed(2) },
          { l: 'VY', v: state.velocity_y_kms.toFixed(2) },
          { l: 'VZ', v: state.velocity_z_kms.toFixed(2) },
        ].map((p) => (
          <div key={p.l} className="text-center p-1 rounded bg-bg border border-border-light">
            <div className="text-[7px] font-mono text-steel">{p.l}</div>
            <div className="text-[9px] font-mono font-semibold text-frost tabular-nums">{p.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DigitalTwinPage() {
  const { satellites } = useSatellites({ limit: 50 })
  const { robots } = useRobots({ limit: 50 })
  const [selectedObj, setSelectedObj] = useState<string | null>(null)
  const [showObjectList, setShowObjectList] = useState(true)
  const [layers, setLayers] = useState<LayerToggle[]>([
    { id: 'orbital', label: 'Orbital Paths', icon: Layers, enabled: true },
    { id: 'satellites', label: 'Satellites', icon: SatelliteIcon, enabled: true },
    { id: 'debris', label: 'Debris Field', icon: Globe, enabled: false },
    { id: 'trajectories', label: 'Trajectories', icon: Crosshair, enabled: true },
  ])

  const { states: selectedStates, latest: selectedLatest } = useOrbitalStates(selectedObj)

  const allObjects = useMemo(
    () => [
      ...satellites.map((s) => ({
        id: s.space_object_id,
        name: s.space_objects.name,
        type: 'SAT' as const,
        noradId: s.norad_id,
        satType: s.satellite_type,
        status: s.space_objects.status,
      })),
      ...robots.map((r) => ({
        id: r.space_object_id,
        name: r.space_objects.name,
        type: 'ROB' as const,
        manufacturer: r.manufacturer,
        autonomy: r.autonomy_level,
        status: r.space_objects.status,
      })),
    ],
    [satellites, robots],
  )

  const selectedInfo = useMemo(() => allObjects.find((o) => o.id === selectedObj) ?? null, [allObjects, selectedObj])

  const toggleLayer = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)))
  }, [])

  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObj(id)
  }, [])

  const totalTracked = allObjects.length
  const activeSatellites = satellites.filter((s) => s.space_objects.status === 'active').length

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Full-viewport SpaceScene */}
      <div className="fixed inset-0 z-0">
        <SpaceScene
          interactive={true}
          showHUD
          altitude={selectedLatest?.altitude_km ?? 408}
          velocity={7.66}
          objectsTracked={totalTracked}
          collisionRisk="LOW"
          activeMissions={activeSatellites}
        />
      </div>

      {/* Floating control panel — top-right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="fixed top-4 right-4 z-20 w-[180px]"
      >
        <div className="bg-surface/90 backdrop-blur-md border border-border-light rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border-light">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-semibold text-navy">LAYERS</span>
          </div>
          <div className="p-2 space-y-0.5">
            {layers.map((layer) => {
              const Icon = layer.icon
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
                    layer.enabled
                      ? 'bg-accent/5 text-frost'
                      : 'text-steel hover:bg-surface-secondary'
                  }`}
                >
                  {layer.enabled ? (
                    <Eye className="w-3 h-3 text-accent" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  <span className="text-[10px] font-medium flex-1 text-left">{layer.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Floating info panel — bottom-left */}
      <AnimatePresence>
        {selectedInfo && selectedLatest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 left-4 z-20 w-[260px]"
          >
            <div className="bg-surface/90 backdrop-blur-md border border-border-light rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
                <div className="flex items-center gap-1.5">
                  {selectedInfo.type === 'SAT' ? (
                    <SatelliteIcon className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                  )}
                  <span className="text-[11px] font-semibold text-navy">{selectedInfo.name}</span>
                </div>
                <button
                  onClick={() => setSelectedObj(null)}
                  className="p-0.5 rounded hover:bg-surface-secondary transition-colors"
                >
                  <X className="w-3 h-3 text-steel" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-mono">
                  <span className="text-steel">TYPE</span>
                  <span className="text-frost">{selectedInfo.type === 'SAT' ? 'Satellite' : 'Robot'}</span>
                  <span className="text-steel ml-auto">STATUS</span>
                  <span className="text-success">{selectedInfo.status}</span>
                </div>
                {selectedInfo.type === 'SAT' && (
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="text-steel">NORAD</span>
                    <span className="text-frost">{selectedInfo.noradId}</span>
                  </div>
                )}
                {selectedInfo.type === 'ROB' && (
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="text-steel">MFR</span>
                    <span className="text-frost">{selectedInfo.manufacturer}</span>
                    <span className="text-steel ml-auto">AUTO</span>
                    <span className="text-frost">{selectedInfo.autonomy}%</span>
                  </div>
                )}
                <div className="divider" />
                <OrbitalParamsCompact state={selectedLatest} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Object list panel — left side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="fixed top-20 left-4 z-20 w-[220px]"
      >
        <div className="bg-surface/90 backdrop-blur-md border border-border-light rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-semibold text-navy">TRACKED OBJECTS</span>
            </div>
            <span className="text-[9px] font-mono text-steel">{totalTracked}</span>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-1.5 space-y-0.5">
            {allObjects.length === 0 ? (
              <div className="text-[10px] text-steel text-center py-4">No objects found</div>
            ) : (
              allObjects.map((obj) => (
                <ObjectListItem
                  key={obj.id}
                  name={obj.name}
                  type={obj.type}
                  isSelected={selectedObj === obj.id}
                  onClick={() => handleSelectObject(selectedObj === obj.id ? null : obj.id)}
                />
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Bottom status bar */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="bg-surface/90 backdrop-blur-md border border-border-light rounded-lg shadow-lg px-3 py-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-mono text-steel">LIVE</span>
          </div>
          <div className="text-[9px] font-mono text-steel">
            <span className="text-frost">{totalTracked}</span> objects
          </div>
          <div className="text-[9px] font-mono text-steel">
            <span className="text-accent">{activeSatellites}</span> active
          </div>
          <div className="text-[9px] font-mono text-steel">
            UTC {new Date().toISOString().replace('T', ' ').slice(0, 19)}
          </div>
        </div>
      </div>
    </div>
  )
}
