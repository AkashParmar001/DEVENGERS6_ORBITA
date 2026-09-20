'use client'

import { Suspense, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Earth } from './Earth'
import { Starfield } from './Starfield'
import { OrbitalPath } from './OrbitalPath'
import { Satellite } from './Satellite'
import { SpatialHUD } from './SpatialHUD'
import { usePointerParallax } from '@/lib/motion/camera'

interface SpaceSceneProps {
  className?: string
  interactive?: boolean
  showHUD?: boolean
  cameraPosition?: [number, number, number]
  scrollProgress?: number
  altitude?: number
  velocity?: number
  objectsTracked?: number
  collisionRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  activeMissions?: number
}

function CameraRig({
  parallaxX,
  parallaxY,
  scrollProgress,
  baseCameraZ,
}: {
  parallaxX: number
  parallaxY: number
  scrollProgress?: number
  baseCameraZ: number
}) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 0, baseCameraZ))

  useFrame(() => {
    const zoomFactor = scrollProgress !== undefined
      ? THREE.MathUtils.lerp(baseCameraZ, baseCameraZ * 0.45, scrollProgress)
      : baseCameraZ

    const parallaxOffsetX = parallaxX * 1.2
    const parallaxOffsetY = parallaxY * 0.8

    targetPos.current.set(parallaxOffsetX, parallaxOffsetY, zoomFactor)

    camera.position.lerp(targetPos.current, 0.04)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#176B9E" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function Scene({
  interactive,
  scrollProgress,
  parallaxX,
  parallaxY,
  cameraPosition,
}: {
  interactive: boolean
  scrollProgress?: number
  parallaxX: number
  parallaxY: number
  cameraPosition: [number, number, number]
}) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[8, 4, 8]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.12} color="#69C7E8" />
      <pointLight position={[0, 0, 0]} intensity={0.15} color="#69C7E8" distance={10} />

      <Starfield count={2500} radius={100} />
      <Earth scale={1} rotationSpeed={0.025} />

      {/* Orbital paths at various inclinations */}
      <OrbitalPath
        semiMajorAxis={2.8}
        semiMinorAxis={2.6}
        inclination={5}
        color="#69C7E8"
        opacity={0.12}
        showSatellite
        satelliteSpeed={0.3}
      />
      <OrbitalPath
        semiMajorAxis={3.4}
        semiMinorAxis={3.1}
        inclination={-12}
        color="#2C9EDB"
        opacity={0.08}
        showSatellite
        satelliteSpeed={0.22}
      />
      <OrbitalPath
        semiMajorAxis={4.2}
        semiMinorAxis={3.9}
        inclination={22}
        color="#69C7E8"
        opacity={0.06}
        showSatellite
        satelliteSpeed={0.15}
      />
      <OrbitalPath
        semiMajorAxis={5.5}
        semiMinorAxis={5.2}
        inclination={-8}
        color="#176B9E"
        opacity={0.04}
        showSatellite={false}
      />

      {/* Additional standalone satellites */}
      <Satellite orbitRadius={3.0} orbitSpeed={0.28} label="ISS-Z1" />
      <Satellite orbitRadius={4.5} orbitSpeed={0.12} label="HUBBLE-2" />
      <Satellite orbitRadius={6.0} orbitSpeed={0.08} label="GPS-IIF" />

      <CameraRig
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        scrollProgress={scrollProgress}
        baseCameraZ={cameraPosition[2]}
      />

      {interactive && (
        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.08}
          minDistance={3}
          maxDistance={14}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
          enableDamping
          dampingFactor={0.05}
        />
      )}
    </>
  )
}

export function SpaceScene({
  className,
  interactive = false,
  showHUD = false,
  cameraPosition = [0, 1.5, 7],
  scrollProgress,
  altitude = 408,
  velocity = 7.66,
  objectsTracked = 247,
  collisionRisk = 'LOW',
  activeMissions = 12,
}: SpaceSceneProps) {
  const { ref, x, y } = usePointerParallax(0.015)

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref(node)
    },
    [ref]
  )

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={containerRef} className="w-full h-full">
        <Canvas
          camera={{
            position: cameraPosition,
            fov: 45,
            near: 0.1,
            far: 200,
          }}
          dpr={[1, 1.5]}
          style={{ background: '#0A1118' }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Scene
              interactive={interactive}
              scrollProgress={scrollProgress}
              parallaxX={x}
              parallaxY={y}
              cameraPosition={cameraPosition}
            />
          </Suspense>
        </Canvas>
      </div>

      {showHUD && (
        <SpatialHUD
          altitude={altitude}
          velocity={velocity}
          objectsTracked={objectsTracked}
          collisionRisk={collisionRisk}
          activeMissions={activeMissions}
        />
      )}
    </div>
  )
}
