'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface OrbitalPathProps {
  radius: number
  inclination?: number
  eccentricity?: number
  color?: string
  opacity?: number
  segments?: number
}

export function OrbitalPath({ radius, inclination = 0, eccentricity = 0, color = '#176B9E', opacity = 0.15, segments = 128 }: OrbitalPathProps) {
  const lineObj = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2
      const r = radius * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(t))
      const incRad = (inclination * Math.PI) / 180
      points.push(new THREE.Vector3(
        r * Math.cos(t),
        r * Math.sin(t) * Math.sin(incRad),
        r * Math.sin(t) * Math.cos(incRad)
      ))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
    return new THREE.Line(geometry, material)
  }, [radius, inclination, eccentricity, segments, color, opacity])

  return <primitive object={lineObj} />
}

export function MissionTrajectory({
  points,
  color = '#2C9EDB',
  opacity = 0.4,
  showMarkers = true,
}: {
  points: Array<[number, number, number]>
  color?: string
  opacity?: number
  showMarkers?: boolean
}) {
  const lineObj = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(...p))
    const curve = new THREE.CatmullRomCurve3(vectors)
    const curvePoints = curve.getPoints(100)
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
    return new THREE.Line(geometry, material)
  }, [points, color, opacity])

  return (
    <group>
      <primitive object={lineObj} />
      {showMarkers && points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}
