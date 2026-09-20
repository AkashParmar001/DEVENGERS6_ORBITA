'use client'

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-[72rem] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-[11px] font-semibold text-navy tracking-wide mb-3">PLATFORM</div>
            <div className="space-y-2">
              {['Digital Twin', 'Simulation', 'Risk Analysis', 'AI Planning'].map((l) => (
                <div key={l} className="text-[11px] text-steel hover:text-accent cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-navy tracking-wide mb-3">MISSIONS</div>
            <div className="space-y-2">
              {['Active', 'Planned', 'Completed', 'Archived'].map((l) => (
                <div key={l} className="text-[11px] text-steel hover:text-accent cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-navy tracking-wide mb-3">RESOURCES</div>
            <div className="space-y-2">
              {['Documentation', 'API', 'Status', 'Support'].map((l) => (
                <div key={l} className="text-[11px] text-steel hover:text-accent cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-navy tracking-wide mb-3">COMPANY</div>
            <div className="space-y-2">
              {['About', 'Careers', 'Blog', 'Contact'].map((l) => (
                <div key={l} className="text-[11px] text-steel hover:text-accent cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-accent/30 flex items-center justify-center bg-accent/5">
              <div className="w-1 h-1 rounded-full bg-accent" />
            </div>
            <span className="text-[11px] font-semibold text-navy tracking-wide">ORBITA</span>
          </div>
          <div className="text-[10px] font-mono text-steel flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="status-dot" /> NOMINAL</span>
            <span>V3.2</span>
            <span>36,512 OBJECTS</span>
          </div>
          <div className="text-[10px] text-steel">&copy; 2026 ORBITA. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
