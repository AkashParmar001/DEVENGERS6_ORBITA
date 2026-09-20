'use client'

export function GaugeBar({ value, max = 100, color = 'accent', size = 'sm', showLabel = true }: { value: number; max?: number; color?: 'accent' | 'success' | 'warning' | 'danger'; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }) {
  const pct = Math.min((value / max) * 100, 100)
  const colorMap = { accent: 'bg-accent', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }
  const heightMap = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-steel">{value} / {max}</span>
          <span className="text-[10px] font-medium text-frost">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-secondary rounded-full overflow-hidden ${heightMap[size]}`}>
        <div className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
