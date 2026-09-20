'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeUp, stagger } from '../../lib/motion/variants'

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="section relative bg-bg">
      <div className="divider-accent mb-12" />
      <div className="section-inner">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl space-y-6"
        >
          <motion.h2 variants={fadeUp} className="text-display-lg text-navy">
            READY TO OPERATE<br />
            <span className="text-accent">BEYOND EARTH?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-mist leading-relaxed">
            Join the next generation of autonomous space infrastructure.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <a href="/dashboard" className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 text-[13px] font-semibold rounded hover:bg-accent-dim transition-colors duration-150">
              ENTER ORBITA
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
