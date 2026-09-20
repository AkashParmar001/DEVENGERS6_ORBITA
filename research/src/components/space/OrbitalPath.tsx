'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface OrbitalPathProps {
  semiMajorAxis?: number
  semiMinorAxis?: number
  inclination?: number
  color?: string
  opacity?: number
  showSatellite?: boolean
  satelliteSpeed?: number
  satelliteSize?: number
  segments?: number
}

export function OrbitalPath({
  semiMajorAxis = 3.5,
  semiMinorAxis = 3.2,
  inclination = 0,
  color = '#69C7E8',
  opacity = 0.15,
  showSatellite = true,
  satelliteSpeed = 0.25,
  satelliteSize = 0.03,
  segments = 128,
}: OrbitalPathProps) {
  const satelliteRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Line>(null)
  const angleRef = useRef(Math.random() * Math.PI * 2)

  const inclinationRad = (inclination * Math.PI) / 180

  const curve = useMemo(() => {
    return new THREE.EllipseCurve(
      0,
      0,
      semiMajorAxis,
      semiMinorAxis,
      0,
      Math.PI * 2,
      false,
      0
    )
  }, [semiMajorAxis, semiMinorAxis])

  const tubeGeometry = useMemo(() => {
    const points = curve.getPoints(segments)
    const vectors = points.map((p) => new THREE.Vector3(p.x, 0, p.y))
    const path = new THREE.CatmullRomCurve3(vectors, true)
    return new THREE.TubeGeometry(path, segments, 0.003, 4, true)
  }, [curve, segments])

  const trailPoints = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          Math.cos(t) * semiMajorAxis,
          0,
          Math.sin(t) * semiMinorAxis
        )
      )
    }
    return pts
  }, [semiMajorAxis, semiMinorAxis, segments])

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(trailPoints)
    return geo
  }, [trailPoints])

  useFrame((_, delta) => {
    if (!showSatellite || !satelliteRef.current) return

    angleRef.current += delta * satelliteSpeed
    if (angleRef.current > Math.PI * 2) {
      angleRef.current -= Math.PI * 2
    }

    const x = Math.cos(angleRef.current) * semiMajorAxis
    const z = Math.sin(angleRef.current) * semiMinorAxis

    satelliteRef.current.position.set(x, 0, z)
    satelliteRef.current.rotation.y = -angleRef.current
  })

  return (
    <group rotation={[inclinationRad, 0, 0]}>
      {/* Orbital ring via tube geometry */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fallback line for the ring */}
      <primitive
        object={new THREE.Line(
          trailGeometry,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: opacity * 0.6,
            depthWrite: false,
          })
        )}
      />

      {/* Satellite marker on path */}
      {showSatellite && (
        <group>
          <mesh ref={satelliteRef}>
            <sphereGeometry args={[satelliteSize, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Satellite glow */}
          {satelliteRef.current && (
            <mesh position={satelliteRef.current.position}>
              <sphereGeometry args={[satelliteSize * 2.5, 8, 8]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.15}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  )
}
