'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { SpaceScene } from '@/components/space/SpaceScene'
import { BootSequence } from '@/components/space/boot-sequence'
import { useScrollProgress } from '@/lib/motion/scroll'
import { OrbitaNav } from '@/components/landing/nav'
import {
  Satellite,
  Radar,
  Cpu,
  Play,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Globe,
} from 'lucide-react'

function Chapter({
  id,
  children,
  className,
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, amount: 0.3 })

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative ${className ?? ''}`}
    >
      {children}
    </motion.section>
  )
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const features = [
  { icon: Globe, label: 'Digital Twin', desc: 'Real-time orbital environment replica' },
  { icon: Shield, label: 'Risk Engine', desc: 'Collision probability analysis' },
  { icon: Layers, label: 'Multi-Agent', desc: 'Autonomous task delegation' },
  { icon: Zap, label: 'Fast Sim', desc: '6-DOF physics simulation' },
  { icon: Cpu, label: 'AI Core', desc: 'ML-based trajectory planning' },
  { icon: Radar, label: 'Tracking', desc: 'Space object catalog integration' },
]

export default function Home() {
  const [booted, setBooted] = useState(false)
  const handleBoot = useCallback(() => setBooted(true), [])

  const { ref: scrollRef, progress: scrollProgress } = useScrollProgress()

  return (
    <>
      {!booted && <BootSequence onComplete={handleBoot} />}
      {booted && <OrbitaNav />}

      {/* Sticky 3D Background */}
      <div className="fixed inset-0 z-0">
        <SpaceScene
          scrollProgress={scrollProgress}
          className="w-full h-full"
        />
      </div>

      {/* Scrollable content */}
      <main ref={scrollRef} className="relative z-10">
        {/* Chapter 01 — ORBIT (Hero) */}
        <Chapter id="hero" className="h-screen flex items-center justify-center">
          <div className="text-center px-6 max-w-3xl">
            <FadeUp delay={0.1}>
              <p className="label-mono mb-4">CHAPTER 01 — ORBIT</p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <h1 className="text-display-xl text-white mb-6">
                Autonomous Intelligence
                <br />
                for Space Infrastructure
              </h1>
            </FadeUp>
            <FadeUp delay={0.35}>
              <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
                Understand, plan, simulate, and validate complex orbital operations
                with a digital environment built for autonomous space robotics.
              </p>
            </FadeUp>
            <FadeUp delay={0.5}>
              <div className="mt-8 flex items-center justify-center gap-4">
                <a
                  href="#congestion"
                  className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded bg-accent text-white hover:bg-accent-dim transition-colors duration-150"
                >
                  Explore Platform <ArrowRight size={14} />
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors duration-150"
                >
                  Mission Control
                </a>
              </div>
            </FadeUp>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-white/40" />
            </motion.div>
          </div>
        </Chapter>

        {/* Chapter 02 — CONGESTION */}
        <Chapter id="congestion" className="min-h-screen bg-bg">
          <div className="section-inner section grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeUp>
                <p className="label-mono mb-3">CHAPTER 02 — CONGESTION</p>
                <h2 className="text-display-lg text-navy mb-5">
                  Growing complexity in
                  <br />
                  low Earth orbit
                </h2>
                <p className="text-sm text-mist leading-relaxed max-w-md">
                  Over 30,000 tracked objects. Thousands of active satellites. A congested,
                  contested, and competitive environment demanding new approaches to
                  space traffic management.
                </p>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { value: '34,500+', label: 'Objects Tracked' },
                    { value: '12,000+', label: 'Active Satellites' },
                    { value: '~300M', label: 'Debris > 1cm' },
                    { value: '27,000 km/h', label: 'Orbital Velocity' },
                  ].map((stat) => (
                    <div key={stat.label} className="panel p-4">
                      <div className="font-mono text-lg font-semibold text-navy">{stat.value}</div>
                      <div className="label-mono mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.2}>
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-full border border-border/40 animate-[orbit_40s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-border/30 animate-[orbit_30s_linear_infinite_reverse]" />
                <div className="absolute inset-8 rounded-full border border-border/20 animate-[orbit_25s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Satellite className="text-accent" size={28} />
                  </div>
                </div>
                {/* Decorative dots */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-2 h-2 rounded-full bg-accent/40"
                    style={{
                      top: `${50 + 42 * Math.sin((deg * Math.PI) / 180)}%`,
                      left: `${50 + 42 * Math.cos((deg * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>
            </FadeUp>
          </div>
        </Chapter>

        <div className="divider" />

        {/* Chapter 03 — MISSION */}
        <Chapter id="missions" className="min-h-screen bg-bg">
          <div className="section-inner section grid md:grid-cols-2 gap-12 items-center">
            <FadeUp delay={0.1}>
              <div className="panel-elevated p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                    <Radar className="text-accent" size={16} />
                  </div>
                  <span className="label-mono">MISSION PLANNER</span>
                </div>
                <div className="space-y-3">
                  {[
                    { phase: 'Phase 1', name: 'Debris Survey', status: 'COMPLETE', color: 'text-success' },
                    { phase: 'Phase 2', name: 'Rendezvous Approach', status: 'ACTIVE', color: 'text-accent' },
                    { phase: 'Phase 3', name: 'Inspection Orbit', status: 'PENDING', color: 'text-steel' },
                    { phase: 'Phase 4', name: 'De-orbit Maneuver', status: 'PENDING', color: 'text-steel' },
                  ].map((p) => (
                    <div key={p.phase} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="label-mono w-16">{p.phase}</span>
                        <span className="text-sm text-navy font-medium">{p.name}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-semibold ${p.color}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <div className="divider-accent" />
                <div className="flex items-center justify-between">
                  <span className="label-mono">EST. DURATION: 4H 32M</span>
                  <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-accent-dim transition-colors">
                    <Play size={12} /> Simulate
                  </button>
                </div>
              </div>
            </FadeUp>

            <div>
              <FadeUp>
                <p className="label-mono mb-3">CHAPTER 03 — MISSION</p>
                <h2 className="text-display-lg text-navy mb-5">
                  Plan complex orbital
                  <br />
                  missions with precision
                </h2>
                <p className="text-sm text-mist leading-relaxed max-w-md">
                  Define multi-phase missions with autonomous decision trees. Each phase
                  is validated through digital twin simulation before any command reaches
                  hardware.
                </p>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="mt-8 space-y-4">
                  {[
                    'Constraint-aware trajectory generation',
                    'Real-time fuel and delta-v budgeting',
                    'Automatic conflict deconfliction',
                    ' contingency branching',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-sm text-frost">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </Chapter>

        <div className="divider" />

        {/* Chapter 04 — AUTONOMY */}
        <Chapter id="risk" className="min-h-screen bg-bg">
          <div className="section-inner section grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeUp>
                <p className="label-mono mb-3">CHAPTER 04 — AUTONOMY</p>
                <h2 className="text-display-lg text-navy mb-5">
                  Intelligence that
                  <br />
                  adapts in orbit
                </h2>
                <p className="text-sm text-mist leading-relaxed max-w-md">
                  Multi-agent systems negotiate, plan, and execute autonomously.
                  From debris avoidance to cooperative inspection, ORBITA's AI core
                  handles the complexity of modern space operations.
                </p>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: Cpu, label: 'ML Planning', value: '97.2%' },
                    { icon: Shield, label: 'Collision Avoid', value: '99.8%' },
                    { icon: Zap, label: 'Response Time', value: '<200ms' },
                    { icon: Layers, label: 'Agent Count', value: '12+' },
                  ].map((m) => (
                    <div key={m.label} className="panel p-4">
                      <m.icon size={16} className="text-accent mb-2" />
                      <div className="font-mono text-lg font-semibold text-navy">{m.value}</div>
                      <div className="label-mono mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.2}>
              <div className="panel-elevated p-8 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                    <Cpu className="text-accent" size={16} />
                  </div>
                  <span className="label-mono">AI CORE — AGENT NETWORK</span>
                </div>
                {[
                  { agent: 'Planner', status: 'ACTIVE', task: 'Trajectory optimization', load: 78 },
                  { agent: 'Navigator', status: 'ACTIVE', task: 'Attitude control', load: 62 },
                  { agent: 'Observer', status: 'ACTIVE', task: 'Debris tracking', load: 45 },
                  { agent: 'Comms', status: 'STANDBY', task: 'Telemetry relay', load: 12 },
                ].map((a) => (
                  <div key={a.agent} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${a.status === 'STANDBY' ? 'status-dot-warning' : ''}`} />
                        <span className="text-sm font-medium text-navy">{a.agent}</span>
                      </div>
                      <span className="font-mono text-[10px] text-steel">{a.task}</span>
                    </div>
                    <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-700"
                        style={{ width: `${a.load}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </Chapter>

        <div className="divider" />

        {/* Chapter 05 — SIMULATION */}
        <Chapter id="simulation" className="min-h-screen bg-bg">
          <div className="section-inner section">
            <div className="text-center mb-12">
              <FadeUp>
                <p className="label-mono mb-3">CHAPTER 05 — SIMULATION</p>
                <h2 className="text-display-lg text-navy mb-5">
                  Validate before you fly
                </h2>
                <p className="text-sm text-mist leading-relaxed max-w-lg mx-auto">
                  High-fidelity 6-DOF physics simulation with real orbital mechanics.
                  Test every maneuver, every contingency, every edge case — before it
                  matters.
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.15}>
              <div className="panel-elevated p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                      <Play className="text-accent" size={16} />
                    </div>
                    <span className="label-mono">SIMULATION VIEWPORT</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="label-mono">TIME: 1.0x</span>
                    <span className="label-mono">STEP: 0.01s</span>
                    <span className="status-dot" />
                  </div>
                </div>
                <div className="relative aspect-video bg-[#0A1118] rounded-lg overflow-hidden border border-border/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SpaceScene className="w-full h-full" interactive showHUD />
                  </div>
                  <div className="absolute top-4 left-4 space-y-1">
                    <div className="label-mono text-white/50">ALT: 408.2 km</div>
                    <div className="label-mono text-white/50">VEL: 7.66 km/s</div>
                    <div className="label-mono text-white/50">INC: 51.6°</div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <button className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded bg-accent/90 text-white hover:bg-accent transition-colors">
                      <Play size={10} /> RUN SIMULATION
                    </button>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </Chapter>

        <div className="divider" />

        {/* Chapter 06 — ENTER ORBITA */}
        <Chapter id="reports" className="min-h-screen bg-bg">
          <div className="section-inner section">
            <div className="text-center mb-12">
              <FadeUp>
                <p className="label-mono mb-3">CHAPTER 06 — ENTER ORBITA</p>
                <h2 className="text-display-xl text-navy mb-5">
                  Ready for orbit
                </h2>
                <p className="text-sm text-mist leading-relaxed max-w-lg mx-auto">
                  One platform to understand, plan, simulate, and validate —
                  built for the teams operating at the frontier.
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.1}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {features.map((f) => (
                  <div key={f.label} className="panel p-5 hover:shadow-card-hover transition-shadow duration-200">
                    <f.icon size={20} className="text-accent mb-3" />
                    <h3 className="text-sm font-semibold text-navy mb-1">{f.label}</h3>
                    <p className="text-xs text-mist leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="text-center">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2.5 text-[14px] font-semibold px-8 py-3 rounded bg-navy text-white hover:bg-frost transition-colors duration-200 shadow-card"
                >
                  ENTER ORBITA <ArrowRight size={16} />
                </a>
                <p className="mt-4 text-xs text-steel">
                  Powered by autonomous intelligence · Built for space
                </p>
              </div>
            </FadeUp>
          </div>
        </Chapter>

        {/* Footer */}
        <footer className="bg-bg border-t border-border">
          <div className="section-inner py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-navy">ORBITA</span>
              <span className="text-xs text-steel">© 2026</span>
            </div>
            <div className="flex items-center gap-6">
              {['Documentation', 'Status', 'Contact'].map((link) => (
                <span key={link} className="text-xs text-mist hover:text-frost cursor-pointer transition-colors">
                  {link}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
