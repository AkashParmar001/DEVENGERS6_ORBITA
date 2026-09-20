'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraRigProps {
  target?: [number, number, number]
  lookAt?: [number, number, number]
  distance?: number
  smooth?: number
}

export function CameraRig({ target = [0, 2, 8], lookAt = [0, 0, 0], distance = 8, smooth = 0.02 }: CameraRigProps) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(...target))
  const targetLookAt = useRef(new THREE.Vector3(...lookAt))

  useEffect(() => {
    targetPos.current.set(...target)
    targetLookAt.current.set(...lookAt)
  }, [target, lookAt])

  useFrame(() => {
    camera.position.lerp(targetPos.current, smooth)
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    camera.lookAt(
      THREE.MathUtils.lerp(camera.position.x + currentLookAt.x * distance, targetLookAt.current.x, smooth),
      THREE.MathUtils.lerp(camera.position.y + currentLookAt.y * distance, targetLookAt.current.y, smooth),
      THREE.MathUtils.lerp(camera.position.z + currentLookAt.z * distance, targetLookAt.current.z, smooth)
    )
  })

  return null
}

export function PointerParallax({ strength = 0.05 }: { strength?: number }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame(() => {
    camera.position.x += (mouse.current.x * strength - camera.position.x * 0.01) * 0.1
    camera.position.y += (-mouse.current.y * strength - camera.position.y * 0.01) * 0.1
  })

  return null
}
