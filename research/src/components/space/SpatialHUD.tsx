'use client'

interface SpatialHUDProps {
  altitude?: number
  velocity?: number
  objectsTracked?: number
  collisionRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  activeMissions?: number
  className?: string
}

const riskColors: Record<string, string> = {
  LOW: 'text-success',
  MEDIUM: 'text-warning',
  HIGH: 'text-danger',
  CRITICAL: 'text-danger',
}

const riskBg: Record<string, string> = {
  LOW: 'bg-success/10 border-success/20',
  MEDIUM: 'bg-warning/10 border-warning/20',
  HIGH: 'bg-danger/10 border-danger/20',
  CRITICAL: 'bg-danger/10 border-danger/20',
}

function HudValue({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-mono font-medium tracking-[0.1em] text-steel uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-[13px] font-mono font-semibold text-frost tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[8px] font-mono text-steel uppercase">{unit}</span>
        )}
      </div>
    </div>
  )
}

export function SpatialHUD({
  altitude = 408,
  velocity = 7.66,
  objectsTracked = 247,
  collisionRisk = 'LOW',
  activeMissions = 12,
  className,
}: SpatialHUDProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 ${className ?? ''}`}
    >
      {/* Top-left telemetry block */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[9px] font-mono font-medium tracking-[0.15em] text-accent uppercase">
            MISSION TELEMETRY
          </span>
        </div>
        <div className="space-y-3 pl-3 border-l border-accent/20">
          <HudValue label="ALTITUDE" value={altitude.toFixed(1)} unit="KM" />
          <HudValue label="VELOCITY" value={velocity.toFixed(2)} unit="KM/S" />
        </div>
      </div>

      {/* Top-right status block */}
      <div className="absolute top-4 right-4 text-right">
        <div className="flex items-center justify-end gap-1.5 mb-3">
          <span className="text-[9px] font-mono font-medium tracking-[0.15em] text-steel uppercase">
            SPACE SITUATION AWARENESS
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
        </div>
        <div className="space-y-3 pr-3 border-r border-accent/20">
          <HudValue label="OBJECTS TRACKED" value={objectsTracked} />
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[8px] font-mono font-medium tracking-[0.1em] text-steel uppercase">
              COLLISION RISK
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${riskColors[collisionRisk]} ${riskBg[collisionRisk]}`}
            >
              {collisionRisk}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-left active missions */}
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[8px] font-mono font-medium tracking-[0.1em] text-steel uppercase">
            ACTIVE MISSIONS
          </span>
        </div>
        <span className="text-[18px] font-mono font-bold text-frost tabular-nums pl-3">
          {activeMissions}
        </span>
      </div>

      {/* Bottom-right timestamp */}
      <div className="absolute bottom-4 right-4 text-right">
        <span className="text-[8px] font-mono text-steel tracking-wider">
          UTC {new Date().toISOString().replace('T', ' ').slice(0, 19)}
        </span>
      </div>

      {/* Corner brackets */}
      <svg className="absolute top-3 left-3 w-3 h-3 text-accent/30" viewBox="0 0 12 12">
        <path d="M0 4 L0 0 L4 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute top-3 right-3 w-3 h-3 text-accent/30" viewBox="0 0 12 12">
        <path d="M8 0 L12 0 L12 4" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-3 h-3 text-accent/30" viewBox="0 0 12 12">
        <path d="M0 8 L0 12 L4 12" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-3 h-3 text-accent/30" viewBox="0 0 12 12">
        <path d="M8 12 L12 12 L12 8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}
