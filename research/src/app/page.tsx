'use client'

import { useState, useCallback, Suspense } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ScrollProgress } from '../components/motion-comps/scroll-scene'
import { fadeUp, stagger } from '../lib/motion/variants'
import { MOCK_SATELLITES } from '../lib/mock/data'
import {
  Rocket, Globe, Cpu, ShieldAlert, Brain,
  ChevronDown, Radio, ArrowRight, Target, Zap, RotateCcw, FileText
} from 'lucide-react'

const SpaceScene = dynamic(() => import('../components/space/space-scene').then(m => ({ default: m.SpaceScene })), { ssr: false })

function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-11 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="h-full flex items-center justify-between px-4 lg:px-6 max-w-[1600px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded border border-accent/30 flex items-center justify-center bg-accent/5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
          <span className="text-[12px] font-semibold tracking-[0.12em] text-navy">ORBITA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {['MISSIONS', 'SIMULATION', 'DIGITAL TWIN', 'RISK'].map((l) => (
            <a key={l} href={`/${l.toLowerCase().replace(' ', '-')}`} className="px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-mist hover:text-frost transition-colors">{l}</a>
          ))}
        </nav>
        <Link href="/dashboard" className="bg-accent text-white px-4 py-1.5 text-[11px] font-semibold rounded hover:bg-accent-dim transition-colors">
          ENTER ORBITA
        </Link>
      </div>
    </header>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const earthY = useTransform(scrollY, [0, 800], [0, -120])
  const earthScale = useTransform(scrollY, [0, 800], [1, 1.3])
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const textY = useTransform(scrollY, [0, 300], [0, -40])

  return (
    <section className="relative h-[200vh]">
      {/* 3D Earth background */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: earthY, scale: earthScale }}
        >
          <Suspense fallback={<div className="w-full h-full bg-[#0a1628]" />}>
            <SpaceScene showHUD showDebris showOrbits interactive={false} parallaxStrength={0.03} className="w-full h-full" />
          </Suspense>
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg to-transparent pointer-events-none" />

        {/* Hero text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity, y: textY }}
        >
          <div className="text-center px-6 max-w-3xl">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={fadeUp} className="technical-label text-accent tracking-[0.3em]">
                MISSION SYSTEM / 01
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-display-2xl text-navy text-balance">
                ORBITA
              </motion.h1>
              <motion.p variants={fadeUp} className="text-display-md text-frost/80">
                AUTONOMOUS INTELLIGENCE<br />FOR SPACE INFRASTRUCTURE
              </motion.p>
              <motion.p variants={fadeUp} className="text-[13px] text-mist leading-relaxed max-w-lg mx-auto">
                Simulate. Validate. Analyze. Operate with confidence.
              </motion.p>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 pt-2">
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 text-[12px] font-semibold rounded hover:bg-accent-dim transition-colors">
                  ENTER MISSION CONTROL <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/missions" className="inline-flex items-center gap-2 bg-white border border-border px-5 py-2.5 text-[12px] font-medium text-mist rounded hover:border-accent/30 hover:text-frost transition-all">
                  EXPLORE THE SYSTEM
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[9px] font-mono text-steel tracking-widest">SCROLL TO EXPLORE</span>
          <ChevronDown className="w-4 h-4 text-steel" />
        </motion.div>
      </div>
    </section>
  )
}

function StorySection({ title, subtitle, label, children, dark = false }: {
  title: string
  subtitle: string
  label: string
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <section className={`relative py-24 lg:py-32 ${dark ? 'bg-bg' : 'bg-white'}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="technical-label text-accent">{label}</div>
            <h2 className="text-display-lg text-navy max-w-2xl">{title}</h2>
            <p className="text-[14px] text-mist leading-relaxed max-w-xl">{subtitle}</p>
          </motion.div>
          {children}
        </motion.div>
      </div>
    </section>
  )
}

function OrbitalEnvironmentSection() {
  return (
    <StorySection
      label="SECTION 01"
      title="THE ORBITAL ENVIRONMENT"
      subtitle="Thousands of objects exist within a continuously changing orbital system. ORBITA tracks, models, and predicts the behavior of every asset in space."
      dark
    >
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { n: 'SATELLITES', v: '12,847', c: 'text-accent' },
          { n: 'DEBRIS OBJECTS', v: '23,641', c: 'text-warning' },
          { n: 'ACTIVE MISSIONS', v: '24', c: 'text-success' },
        ].map((s) => (
          <div key={s.n} className="panel p-4">
            <div className="label-mono mb-2">{s.n}</div>
            <div className={`text-[28px] font-semibold font-mono ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="space-viz h-64 relative">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 relative">
            <div className="absolute -inset-8 orbit-ring animate-orbit" />
            <div className="absolute -inset-16 orbit-ring animate-orbit" style={{ animationDuration: '90s' }} />
            {MOCK_SATELLITES.slice(0, 3).map((s, i) => (
              <motion.div
                key={s.id}
                className="absolute w-2 h-2 rounded-full bg-accent-bright"
                style={{
                  top: `${30 + i * 20}%`,
                  left: `${20 + i * 25}%`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-3 left-3 label-mono text-steel">LIVE ORBITAL VIEW</div>
      </motion.div>
    </StorySection>
  )
}

function DigitalTwinSection() {
  return (
    <StorySection
      label="SECTION 02"
      title="THE DIGITAL TWIN"
      subtitle="Every asset in orbit has a digital counterpart. Real-time telemetry, predictive models, and mission history — all synchronized."
    >
      <motion.div variants={fadeUp} className="panel p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="label-mono text-accent">SPACECRAFT</div>
            <div className="text-[18px] font-semibold text-navy">SAT-204</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'STATUS', v: 'NOMINAL', c: 'text-success' },
                { l: 'ALTITUDE', v: '548.3 km', c: 'text-frost' },
                { l: 'VELOCITY', v: '7.42 km/s', c: 'text-frost' },
                { l: 'HEALTH', v: '98.7%', c: 'text-accent' },
                { l: 'FUEL', v: '87%', c: 'text-frost' },
                { l: 'BATTERY', v: '92%', c: 'text-frost' },
              ].map((t) => (
                <div key={t.l} className="space-y-0.5">
                  <div className="label-mono">{t.l}</div>
                  <div className={`value-mono ${t.c}`}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-viz h-48 relative">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-6 bg-surface-3/50 border border-accent/30 rounded" />
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-px bg-accent/30" />
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-px bg-accent/30" />
              </div>
            </div>
            <div className="absolute top-3 left-3 label-mono text-steel">DIGITAL TWIN VIEW</div>
          </div>
        </div>
      </motion.div>
    </StorySection>
  )
}

function MissionIntelligenceSection() {
  const tasks = ['OBJECTIVE', 'TARGET IDENTIFICATION', 'APPROACH', 'INSPECTION', 'RETURN']
  return (
    <StorySection
      label="SECTION 03"
      title="MISSION INTELLIGENCE"
      subtitle="The AI decomposes complex objectives into validated mission graphs. Every step is planned, simulated, and verified before deployment."
      dark
    >
      <motion.div variants={fadeUp} className="panel p-6">
        <div className="label-mono text-accent mb-4">AI TASK GRAPH</div>
        <div className="space-y-0">
          {tasks.map((task, i) => (
            <div key={task} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${i < 3 ? 'bg-success' : i === 3 ? 'bg-accent animate-pulse-soft' : 'bg-border'}`} />
                {i < tasks.length - 1 && <div className="w-px h-6 bg-border-light" />}
              </div>
              <div className="pb-3">
                <span className={`text-[11px] font-mono ${i <= 3 ? 'text-frost' : 'text-steel'}`}>{task}</span>
                {i === 3 && <span className="ml-2 text-[9px] font-mono text-accent">IN PROGRESS</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </StorySection>
  )
}

function SimulationSection() {
  return (
    <StorySection
      label="SECTION 04"
      title="SIMULATION"
      subtitle="Compare trajectories, test scenarios, and validate mission plans before a single thruster fires."
    >
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { name: 'NOMINAL', desc: 'Safe approach trajectory', risk: '0.02%', color: 'success', active: true },
          { name: 'LOW FUEL', desc: 'Optimized fuel consumption', risk: '0.08%', color: 'warning', active: false },
          { name: 'HIGH RISK', desc: 'Collision window identified', risk: '0.45%', color: 'danger', active: false },
        ].map((s) => (
          <div key={s.name} className={`panel p-4 cursor-pointer transition-all ${s.active ? 'border-accent/30 shadow-card-hover' : 'hover:border-accent/15'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-frost">{s.name}</span>
              <span className={`text-[9px] font-mono text-${s.color}`}>{s.risk}</span>
            </div>
            <p className="text-[10px] text-steel">{s.desc}</p>
          </div>
        ))}
      </motion.div>
    </StorySection>
  )
}

function RiskSection() {
  return (
    <StorySection
      label="SECTION 05"
      title="RISK INTELLIGENCE"
      subtitle="Spatial risk visualization with collision probability, uncertainty regions, and debris density mapping."
      dark
    >
      <motion.div variants={fadeUp} className="panel p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="label-mono text-accent">CONJUNCTION ALERT</div>
            <div className="text-[16px] font-semibold text-navy">CR-7: DEB-1092</div>
            <div className="space-y-2">
              {[
                { l: 'MISS DISTANCE', v: '0.3 km' },
                { l: 'PROBABILITY', v: '0.045%' },
                { l: 'TIME TO TCA', v: '12h' },
              ].map((t) => (
                <div key={t.l} className="flex items-center justify-between">
                  <span className="label-mono">{t.l}</span>
                  <span className="value-mono">{t.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="label-mono text-accent">RISK FACTORS</div>
            {[
              { name: 'Orbital Density', value: 62 },
              { name: 'Debris Proximity', value: 38 },
              { name: 'Tracking Confidence', value: 94 },
            ].map((rf) => (
              <div key={rf.name}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-steel">{rf.name}</span>
                  <span className="font-mono text-frost">{rf.value}%</span>
                </div>
                <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${rf.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </StorySection>
  )
}

function RecoverySection() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const options = [
    { label: 'OPTION A', desc: 'Adjust trajectory', icon: RotateCcw, borderClass: 'hover:border-accent/30', iconClass: 'text-accent', activeBorder: 'border-accent/40 bg-accent/5' },
    { label: 'OPTION B', desc: 'Abort inspection', icon: ShieldAlert, borderClass: 'hover:border-warning/30', iconClass: 'text-warning', activeBorder: 'border-warning/40 bg-warning/5' },
    { label: 'OPTION C', desc: 'Return to safe orbit', icon: Target, borderClass: 'hover:border-success/30', iconClass: 'text-success', activeBorder: 'border-success/40 bg-success/5' },
  ]
  return (
    <StorySection
      label="SECTION 06"
      title="AUTONOMOUS RECOVERY"
      subtitle="When anomalies are detected, ORBITA generates recovery options and visualizes each as a different trajectory."
    >
      <motion.div variants={fadeUp} className="panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-warning" />
          <span className="text-[12px] font-semibold text-warning">ANOMALY DETECTED</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon
            const isSelected = selectedOption === opt.label
            return (
              <button
                key={opt.label}
                onClick={() => setSelectedOption(isSelected ? null : opt.label)}
                className={`text-left panel p-4 ${opt.borderClass} hover:shadow-card-hover transition-all ${isSelected ? opt.activeBorder : ''}`}
              >
                <Icon className={`w-4 h-4 ${opt.iconClass} mb-2`} />
                <div className="text-[11px] font-semibold text-frost">{opt.label}</div>
                <div className="text-[10px] text-steel mt-0.5">{opt.desc}</div>
                {isSelected && <div className="text-[9px] font-mono text-accent mt-2">SELECTED</div>}
              </button>
            )
          })}
        </div>
        {selectedOption && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <Link href="/simulation" className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-[11px] font-semibold rounded hover:bg-accent-dim transition-colors">
              Run Simulation with {selectedOption} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>
    </StorySection>
  )
}

function FinalSection() {
  return (
    <section className="relative py-32 bg-bg">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} className="text-display-xl text-navy">
            SIMULATE THE MISSION<br />BEFORE THE MISSION.
          </motion.h2>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 text-[13px] font-semibold rounded hover:bg-accent-dim transition-colors">
              ENTER ORBITA <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-accent/30 flex items-center justify-center bg-accent/5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>
            <span className="text-[11px] font-semibold text-navy tracking-[0.1em]">ORBITA</span>
          </div>
          <div className="text-[10px] font-mono text-steel flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="status-dot" /> NOMINAL</span>
            <span>V3.2</span>
          </div>
          <div className="text-[10px] text-steel">&copy; 2026 ORBITA. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <LandingNav />
      <main>
        <HeroSection />
        <OrbitalEnvironmentSection />
        <DigitalTwinSection />
        <MissionIntelligenceSection />
        <SimulationSection />
        <RiskSection />
        <RecoverySection />
        <FinalSection />
      </main>
      <LandingFooter />
    </div>
  )
}
