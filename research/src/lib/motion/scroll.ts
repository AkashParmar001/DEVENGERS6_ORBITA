'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollProgressResult {
  ref: (node: HTMLElement | null) => void
  progress: number
}

export function useScrollProgress(): ScrollProgressResult {
  const [progress, setProgress] = useState(0)
  const elementRef = useRef<HTMLElement | null>(null)
  const isVisibleRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  const calculateProgress = useCallback(() => {
    if (!elementRef.current || !isVisibleRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const elementHeight = rect.height

    if (elementHeight <= 0) {
      setProgress(0)
      return
    }

    const start = windowHeight
    const end = -elementHeight
    const current = rect.top
    const raw = (start - current) / (start - end)

    setProgress(Math.max(0, Math.min(1, raw)))
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return

    rafRef.current = requestAnimationFrame(() => {
      calculateProgress()
      rafRef.current = null
    })
  }, [calculateProgress])

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (elementRef.current) {
        window.removeEventListener('scroll', onScroll, true)
        if (elementRef.current) {
          ;(elementRef.current as any)._scrollObserver?.disconnect()
        }
      }

      elementRef.current = node

      if (node) {
        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            isVisibleRef.current = entry.isIntersecting
            if (entry.isIntersecting) {
              calculateProgress()
            }
          },
          { threshold: Array.from({ length: 20 }, (_, i) => i / 19) }
        )

        observer.observe(node)
        ;(node as any)._scrollObserver = observer

        window.addEventListener('scroll', onScroll, true)
        calculateProgress()
      }
    },
    [onScroll, calculateProgress]
  )

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      window.removeEventListener('scroll', onScroll, true)
      if (elementRef.current) {
        ;(elementRef.current as any)._scrollObserver?.disconnect()
      }
    }
  }, [onScroll])

  return { ref, progress }
}
