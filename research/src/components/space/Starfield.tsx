'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarfieldProps {
  count?: number
  radius?: number
  className?: string
}

export function Starfield({ count = 2500, radius = 100 }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Distribute stars in a spherical shell
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * 0.3 + Math.random() * radius * 0.7

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      // Star color variation (white to slight blue/warm tint)
      const temp = Math.random()
      if (temp < 0.6) {
        // White stars
        colors[i3] = 0.95 + Math.random() * 0.05
        colors[i3 + 1] = 0.95 + Math.random() * 0.05
        colors[i3 + 2] = 1.0
      } else if (temp < 0.8) {
        // Blue-white stars
        colors[i3] = 0.8 + Math.random() * 0.1
        colors[i3 + 1] = 0.85 + Math.random() * 0.1
        colors[i3 + 2] = 1.0
      } else if (temp < 0.92) {
        // Warm stars
        colors[i3] = 1.0
        colors[i3 + 1] = 0.85 + Math.random() * 0.1
        colors[i3 + 2] = 0.7 + Math.random() * 0.15
      } else {
        // Rare bright blue stars
        colors[i3] = 0.7
        colors[i3 + 1] = 0.8
        colors[i3 + 2] = 1.0
      }

      // Size variation
      const sizeClass = Math.random()
      if (sizeClass < 0.7) {
        sizes[i] = 0.3 + Math.random() * 0.4 // Dim
      } else if (sizeClass < 0.92) {
        sizes[i] = 0.5 + Math.random() * 0.5 // Medium
      } else {
        sizes[i] = 0.8 + Math.random() * 0.7 // Bright
      }
    }

    return { positions, colors, sizes }
  }, [count, radius])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.0003
      pointsRef.current.rotation.x += delta * 0.0001
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.25}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
