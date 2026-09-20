'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Stars({ count = 800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 180
      pos[i * 3 + 1] = (Math.random() - 0.5) * 180
      pos[i * 3 + 2] = (Math.random() - 0.5) * 180
    }
    return pos
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002
      ref.current.rotation.x += delta * 0.001
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#ffffff" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-white" />
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }} style={{ position: 'absolute', inset: 0 }} dpr={[1, 1.5]}>
        <Stars count={800} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white pointer-events-none" />
    </div>
  )
}
