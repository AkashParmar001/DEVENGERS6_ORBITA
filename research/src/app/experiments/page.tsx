'use client'

import { OrbitaShell } from '../../components/layout/orbita-shell'
import { MOCK_MISSIONS } from '../../lib/mock/data'

const statusBadge: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  simulating: 'bg-accent/10 text-accent',
  planning: 'bg-surface-secondary text-steel',
}

export default function ExperimentsPage() {
  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-[16px] font-semibold text-navy">Experiments</h1>
          <p className="text-[11px] text-steel font-mono mt-0.5">Batch simulation runs and policy benchmarking</p>
        </div>

        <div className="space-y-2">
          {MOCK_MISSIONS.map((m) => (
            <div key={m.id} className="panel p-4 flex items-center gap-4 hover:border-accent/15 hover:shadow-card-hover transition-all">
              <div className="w-8 h-8 rounded bg-bg border border-border-light flex items-center justify-center text-[10px] font-mono text-steel">
                {m.id.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-frost">{m.name}</div>
                <div className="text-[9px] text-steel font-mono">{m.id} · Target: {m.target}</div>
              </div>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusBadge[m.status]}`}>{m.status}</span>
              <span className="text-[10px] font-mono text-frost">{m.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </OrbitaShell>
  )
}
