'use client'

import { Suspense, useState, useCallback, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Earth } from './earth'
import { Starfield } from './starfield'
import { Satellite, DebrisField } from './satellites'
import { OrbitalPath } from './orbital-paths'
import { PointerParallax } from './camera-rig'
import { SpatialHUD } from './spatial-hud'
import { MOCK_SATELLITES } from '../../lib/mock/data'
import * as THREE from 'three'

interface SpaceSceneProps {
  showHUD?: boolean
  showDebris?: boolean
  showOrbits?: boolean
  interactive?: boolean
  className?: string
  parallaxStrength?: number
  filter?: string
}

function CameraController({ focusTarget }: { focusTarget: [number, number, number] | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 2, 8))

  useFrame(() => {
    if (focusTarget) {
      const focusVec = new THREE.Vector3(...focusTarget)
      const camTarget = focusVec.clone().add(new THREE.Vector3(1.5, 1, 2))
      targetPos.current.lerp(camTarget, 0.03)
      camera.position.lerp(targetPos.current, 0.03)
      const lookTarget = new THREE.Vector3()
      camera.getWorldDirection(lookTarget)
      camera.lookAt(focusVec)
    }
  })

  return null
}

export function SpaceScene({
  showHUD = true,
  showDebris = true,
  showOrbits = true,
  interactive = true,
  className = '',
  parallaxStrength = 0.05,
  filter = 'ALL',
}: SpaceSceneProps) {
  const [hoveredSat, setHoveredSat] = useState<string | null>(null)
  const [selectedSat, setSelectedSat] = useState<string | null>(null)

  const handleHover = useCallback((id: string, hovered: boolean) => {
    setHoveredSat(hovered ? id : null)
  }, [])

  const filteredSatellites = filter === 'ALL'
    ? MOCK_SATELLITES
    : MOCK_SATELLITES.filter((s) => {
        const f = filter.toLowerCase()
        if (f === 'satellites') return s.type === 'satellite'
        if (f === 'debris') return s.type === 'debris'
        if (f === 'spacecraft') return s.type === 'spacecraft'
        if (f === 'robots') return s.type === 'robot'
        return true
      })

  const selectedSatData = selectedSat ? MOCK_SATELLITES.find((s) => s.id === selectedSat) : null
  const focusTarget: [number, number, number] | null = selectedSatData
    ? [selectedSatData.position.x / 1000, selectedSatData.position.y / 1000, selectedSatData.position.z / 1000]
    : null

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45, near: 0.1, far: 500 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-3, -1, -3]} intensity={0.15} color="#4da8da" />

          <Earth />
          <Starfield count={1200} />

          {showDebris && <DebrisField count={80} />}

          {showOrbits && (
            <>
              <OrbitalPath radius={2.5} inclination={51.6} color="#176B9E" opacity={0.12} />
              <OrbitalPath radius={6.2} inclination={28.5} color="#86939F" opacity={0.08} />
              <OrbitalPath radius={1.8} inclination={97.8} color="#2E8B62" opacity={0.1} />
            </>
          )}

          {filteredSatellites.map((sat) => (
            <Satellite
              key={sat.id}
              position={[sat.position.x / 1000, sat.position.y / 1000, sat.position.z / 1000]}
              color={selectedSat === sat.id ? '#ffffff' : sat.status === 'warning' ? '#B7791F' : sat.type === 'robot' ? '#2E8B62' : '#2C9EDB'}
              scale={selectedSat === sat.id ? 3 : sat.type === 'spacecraft' ? 2.5 : sat.type === 'robot' ? 2 : 1}
              onHover={(h) => handleHover(sat.id, h)}
              onClick={() => setSelectedSat(selectedSat === sat.id ? null : sat.id)}
            />
          ))}

          <PointerParallax strength={parallaxStrength} />
          <CameraController focusTarget={focusTarget} />

          {interactive && (
            <OrbitControls
              enableZoom
              enablePan
              enableRotate
              autoRotate
              autoRotateSpeed={0.15}
              minDistance={3}
              maxDistance={25}
              maxPolarAngle={Math.PI * 0.75}
              enabled={!focusTarget}
            />
          )}
        </Suspense>
      </Canvas>

      {showHUD && (
        <SpatialHUD
          hoveredSatellite={hoveredSat ? MOCK_SATELLITES.find((s) => s.id === hoveredSat) || null : null}
          selectedSatellite={selectedSat ? MOCK_SATELLITES.find((s) => s.id === selectedSat) || null : null}
          onDeselect={() => setSelectedSat(null)}
        />
      )}
    </div>
  )
}
