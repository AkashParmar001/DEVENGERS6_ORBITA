'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface PointerParallaxResult {
  ref: (node: HTMLElement | null) => void
  x: number
  y: number
}

export function usePointerParallax(sensitivity = 0.02): PointerParallaxResult {
  const [values, setValues] = useState({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
      if (e.matches && rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        targetRef.current = { x: 0, y: 0 }
        currentRef.current = { x: 0, y: 0 }
        setValues({ x: 0, y: 0 })
      }
    }

    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const lerp = useCallback((current: number, target: number, factor: number) => {
    return current + (target - current) * factor
  }, [])

  const animate = useCallback(() => {
    if (prefersReducedMotion.current) return

    const current = currentRef.current
    const target = targetRef.current
    const damping = 0.08

    currentRef.current = {
      x: lerp(current.x, target.x, damping),
      y: lerp(current.y, target.y, damping),
    }

    const dx = Math.abs(currentRef.current.x - target.x)
    const dy = Math.abs(currentRef.current.y - target.y)

    if (dx > 0.0001 || dy > 0.0001) {
      setValues({ ...currentRef.current })
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [lerp])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion.current) return
      const el = elementRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const normalizedX = ((e.clientX - centerX) / (rect.width / 2)) * sensitivity
      const normalizedY = ((e.clientY - centerY) / (rect.height / 2)) * sensitivity

      targetRef.current = {
        x: Math.max(-1, Math.min(1, normalizedX)),
        y: Math.max(-1, Math.min(1, normalizedY)),
      }

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(animate)
      }
    },
    [sensitivity, animate]
  )

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('mousemove', handleMouseMove)
      }

      elementRef.current = node

      if (node) {
        node.addEventListener('mousemove', handleMouseMove)
      }
    },
    [handleMouseMove]
  )

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [handleMouseMove])

  return { ref, x: values.x, y: values.y }
}
