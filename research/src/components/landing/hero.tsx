'use client'

import { motion } from 'motion/react'
import { EarthScene } from '../three/earth-scene'
import { fadeUp, stagger } from '../../lib/motion/variants'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg">
      {/* 3D Earth */}
      <div className="absolute inset-0">
        <EarthScene className="w-full h-full" />
      </div>

      {/* Light overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/20 to-bg pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-14">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
          <motion.p variants={fadeUp} className="label-mono text-accent">AUTONOMOUS SPACE INFRASTRUCTURE</motion.p>

          <motion.h1 variants={fadeUp} className="text-display-xl text-navy">
            AUTONOMOUS INTELLIGENCE<br />
            <span className="text-accent">FOR SPACE INFRASTRUCTURE</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-sm text-mist max-w-xl mx-auto leading-relaxed">
            ORBITA provides a digital environment for autonomous space robotics to
            understand, plan, simulate, and validate complex operations in orbit.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 pt-2">
            <a href="/dashboard" className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 text-[13px] font-semibold rounded hover:bg-accent-dim transition-colors duration-150">
              ENTER MISSION CONTROL
            </a>
            <a href="#digital-twin" className="inline-flex items-center gap-2 border border-border text-mist px-5 py-2 text-[13px] font-medium rounded hover:border-accent hover:text-accent transition-all duration-150 bg-white">
              EXPLORE DIGITAL TWIN
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-5 pt-10 text-[11px] font-mono text-steel">
            <span className="flex items-center gap-1.5"><span className="status-dot" /> SYSTEM ONLINE</span>
            <span className="text-border">|</span>
            <span>LEO ACTIVE</span>
            <span className="text-border">|</span>
            <span>36,512 OBJECTS</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="w-4 h-7 rounded-full border border-border flex justify-center pt-1.5 bg-white/50">
          <motion.div
            className="w-0.5 h-1.5 rounded-full bg-accent/50"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
