'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Earth({ onHover, onSelect }: { onHover?: (hovered: boolean) => void; onSelect?: () => void } = {}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  const earthMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2a5a8b'),
    roughness: 0.75,
    metalness: 0.15,
  }), [])

  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
        vec3 color = mix(vec3(0.1, 0.35, 0.6), vec3(0.2, 0.5, 0.8), fresnel);
        gl_FragColor = vec4(color, fresnel * 0.6);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  }), [])

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.02
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.015
  })

  return (
    <group>
      <mesh ref={meshRef} material={earthMaterial} onPointerEnter={() => onHover?.(true)} onPointerLeave={() => onHover?.(false)} onClick={onSelect}>
        <sphereGeometry args={[1.5, 64, 64]} />
      </mesh>
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[1.54, 64, 64]} />
      </mesh>
    </group>
  )
}
