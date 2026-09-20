'use client'

import { motion, useScroll, useTransform, MotionProps } from 'motion/react'
import { useRef, ReactNode } from 'react'

export const fadeUp: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeIn: MotionProps['variants'] = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const stagger: MotionProps['variants'] = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const scaleIn: MotionProps['variants'] = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxLayer({
  children,
  speed = 0.1,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
