'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Earth() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#0a1628" roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.08, 64, 64]} />
      <meshStandardMaterial color="#1a3a5c" transparent opacity={0.06} side={THREE.BackSide} />
    </mesh>
  )
}

function OrbitRing({ radius, tilt = 0, opacity = 0.08 }: { radius: number; tilt?: number; opacity?: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <group rotation={[tilt, 0, 0]}>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#69C7E8', transparent: true, opacity }))} />
    </group>
  )
}

function Satellite({ orbitRadius, speed, size = 0.025 }: { orbitRadius: number; speed: number; size?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    angle.current += delta * speed
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * orbitRadius
      ref.current.position.z = Math.sin(angle.current) * orbitRadius
      ref.current.position.y = Math.sin(angle.current * 0.5) * 0.08
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[size, size * 0.4, size * 1.5]} />
      <meshStandardMaterial color="#69C7E8" emissive="#69C7E8" emissiveIntensity={0.3} transparent opacity={0.7} />
    </mesh>
  )
}

function Debris({ orbitRadius, speed }: { orbitRadius: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    angle.current += delta * speed
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * orbitRadius
      ref.current.position.z = Math.sin(angle.current) * orbitRadius
      ref.current.position.y = (Math.random() - 0.5) * 0.15
      ref.current.rotation.x += delta * 0.3
      ref.current.rotation.z += delta * 0.2
    }
  })

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.012, 0]} />
      <meshStandardMaterial color="#E5B85C" transparent opacity={0.4} />
    </mesh>
  )
}

function ServicingCraft({ orbitRadius, speed }: { orbitRadius: number; speed: number }) {
  const ref = useRef<THREE.Group>(null)
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    angle.current += delta * speed
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * orbitRadius
      ref.current.position.z = Math.sin(angle.current) * orbitRadius
      ref.current.position.y = Math.sin(angle.current * 0.3) * 0.1
      ref.current.rotation.y = -angle.current
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.05, 0.025, 0.03]} />
        <meshStandardMaterial color="#8a9ab0" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.05, 0, 0]}>
        <boxGeometry args={[0.06, 0.002, 0.025]} />
        <meshStandardMaterial color="#0a1628" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[0.06, 0.002, 0.025]} />
        <meshStandardMaterial color="#0a1628" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.015]} />
        <meshStandardMaterial color="#69C7E8" emissive="#69C7E8" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-5, -2, -5]} intensity={0.15} color="#69C7E8" />
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#69C7E8" distance={8} />

      <Earth />
      <Atmosphere />

      {/* Orbital paths */}
      <OrbitRing radius={2.6} tilt={0.08} opacity={0.06} />
      <OrbitRing radius={2.9} tilt={0.12} opacity={0.04} />
      <OrbitRing radius={3.2} tilt={0.06} opacity={0.03} />
      <OrbitRing radius={4.2} tilt={0.25} opacity={0.025} />
      <OrbitRing radius={5.5} tilt={0.02} opacity={0.02} />

      {/* Satellites */}
      <Satellite orbitRadius={2.6} speed={0.3} />
      <Satellite orbitRadius={2.9} speed={0.25} />
      <Satellite orbitRadius={3.2} speed={0.2} />
      <Satellite orbitRadius={4.2} speed={0.15} />
      <Satellite orbitRadius={5.5} speed={0.08} />

      {/* Debris */}
      <Debris orbitRadius={2.7} speed={0.35} />
      <Debris orbitRadius={3.0} speed={0.28} />
      <Debris orbitRadius={3.4} speed={0.22} />
      <Debris orbitRadius={4.5} speed={0.14} />

      {/* Servicing craft */}
      <ServicingCraft orbitRadius={3.1} speed={0.26} />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={true}
        autoRotateSpeed={0.15}
        minDistance={3}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
      />
    </>
  )
}

interface EarthSceneProps {
  className?: string;
}

export function EarthScene({ className }: EarthSceneProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 2, 6.5], fov: 40 }} dpr={[1, 1.5]} style={{ background: 'transparent' }}>
        <Scene />
      </Canvas>
    </div>
  )
}
