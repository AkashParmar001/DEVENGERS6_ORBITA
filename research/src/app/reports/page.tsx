'use client'

import { OrbitaShell } from '../../components/layout/orbita-shell'
import { MOCK_REPORTS } from '../../lib/mock/data'

const resultBadge: Record<string, string> = {
  success: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
  failure: 'bg-danger/10 text-danger',
}

export default function ReportsPage() {
  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-[16px] font-semibold text-navy">Reports</h1>
          <p className="text-[11px] text-steel font-mono mt-0.5">Mission reports and analysis documents</p>
        </div>

        <div className="space-y-3">
          {MOCK_REPORTS.map((r) => (
            <div key={r.id} className="panel p-5 hover:border-accent/15 hover:shadow-card-hover transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-navy">{r.title}</h3>
                  <p className="text-[10px] text-steel font-mono mt-0.5">{r.id} · {r.missionId} · {new Date(r.created).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${resultBadge[r.result]}`}>{r.result}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${r.risk === 'low' ? 'bg-success/10 text-success' : r.risk === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                    {r.risk} risk
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-mist leading-relaxed">{r.summary}</p>
              <div className="mt-3 pt-3 border-t border-border-light">
                <div className="flex items-center gap-4">
                  {['MISSION SUMMARY', 'AI PLAN', 'VALIDATION', 'SIMULATION', 'RISK', 'EVENTS'].map((section) => (
                    <span key={section} className="text-[9px] font-mono text-steel hover:text-accent cursor-pointer transition-colors">{section}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OrbitaShell>
  )
}
