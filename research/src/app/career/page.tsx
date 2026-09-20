'use client'

import { OrbitaShell } from '../../components/layout/orbita-shell'
import { motion } from 'motion/react'

const skills = [
  { name: 'Orbital Mechanics', level: 85 },
  { name: 'Collision Avoidance', level: 72 },
  { name: 'Robotic Operations', level: 60 },
  { name: 'Mission Planning', level: 90 },
  { name: 'Risk Assessment', level: 78 },
  { name: 'Data Analysis', level: 88 },
]

const badges = [
  { name: 'First Contact', desc: 'Complete first satellite inspection', unlocked: true, icon: 'F' },
  { name: 'Risk Free', desc: 'Mission with risk < 1%', unlocked: true, icon: 'R' },
  { name: 'Speed Runner', desc: 'Mission under 5 minutes', unlocked: false, icon: 'S' },
  { name: 'Streak Master', desc: '10-day mission streak', unlocked: true, icon: '1' },
  { name: 'Data Miner', desc: 'Process 100GB of orbital data', unlocked: false, icon: 'D' },
  { name: 'Pathfinder', desc: 'Discover 5 new orbital objects', unlocked: true, icon: 'P' },
]

export default function CareerPage() {
  return (
    <OrbitaShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-[16px] font-semibold text-navy">Career</h1>
          <p className="text-[11px] text-steel font-mono mt-0.5">Skills, badges, and operator progression</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { l: 'TOTAL XP', v: '2,470' },
            { l: 'MISSIONS', v: '18' },
            { l: 'STREAK', v: '12 days' },
            { l: 'RANK', v: 'L2 Operator' },
          ].map((s) => (
            <div key={s.l} className="panel p-4 text-center">
              <div className="label-mono text-[9px] mb-1">{s.l}</div>
              <div className="text-[18px] font-semibold font-mono text-navy">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h2 className="text-[12px] font-semibold text-navy mb-4">Skills</h2>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-frost">{s.name}</span>
                    <span className="font-mono text-accent">{s.level}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-[12px] font-semibold text-navy mb-4">Badges</h2>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b) => (
                <div key={b.name} className={`p-3 rounded border transition-all ${b.unlocked ? 'border-accent/15 bg-accent/5' : 'border-border-light opacity-50'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${b.unlocked ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-bg text-steel border border-border-light'}`}>{b.icon}</div>
                    <span className="text-[11px] font-medium text-frost">{b.name}</span>
                  </div>
                  <p className="text-[10px] text-steel">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OrbitaShell>
  )
}
