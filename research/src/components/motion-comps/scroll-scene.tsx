'use client'

import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

interface ScrollSceneProps {
  children: ReactNode
  className?: string
}

export function ScrollScene({ children, className }: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

interface ScrollProgressProps {
  className?: string
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className={`fixed top-11 left-0 right-0 h-px bg-accent origin-left z-50 ${className || ''}`}
      style={{ scaleX: scrollYProgress }}
    />
  )
}
