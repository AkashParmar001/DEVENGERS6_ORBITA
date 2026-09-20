'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SatelliteProps {
  position: [number, number, number]
  color?: string
  scale?: number
  label?: string
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}

export function Satellite({ position, color = '#2C9EDB', scale = 1, onHover, onClick }: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, metalness: 0.7 }), [color])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh material={bodyMaterial} onPointerEnter={() => onHover?.(true)} onPointerLeave={() => onHover?.(false)} onClick={onClick}>
        <boxGeometry args={[0.08, 0.04, 0.06]} />
      </mesh>
      <mesh position={[-0.06, 0, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.04, 0.005, 0.08]} />
        <meshStandardMaterial color="#4da8da" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.06, 0, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.04, 0.005, 0.08]} />
        <meshStandardMaterial color="#4da8da" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function DebrisField({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const debrisData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      radius: 2 + Math.random() * 4,
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(2 * Math.random() - 1),
      speed: 0.1 + Math.random() * 0.3,
      rotSpeed: Math.random() * 2,
      scale: 0.005 + Math.random() * 0.015,
    }))
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    debrisData.forEach((d, i) => {
      const angle = d.theta + t * d.speed
      dummy.position.set(
        d.radius * Math.sin(d.phi) * Math.cos(angle),
        d.radius * Math.sin(d.phi) * Math.sin(angle) * 0.3,
        d.radius * Math.cos(d.phi)
      )
      dummy.scale.setScalar(d.scale)
      dummy.rotation.set(t * d.rotSpeed, t * d.rotSpeed * 0.7, 0)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7b8d" roughness={0.8} metalness={0.4} />
    </instancedMesh>
  )
}
