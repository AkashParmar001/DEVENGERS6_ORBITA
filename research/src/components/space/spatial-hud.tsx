'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Satellite } from '../../lib/api/types'

interface SpatialHUDProps {
  hoveredSatellite: Satellite | null
  selectedSatellite: Satellite | null
  onDeselect?: () => void
}

export function SpatialHUD({ hoveredSatellite, selectedSatellite, onDeselect }: SpatialHUDProps) {
  const sat = selectedSatellite || hoveredSatellite

  return (
    <>
      {/* Fixed HUD overlay - top-left */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="hud-element px-3 py-2 space-y-1">
          <div className="technical-label text-accent">ORBITAL ENVIRONMENT</div>
          <div className="text-[10px] font-mono text-steel">
            OBJECTS TRACKED: 36,512
          </div>
        </div>
      </div>

      {/* Bottom-left status */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="hud-element px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span className="text-[9px] font-mono text-success">LIVE</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span className="text-[9px] font-mono text-steel tabular-nums">
            {new Date().toISOString().slice(11, 19)} UTC
          </span>
        </div>
      </div>

      {/* Satellite info panel */}
      <AnimatePresence>
        {sat && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="hud-element px-4 py-3 min-w-[200px] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${sat.status === 'nominal' ? 'bg-success' : sat.status === 'warning' ? 'bg-warning' : 'bg-danger'}`} />
                  <span className="text-[11px] font-semibold text-navy">{sat.id}</span>
                </div>
                {selectedSatellite && onDeselect && (
                  <button onClick={onDeselect} className="text-[9px] text-steel hover:text-frost transition-colors">✕</button>
                )}
              </div>
              <div className="space-y-1">
                {[
                  { l: 'TYPE', v: sat.type.toUpperCase() },
                  { l: 'ALT', v: `${sat.orbit.altitude} km` },
                  { l: 'VEL', v: `${Math.sqrt(sat.velocity.x ** 2 + sat.velocity.y ** 2 + sat.velocity.z ** 2).toFixed(2)} km/s` },
                  { l: 'HEALTH', v: `${sat.health}%` },
                  { l: 'INCL', v: `${sat.orbit.inclination}°` },
                ].map((t) => (
                  <div key={t.l} className="flex items-center justify-between gap-4">
                    <span className="technical-label">{t.l}</span>
                    <span className="value-mono text-[10px]">{t.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent/20 pointer-events-none" />
    </>
  )
}
