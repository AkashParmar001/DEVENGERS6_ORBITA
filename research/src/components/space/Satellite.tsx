'use client'

import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface SatelliteProps {
  position?: [number, number, number]
  orbitRadius?: number
  orbitSpeed?: number
  label?: string
  className?: string
}

export function Satellite({
  position = [0, 0, 0],
  orbitRadius = 3.5,
  orbitSpeed = 0.3,
  label = 'SAT-001',
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const [hovered, setHovered] = useState(false)

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    angleRef.current += delta * orbitSpeed
    if (angleRef.current > Math.PI * 2) {
      angleRef.current -= Math.PI * 2
    }

    const x = Math.cos(angleRef.current) * orbitRadius + position[0]
    const z = Math.sin(angleRef.current) * orbitRadius + position[2]
    const y = Math.sin(angleRef.current * 0.4) * 0.15 + position[1]

    groupRef.current.position.set(x, y, z)
    groupRef.current.rotation.y = -angleRef.current
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Main body */}
      <mesh>
        <boxGeometry args={[0.04, 0.025, 0.03]} />
        <meshStandardMaterial
          color="#8a9ab0"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* Left solar panel */}
      <mesh position={[-0.045, 0, 0]}>
        <boxGeometry args={[0.055, 0.002, 0.028]} />
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Right solar panel */}
      <mesh position={[0.045, 0, 0]}>
        <boxGeometry args={[0.055, 0.002, 0.028]} />
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.001, 0.001, 0.012, 6]} />
        <meshStandardMaterial
          color="#69C7E8"
          emissive="#69C7E8"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Blinking status light */}
      <mesh position={[0, 0.014, 0.016]}>
        <sphereGeometry args={[0.003, 6, 6]} />
        <meshBasicMaterial color="#2E8B62" />
      </mesh>

      {/* Glow when hovered */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color="#69C7E8"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && (
        <Html
          center
          distanceFactor={5}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(10, 17, 24, 0.9)',
              border: '1px solid rgba(105, 199, 232, 0.3)',
              borderRadius: '2px',
              padding: '4px 8px',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '9px',
              color: '#69C7E8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{label}</div>
            <div style={{ color: '#86939F', fontSize: '8px' }}>
              ORBIT: {(orbitRadius * 6371).toFixed(0)} KM
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
