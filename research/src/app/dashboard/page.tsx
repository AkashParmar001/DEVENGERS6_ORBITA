'use client'

import { OrbitaShell } from '../../components/layout/orbita-shell'
import { SpaceScene } from '../../components/space/space-scene'
import { StatCard } from '../../components/ui/stat-card'
import { GaugeBar } from '../../components/ui/gauge-bar'
import { MOCK_MISSIONS, MOCK_AGENTS } from '../../lib/mock/data'

export default function DashboardPage() {
  return (
    <OrbitaShell>
      <div className="space-y-5">
        {/* Main 3D viewport */}
        <div className="space-viz h-[400px] relative">
          <SpaceScene showHUD showDebris showOrbits interactive className="w-full h-full" />
          {/* Floating mission panel */}
          <div className="absolute top-4 left-4 z-10 hud-element px-4 py-3 min-w-[200px] space-y-2">
            <div className="technical-label text-accent">ACTIVE MISSION</div>
            <div className="text-[12px] font-semibold text-frost">Debris Avoidance CR-7</div>
            <div className="space-y-1">
              {[
                { l: 'STATUS', v: 'SIMULATING', c: 'text-accent' },
                { l: 'PROGRESS', v: '68%', c: 'text-frost' },
                { l: 'RISK', v: '0.15%', c: 'text-warning' },
              ].map((t) => (
                <div key={t.l} className="flex items-center justify-between gap-4">
                  <span className="technical-label">{t.l}</span>
                  <span className={`value-mono text-[10px] ${t.c}`}>{t.v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Intelligence panel */}
          <div className="absolute top-4 right-4 z-10 hud-element px-4 py-3 min-w-[220px] space-y-2">
            <div className="technical-label text-accent">ORBITA INTELLIGENCE</div>
            <div className="space-y-1 text-[10px] font-mono text-steel">
              <p>Objective understood.</p>
              <p>3 mission phases identified.</p>
              <p>2 validation checks remaining.</p>
            </div>
          </div>
          {/* Timeline bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="hud-element px-4 py-2 flex items-center gap-4 overflow-x-auto">
              {['MISSION CREATED', 'PLAN GENERATED', 'VALIDATION', 'SIMULATION', 'ANALYSIS'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-success' : i === 3 ? 'bg-accent animate-pulse-soft' : 'bg-border'}`} />
                  <span className={`text-[9px] font-mono ${i <= 3 ? 'text-frost' : 'text-steel'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total XP" value="2,470" trend="up" change="+180 this week" />
          <StatCard title="Missions" value="23" trend="up" change="+3 this month" />
          <StatCard title="Avg Risk" value="0.04" description="Below threshold" />
          <StatCard title="Streak" value="12 days" trend="up" change="Personal best" />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent missions */}
          <div className="lg:col-span-2 panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[12px] font-semibold text-navy">Recent Missions</h2>
            </div>
            <div className="space-y-2">
              {MOCK_MISSIONS.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded border border-border-light hover:border-accent/15 hover:bg-surface-hover transition-all">
                  <div className="w-8 h-8 rounded bg-bg border border-border-light flex items-center justify-center text-[10px] font-mono text-steel">
                    {m.id.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-frost truncate">{m.name}</div>
                    <div className="text-[9px] text-steel font-mono">{m.id} · Risk: {m.risk}</div>
                  </div>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${m.status === 'completed' ? 'bg-success/10 text-success' : m.status === 'simulating' ? 'bg-accent/10 text-accent' : 'bg-surface-secondary text-steel'}`}>{m.status}</span>
                  <span className="text-[10px] font-mono text-accent">+{m.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent status */}
          <div className="panel p-5">
            <h2 className="text-[12px] font-semibold text-navy mb-4">Agent Network</h2>
            <div className="space-y-2">
              {MOCK_AGENTS.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 p-2 rounded border border-border-light">
                  <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'active' ? 'bg-success' : a.status === 'waiting' ? 'bg-warning' : a.status === 'failed' ? 'bg-danger' : 'bg-border'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-frost">{a.name}</div>
                    <div className="text-[9px] text-steel">{a.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OrbitaShell>
  )
}
